'use server'

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { AdminDetailsProps, BasicUserProps, FullAdminDetailsProps } from "@/lib/types";
import Admin from "@/models/admin";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export const getUserByEmail = async (email: string) => {
  await connectToMongoDB();

  const user = await User.findOne({email: email, userAccountDeleted: false})
  .select('password role email surName lastName profilePicture')
  .exec();

  if (!user) {
    return;
  }

  const userData = JSON.parse(JSON.stringify(user));

  return userData as BasicUserProps;
};

export const getAdminByUserId = async (id:string) => {
  await connectToMongoDB();

  const admin = await Admin.findOne({userId: id})
  .populate({
    path: 'userId',
    model: User,
    select: 'email surName lastName placeholderColor'
  })
  .exec();

  if (!admin) {
    return;
  }

  const adminData = JSON.parse(JSON.stringify(admin));

  return adminData as FullAdminDetailsProps;
};

export const getAdminByAdminId = async (adminId: string) => {
  await connectToMongoDB();

  const admin = await Admin.findById(adminId)
    .populate({
      path: 'userId',
      select: 'email surName lastName placeholderColor'
    })
    .exec();

  if (!admin) {
    return null;
  }

  const adminData = JSON.parse(JSON.stringify(admin));

  return adminData as FullAdminDetailsProps;
};

export const getUserSession = async () => {
  return await getServerSession(authOptions);
};

export const getCurrentUser = async () => {
  await connectToMongoDB();

  const currentUserSession = await getUserSession();

  if (!currentUserSession?.user?.email) {
    return;
  }

  try {
    const user = await Admin.findById(currentUserSession?.user?.adminId)
    .select('_id userId role adminAccess adminPermissions adminId isActivated isSuspended adminOnboarded')
      .populate({
        model: User,
        path: 'userId',
        select: 'email surName lastName placeholderColor profilePicture'
      })
      .exec();

    if (!user) {
      return;
    }

    const currentUser = JSON.parse(JSON.stringify(user));

    revalidatePath("/");
    return currentUser as AdminDetailsProps;
  } catch (error) {
    console.error(error);
    return;
  }
};