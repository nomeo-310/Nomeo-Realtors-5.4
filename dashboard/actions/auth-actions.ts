'use server'

import mongoose from 'mongoose';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { AdminDetailsProps, BasicUserProps, FullAdminDetailsProps } from "@/lib/types";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import Admin from "@/models/admin";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";


interface createProfileProps {
  profileImage: { public_id: string; secure_url: string; };
  bio: string | undefined;
  adminId: string;
  surName: string;
  lastName: string;
  username: string;
  phoneNumber?: string | undefined;
  path: string;
}

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
        select: 'email surName lastName placeholderColor profilePicture username bio profileImage phoneNumber'
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

export const createProfile = async (values: createProfileProps) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToMongoDB();

    const { path, profileImage, bio, adminId, surName, lastName, phoneNumber, username } = values;

    // 1. Validate current user session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return createErrorResponse('Authentication required. Please log in.', 401);
    }

    // 2. Verify user owns this admin account
    const adminDetails = await Admin.findById(adminId).session(session);

    if (!adminDetails) {
      await session.abortTransaction();
      return createErrorResponse('Admin profile not found.', 404);
    }

    // 3. Verify the admin belongs to the current user
    if (adminDetails.userId.toString() !== currentUser.userId._id.toString()) {
      await session.abortTransaction();
      return createErrorResponse('You are not authorized to update this admin profile.', 403);
    }

    // 4. Check if admin is already onboarded
    if (adminDetails.adminOnboarded) {
      await session.abortTransaction();
      return createErrorResponse('This admin profile has already been completed.', 409);
    }

    // 5. Prepare update data for user
    const userUpdateData: any = {
      surName: surName?.trim(),
      lastName: lastName?.trim(),
      username: username?.trim(),
      phoneNumber: phoneNumber?.trim() || null,
      profileCreated: true,
      userOnboarded: true,
      updatedAt: Date.now(),
    };

    // Add profile image if provided
    if (profileImage?.secure_url && profileImage?.public_id) {
      userUpdateData.profileImage = profileImage;
      userUpdateData.profilePicture = profileImage.secure_url;
    }

    // Add bio if provided (for creators)
    if (bio?.trim()) {
      userUpdateData.bio = bio.trim();
    }

    // 6. Perform updates within transaction
    const userUpdatePromise = User.findByIdAndUpdate(
      currentUser.userId,
      userUpdateData,
      { 
        session,
        new: true, // Return updated document
        runValidators: true // Ensure data validation
      }
    );

    const adminUpdatePromise = Admin.findByIdAndUpdate(
      adminId,
      {
        adminOnboarded: true,
        updatedAt: Date.now()
      },
      {
        session,
        new: true,
        runValidators: true
      }
    );

    // Execute both updates concurrently
    const [updatedUser, updatedAdmin] = await Promise.all([
      userUpdatePromise,
      adminUpdatePromise
    ]);

    // 7. Validate updates were successful
    if (!updatedUser) {
      await session.abortTransaction();
      return createErrorResponse('Failed to update user profile.', 500);
    }

    if (!updatedAdmin) {
      await session.abortTransaction();
      return createErrorResponse('Failed to update admin status.', 500);
    }

    // 8. Commit the transaction
    await session.commitTransaction();

    // 9. Revalidate the path for Next.js caching
    if (path) {
      revalidatePath(path);
    }

    return createSuccessResponse('Profile successfully created');

  } catch (error: any) {
    // 10. Handle transaction errors
    await session.abortTransaction();
    
    console.error('Profile creation error:', error);

    return createErrorResponse( error.message || 'Internal server error. Please try again.', 500);
  } finally {
    // 11. Always end the session
    await session.endSession();
  }
};