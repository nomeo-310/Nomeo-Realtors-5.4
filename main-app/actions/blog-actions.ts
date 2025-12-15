"use server";

import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";
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
import { getCurrentUser } from "./user-actions";

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
    collaborators = [], // ← default empty array
  } = blogData;

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  const hasCollaborators = collaborators.length > 0;

  // Define who can auto-approve
  const canAutoApprove = ['superAdmin', 'admin', 'creator'].includes(
    authResult.current_user!.role
  );

  try {
    const newBlog = await Blog.create({
      read_time,
      title,
      description,
      content: content || '',
      banner,
      author: authResult.current_user!._id,
      collaborators,
      collaboration: hasCollaborators,
      is_published: true,
      is_draft: false,
      blog_approval: canAutoApprove ? 'approved' : 'pending',
    });

    if (hasCollaborators) {
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
    collaborators = [],
  } = blogData;

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  const hasCollaborators = collaborators.length > 0;

  try {
    const newBlog = await Blog.create({
      read_time,
      title,
      description,
      content: content || '',
      banner,
      author: authResult.current_user!._id,
      collaborators,
      collaboration: hasCollaborators,
      is_draft: true,
      is_published: false,
      blog_approval: 'pending',
    });

    if (hasCollaborators) {
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
          content: `You've been invited by ${getAuthorName(authResult.current_user!)} to collaborate on "${title}".`,
        }
      );

      await User.updateMany(
        { _id: { $in: collaborators } },
        { $push: { collaborations: newBlog._id } }
      );
    }

    revalidatePath(path);
    return { success: true, message: "Blog draft created successfully", status: 200 };
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
    return { success: false, message: "You can only accept a collaboration if you are a collaborator", status: 403 };
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return { success: false, message: "Blog not found", status: 404 };
    if (blog.author.toString() !== authorId) return { success: false, message: "Invalid author", status: 403 };

    const result = await Blog.updateOne(
      { _id: blogId },
      {
        $addToSet: { collaborators: collaboratorId },
        $set: { collaboration: true }
      }
    );

    if (result.modifiedCount === 0) {
      return { success: false, message: "Already a collaborator", status: 400 };
    }

    const collaborator = await User.findById(collaboratorId);
    if (collaborator) {
      await createNotifications(
        [blog.author.toString()],
        {
          issuer: collaboratorId,
          blogId: blog._id,
          title: "Collaboration Accepted",
          type: "notification",
          content: `${getAuthorName(collaborator)} has accepted your collaboration invite for "${blog.title}".`,
        }
      );

      await User.findByIdAndUpdate(collaboratorId, {
        $addToSet: { collaborations: blog._id }
      });
    }

    revalidatePath(path);
    return { success: true, message: "Collaboration accepted successfully", status: 200 };
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
    return { success: false, message: "You can only reject a collaboration if you are a collaborator", status: 403 };
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return { success: false, message: "Blog not found", status: 404 };
    if (blog.author.toString() !== authorId) return { success: false, message: "Invalid author", status: 403 };

    const wasCollaborator = blog.collaborators?.some(id => id.toString() === collaboratorId);

    if (wasCollaborator) {
      await Promise.all([
        Blog.updateOne(
          { _id: blogId },
          { $pull: { collaborators: collaboratorId } }
        ),
        User.updateOne(
          { _id: collaboratorId },
          { $pull: { collaborations: blogId } }
        )
      ]);
    }

    const collaborator = await User.findById(collaboratorId);
    if (collaborator) {
      const fullName = getAuthorName(collaborator);
      const message = wasCollaborator
        ? `${fullName} has left the collaboration on "${blog.title}".`
        : `${fullName} has rejected your collaboration invite for "${blog.title}".`;

      await createNotifications(
        [blog.author.toString()],
        {
          issuer: collaboratorId,
          blogId: blog._id,
          title: "Collaboration Update",
          type: "notification",
          content: message,
        }
      );
    }

    revalidatePath(path);
    return { success: true, message: "Collaboration rejected successfully", status: 200 };
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
    collaborators = [], // ← default
    blogId,
  } = blogData;

  const currentBlog = await Blog.findOne({ _id: blogId, is_draft: true });
  if (!currentBlog) return { success: false, message: "Draft not found", status: 404 };

  const isAuthor = currentBlog.author.toString() === authResult.current_user!._id.toString();
  if (!isAuthor) return { success: false, message: "Only author can publish", status: 403 };

  const canAutoApprove = ['superAdmin', 'admin', 'creator'].includes(authResult.current_user!.role);

  const banner = { secure_url: bannerImageUrl, public_id: bannerImagePublicId };

  try {
    await Blog.findByIdAndUpdate(blogId, {
      title,
      description,
      content: content || '',
      read_time,
      banner,
      collaborators,
      collaboration: collaborators.length > 0,
      is_draft: false,
      is_published: true,
      blog_approval: canAutoApprove ? 'approved' : 'pending',
    });

    revalidatePath(path);
    return { success: true, message: "Blog published successfully", status: 200 };
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

  const userId = authResult.current_user!._id;
  const blogObjectId = new mongoose.Types.ObjectId(blogId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    const blog = await Blog.findById(blogObjectId);
    if (!blog) {
      return { success: false, message: "Blog does not exist", status: 404 };
    }

    const hasLiked = blog.likes.some(id => id.toString() === userObjectId.toString());

    if (hasLiked) {
      // Unlike
      await Promise.all([
        Blog.updateOne(
          { _id: blogObjectId },
          { $pull: { likes: userObjectId } }
        ),
        User.updateOne(
          { _id: userObjectId },
          { $pull: { likedBlogs: blogObjectId } }
        )
      ]);
    } else {
      // Like
      await Promise.all([
        Blog.updateOne(
          { _id: blogObjectId },
          { $addToSet: { likes: userObjectId } }
        ),
        User.updateOne(
          { _id: userObjectId },
          { $addToSet: { likedBlogs: blogObjectId } }
        )
      ]);
    }

    revalidatePath(path);
    return {
      success: true,
      message: hasLiked ? "Blog unliked" : "Blog liked",
      data: { hasLiked: !hasLiked },
      status: 200
    };
  } catch (error) {
    console.error('Like blog error:', error);
    return { success: false, message: "Server error", status: 500 };
  }
};

export const saveBlog = async ({ blogId, path }: { blogId: string; path: string }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const userId = authResult.current_user!._id;
  const blogObjectId = new mongoose.Types.ObjectId(blogId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    const blog = await Blog.findById(blogObjectId);
    if (!blog) {
      return { success: false, message: "Blog does not exist", status: 404 };
    }

    const hasSaved = blog.saves.some(id => id.toString() === userId);

    if (hasSaved) {
      await Promise.all([
        Blog.updateOne({ _id: blogObjectId }, { $pull: { saves: userObjectId } }),
        User.updateOne({ _id: userObjectId }, { $pull: { bookmarkedABlogs: blogObjectId } })
      ]);
    } else {
      await Promise.all([
        Blog.updateOne({ _id: blogObjectId }, { $addToSet: { saves: userObjectId } }),
        User.updateOne({ _id: userObjectId }, { $addToSet: { bookmarkedABlogs: blogObjectId } })
      ]);
    }

    revalidatePath(path);
    return {
      success: true,
      message: hasSaved ? "Blog removed from saves" : "Blog saved",
      data: { hasSaved: !hasSaved },
      status: 200
    };
  } catch (error) {
    console.error('Save blog error:', error);
    return { success: false, message: "Server error", status: 500 };
  }
};

export const getSingleBlog = async (blogId: string) => {
  await ensureConnection();

  try {
    const blog = await Blog.findById(blogId)
      .populate({
        path: 'author',
        select: '_id surName lastName profilePicture username role placeholderColor email',
      })
      .populate({
        path: 'collaborators',
        select: '_id surName lastName profilePicture username role placeholderColor email',
      })
      .lean()
      .exec();

    if (!blog) {
      return { success: false, message: 'Blog not found', status: 404 };
    }

    const blogsWithVirtuals = {
      ...blog,
      total_likes: blog.likes?.length || 0,
      total_saves: blog.saves?.length || 0,
      total_comments: blog.comments?.length || 0,
      total_reads: (blog.reads?.length || 0) + (blog.guest_readers?.length || 0)
    }

    return JSON.parse(JSON.stringify(blogsWithVirtuals));
  } catch (error) {
    console.error('Get single blog error:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const readBlog = async ({ blogId, path, sessionKey }: { blogId: string; path: string; sessionKey: string }) => {
  await ensureConnection();

  if (!sessionKey) {
    return { success: false, message: "Session key required", status: 400 };
  }

  const blogObjectId = new mongoose.Types.ObjectId(blogId);

  try {
    const current_user = await getCurrentUser();

    if (!current_user) {
      // Guest reader
      const result = await Blog.updateOne(
        { 
          _id: blogObjectId,
          guest_readers: { $ne: sessionKey }  // Only count once
        },
        { 
          $addToSet: { guest_readers: sessionKey }
        }
      );

      if (result.modifiedCount > 0) {
        revalidatePath(path);
      }

      return { success: true, message: "Read tracked (guest)" };
    }

    // Logged-in user
    const userObjectId = new mongoose.Types.ObjectId(current_user._id);

    const result = await Blog.updateOne(
      {
        _id: blogObjectId,
        reads: { $ne: userObjectId }
      },
      {
        $addToSet: { 
          reads: userObjectId,
        }
      }
    );

    if (result.modifiedCount > 0) {
      await User.updateOne(
        { _id: userObjectId },
        { $addToSet: { readBlogs: blogObjectId } }
      );
      revalidatePath(path);
    }

    return { success: true, message: "Read tracked" };
  } catch (error) {
    console.error('Read blog error:', error);
    return { success: false, message: "Server error", status: 500 };
  }
};