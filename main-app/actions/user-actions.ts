"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import User from "@/models/user";
import generateOtp from "@/utils/generateOtp";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/components";
import { VerificationEmailTemplate } from "@/components/email-templates/verification-email-template";
import { sendEmail } from "@/lib/send-email";
import mongoose from "mongoose";
import Agent from "@/models/agent";
import bcrypt from "bcryptjs";
import { deleteCloudinaryImages } from "./delete-cloudinary-image";
import Notification from "@/models/notification";
import { agentProps, propertyProps, userProps } from "@/lib/types";
import Apartment from "@/models/apartment";
import Rented from "@/models/rented";
import { TemporaryDeleteEmailTemplate } from "@/components/email-templates/temporary-delete-email-template";
import { capitalizeName } from "@/lib/utils";

interface apiResponse {
  success: boolean;
  message: string;
  status: number;
}

type Image = {
  public_id: string;
  secure_url: string;
};

type signUpValues = {
  role: string;
  username: string;
  email: string;
  password: string;
};

type restoreUserValues = {
  username: string;
  email: string;
  password: string;
};

type verifyValues = {
  otp: string;
  email?: string;
};

type resetPasswordValues = {
  email: string;
  otp: string;
  password: string;
};

type createAgentProfile = {
  surName: string;
  lastName: string;
  userId: string;
  profileImage: { public_id: string; secure_url: string };
  phoneNumber: string;
  city: string;
  state: string;
  officeNumber: string;
  agencyName: string;
  inspectionFeePerHour: number;
  agencyAddress: string;
  agentBio: string;
  additionalPhoneNumber?: string | undefined;
};

type createUserProfile = {
  surName: string;
  lastName: string;
  userId: string;
  profileImage: { public_id: string; secure_url: string };
  city: string;
  state: string;
  phoneNumber: string;
  additionalPhoneNumber?: string | undefined;
  userBio?: string | undefined;
};

type editUserProps = {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  profileImage?: Image;
  bio?: string;
  phoneNumber?: string;
  additionalPhoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  path: string;
  isNewImage: boolean;
};

type imageProps = {
  public_id: string;
  secure_url: string;
};

type singleAttachment = {
  _id: string;
  attachments: imageProps[];
};

type editAgentProfile = {
  officeNumber: string;
  officeAddress: string;
  agencyWebsite?: string;
  inspectionFeePerHour: number;
  coverImage?: Image;
};

type notificationProps = {
  _id: string;
  type:
    | "notification"
    | "inspection"
    | "rentouts"
    | "verification"
    | "pending"
    | "payment"
    | "add-clients"
    | "profile";
  title: string;
  content: string;
  propertyId?: string;
  issuer?: string;
  recipient?: string;
  seen: boolean;
  createdAt: string;
};

export const getUserByEmail = async (email: string) => {
  await connectToMongoDB();

  const user = await User.findOne({
    email: email,
    userAccountDeleted: false,
  }).exec();

  if (!user) {
    return;
  }

  const userData = JSON.parse(JSON.stringify(user));

  return userData as userProps;
};

export const getAgentById = async (id: string) => {
  await connectToMongoDB();

  const agent = await Agent.findById(id).exec();

  if (!agent) {
    return;
  }

  const agentData = JSON.parse(JSON.stringify(agent));

  return agentData;
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
    const user = await User.findOne({
      email: currentUserSession.user.email,
      userAccountDeleted: false,
    }).exec();

    if (!user) {
      return;
    }

    const currentUser = JSON.parse(JSON.stringify(user));

    revalidatePath("/");
    return currentUser as userProps;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const getCurrentUserDetails = async () => {
  await connectToMongoDB();

  const currentUserSession = await getUserSession();

  if (!currentUserSession?.user?.email) {
    return;
  }

  try {
    const user = await User.findOne({
      email: currentUserSession.user.email,
      userAccountDeleted: false,
    })
      .select(
        "_id profilePicture username firstName lastName bio phoneNumber additionalPhoneNumber address city state role userOnboarded profileCreated userVerified placeholderColor "
      )
      .exec();

    if (!user) {
      return;
    }

    const currentUser = JSON.parse(JSON.stringify(user));

    revalidatePath("/");
    return currentUser;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const createUser = async (value: signUpValues) => {
  const { role, username, email, password } = value;

  await connectToMongoDB();

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      if (existingUser.userAccountDeleted) {
        return {
          success: false,
          message: "Account was deleted. Will you like to restore it?",
          status: 408,
        };
      }
      return {
        success: false,
        message: "User already exists, go ahead and login",
        status: 409,
      };
    }

    const otp = generateOtp();
    const otpExpiresIn = Date.now() + 24 * 60 * 60 * 100;
    const newUser = await User.create({
      email,
      password,
      username,
      role,
      otp,
      otpExpiresIn,
    });
    newUser.save();

    const emailTemplate = await render(
      VerificationEmailTemplate({
        username,
        title: "Email Verification OTP",
        otp,
        message: "Your one-time password (OTP) for account verification is: ",
      })
    );

    const sendOption = {
      email: email,
      subject: "Email Account Verification",
      html: emailTemplate,
    };

    try {
      await sendEmail(sendOption);

      return {
        success: true,
        message: "User created! OTP has been sent to your email",
        status: 201,
      };
    } catch (error) {
      await User.findOneAndDelete({ _id: newUser._id });
      return {
        success: false,
        message: "User not created! Something went wrong",
        status: 500,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Internal server error, try again later!",
      status: 500,
    };
  }
};

export const restoreUser = async (value: restoreUserValues) => {
  const { username, email, password } = value;

  await connectToMongoDB();

  try {
    const existingUser = await User.findOne({
      email: email,
      username: username,
    });

    if (existingUser) {
      if (!existingUser.password) {
        return { success: false, message: "Invalid account data", status: 500 };
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!passwordMatch) {
        return { success: false, message: "Invalid credentials", status: 401 };
      }

      if (existingUser.userAccountDeleted) {
        const otp = generateOtp();
        const otpExpiresIn = Date.now() + 24 * 60 * 60 * 1000;

        // Restore the existing account instead of creating a new one
        await User.findOneAndUpdate(
          { _id: existingUser._id },
          {
            userAccountDeleted: false,
            otp: otp,
            otpExpiresIn: otpExpiresIn,
            userVerified: false, // Reset verification status
          }
        );

        const emailTemplate = await render(
          VerificationEmailTemplate({
            username: existingUser.username,
            title: "Account Restored - Email Verification OTP",
            otp,
            message:
              "Your account has been restored. Your one-time password (OTP) for account verification is: ",
          })
        );

        const sendOption = {
          email: email,
          subject: "Account Restored - Email Verification",
          html: emailTemplate,
        };

        try {
          await sendEmail(sendOption);

          return {
            success: true,
            message:
              "Account restored! OTP has been sent to your email for verification",
            status: 200,
          };
        } catch (error) {
          // Revert the restoration if email fails
          await User.findOneAndUpdate(
            { _id: existingUser._id },
            { userAccountDeleted: true, otp: null, otpExpiresIn: null }
          );
          return {
            success: false,
            message: "Account restoration failed! Something went wrong",
            status: 500,
          };
        }
      }
      return {
        success: false,
        message: "Account is active, go ahead and login",
        status: 409,
      };
    } else {
      return {
        success: false,
        message: "No account found with this credentials",
        status: 404,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Internal server error, try again later!",
      status: 500,
    };
  }
};

export const createUserProfile = async (values: createUserProfile) => {
  const {
    profileImage,
    phoneNumber,
    city,
    state,
    userBio,
    additionalPhoneNumber,
    userId,
    surName,
    lastName,
  } = values;

  const current_user = await getCurrentUser();

  await connectToMongoDB();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (current_user._id !== userId) {
    return {
      success: false,
      message: "You are not authorized to access this feature",
      status: 403,
    };
  }

  if (current_user.role !== "user") {
    return {
      success: false,
      message: "You are not authorized to access this feature",
      status: 403,
    };
  }

  const userUpdate = {
    surName: surName,
    lastName: lastName,
    profilePicture: profileImage.secure_url,
    profileImage: profileImage,
    bio: userBio,
    phoneNumber: phoneNumber,
    additionalPhoneNumber: additionalPhoneNumber,
    city: city,
    state: state,
    userOnboarded: true,
    profileCreated: true,
  };

  const createNotification = {
    type: "profile",
    title: "Profile Created!!!",
    content: `Congratulations dear ${surName} ${lastName}, you have successfully created your profile and therefore your membership has been verified. You now have access to all that Nomeo Realtors have to offer.`,
    recipient: current_user._id,
  };

  try {
    await User.findOneAndUpdate({ _id: current_user._id }, userUpdate);

    const notification = await Notification.create(createNotification);
    notification.save();

    revalidatePath("/");
    return {
      success: true,
      message: "Profile successfully created!",
      status: 201,
    };
  } catch (error) {
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const editUserProfile = async (values: editUserProps) => {
  const {
    profileImage,
    phoneNumber,
    city,
    state,
    bio,
    additionalPhoneNumber,
    username,
    userId,
    profilePicture,
    address,
    firstName,
    lastName,
    isNewImage,
    path,
  } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (current_user._id !== userId) {
    return {
      success: false,
      message: "You are not authorized to access this feature",
      status: 403,
    };
  }

  if (
    isNewImage &&
    current_user.profileImage &&
    current_user.profileImage.public_id
  ) {
    deleteCloudinaryImages(current_user.profileImage.public_id);
  }

  try {
    await User.findOneAndUpdate(
      { _id: userId },
      {
        profileImage,
        profilePicture,
        phoneNumber,
        city,
        state,
        bio,
        additionalPhoneNumber,
        username,
        firstName,
        lastName,
        address,
      }
    );

    revalidatePath(path);
    return {
      success: true,
      message: "Profile successfully updated!",
      status: 200,
    };
  } catch (error) {
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const createAgent = async (
  value: signUpValues
): Promise<apiResponse> => {
  const { email, password, username, role } = value;

  // Validate role early
  if (role !== "agent") {
    return {
      success: false,
      message: "Role must be agent to create account.",
      status: 400,
    };
  }

  try {
    await connectToMongoDB();

    // Check for existing user
    if (await User.findOne({ email }).lean()) {
      return {
        success: false,
        message: "Email already used by an account!",
        status: 409,
      };
    }

    const otp = generateOtp();
    const otpExpiresIn = Date.now() + 24 * 60 * 60 * 1000;

    const userData = {
      email,
      password,
      username,
      otp,
      otpExpiresIn,
      role,
      userIsAnAgent: true,
    };

    const newUser = await User.create(userData);

    try {
      const newAgent = await Agent.create({userId: newUser._id,});

      newUser.agentId = newAgent._id as mongoose.Types.ObjectId;
      await newUser.save();

      const emailTemplate = await render(
        VerificationEmailTemplate({
          username,
          title: "Email Verification OTP",
          otp,
          message: "Your one-time password (OTP) for account verification is: ",
        })
      );

      await sendEmail({
        email,
        subject: "Email Account Verification",
        html: emailTemplate,
      });

      return {
        success: true,
        message: "Account created! OTP has been sent to your email",
        status: 201,
      };
    } catch (error) {
      
      await User.findByIdAndDelete(newUser._id);
      await Agent.findOneAndDelete({ userId: newUser._id });
      throw error;
    }
  } catch (error) {
    console.error("Error creating agent:", error);
    return {
      success: false,
      message: "Internal server error, try again later!",
      status: 500,
    };
  }
};

export const createAgentProfile = async (values: createAgentProfile) => {
  const {
    profileImage,
    phoneNumber,
    city,
    state,
    officeNumber,
    agencyName,
    inspectionFeePerHour,
    agencyAddress,
    agentBio,
    additionalPhoneNumber,
    userId,
    surName,
    lastName,
  } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (current_user._id !== userId) {
    return {
      success: false,
      message: "You are not authorized to access this feature",
      status: 403,
    };
  }

  if (current_user.role !== "agent") {
    return {
      success: false,
      message: "You are not authorized to access this feature",
      status: 403,
    };
  }

  const userUpdate = {
    surName: surName,
    lastName: lastName,
    profilePicture: profileImage.secure_url,
    profileImage: profileImage,
    bio: agentBio,
    phoneNumber: phoneNumber,
    additionalPhoneNumber: additionalPhoneNumber,
    address: agencyAddress,
    city: city,
    state: state,
    userOnboarded: true,
    profileCreated: true,
  };

  const agentUpdate = {
    officeNumber: officeNumber,
    officeAddress: agencyAddress,
    agencyName: agencyName,
    inspectionFeePerHour: inspectionFeePerHour,
    verificationStatus: "pending",
  };

  const createNotification = {
    type: "profile",
    title: "Profile Created!!!",
    content: `Congratulations dear ${surName} ${lastName}, you have successfully created your profile and therefore your membership has been verified. You now have access to all that Nomeo Realtors have to offer.`,
    recipient: current_user._id,
  };

  try {
    await User.findOneAndUpdate({ _id: current_user._id }, userUpdate);
    await Agent.findOneAndUpdate({ _id: current_user.agentId }, agentUpdate);

    const notification = await Notification.create(createNotification);
    notification.save();

    revalidatePath("/");
    return {
      success: true,
      message: "Profile successfully created!",
      status: 201,
    };
  } catch (error) {
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const verifyAccount = async (value: verifyValues) => {
  const { otp, email } = value;

  if (!otp) {
    return {
      success: false,
      message: "OTP is required for account verification.",
      status: 400,
    };
  }

  await connectToMongoDB();

  const user = await User.findOne({ email: email });

  if (!user) {
    return { success: false, message: "User does not exist", status: 404 };
  }

  try {
    if (user.otp !== otp) {
      return { success: false, message: "OTP sent is invalid", status: 403 };
    }

    if (user.otpExpiresIn && Date.now() > user.otpExpiresIn) {
      return {
        success: false,
        message: "OTP sent has expired. Please request a new OTP.",
        status: 403,
      };
    }

    await User.findOneAndUpdate(
      { _id: user._id, email: user.email, role: user.role },
      { userVerified: true, otp: null, otpExpiresIn: null }
    );

    const createNotification = {
      type: "notification",
      title: "Email Verified!!!",
      content:
        "Welcome to Nomeo Realtors. We are glad to have you, either you are just a user or an agent. When you login, there will be a prompt to create your profile. This will not take much time after which your membership will be fully verified.",
      recipient: user._id,
    };

    const notification = await Notification.create(createNotification);
    notification.save();

    return {
      success: true,
      message: "Email verified!! Welcome to Nomeo Realtors!",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: "Email verification failed, try again later!",
      status: 500,
    };
  }
};

export const resendOtp = async (email: string) => {
  let verificationDetails:
    | {
        username: string;
        title: string;
        otp: string;
        message: string;
      }
    | undefined;

  if (!email) {
    return {
      success: false,
      message: "Email is required for new OTP",
      status: 400,
    };
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return { success: false, message: "User does not exist!", status: 404 };
  }

  if (user.userVerified) {
    return {
      success: false,
      message: "This account is already verified",
      status: 400,
    };
  }

  await connectToMongoDB();

  const otp = generateOtp();
  const otpExpiresIn = Date.now() + 24 * 60 * 60 * 1000;

  if (user.userIsAnAgent && user.agentId) {
    const agent = await Agent.findOne({ _id: user.agentId });

    if (agent) {
      verificationDetails = {
        username: agent.licenseNumber,
        title: "New OTP Verification Code",
        otp: otp,
        message:
          "Your new one-time password (OTP) for account verification is: ",
      };

      await User.findOneAndUpdate(
        { email: email },
        { otp: otp, otpExpiresIn: otpExpiresIn }
      );
    } else {
      return {
        success: false,
        message: "Something went wrong! Try again later",
        status: 500,
      };
    }
  } else {
    verificationDetails = {
      username: user.username,
      title: "New OTP Verification Code",
      otp: otp,
      message: "Your new one-time password (OTP) for account verification is: ",
    };

    await User.findOneAndUpdate(
      { email: email },
      { otp: otp, otpExpiresIn: otpExpiresIn }
    );
  }

  if (!verificationDetails) {
    return {
      success: false,
      message: "Verification details are missing",
      status: 403,
    };
  }

  const emailTemplate = await render(
    VerificationEmailTemplate(verificationDetails)
  );

  const sendOption = {
    email: email,
    subject: "New Verification Code",
    html: emailTemplate,
  };

  try {
    await sendEmail(sendOption);

    return {
      success: true,
      message: "New OTP has been sent to your email",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: "New OTP not sent! Something went wrong",
      status: 500,
    };
  }
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    return { success: false, message: "User not found!", status: 404 };
  }

  await connectToMongoDB();

  const otp = generateOtp();
  const resetOtpExpiresIn = Date.now() + 30000;

  await User.findOneAndUpdate(
    { email: email },
    { resetPasswordOtp: otp, resetPasswordOtpExpresIn: resetOtpExpiresIn }
  );

  try {
    const emailTemplate = await render(
      VerificationEmailTemplate({
        username: user.username,
        title: "Password Reset OTP",
        otp,
        message: "Your one-time password (OTP) for password reset is: ",
      })
    );

    const sendOption = {
      email: email,
      subject: "Password Reset Request",
      html: emailTemplate,
    };

    try {
      await sendEmail(sendOption);

      return {
        success: true,
        message: "Password resetOTP has been sent to your email",
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Password reset OTP not sent! Something went wrong",
        status: 500,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Internal server error, try again later!",
      status: 500,
    };
  }
};

export const resetPassword = async (value: resetPasswordValues) => {
  const { email, password, otp } = value;

  const user = await User.findOne({ email: email, resetPasswordOtp: otp });

  if (!user) {
    return { success: false, message: "User not found!", status: 404 };
  }

  await connectToMongoDB();

  const new_password = await bcrypt.hash(password, 10);

  try {
    await User.findOneAndUpdate(
      { email: email },
      {
        password: new_password,
        resetPasswordOtp: null,
        resetPasswordOtpExpresIn: null,
      }
    );

    return {
      success: true,
      message: "Password reset successful! Go ahead and log in",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: "Password reset Failed! Try again later",
      status: 500,
    };
  }
};

export const changeProfileImage = async (value: {
  secure_url: string;
  public_id: string;
  userId: string;
  isNewImage: boolean;
  path: string;
}) => {
  await connectToMongoDB();

  const { secure_url, public_id, userId, isNewImage, path } = value;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (current_user._id !== userId) {
    return {
      success: false,
      message: "You do not have access to this feature",
      status: 403,
    };
  }

  const oldProfileImage = current_user.profileImage;

  if (isNewImage && oldProfileImage && oldProfileImage.public_id) {
    deleteCloudinaryImages(oldProfileImage.public_id);
  }

  const profileImage = { secure_url: secure_url, public_id: public_id };

  try {
    await User.findOneAndUpdate(
      { _id: userId },
      { profileImage: profileImage, profilePicture: secure_url }
    );

    revalidatePath(path);
    return {
      success: true,
      message: "Profile image successfully changed",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const changePassword = async (value: {
  oldPassword: string;
  newPassword: string;
  userId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { oldPassword, newPassword, userId, path } = value;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (current_user._id !== userId) {
    return {
      success: false,
      message: "You do not have access to this feature",
      status: 403,
    };
  }

  const rawUserData = await User.findOne({ _id: userId });

  if (!rawUserData) {
    return;
  }

  const oldHashedPassword = rawUserData.password;

  if (!oldHashedPassword) {
    return;
  }

  const oldpasswordMatch = await bcrypt.compare(oldPassword, oldHashedPassword);

  if (!oldpasswordMatch) {
    return {
      success: false,
      message: "Old password is incorrect!!",
      status: 403,
    };
  }

  if (oldpasswordMatch && oldPassword === newPassword) {
    return {
      success: false,
      message: "Password change not necessary",
      status: 403,
    };
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await User.findOneAndUpdate(
      { _id: userId },
      { password: newHashedPassword }
    );

    revalidatePath(path);
    return {
      success: true,
      message: "Password successfully changed.",
      status: 200,
    };
  } catch (error) {
    console.error(error);

    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const changeEmailStart = async (value: {
  newEmail: string;
  userId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { newEmail, userId, path } = value;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (current_user._id !== userId) {
    return {
      success: false,
      message: "You do not have access to this feature",
      status: 403,
    };
  }

  if (current_user.email === newEmail) {
    return {
      success: false,
      message: "Email change not necessary",
      status: 403,
    };
  }

  const emailExists = await User.findOne({ email: newEmail });

  if (emailExists) {
    return {
      success: false,
      message: "Email address already in use",
      status: 403,
    };
  }

  const otp = generateOtp();
  const otpExpiresIn = Date.now() + 24 * 60 * 60 * 1000;

  const verificationDetails = {
    username: current_user.username,
    title: "OTP Verification Code",
    otp: otp,
    message:
      "Your new one-time password (OTP) for email change verification is: ",
  };

  await User.findOneAndUpdate(
    { _id: userId },
    { otp: otp, otpExpiresIn: otpExpiresIn }
  );

  const emailTemplate = await render(
    VerificationEmailTemplate(verificationDetails)
  );

  const sendOption = {
    email: newEmail,
    subject: "Email Change Verification",
    html: emailTemplate,
  };

  try {
    await sendEmail(sendOption);

    revalidatePath(path);
    return {
      success: true,
      message: "Verification OTP has been sent to your email",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: "Verification OTP not sent! Something went wrong",
      status: 500,
    };
  }
};

export const changeEmail = async (value: {
  email: string;
  otp: string;
  path: string;
  userId: string;
}) => {
  await connectToMongoDB();

  const { email, userId, path, otp } = value;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (current_user._id !== userId) {
    return {
      success: false,
      message: "You do not have access to this feature",
      status: 403,
    };
  }

  try {
    if (current_user.otp !== otp) {
      return { success: false, message: "OTP sent is invalid", status: 403 };
    }

    if (current_user.otpExpiresIn && Date.now() > current_user.otpExpiresIn) {
      return {
        success: false,
        message: "OTP sent has expired. Please request a new OTP.",
        status: 403,
      };
    }

    await User.findOneAndUpdate(
      { _id: current_user._id },
      { email: email, userVerified: true, otp: null, otpExpiresIn: null }
    );

    revalidatePath(path);
    return { success: true, message: "Email succesfully changed", status: 200 };
  } catch (error) {
    return {
      success: false,
      message: "Verification OTP not sent! Something went wrong",
      status: 500,
    };
  }
};

export const changeAgencyAddress = async (values: {
  agentId: string;
  newAddress: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { agentId, newAddress, path } = values;
  const current_user = await getCurrentUser();

  const agent = await getAgentById(agentId);

  if (!agent) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!current_user || agent.userId !== current_user._id) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  try {
    await Agent.findOneAndUpdate(
      { _id: agentId },
      { officeAddress: newAddress }
    );

    revalidatePath(path);
    return {
      success: true,
      message: "Office address successfully changed",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to update office address.",
      status: 403,
    };
  }
};

export const changeInspectionFee = async (values: {
  agentId: string;
  newFee: number;
  path: string;
}) => {
  await connectToMongoDB();

  const { agentId, newFee, path } = values;
  const current_user = await getCurrentUser();

  const agent = await getAgentById(agentId);

  if (!agent) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!current_user || agent.userId !== current_user._id) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  try {
    await Agent.findOneAndUpdate(
      { _id: agentId },
      { inspectionFeePerHour: newFee }
    );

    revalidatePath(path);
    return {
      success: true,
      message: "Inspection fee successfully changed",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to update inspection fee.",
      status: 403,
    };
  }
};

export const changeOfficeNumber = async (values: {
  agentId: string;
  newNumber: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { agentId, newNumber, path } = values;
  const current_user = await getCurrentUser();

  const agent = await getAgentById(agentId);

  if (!agent) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!current_user || agent.userId !== current_user._id) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  try {
    await Agent.findOneAndUpdate({ _id: agentId }, { officeNumber: newNumber });

    revalidatePath(path);
    return {
      success: true,
      message: "Office number successfully changed",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to update office number.",
      status: 403,
    };
  }
};

export const changePhoneNumber = async (values: {
  userId: string;
  newNumber: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { userId, newNumber, path } = values;
  const current_user = await getCurrentUser();

  if (!current_user || current_user._id !== userId) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  try {
    await User.findOneAndUpdate({ _id: userId }, { phoneNumber: newNumber });

    revalidatePath(path);
    return {
      success: true,
      message: "Phone number successfully changed",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to update phone number.",
      status: 403,
    };
  }
};

export const toggleListings = async (values: {
  agentId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { agentId, path } = values;
  const agent = await Agent.findById(agentId);

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are logged in", status: 403 };
  }

  if (!agent) {
    return { success: false, message: "Agent does not exist", status: 403 };
  }

  const alreadyToggled = agent.getListings;

  try {
    if (alreadyToggled) {
      await Agent.findOneAndUpdate({ _id: agentId }, { getListings: false });

      revalidatePath(path);
      return {
        success: true,
        message: "You will no longer get client listings.",
        status: 200,
      };
    } else {
      await Agent.findOneAndUpdate({ _id: agentId }, { getListings: true });

      revalidatePath(path);
      return {
        success: true,
        message: "You will be getting client listings henceforth.",
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to update listings.",
      status: 500,
    };
  }
};

export const toggleLikedApartments = async (values: {
  userId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { userId, path } = values;
  const user = await User.findById(userId);

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!user) {
    return { success: false, message: "User does not exist", status: 403 };
  }

  const alreadyToggled = user.showLikedApartments;

  try {
    if (alreadyToggled) {
      await User.findOneAndUpdate(
        { _id: userId },
        { showLikedApartments: false }
      );

      revalidatePath(path);
      return {
        success: true,
        message: "You will not get list of like apartments.",
        status: 200,
      };
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { showLikedApartments: true },
        { upsert: true }
      );

      revalidatePath(path);
      return {
        success: true,
        message: "You will be getting list of liked apartments.",
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to access feature.",
      status: 500,
    };
  }
};

export const toggleBookmarkedApartments = async (values: {
  userId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { userId, path } = values;
  const user = await User.findById(userId);

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!user) {
    return { success: false, message: "User does not exist", status: 403 };
  }

  const alreadyToggled = user.showBookmarkedApartments;

  try {
    if (alreadyToggled) {
      await User.findOneAndUpdate(
        { _id: userId },
        { showBookmarkedApartments: false }
      );

      revalidatePath(path);
      return {
        success: true,
        message: "You will not get list of bookmarked apartments.",
        status: 200,
      };
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { showBookmarkedApartments: true },
        { upsert: true }
      );

      revalidatePath(path);
      return {
        success: true,
        message: "You will be getting list of bookmarked apartments.",
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to access feature.",
      status: 500,
    };
  }
};

export const toggleLikedBlogs = async (values: {
  userId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { userId, path } = values;
  const user = await User.findById(userId);

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!user) {
    return { success: false, message: "User does not exist", status: 403 };
  }

  const alreadyToggled = user.showLikedBlogs;

  try {
    if (alreadyToggled) {
      await User.findOneAndUpdate({ _id: userId }, { showLikedBlogs: false });

      revalidatePath(path);
      return {
        success: true,
        message: "You will not get list of like blogs.",
        status: 200,
      };
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { showLikedBlogs: true },
        { upsert: true }
      );

      revalidatePath(path);
      return {
        success: true,
        message: "You will be getting list of liked blogs.",
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to access feature.",
      status: 500,
    };
  }
};

export const toggleBookmarkedBlogs = async (values: {
  userId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { userId, path } = values;
  const user = await User.findById(userId);

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!user) {
    return { success: false, message: "User does not exist", status: 403 };
  }

  const alreadyToggled = user.showBookmarkedBlogs;

  try {
    if (alreadyToggled) {
      await User.findOneAndUpdate(
        { _id: userId },
        { showBookmarkedBlogs: false }
      );

      revalidatePath(path);
      return {
        success: true,
        message: "You will not get list of like apartments.",
        status: 200,
      };
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { showBookmarkedBlogs: true },
        { upsert: true }
      );

      revalidatePath(path);
      return {
        success: true,
        message: "You will be getting list of liked apartments.",
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to access feature.",
      status: 500,
    };
  }
};

export const deleteAccount = async (values: {
  email: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { email, path } = values;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return {
      success: false,
      message: "You are not logged in, login to access this feature",
      status: 403,
    };
  }

  if (current_user.email !== email) {
    return {
      success: false,
      message: "The email address does not match!",
      status: 404,
    };
  }

  const surname = capitalizeName(current_user.surName || "");
  const lastname = capitalizeName(current_user.lastName || "");
  const name = `${surname} ${lastname}`;

  const emailTemplate = await render(TemporaryDeleteEmailTemplate({ name }));

  const sendOption = {
    email: email,
    subject: " Your Account Has Been Temporarily Deleted",
    html: emailTemplate,
  };

  try {
    await sendEmail(sendOption);

    await User.findOneAndUpdate(
      { _id: current_user._id, email: email },
      { userAccountDeleted: true }
    );
    revalidatePath(path);

    return {
      success: true,
      message: "Account successfully deleted",
      status: 200,
    };
  } catch (error) {
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const transferAccount = async (values: {
  oldEmail: string;
  newEmail: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { oldEmail, newEmail, path } = values;
  const current_user = await getCurrentUser();

  if (!current_user) {
    return {
      success: false,
      message: "You are not logged in, login to access this feature",
      status: 403,
    };
  }

  const oldAgent = await Agent.findOne({ _id: current_user._id });
  const oldAgentData = JSON.parse(JSON.stringify(oldAgent)) as agentProps;

  if (current_user) {
    if (current_user.role !== "agent" && !oldAgent) {
      return {
        success: false,
        message: "You are authorized to access this feature",
        status: 403,
      };
    }
  }

  if (current_user.email !== oldEmail) {
    return {
      success: false,
      message: "Your credentials does not match! Check and retype",
      status: 403,
    };
  }

  const newUser = await getUserByEmail(newEmail);

  if (!newUser) {
    return {
      success: false,
      message: "New account does not exist! Use email of an existing account",
      status: 403,
    };
  }

  if (newUser) {
    if (newUser.role !== "agent" && newUser.userVerified !== true) {
      return {
        success: false,
        message: "You can only transfer account to a verified agent like you",
        status: 403,
      };
    }
  }

  const properties = await Apartment.find({ agent: current_user.agentId });
  const oldAgentProperties = JSON.parse(
    JSON.stringify(properties)
  ) as propertyProps[];

  if (oldAgentProperties && oldAgentProperties.length > 0) {
    const propertyId = oldAgentProperties.map((item) => item._id);
    if (propertyId.length > 0) {
      await Apartment.updateMany(
        { _id: { $in: propertyId } },
        { agent: newUser.agentId }
      );
      await Rented.updateMany(
        { apartment: { $in: propertyId } },
        { agent: newUser.agentId }
      );

      propertyId.forEach(async (element) => {
        await Agent.findOneAndUpdate(
          { _id: newUser.agentId },
          { apartments: { $push: element } }
        );
      });
    }
  }

  if (oldAgentData && oldAgentData.clients.length > 0) {
    oldAgentData.clients.forEach(async (element) => {
      await Agent.findOneAndUpdate(
        { _id: newUser.agentId },
        { clients: { $push: element } }
      );
    });
  }

  if (oldAgentData && oldAgentData.inspections.length > 0) {
    oldAgentData.clients.forEach(async (element) => {
      await Agent.findOneAndUpdate(
        { _id: newUser.agentId },
        { inspections: { $push: element } }
      );
    });
  }

  const notifications = await Notification.find({
    recipient: current_user._id,
  });
  const oldNotifications = JSON.parse(
    JSON.stringify(notifications)
  ) as notificationProps[];

  if (oldNotifications && oldNotifications.length > 0) {
    const notificationIds = oldNotifications.map(
      (item) => item._id
    ) as string[];
    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { recipient: newUser._id }
    );

    notificationIds.forEach(async (element) => {
      await User.findOneAndUpdate(
        { _id: newUser._id },
        { notifications: { $push: element } }
      );
    });
  }

  try {
    if (
      current_user &&
      current_user.profileImage &&
      current_user.profileImage.public_id !== undefined
    ) {
      deleteCloudinaryImages(current_user.profileImage.public_id);
    }

    await User.deleteOne({ _id: current_user._id });
    revalidatePath(path);

    return {
      success: true,
      message: "You have successfully transferred your account",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: true,
      message: "Error occurred while transferring account",
      status: 500,
    };
  }
};

export const toggleCollaborator = async (values: {
  userId: string;
  path: string;
}) => {
  await connectToMongoDB();

  const { userId, path } = values;
  const user = await User.findById(userId);

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (!user) {
    return { success: false, message: "User does not exist", status: 403 };
  }

  const alreadyToggled = user.blogCollaborator;
  const isAnAgent = user.userIsAnAgent && user.agentId !== undefined;

  try {
    if (alreadyToggled) {
      await User.findOneAndUpdate({ _id: userId }, { blogCollaborator: false });

      if (isAnAgent) {
        await Agent.findOneAndUpdate(
          { _id: user.agentId },
          { isACollaborator: false }
        );
      }

      revalidatePath(path);
      return {
        success: true,
        message: "You are no longer a collaborator on blogs.",
        status: 200,
      };
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { blogCollaborator: true },
        { upsert: true }
      );

      if (isAnAgent) {
        await Agent.findOneAndUpdate(
          { _id: user.agentId },
          { isACollaborator: true }
        );
      }

      revalidatePath(path);
      return {
        success: true,
        message: "You are now a collaborator on blogs.",
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong while trying to access feature.",
      status: 500,
    };
  }
};
