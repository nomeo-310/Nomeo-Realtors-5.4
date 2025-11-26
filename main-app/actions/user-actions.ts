"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import mongoose from "mongoose";
import User from "@/models/user";
import Agent from "@/models/agent";
import Notification from "@/models/notification";
import Apartment from "@/models/apartment";
import Rentout from "@/models/rentout";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import generateOtp from "@/utils/generateOtp";
import { capitalizeName } from "@/lib/utils";
import { render } from "@react-email/components";
import { sendEmail } from "@/lib/send-email";
import { VerificationEmailTemplate } from "@/components/email-templates/verification-email-template";
import { TemporaryDeleteEmailTemplate } from "@/components/email-templates/temporary-delete-email-template";
import { deleteCloudinaryImages } from "./delete-cloudinary-image";
import { userProps } from "@/lib/types";
import Suspension from "@/models/suspension";

// Types
interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  data?: any;
}

interface Image {
  public_id: string;
  secure_url: string;
}

interface SignUpValues {
  role: string;
  username: string;
  email: string;
  password: string;
}

interface VerifyValues {
  otp: string;
  email?: string;
}

interface CreateAgentProfile {
  surName: string;
  lastName: string;
  userId: string;
  profileImage: Image;
  phoneNumber: string;
  city: string;
  state: string;
  officeNumber: string;
  agencyName: string;
  inspectionFeePerHour: number;
  agencyAddress: string;
  agentBio: string;
  additionalPhoneNumber?: string;
}

interface CreateUserProfile {
  surName: string;
  lastName: string;
  userId: string;
  profileImage: Image;
  city: string;
  state: string;
  phoneNumber: string;
  additionalPhoneNumber?: string;
  userBio?: string;
}

interface EditUserProps {
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
}

interface ResetPasswordValues {
  email: string;
  otp: string;
  password: string;
}

interface AppealSuspensionParams {
  email: string;
  appealReason: string;
  licenseNumber?: string;
  role: string;
  path: string;
}

// Constants
const OTP_EXPIRY_MS = 24 * 60 * 60 * 1000;
const RESET_OTP_EXPIRY_MS = 30000;

// Utility functions
const handleServerError = (error: unknown): ApiResponse => {
  console.error("Server error:", error);
  return {
    success: false,
    message: "Internal server error, try again later!",
    status: 500,
  };
};

const validateUserAccess = (currentUser: userProps | null, userId: string): ApiResponse | null => {
  if (!currentUser) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  if (currentUser._id !== userId) {
    return {
      success: false,
      message: "You are not authorized to access this feature",
      status: 403
    };
  }

  return null;
};

const sendVerificationEmail = async (
  email: string,
  username: string,
  otp: string,
  subject: string,
  customMessage?: string
): Promise<boolean> => {
  try {
    const emailTemplate = await render(
      VerificationEmailTemplate({
        username,
        title: subject,
        otp,
        message: customMessage || "Your one-time password (OTP) is: "
      })
    );

    await sendEmail({ email, subject, html: emailTemplate });
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

// User functions
export const getUserByEmail = async (email: string): Promise<userProps | undefined> => {
  await connectToMongoDB();
  const user = await User.findOne({ email }).lean().exec();
  return user ? JSON.parse(JSON.stringify(user)) : undefined;
};

export const getAgentById = async (id: string): Promise<any> => {
  await connectToMongoDB();
  const agent = await Agent.findById(id).lean().exec();
  return agent ? JSON.parse(JSON.stringify(agent)) : undefined;
};

export const getUserSession = async () => {
  return await getServerSession(authOptions);
};

export const getCurrentUser = async (): Promise<userProps | null> => {
  await connectToMongoDB();
  const currentUserSession = await getUserSession();

  if (!currentUserSession?.user?.email) {
    return null;
  }

  try {
    const user = await User.findOne({
      email: currentUserSession.user.email,
      userAccountDeleted: false,
    }).lean().exec();

    if (!user) return null;

    const currentUser = JSON.parse(JSON.stringify(user));
    revalidatePath("/");
    return currentUser;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const getCurrentUserDetails = async (): Promise<any> => {
  await connectToMongoDB();
  const currentUserSession = await getUserSession();

  if (!currentUserSession?.user?.email) {
    return undefined;
  }

  try {
    const user = await User.findOne({
      email: currentUserSession.user.email,
      userAccountDeleted: false,
    })
      .select("_id profilePicture username surName lastName bio phoneNumber additionalPhoneNumber address city state role userOnboarded profileCreated userVerified placeholderColor email")
      .lean()
      .exec();

    if (!user) return undefined;

    const currentUser = JSON.parse(JSON.stringify(user));
    revalidatePath("/");
    return currentUser;
  } catch (error) {
    console.error("Get current user details error:", error);
    return undefined;
  }
};

// Helper function to check if account is within recovery period
const checkIfWithinRecoveryPeriod = (deletedAt: Date): boolean => {
  const deletionDate = new Date(deletedAt);
  const thirtyDaysAfterDeletion = new Date(deletionDate.getTime() + (30 * 24 * 60 * 60 * 1000));
  return new Date() <= thirtyDaysAfterDeletion;
};

// Auth functions
export const createUser = async (values: SignUpValues): Promise<ApiResponse> => {
  const { role, username, email, password } = values;
  await connectToMongoDB();

  try {
    const existingUser = await User.findOne({ email }).lean().exec();

    if (existingUser) {
      // Check for suspended account first
      if (existingUser.userAccountSuspended) {
        const suspensionMessage = existingUser.suspensionReason
          ? `Your account has been suspended for: ${existingUser.suspensionReason}. Please contact support to appeal.`
          : "Your account has been suspended. Please contact support to appeal this decision.";

        return {
          success: false,
          message: suspensionMessage,
          status: existingUser.role === 'user' ? 423 : 424,
          data: {
            accountStatus: 'suspended',
            canAppeal: true,
            role: existingUser.role,
            suspensionReason: existingUser.suspensionReason
          }
        };
      }

      // Check for deleted account
      if (existingUser.userAccountDeleted) {
        const isWithinRecoveryPeriod = checkIfWithinRecoveryPeriod(existingUser.deletedAt);

        if (!isWithinRecoveryPeriod) {
          return {
            success: false,
            message: "This account was permanently deleted and cannot be restored. Please create a new account.",
            status: 410,
          };
        }

        return {
          success: false,
          message: "Account was deleted. Would you like to restore it?",
          status: existingUser.role === 'user' ? 407 : 408,
          data: {
            accountStatus: 'deleted',
            canRestore: true,
            role: existingUser.role
          }
        };
      }

      return {
        success: false,
        message: "User already exists, go ahead and login",
        status: 409,
      };
    }

    const otp = generateOtp();
    const newUser = await User.create({
      email, password, username, role, otp,
      otpExpiresIn: Date.now() + OTP_EXPIRY_MS,
    });

    const emailSent = await sendVerificationEmail(email, username, otp, "Email Account Verification");

    if (!emailSent) {
      await User.findByIdAndDelete(newUser._id);
      return {
        success: false,
        message: "User not created! Email failed",
        status: 500,
      };
    }

    return {
      success: true,
      message: "User created! OTP sent to your email",
      status: 201,
    };
  } catch (error) {
    return handleServerError(error);
  }
};

export const restoreUser = async (values: {
  username: string;
  email: string;
  password: string;
}): Promise<ApiResponse> => {
  const { username, email, password } = values;
  await connectToMongoDB();

  try {
    const existingUser = await User.findOne({ email, username });

    if (!existingUser) {
      return {
        success: false,
        message: "No account found with these credentials",
        status: 404,
      };
    }

    if (!existingUser.password) {
      return {
        success: false,
        message: "Invalid account data",
        status: 500
      };
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid credentials",
        status: 401
      };
    }


    if (!existingUser.userAccountDeleted && (existingUser.otp !== null && existingUser.otpExpiresIn !== null)) {

      const otp = generateOtp();
      await User.findByIdAndUpdate(existingUser._id, {
        userAccountDeleted: false,
        otp,
        otpExpiresIn: Date.now() + OTP_EXPIRY_MS,
        userVerified: false,
      });
      return {
        success: true,
        message: "New OTP sent to your email",
        status: 200,
      };
    }

    if (!existingUser.userAccountDeleted) {
      return {
        success: false,
        message: "Account is active, go ahead and login",
        status: 409,
      };
    }

    const otp = generateOtp();
    await User.findByIdAndUpdate(existingUser._id, {
      userAccountDeleted: false,
      otp,
      otpExpiresIn: Date.now() + OTP_EXPIRY_MS,
      userVerified: false,
      deletedAt: null,
      deletedBy: null,
    });

    const emailSent = await sendVerificationEmail(
      email,
      existingUser.username,
      otp,
      "Account Restored - Email Verification",
      "Your account has been restored. Your one-time password (OTP) for account verification is: "
    );

    if (!emailSent) {
      await User.findByIdAndUpdate(existingUser._id, {
        userAccountDeleted: true,
        otp: null,
        otpExpiresIn: null,
      });
      return {
        success: false,
        message: "Account restoration failed! Email failed",
        status: 500,
      };
    }

    return {
      success: true,
      message: "Account restored! OTP sent to your email",
      status: 200,
    };
  } catch (error) {
    return handleServerError(error);
  }
};

export const createAgent = async (values: SignUpValues): Promise<ApiResponse> => {
  const { email, password, username, role } = values;

  if (role !== "agent") {
    return {
      success: false,
      message: "Role must be agent",
      status: 400,
    };
  }

  try {
    await connectToMongoDB();

    const existingUser = await User.findOne({ email }).lean().exec();

    if (existingUser) {
      // Check for suspended account first
      if (existingUser.userAccountSuspended) {
        const suspensionMessage = existingUser.suspensionReason
          ? `Your account has been suspended for: ${existingUser.suspensionReason}. Please contact support to appeal.`
          : "Your account has been suspended. Please contact support to appeal this decision.";

        return {
          success: false,
          message: suspensionMessage,
          status: existingUser.role === 'user' ? 423 : 424,
          data: {
            accountStatus: 'suspended',
            canAppeal: true,
            role: existingUser.role,
            suspensionReason: existingUser.suspensionReason
          }
        };
      }

      // Check for deleted account
      if (existingUser.userAccountDeleted) {
        const isWithinRecoveryPeriod = checkIfWithinRecoveryPeriod(existingUser.deletedAt);

        if (!isWithinRecoveryPeriod) {
          return {
            success: false,
            message: "This account was permanently deleted and cannot be restored. Please create a new account.",
            status: 410,
          };
        }

        return {
          success: false,
          message: "Account was deleted. Would you like to restore it?",
          status: existingUser.role === 'user' ? 407 : 408,
          data: {
            accountStatus: 'deleted',
            canRestore: true,
            role: existingUser.role
          }
        };
      }

      return {
        success: false,
        message: "User already exists, go ahead and login",
        status: 409,
      };
    }

    const otp = generateOtp();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newUser = await User.create([{
        email, password, username, otp,
        otpExpiresIn: Date.now() + OTP_EXPIRY_MS,
        role, userIsAnAgent: true,
      }], { session });

      const newAgent = await Agent.create([{ userId: newUser[0]._id }], { session });
      await User.findByIdAndUpdate(newUser[0]._id, { agentId: newAgent[0]._id }, { session });

      const emailSent = await sendVerificationEmail(email, username, otp, "Email Account Verification");

      if (!emailSent) {
        await session.abortTransaction();
        return {
          success: false,
          message: "Account creation failed! Email failed",
          status: 500,
        };
      }

      await session.commitTransaction();
      return {
        success: true,
        message: "Account created! OTP sent to your email",
        status: 201,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return handleServerError(error);
  }
};

export const verifyAccount = async (values: VerifyValues): Promise<ApiResponse> => {
  const { otp, email } = values;

  if (!otp || !email) {
    return {
      success: false,
      message: "OTP and email are required",
      status: 400,
    };
  }

  await connectToMongoDB();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User does not exist", status: 404 };
    }

    if (user.otp !== otp) {
      return { success: false, message: "Invalid OTP", status: 403 };
    }

    if (user.otpExpiresIn && Date.now() > user.otpExpiresIn) {
      return { success: false, message: "OTP expired", status: 403 };
    }

    await User.findByIdAndUpdate(user._id, {
      userVerified: true,
      otp: null,
      otpExpiresIn: null,
    });

    await Notification.create({
      type: "notification",
      title: "Email Verified!",
      content: "Welcome to Nomeo Realtors.",
      recipient: user._id,
    });

    return {
      success: true,
      message: "Email verified! Welcome!",
      status: 200,
    };
  } catch (error) {
    return handleServerError(error);
  }
};

// Profile functions
export const createUserProfile = async (values: CreateUserProfile): Promise<ApiResponse> => {
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

  const currentUser = await getCurrentUser();
  await connectToMongoDB();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  if (currentUser!.role !== "user") {
    return { success: false, message: "Not authorized", status: 403 };
  }

  const userUpdate = {
    surName,
    lastName,
    profilePicture: profileImage.secure_url,
    profileImage,
    bio: userBio,
    phoneNumber,
    additionalPhoneNumber,
    city,
    state,
    userOnboarded: true,
    profileCreated: true,
  };

  try {
    await User.findByIdAndUpdate(currentUser!._id, userUpdate);

    await Notification.create({
      type: "profile",
      title: "Profile Created!",
      content: `Congratulations ${surName} ${lastName}, your profile has been created.`,
      recipient: currentUser!._id,
    });

    revalidatePath("/");
    return { success: true, message: "Profile created!", status: 201 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const createAgentProfile = async (values: CreateAgentProfile): Promise<ApiResponse> => {
  const {
    profileImage, phoneNumber, city, state, officeNumber, agencyName,
    inspectionFeePerHour, agencyAddress, agentBio, additionalPhoneNumber,
    userId, surName, lastName,
  } = values;

  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  if (currentUser!.role !== "agent") {
    return { success: false, message: "Not authorized", status: 403 };
  }

  const userUpdate = {
    surName, lastName, profilePicture: profileImage.secure_url, profileImage,
    bio: agentBio, phoneNumber, additionalPhoneNumber, address: agencyAddress,
    city, state, userOnboarded: true, profileCreated: true,
  };

  const agentUpdate = {
    officeNumber, officeAddress: agencyAddress, agencyName, inspectionFeePerHour,
    verificationStatus: "pending",
  };

  try {
    await Promise.all([
      User.findByIdAndUpdate(currentUser!._id, userUpdate),
      Agent.findByIdAndUpdate(currentUser!.agentId, agentUpdate),
    ]);

    await Notification.create({
      type: "profile",
      title: "Profile Created!",
      content: `Congratulations ${surName} ${lastName}, your profile has been created.`,
      recipient: currentUser!._id,
    });

    revalidatePath("/");
    return { success: true, message: "Profile created!", status: 201 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const editUserProfile = async (values: EditUserProps): Promise<ApiResponse> => {
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
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  if (isNewImage && currentUser!.profileImage?.public_id) {
    await deleteCloudinaryImages(currentUser!.profileImage.public_id);
  }

  try {
    await User.findByIdAndUpdate(userId, {
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
    });

    revalidatePath(path);
    return { success: true, message: "Profile updated!", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

// Password & Security functions
export const resendOtp = async (email: string): Promise<ApiResponse> => {
  if (!email) {
    return {
      success: false,
      message: "Email is required for new OTP",
      status: 400,
    };
  }

  await connectToMongoDB();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User does not exist!",
        status: 404
      };
    }

    if (user.userVerified) {
      return {
        success: false,
        message: "This account is already verified",
        status: 400,
      };
    }

    const otp = generateOtp();
    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpiresIn: Date.now() + OTP_EXPIRY_MS
    });

    const emailSent = await sendVerificationEmail(
      email,
      user.username,
      otp,
      "New Verification Code"
    );

    if (!emailSent) {
      return {
        success: false,
        message: "New OTP not sent! Something went wrong",
        status: 500,
      };
    }

    return {
      success: true,
      message: "New OTP has been sent to your email",
      status: 200,
    };
  } catch (error) {
    return handleServerError(error);
  }
};

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  await connectToMongoDB();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found!",
        status: 404
      };
    }

    const otp = generateOtp();
    await User.findByIdAndUpdate(user._id, {
      resetPasswordOtp: otp,
      resetPasswordOtpExpresIn: Date.now() + RESET_OTP_EXPIRY_MS,
    });

    const emailSent = await sendVerificationEmail(
      email,
      user.username,
      otp,
      "Password Reset Request",
      "Your one-time password (OTP) for password reset is: "
    );

    if (!emailSent) {
      return {
        success: false,
        message: "Password reset OTP not sent! Something went wrong",
        status: 500,
      };
    }

    return {
      success: true,
      message: "Password reset OTP has been sent to your email",
      status: 200,
    };
  } catch (error) {
    return handleServerError(error);
  }
};

export const resetPassword = async (values: ResetPasswordValues): Promise<ApiResponse> => {
  const { email, password, otp } = values;

  await connectToMongoDB();

  try {
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid OTP or user not found!",
        status: 404
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordOtp: null,
      resetPasswordOtpExpresIn: null,
    });

    return {
      success: true,
      message: "Password reset successful! Go ahead and log in",
      status: 200,
    };
  } catch (error) {
    return handleServerError(error);
  }
};

// Profile update functions
export const changeProfileImage = async (values: {
  secure_url: string;
  public_id: string;
  userId: string;
  isNewImage: boolean;
  path: string;
}): Promise<ApiResponse> => {
  const { secure_url, public_id, userId, isNewImage, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  if (isNewImage && currentUser!.profileImage?.public_id) {
    await deleteCloudinaryImages(currentUser!.profileImage.public_id);
  }

  const profileImage = { secure_url, public_id };

  try {
    await User.findByIdAndUpdate(userId, { profileImage, profilePicture: secure_url });
    revalidatePath(path);
    return { success: true, message: "Profile image updated", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const changePassword = async (values: {
  oldPassword: string;
  newPassword: string;
  userId: string;
  path: string;
}): Promise<ApiResponse> => {
  const { oldPassword, newPassword, userId, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  try {
    const user = await User.findById(userId).select('+password');
    if (!user?.password) {
      return { success: false, message: "User not found", status: 404 };
    }

    const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!oldPasswordMatch) {
      return { success: false, message: "Old password incorrect", status: 403 };
    }

    if (oldPassword === newPassword) {
      return { success: false, message: "Password change not needed", status: 403 };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: newHashedPassword });

    revalidatePath(path);
    return { success: true, message: "Password updated", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const changeEmailStart = async (values: {
  newEmail: string;
  userId: string;
  path: string;
}): Promise<ApiResponse> => {
  const { newEmail, userId, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  if (currentUser!.email === newEmail) {
    return { success: false, message: "Email change not needed", status: 403 };
  }

  const emailExists = await User.findOne({ email: newEmail });
  if (emailExists) {
    return { success: false, message: "Email already in use", status: 403 };
  }

  const otp = generateOtp();
  await User.findByIdAndUpdate(userId, {
    otp,
    otpExpiresIn: Date.now() + OTP_EXPIRY_MS
  });

  const emailSent = await sendVerificationEmail(
    newEmail,
    currentUser!.username,
    otp,
    "Email Change Verification",
    "Your new one-time password (OTP) for email change verification is: "
  );

  if (!emailSent) {
    return {
      success: false,
      message: "Verification OTP not sent! Something went wrong",
      status: 500,
    };
  }

  revalidatePath(path);
  return {
    success: true,
    message: "Verification OTP has been sent to your email",
    status: 200,
  };
};

export const changeEmail = async (values: {
  email: string;
  otp: string;
  path: string;
  userId: string;
}): Promise<ApiResponse> => {
  const { email, userId, path, otp } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  try {
    if (currentUser!.otp !== otp) {
      return { success: false, message: "Invalid OTP", status: 403 };
    }

    if (currentUser!.otpExpiresIn && Date.now() > currentUser!.otpExpiresIn) {
      return { success: false, message: "OTP expired", status: 403 };
    }

    await User.findByIdAndUpdate(currentUser!._id, {
      email: email,
      userVerified: true,
      otp: null,
      otpExpiresIn: null,
    });

    revalidatePath(path);
    return { success: true, message: "Email updated", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

// Agent-specific functions
const validateAgentAccess = async (agentId: string): Promise<{ agent?: any; error?: ApiResponse }> => {
  const currentUser = await getCurrentUser();
  const agent = await getAgentById(agentId);

  if (!currentUser || !agent) {
    return { error: { success: false, message: "Not authorized", status: 403 } };
  }

  if (agent.userId !== currentUser._id) {
    return { error: { success: false, message: "Not authorized", status: 403 } };
  }

  return { agent };
};

export const changeAgencyAddress = async (values: {
  agentId: string;
  newAddress: string;
  path: string;
}): Promise<ApiResponse> => {
  const { agentId, newAddress, path } = values;
  await connectToMongoDB();

  const { agent, error } = await validateAgentAccess(agentId);
  if (error) return error;

  try {
    await Agent.findByIdAndUpdate(agentId, { officeAddress: newAddress });
    revalidatePath(path);
    return { success: true, message: "Office address updated", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const changeInspectionFee = async (values: {
  agentId: string;
  newFee: number;
  path: string;
}): Promise<ApiResponse> => {
  const { agentId, newFee, path } = values;
  await connectToMongoDB();

  const { agent, error } = await validateAgentAccess(agentId);
  if (error) return error;

  try {
    await Agent.findByIdAndUpdate(agentId, { inspectionFeePerHour: newFee });
    revalidatePath(path);
    return { success: true, message: "Inspection fee updated", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const changeOfficeNumber = async (values: {
  agentId: string;
  newNumber: string;
  path: string;
}): Promise<ApiResponse> => {
  const { agentId, newNumber, path } = values;
  await connectToMongoDB();

  const { agent, error } = await validateAgentAccess(agentId);
  if (error) return error;

  try {
    await Agent.findByIdAndUpdate(agentId, { officeNumber: newNumber });
    revalidatePath(path);
    return { success: true, message: "Office number updated", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const toggleListings = async (values: {
  agentId: string;
  path: string;
}): Promise<ApiResponse> => {
  const { agentId, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();
  const agent = await getAgentById(agentId);

  if (!currentUser || !agent || agent.userId !== currentUser._id) {
    return { success: false, message: "Not authorized", status: 403 };
  }

  const newValue = !agent.getListings;

  try {
    await Agent.findByIdAndUpdate(agentId, { getListings: newValue });
    revalidatePath(path);
    return {
      success: true,
      message: newValue ? "Getting client listings" : "Stopped getting listings",
      status: 200
    };
  } catch (error) {
    return handleServerError(error);
  }
};

// User preference functions
export const changePhoneNumber = async (values: {
  userId: string;
  newNumber: string;
  path: string;
}): Promise<ApiResponse> => {
  const { userId, newNumber, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  try {
    await User.findByIdAndUpdate(userId, { phoneNumber: newNumber });
    revalidatePath(path);
    return { success: true, message: "Phone number updated", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

const toggleUserPreference = async (
  values: { userId: string; path: string },
  preferenceField: string,
  trueMessage: string,
  falseMessage: string
): Promise<ApiResponse> => {
  const { userId, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found", status: 403 };

    const newValue = !user[preferenceField as keyof typeof user];
    await User.findByIdAndUpdate(userId, { [preferenceField]: newValue });

    revalidatePath(path);
    return { success: true, message: newValue ? trueMessage : falseMessage, status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const toggleLikedApartments = async (values: { userId: string; path: string }): Promise<ApiResponse> =>
  toggleUserPreference(values, 'showLikedApartments', 'Showing liked apartments', 'Hiding liked apartments');

export const toggleBookmarkedApartments = async (values: { userId: string; path: string }): Promise<ApiResponse> =>
  toggleUserPreference(values, 'showBookmarkedApartments', 'Showing bookmarked apartments', 'Hiding bookmarked apartments');

export const toggleLikedBlogs = async (values: { userId: string; path: string }): Promise<ApiResponse> =>
  toggleUserPreference(values, 'showLikedBlogs', 'Showing liked blogs', 'Hiding liked blogs');

export const toggleBookmarkedBlogs = async (values: { userId: string; path: string }): Promise<ApiResponse> =>
  toggleUserPreference(values, 'showBookmarkedBlogs', 'Showing bookmarked blogs', 'Hiding bookmarked blogs');

// Account management
export const deleteAccount = async (values: { email: string; path: string }): Promise<ApiResponse> => {
  const { email, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, message: "Not logged in", status: 403 };
  }

  if (currentUser.email !== email) {
    return { success: false, message: "Email doesn't match", status: 404 };
  }

  const surname = capitalizeName(currentUser.surName || "");
  const lastname = capitalizeName(currentUser.lastName || "");
  const name = `${surname} ${lastname}`;

  try {
    const emailTemplate = await render(TemporaryDeleteEmailTemplate({ name }));
    await sendEmail({ email, subject: "Account Deleted", html: emailTemplate });

    await User.findByIdAndUpdate(currentUser._id, { userAccountDeleted: true, deletedAt: new Date(), deletedBy: currentUser._id });
    revalidatePath(path);
    return { success: true, message: "Account deleted", status: 200 };
  } catch (error) {
    return handleServerError(error);
  }
};

export const transferAccount = async (values: {
  oldEmail: string;
  newEmail: string;
  path: string;
}): Promise<ApiResponse> => {
  const { oldEmail, newEmail, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You are not logged in, login to access this feature",
      status: 403,
    };
  }

  if (currentUser.role !== "agent") {
    return {
      success: false,
      message: "You are not authorized to access this feature",
      status: 403,
    };
  }

  if (currentUser.email !== oldEmail) {
    return {
      success: false,
      message: "Your credentials do not match! Check and retype",
      status: 403,
    };
  }

  const newUser = await getUserByEmail(newEmail);
  if (!newUser || newUser.role !== "agent" || !newUser.userVerified) {
    return {
      success: false,
      message: "You can only transfer account to a verified agent like you",
      status: 403,
    };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Transfer properties
    const properties = await Apartment.find({ agent: currentUser.agentId });
    if (properties.length > 0) {
      const propertyIds = properties.map(item => item._id);

      await Promise.all([
        Apartment.updateMany(
          { _id: { $in: propertyIds } },
          { agent: newUser.agentId },
          { session }
        ),
        Rentout.updateMany(
          { apartment: { $in: propertyIds } },
          { agent: newUser.agentId },
          { session }
        ),
        Agent.findByIdAndUpdate(
          newUser.agentId,
          { $push: { apartments: { $each: propertyIds } } },
          { session }
        )
      ]);
    }

    // Transfer notifications
    const notifications = await Notification.find({ recipient: currentUser._id });
    if (notifications.length > 0) {
      const notificationIds = notifications.map(item => item._id);

      await Promise.all([
        Notification.updateMany(
          { _id: { $in: notificationIds } },
          { recipient: newUser._id },
          { session }
        ),
        User.findByIdAndUpdate(
          newUser._id,
          { $push: { notifications: { $each: notificationIds } } },
          { session }
        )
      ]);
    }

    // Delete old profile image
    if (currentUser.profileImage?.public_id) {
      await deleteCloudinaryImages(currentUser.profileImage.public_id);
    }

    await User.findByIdAndDelete(currentUser._id, { session });

    await session.commitTransaction();

    revalidatePath(path);
    return {
      success: true,
      message: "You have successfully transferred your account",
      status: 200,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleServerError(error);
  } finally {
    await session.endSession();
  }
};

export const toggleCollaborator = async (values: { userId: string; path: string }): Promise<ApiResponse> => {
  const { userId, path } = values;
  await connectToMongoDB();
  const currentUser = await getCurrentUser();

  const accessError = validateUserAccess(currentUser, userId);
  if (accessError) return accessError;

  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: "User not found", status: 403 };

    const newCollaboratorStatus = !user.blogCollaborator;
    const isAnAgent = user.userIsAnAgent && user.agentId;

    const updatePromises: Promise<any>[] = [
      User.findByIdAndUpdate(userId, { blogCollaborator: newCollaboratorStatus })
    ];

    if (isAnAgent) {
      updatePromises.push(
        Agent.findByIdAndUpdate(user.agentId, { isACollaborator: newCollaboratorStatus })
      );
    }

    await Promise.all(updatePromises);

    revalidatePath(path);
    return {
      success: true,
      message: newCollaboratorStatus
        ? "You are now a collaborator on blogs"
        : "You are no longer a collaborator on blogs",
      status: 200,
    };
  } catch (error) {
    return handleServerError(error);
  }
};

// Appeal suspension
export const appealSuspension = async (values: AppealSuspensionParams): Promise<ApiResponse> => {
  const { email, appealReason, role, path, licenseNumber } = values;

  try {
    await connectToMongoDB();

    // Input validation
    if (!email || !appealReason?.trim() || !role) {
      return { 
        success: false, 
        message: "Missing required fields", 
        status: 400 
      };
    }

    const currentUser = await getUserByEmail(email);

    if (!currentUser) {
      return { 
        success: false, 
        message: "User not found", 
        status: 404 
      };
    }

    // Role validation
    if (currentUser.role !== role) {
      return { 
        success: false, 
        message: "You are not authorized to appeal this suspension", 
        status: 403 
      };
    }

    // License validation for agents
    if (role === 'agent') {
      if (!licenseNumber?.trim()) {
        return { 
          success: false, 
          message: "License number is required for agents", 
          status: 400 
        };
      }

      const agent = await Agent.findOne({ 
        userId: currentUser._id, 
        licenseNumber: licenseNumber.trim() 
      });

      if (!agent) {
        return { 
          success: false, 
          message: "Agent license not found or does not match", 
          status: 404 
        };
      }
    }

    // Suspension status check
    if (!currentUser.userAccountSuspended) {
      return { 
        success: false, 
        message: "Your account is not suspended", 
        status: 400 
      };
    }

    const suspension = await Suspension.findOne({ 
      user: currentUser._id, 
      isActive: true 
    });

    if (!suspension) {
      return { 
        success: false, 
        message: "Active suspension not found", 
        status: 404 
      };
    }

    // Rate limiting check
    const recentAppeals = await Suspension.countDocuments({
      user: currentUser._id,
      'history.action': 'appeal',
      'history.performedAt': { 
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    });

    if (recentAppeals > 2) {
      return {
        success: false,
        message: "Too many appeals filed recently. Please wait before submitting another.",
        status: 429
      };
    }

    // Appeal duplication check
    const existingAppeal = suspension.history.find(
      (entry: any) => entry.action === 'appeal'
    );

    if (existingAppeal) {
      return { 
        success: false, 
        message: "An appeal has already been filed for this suspension", 
        status: 409 
      };
    }
    console.log('✅ No duplicate appeal found');

    // Add appeal to history
    const appealEntry = {
      action: 'appeal' as const,
      description: `Appeal filed: ${appealReason.trim()}`,
      performedBy: new mongoose.Types.ObjectId(currentUser._id),
      performedAt: new Date(),
      reason: appealReason.trim(),
      data: {
        originalSuspensionId: suspension._id,
        appealDate: new Date()
      }
    };
    
    suspension.history.push(appealEntry);
    suspension.markModified('history');
    
    const savedSuspension = await suspension.save();

    const suspensionEntry = suspension.history.find(
      (entry: any) => entry.action === 'suspend'
    );
    
    if (suspensionEntry?.performedBy) {
      await Notification.create({
        type: "notification",
        title: "New Suspension Appeal Filed",
        content: `User ${currentUser.username} (${currentUser.email}) has filed an appeal regarding their suspension. Please review it.`,
        recipient: suspensionEntry.performedBy,
      });
    }

    revalidatePath(path);
    return {
      success: true,
      message: "Appeal filed successfully. Our team will review your case shortly.",
      status: 200,
    };

  } catch (error) {
    console.error('❌ Appeal suspension error:', error);
    return handleServerError(error);
  }
};