"use server";

import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";
import { getCurrentUser } from "./user-actions";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/render";
import { PostedCollaborationEmailTemplate } from "@/components/email-templates/posted-collaboration-email-template";
import User from "@/models/user";
import { capitalizeName } from "@/lib/utils";
import { sendEmail } from "@/lib/send-email";
import { CollaborationEmailTemplate } from "@/components/email-templates/collaboration-email-template";
import Notification from "@/models/notification";
import { deleteCloudinaryImages } from "./delete-cloudinary-image";
import mongoose from 'mongoose'
import { ObjectId } from "mongodb";

interface blogData {
  read_time: number;
  path: string;
  collaborators: string[];
  title: string;
  bannerImageUrl: string;
  description: string;
  content: string;
  bannerImagePublicId?: string | undefined;
}

interface draftBlogData {
  read_time?: number;
  path: string;
  collaborators?: string[];
  title: string;
  bannerImageUrl: string;
  description: string;
  content?: string;
  bannerImagePublicId?: string | undefined;
}

interface updateBlogData extends blogData {
  blogId: string;
}

type acceptDataProps = {
  blogId: string;
  collaboratorId: string;
  authorId: string;
  path: string;
};

// Database connection optimization
let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    await connectToMongoDB();
    isConnected = true;
  }
};

// Common validation functions
interface AuthValidationResult {
  success: boolean;
  message?: string;
  status?: number;
  current_user?: any;
}

const validateUserAuth = async (): Promise<AuthValidationResult> => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  return { success: true, current_user };
};

const validateBlogPermissions = async (current_user: any, acceptableRoles: string[], collaboratorRoles: string[] = []) => {
  const hasAcceptableRole = acceptableRoles.includes(current_user.role);
  const hasCollaboratorAccess = collaboratorRoles.includes(current_user.role) && current_user.blogCollaborator;

  if (!hasAcceptableRole && !hasCollaboratorAccess) {
    return {
      success: false,
      message: "You must be a collaborator or have sufficient permissions to perform this action",
      status: 403,
    };
  }

  return { success: true };
};

// Email and notification helper functions
const sendCollaborationEmails = async (collaborators: any[], templateProps: any, subject: string, templateType: 'invitation' | 'published' = 'invitation') => {
  const fullDetails = collaborators.map((collaborator) => ({
    fullName: `${capitalizeName(collaborator.surName || "")} ${capitalizeName(collaborator.lastName || "")}`.trim(),
    email: collaborator.email,
  }));

  const EmailTemplate = templateType === 'published' ? PostedCollaborationEmailTemplate : CollaborationEmailTemplate;
  const emailTemplate = await render(EmailTemplate(templateProps));

  const emailPromises = fullDetails.map((detail) =>
    sendEmail({
      email: detail.email,
      subject,
      html: emailTemplate.replace("Collaborator", detail.fullName),
    })
  );

  await Promise.all(emailPromises);
};

const createNotifications = async (recipients: string[], notificationData: any) => {
  const notificationPromises = recipients.map(async (recipient) => {
    const newNotification = await Notification.create({
      recipient,
      ...notificationData,
    });
    return newNotification;
  });

  const createdNotifications = await Promise.all(notificationPromises);

  const userUpdatePromises = createdNotifications.map((notification) =>
    User.findByIdAndUpdate(
      notification.recipient,
      { $push: { notifications: notification._id } },
      { new: true }
    )
  );

  await Promise.all(userUpdatePromises);
};

const getAuthorName = (user: any) => {
  return user.role === "superAdmin"
    ? "The Nomeo Realtor Blog Team"
    : `${capitalizeName(user.surName || "")} ${capitalizeName(user.lastName || "")}`.trim();
};

// Blog Actions
export const createNewBlog = async (blogData: blogData) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const permissionResult = await validateBlogPermissions(
    authResult.current_user!,
    ["admin", "creator", "superAdmin"],
    ["user", "agent"]
  );
  if (!permissionResult.success) return permissionResult;

  const {
    read_time,
    path,
    title,
    bannerImageUrl,
    description,
    content,
    bannerImagePublicId,
    collaborators,
  } = blogData;

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  const collaboratorPresent = collaborators.length > 0;

  const newBlogData = {
    read_time,
    path,
    title,
    description,
    content,
    banner,
    author: authResult.current_user!._id,
    collaborators,
    collaboration: collaboratorPresent,
    is_published: true,
    is_draft: false,
    blog_approval: authResult.current_user!.role === 'superAdmin' ? 'approved' : 'pending',
  };

  try {
    const newBlog = await Blog.create(newBlogData);

    if (collaboratorPresent) {
      const collaboratorUsers = await User.find({
        _id: { $in: collaborators },
        blogCollaborator: true,
      });

      await sendCollaborationEmails(
        collaboratorUsers,
        {
          recipient: "Collaborator",
          author: getAuthorName(authResult.current_user!),
        },
        "Your Collaboration has been published!",
        'published'
      );

      await User.updateMany(
        { _id: { $in: collaborators } },
        { $push: { collaborations: newBlog._id } }
      );
    }

    await User.findByIdAndUpdate(authResult.current_user!._id, {
      $push: { createdBlogs: newBlog._id },
    });

    revalidatePath(path);
    return { success: true, message: "Blog created successfully", status: 200 };
  } catch (error) {
    console.error('Create blog error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const createNewDraft = async (blogData: draftBlogData) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const permissionResult = await validateBlogPermissions(
    authResult.current_user!,
    ["admin", "creator", "superAdmin"],
    ["user", "agent"]
  );
  if (!permissionResult.success) return permissionResult;

  const {
    read_time,
    path,
    title,
    bannerImageUrl,
    description,
    content,
    bannerImagePublicId,
    collaborators,
  } = blogData;

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  const collaboratorPresent = collaborators && collaborators.length > 0;

  const newBlogData = {
    read_time,
    path,
    title,
    description,
    content,
    banner: banner,
    author: authResult.current_user!._id,
    collaborators: collaborators || [],
    collaboration: collaboratorPresent ? true : false,
    is_draft: true,
  };

  try {
    const newBlog = await Blog.create(newBlogData);

    if (collaboratorPresent && collaborators) {
      const blogCollaborators = await User.find({
        _id: { $in: collaborators },
        blogCollaborator: true,
      });

      await sendCollaborationEmails(
        blogCollaborators,
        {
          blog_title: title,
          recipient: "Collaborator",
          author: getAuthorName(authResult.current_user!),
        },
        "You've been invited to collaborate on a new blog post!"
      );

      await createNotifications(
        collaborators,
        {
          issuer: authResult.current_user!._id,
          blogId: newBlog._id,
          title: "New Collaboration Invitation",
          type: "blog-invitation",
          content: `You've been invited by ${getAuthorName(authResult.current_user!)} to collaborate on the blog post: "${title}".`,
        }
      );

      await User.updateMany(
        { _id: { $in: collaborators } },
        { $push: { collaborations: newBlog._id } }
      );
    }

    revalidatePath(path);
    return {
      success: true,
      message: "Blog draft created successfully",
      status: 200,
    };
  } catch (error) {
    console.error('Create draft error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const acceptCollaboration = async (acceptData: acceptDataProps) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const { blogId, collaboratorId, path, authorId } = acceptData;

  const permissionResult = await validateBlogPermissions(
    authResult.current_user!,
    ["admin", "creator", "superAdmin"],
    ["user", "agent"]
  );
  if (!permissionResult.success) return permissionResult;

  if (["user", "agent"].includes(authResult.current_user!.role) && !authResult.current_user!.blogCollaborator) {
    return {
      success: false,
      message: "You can only accept a collaboration if you are a collaborator",
      status: 403,
    };
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return { success: false, message: "Blog not found", status: 404 };
    }

    if (blog.collaborators?.some((id) => id.toString() === collaboratorId)) {
      return {
        success: false,
        message: "You have already accepted this collaboration",
        status: 400,
      };
    }

    if (blog.author.toString() !== authorId) {
      return {
        success: false,
        message: "The author of this blog didn't send you an invite",
        status: 403,
      };
    }

    if (!blog.collaborators) blog.collaborators = [];
    blog.collaborators.push(collaboratorId as any);
    blog.collaboration = true;
    await blog.save();

    const collaborator = await User.findById(collaboratorId);
    if (collaborator) {
      const fullName = getAuthorName(collaborator);

      await createNotifications(
        [blog.author.toString()],
        {
          issuer: collaboratorId,
          blogId: blog._id,
          title: "Collaboration Accepted",
          type: "notification",
          content: `${fullName} has accepted your invitation to collaborate on the blog post: "${blog.title}".`,
        }
      );

      await User.findByIdAndUpdate(
        collaboratorId,
        { $push: { collaborations: blog._id } },
        { new: true }
      );
    }

    revalidatePath(path);
    return {
      success: true,
      message: "Collaboration accepted successfully",
      status: 200,
    };
  } catch (error) {
    console.error('Accept collaboration error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const rejectCollaboration = async (acceptData: acceptDataProps) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const { blogId, collaboratorId, path, authorId } = acceptData;

  const permissionResult = await validateBlogPermissions(
    authResult.current_user!,
    ["admin", "creator", "superAdmin"],
    ["user", "agent"]
  );
  if (!permissionResult.success) return permissionResult;

  if (["user", "agent"].includes(authResult.current_user!.role) && !authResult.current_user!.blogCollaborator) {
    return {
      success: false,
      message: "You can only reject a collaboration if you are a collaborator",
      status: 403,
    };
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return { success: false, message: "Blog not found", status: 404 };
    }

    if (blog.author.toString() !== authorId) {
      return {
        success: false,
        message: "The author of this blog didn't send you an invite",
        status: 403,
      };
    }

    const collaborator = await User.findById(collaboratorId);
    const alreadyCollaborated = blog.collaborators?.some((id) => id.toString() === collaboratorId);

    if (alreadyCollaborated && collaborator) {
      const fullName = getAuthorName(collaborator);

      await createNotifications(
        [blog.author.toString()],
        {
          issuer: authResult.current_user!._id,
          blogId: blog._id,
          title: "Collaboration Rejected",
          type: "notification",
          content: `${fullName} will no longer be collaborating with you on the blog post: "${blog.title}".`,
        }
      );

      await Promise.all([
        Blog.findByIdAndUpdate(blogId, { $pull: { collaborators: collaborator._id } }),
        User.findByIdAndUpdate(collaboratorId, { $pull: { collaborations: blog._id } })
      ]);
    } else if (collaborator) {
      const fullName = getAuthorName(collaborator);

      await createNotifications(
        [blog.author.toString()],
        {
          issuer: authResult.current_user!._id,
          blogId: blog._id,
          title: "Collaboration Rejected",
          type: "notification",
          content: `${fullName} has rejected your invitation to collaborate on the blog post: "${blog.title}".`,
        }
      );
    }

    revalidatePath(path);
    return {
      success: true,
      message: "Collaboration rejected successfully",
      status: 200,
    };
  } catch (error) {
    console.error('Reject collaboration error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const getEditBlog = async (id: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const currentBlog = await Blog.findById(id);
  if (!currentBlog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  const isAuthor = currentBlog.author.toString() === authResult.current_user!._id.toString();
  const isCollaborator = currentBlog.collaborators?.some((collabId) =>
    collabId.toString() === authResult.current_user!._id.toString()
  );

  if (!isCollaborator && !isAuthor) {
    return {
      success: false,
      message: "You are not authorized to edit this blog",
      status: 403,
    };
  }

  if (isCollaborator && currentBlog.is_published) {
    return {
      success: false,
      message: "You are not authorized to edit this blog",
      status: 403,
    };
  }

  try {
    const blog = await Blog.findById(id).exec();
    const blogs = JSON.parse(JSON.stringify(blog));
    return blogs;
  } catch (error) {
    console.error('Get edit blog error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const updateDraft = async (blogData: updateBlogData) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const {
    read_time,
    path,
    title,
    bannerImageUrl,
    description,
    content,
    bannerImagePublicId,
    collaborators,
    blogId,
  } = blogData;

  const currentBlog = await Blog.findOne({ _id: blogId, is_draft: true });
  if (!currentBlog) {
    return {
      success: false,
      message: "The blog you intend to edit does not exist!",
      status: 404,
    };
  }

  const isAuthor = currentBlog.author.toString() === authResult.current_user!._id.toString();
  const isACollaborator = currentBlog.collaborators?.some((collabId) =>
    collabId.toString() === authResult.current_user!._id.toString()
  );

  if (!isAuthor && !isACollaborator) {
    return {
      success: false,
      message: "You do not have the required permission to update this draft",
      status: 403,
    };
  }

  const newCollaboratorAdded = (collaborators?.length || 0) > (currentBlog.collaborators?.length || 0);
  let newCollaborators: string[] = [];

  if (newCollaboratorAdded && collaborators) {
    newCollaborators = collaborators.filter((id) =>
      !(currentBlog.collaborators || []).some((existingId) => existingId.toString() === id.toString())
    );

    if (newCollaborators.length > 0) {
      const collaboratorUsers = await User.find({
        _id: { $in: newCollaborators },
        blogCollaborator: true,
      });

      await sendCollaborationEmails(
        collaboratorUsers,
        {
          blog_title: title,
          recipient: "Collaborator",
          author: getAuthorName(authResult.current_user!),
        },
        "You've been invited to collaborate on a new blog post!"
      );

      await createNotifications(
        newCollaborators,
        {
          issuer: authResult.current_user!._id,
          blogId: blogId,
          title: "New Collaboration Invitation",
          type: "blog-invitation",
          content: `You've been invited by ${getAuthorName(authResult.current_user!)} to collaborate on the blog post: "${title}".`,
        }
      );

      await User.updateMany(
        { _id: { $in: newCollaborators } },
        { $push: { collaborations: currentBlog._id } }
      );
    }
  }

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  try {
    await Blog.findByIdAndUpdate(blogId, {
      title,
      description,
      content,
      read_time,
      banner,
    });

    revalidatePath(path);
    return { success: true, message: "Blog updated successfully", status: 200 };
  } catch (error) {
    console.error('Update draft error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const publishDraft = async (blogData: updateBlogData) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const {
    read_time,
    path,
    title,
    bannerImageUrl,
    description,
    content,
    bannerImagePublicId,
    collaborators,
    blogId,
  } = blogData;

  const currentBlog = await Blog.findOne({ _id: blogId, is_draft: true });
  if (!currentBlog) {
    return {
      success: false,
      message: "The blog you intend to edit does not exist!",
      status: 404,
    };
  }

  const isAuthor = currentBlog.author.toString() === authResult.current_user!._id.toString();
  const isACollaborator = currentBlog.collaborators?.some((collabId) =>
    collabId.toString() === authResult.current_user!._id.toString()
  );

  if (!isAuthor || isACollaborator) {
    return {
      success: false,
      message: "You do not have the required permission to publish this draft",
      status: 403,
    };
  }

  const newCollaboratorAdded = (blogData.collaborators?.length || 0) > (currentBlog.collaborators?.length || 0);
  let newCollaborators: string[] = [];

  if (newCollaboratorAdded && collaborators) {
    newCollaborators = collaborators.filter((id) =>
      !(currentBlog.collaborators || []).some((existingId) => existingId.toString() === id.toString())
    );

    if (newCollaborators.length > 0) {
      const collaboratorUsers = await User.find({
        _id: { $in: newCollaborators },
        blogCollaborator: true,
      });

      await sendCollaborationEmails(
        collaboratorUsers,
        {
          recipient: "Collaborator",
          author: getAuthorName(authResult.current_user!),
        },
        "Your Collaboration has been published!",
        'published'
      );

      await User.updateMany(
        { _id: { $in: newCollaborators } },
        { $push: { collaborations: currentBlog._id } }
      );
    }
  }

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  try {
    await Blog.findByIdAndUpdate(blogId, {
      title,
      description,
      content,
      read_time,
      banner,
      collaborators: collaborators ?? currentBlog.collaborators,
      is_draft: false,
      is_published: true,
      blog_approval: authResult.current_user!.role === 'superAdmin' ? 'approved' : 'pending',
    });

    revalidatePath(path);
    return { success: true, message: "Blog successfully published", status: 200 };
  } catch (error) {
    console.error('Publish draft error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const deletePost = async (blogId: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const current_blog = await Blog.findById(blogId);
  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  if (current_blog.author.toString() !== authResult.current_user!._id.toString()) {
    return {
      success: false,
      message: "You are not authorized to delete this blog",
      status: 403,
    };
  }

  try {
    await Blog.findByIdAndUpdate(blogId, { is_deleted: true });
    return { success: true, message: "Blog deleted successfully", status: 200 };
  } catch (error) {
    console.error('Delete post error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const restoreDeletedPost = async (blogId: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const current_blog = await Blog.findById(blogId);
  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  if (current_blog.author.toString() !== authResult.current_user!._id.toString()) {
    return {
      success: false,
      message: "You are not authorized to restore this blog",
      status: 403,
    };
  }

  try {
    await Blog.findByIdAndUpdate(blogId, { is_deleted: false });
    return {
      success: true,
      message: "Blog restored successfully",
      status: 200,
    };
  } catch (error) {
    console.error('Restore post error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const fullPostDelete = async (blogId: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const current_blog = await Blog.findById(blogId);
  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  if (current_blog.author.toString() !== authResult.current_user!._id.toString()) {
    return {
      success: false,
      message: "You are not authorized to delete this blog",
      status: 403,
    };
  }

  try {
    if (current_blog.banner.public_id) {
      await deleteCloudinaryImages(current_blog.banner.public_id);
    }

    await Blog.findByIdAndDelete(blogId);
    return {
      success: true,
      message: "Blog fully deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error('Full delete post error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const likeBlog = async ({ blogId, path }: { blogId: string; path: string }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    const current_blog = await Blog.findById(blogId);
    if (!current_blog) {
      return { success: false, message: "Blog does not exist", status: 404 };
    }

    const userId = new mongoose.Types.ObjectId(authResult.current_user!._id);
    const hasLiked = current_blog.likes.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
    );

    const operation = hasLiked ?
      { $pull: { likes: userId }, $inc: { total_likes: -1 } } :
      { $push: { likes: userId }, $inc: { total_likes: 1 } };

    const userOperation = hasLiked ?
      { $pull: { likedBlogs: current_blog._id } } :
      { $push: { likedBlogs: current_blog._id } };

    await Promise.all([
      Blog.findByIdAndUpdate(blogId, operation),
      User.findByIdAndUpdate(authResult.current_user!._id, userOperation)
    ]);

    revalidatePath(path);
    return {
      success: true,
      message: hasLiked ? "Blog unliked successfully" : "Blog liked successfully",
      status: 200
    };
  } catch (error) {
    console.error('Like blog error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const saveBlog = async ({ blogId, path }: { blogId: string; path: string }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    const current_blog = await Blog.findById(blogId);
    if (!current_blog) {
      return { success: false, message: "Blog does not exist", status: 404 };
    }

    const userId = new mongoose.Types.ObjectId(authResult.current_user!._id);
    const hasSaved = current_blog.saves.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
    );

    const operation = hasSaved ?
      { $pull: { saves: userId }, $inc: { total_saves: -1 } } :
      { $push: { saves: userId }, $inc: { total_saves: 1 } };

    const userOperation = hasSaved ?
      { $pull: { bookmarkedABlogs: current_blog._id } } :
      { $push: { bookmarkedABlogs: current_blog._id } };

    await Promise.all([
      Blog.findByIdAndUpdate(blogId, operation),
      User.findByIdAndUpdate(authResult.current_user!._id, userOperation)
    ]);

    revalidatePath(path);
    return {
      success: true,
      message: hasSaved ? "Blog unsaved successfully" : "Blog saved successfully",
      status: 200
    };
  } catch (error) {
    console.error('Save blog error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const getSingleBlog = async (blogId: string) => {
  await ensureConnection();

  try {
    const current_blog = await Blog.findById(blogId)
      .populate({
        path: 'author',
        model: User,
        select: '_id surName lastName profilePicture username role placeholderColor email'
      })
      .populate({
        path: 'collaborators',
        model: User,
        select: '_id surName lastName profilePicture username role placeholderColor email'
      })
      .exec();

    const blogData = JSON.parse(JSON.stringify(current_blog));
    return blogData;
  } catch (error) {
    console.error('Get single blog error:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const readBlog = async ({ blogId, path, sessionKey }: { blogId: string; path: string; sessionKey: string }) => {
  await ensureConnection();

  try {
    if (!sessionKey) {
      return { success: false, message: "Missing session identifier", status: 400 };
    }

    const blog = await Blog.findOne({ _id: new ObjectId(blogId) }).lean();
    if (!blog) {
      return { success: false, message: "Blog not found", status: 404 };
    }

    const current_user = await getCurrentUser();
    let shouldIncrementReads = false;

    if (!current_user) {
      // Guest user
      if (!blog.guest_readers?.includes(sessionKey)) {
        shouldIncrementReads = true;
        await Blog.updateOne(
          { _id: new ObjectId(blogId) },
          { $inc: { total_reads: 1 }, $addToSet: { guest_readers: sessionKey } }
        );
      }
    } else {
      // Logged-in user
      const userId = current_user._id.toString();
      const alreadyRead = blog.reads?.some((id: any) => id.toString() === userId);

      if (!alreadyRead) {
        shouldIncrementReads = true;
        await Promise.all([
          Blog.updateOne(
            { _id: new ObjectId(blogId) },
            { $inc: { total_reads: 1 }, $addToSet: { reads: new ObjectId(userId) } }
          ),
          User.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { reads: new ObjectId(blogId) } }
          )
        ]);
      }
    }

    if (shouldIncrementReads) {
      revalidatePath(path);
    }

    return { success: true, message: "Read registered", status: 200 };
  } catch (error) {
    console.error('Read blog error:', error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};