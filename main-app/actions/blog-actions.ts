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

export const createNewBlog = async (blogData: blogData) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

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

  const acceptableRoles = ["admin", "creator", "superAdmin"];
  const collaboratorRoles = ["user", "agent"];

  if (
    !acceptableRoles.includes(current_user.role) &&
    (!collaboratorRoles.includes(current_user.role) ||
      !current_user.blogCollaborator)
  ) {
    return {
      success: false,
      message:
        "You must be a collaborator or have sufficient permissions to create a blog",
      status: 403,
    };
  }

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
    banner: banner,
    author: current_user._id,
    collaborators: collaborators,
    collaboration: collaboratorPresent ? true : false,
    is_published: true,
    is_draft: false,
    blog_approval: current_user.role === 'superAdmin' ? 'approved' : 'pending',
  };

  try {
    const newBlog = await Blog.create(newBlogData);
    await newBlog.save();

    if (collaboratorPresent) {
      const collaborators = await User.find({
        _id: { $in: newBlogData.collaborators },
        blogCollaborator: true,
      });

      const fullDetails = collaborators.map((collaborator) => {
        const capitalizedFirstName = capitalizeName(collaborator.surName || "");
        const capitalizedLastName = capitalizeName(collaborator.lastName || "");
        const fullName =
          `${capitalizedFirstName} ${capitalizedLastName}`.trim();

        return { fullName, email: collaborator.email };
      });

      const emailTemplate = await render(
        PostedCollaborationEmailTemplate({
          recipient: "Collaborator",
          author:
            `${capitalizeName(current_user.surName || "")} ${capitalizeName(current_user.lastName || "")}`.trim(),
        })
      );

      const recipientPromises = fullDetails.map((detail) =>
        sendEmail({
          email: detail.email,
          subject: "Your Collaboration has been published!",
          html: emailTemplate.replace("Collaborator", detail.fullName),
        })
      );

      await Promise.all(recipientPromises);

      await User.updateMany(
        { _id: { $in: newBlogData.collaborators } },
        { $push: { collaborations: newBlog._id } }
      );
    }

    await User.findByIdAndUpdate(current_user._id, {
      $push: { createdBlogs: newBlog._id },
    });

    revalidatePath(path);
    return { success: true, message: "Blog created successfully", status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const createNewDraft = async (blogData: draftBlogData) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const acceptableRoles = ["admin", "creator", "superAdmin"];
  const collaboratorRoles = ["user", "agent"];

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

  if (
    !acceptableRoles.includes(current_user.role) &&
    (!collaboratorRoles.includes(current_user.role) ||
      !current_user.blogCollaborator)
  ) {
    return {
      success: false,
      message:
        "You must be a collaborator or have sufficient permissions to create a blog",
      status: 403,
    };
  }

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
    author: current_user._id,
    collaborators: collaborators || [],
    collaboration: collaboratorPresent ? true : false,
    is_draft: true,
  };

  try {
    const newBlog = await Blog.create(newBlogData);
    await newBlog.save();

    if (collaboratorPresent) {
      const blogcollaborators = await User.find({
        _id: { $in: collaborators },
        blogCollaborator: true,
      });

      const fullDetails = blogcollaborators.map((collaborator) => {
        const capitalizedFirstName = capitalizeName(collaborator.surName || "");
        const capitalizedLastName = capitalizeName(collaborator.lastName || "");
        const fullName =
          `${capitalizedFirstName} ${capitalizedLastName}`.trim();

        return { fullName, email: collaborator.email };
      });

      const emailTemplate = await render(
        CollaborationEmailTemplate({
          blog_title: title,
          recipient: "Collaborator",
          author:
            current_user.role === "superAdmin"
              ? "The Nomeo Realtor Blog Team"
              : `${capitalizeName(current_user.surName || "")} ${capitalizeName(current_user.lastName || "")}`.trim(),
        })
      );

      const recipientPromises = fullDetails.map((detail) =>
        sendEmail({
          email: detail.email,
          subject: "You've been invited to collaborate on a new blog post!",
          html: emailTemplate.replace("Collaborator", detail.fullName),
        })
      );

      await Promise.all(recipientPromises);

      const notificationPromises = blogcollaborators.map(
        async (collaborator) => {
          const newNotification = await Notification.create({
            recipient: collaborator._id,
            issuer: current_user._id,
            blogId: newBlog._id,
            title: "New Collaboration Invitation",
            type: "blog-invitation",
            content: `You've been invited by ${`${capitalizeName(current_user.surName || "")} ${capitalizeName(current_user.lastName || "")}`.trim()} to collaborate on the blog post: "${title}".`,
          });
          return newNotification;
        }
      );

      const createdNotifications = await Promise.all(notificationPromises);

      const userUpdatePromises = createdNotifications.map((notification) => {
        return User.findByIdAndUpdate(
          notification.recipient,
          { $push: { notifications: notification._id } },
          { new: true }
        );
      });

      await Promise.all(userUpdatePromises);
    }

    revalidatePath(path);
    return {
      success: true,
      message: "Blog draft created successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const acceptCollaboration = async (acceptData: acceptDataProps) => {
  await connectToMongoDB();

  const { blogId, collaboratorId, path, authorId } = acceptData;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const acceptableRoles = ["admin", "creator", "superAdmin"];
  const collaboratorRoles = ["user", "agent"];

  if (
    !acceptableRoles.includes(current_user.role) &&
    !collaboratorRoles.includes(current_user.role)
  ) {
    return {
      success: false,
      message:
        "You do not have the required permissions to accept a collaboration",
      status: 403,
    };
  }

  if (
    collaboratorRoles.includes(current_user.role) &&
    current_user.blogCollaborator === false
  ) {
    return {
      success: false,
      message: "You can only accept a collaboration if you are a collaborator",
      status: 403,
    };
  }

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return {
        success: false,
        message: "Blog not found",
        status: 404,
      };
    }

    if (
      blog.collaborators &&
      blog.collaborators.length > 0 &&
      blog.collaborators.some((id) => id.toString() === collaboratorId)
    ) {
      return {
        success: false,
        message: "You have already been accepted this collaboration",
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

    if (!blog.collaborators) {
      blog.collaborators = [];
    }

    blog.collaborators.push(collaboratorId as any);
    blog.collaboration = true;
    await blog.save();

    const collaborator = await User.findById(collaboratorId);

    if (collaborator) {
      const fullName =
        `${capitalizeName(collaborator.surName || "")} ${capitalizeName(collaborator.lastName || "")}`.trim();

      const authorNotification = await Notification.create({
        recipient: blog.author,
        issuer: collaboratorId,
        blogId: blog._id,
        title: "Collaboration Accepted",
        type: "notification",
        content: `${fullName} has accepted your invitation to collaborate on the blog post: "${blog.title}.`,
      });

      await User.findByIdAndUpdate(
        blog.author,
        { $push: { notifications: authorNotification._id } },
        { new: true }
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
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const rejectCollaboration = async (acceptData: acceptDataProps) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  const { blogId, collaboratorId, path, authorId } = acceptData;

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const acceptableRoles = ["admin", "creator", "superAdmin"];
  const collaboratorRoles = ["user", "agent"];

  if (
    !acceptableRoles.includes(current_user.role) &&
    !collaboratorRoles.includes(current_user.role)
  ) {
    return {
      success: false,
      message:
        "You do not have the required permissions to reject a collaboration",
      status: 403,
    };
  }

  if (
    collaboratorRoles.includes(current_user.role) &&
    current_user.blogCollaborator === false
  ) {
    return {
      success: false,
      message: "You can only reject a collaboration if you are a collaborator",
      status: 403,
    };
  }

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return {
        success: false,
        message: "Blog not found",
        status: 404,
      };
    }

    if (blog.author.toString() !== authorId) {
      return {
        success: false,
        message: "The author of this blog didn't send you an invite",
        status: 403,
      };
    }

    const collaborator = await User.findById(collaboratorId);

    const alreadyCollaborated =
      blog.collaborators &&
      blog.collaborators.length > 0 &&
      blog.collaborators?.some((id) => id.toString() === collaboratorId);

    if (alreadyCollaborated) {
      if (collaborator) {
        const fullName =
          `${capitalizeName(collaborator.surName || "")} ${capitalizeName(collaborator.lastName || "")}`.trim();

        const collaboratorNotification = await Notification.create({
          recipient: blog.author,
          issuer: current_user._id,
          blogId: blog._id,
          title: "Collaboration Rejected",
          type: "notification",
          content: `${fullName} will no longer be collaborating with you on the blog post: "${blog.title}.`,
        });

        await User.findByIdAndUpdate(
          blog.author,
          { $push: { notifications: collaboratorNotification._id } },
          { new: true }
        );

        await Blog.findByIdAndUpdate(blogId, {
          $pull: { collaborators: collaborator._id },
        });

        await User.findByIdAndUpdate(collaboratorId, {
          $pull: { collaborations: blog._id },
        });
      }
    } else {
      if (collaborator) {
        const fullName =
          `${capitalizeName(collaborator.surName || "")} ${capitalizeName(collaborator.lastName || "")}`.trim();
        const collaboratorNotification = await Notification.create({
          recipient: blog.author,
          issuer: current_user._id,
          blogId: blog._id,
          title: "Collaboration Rejected",
          type: "notification",
          content: `${fullName} has rejected your invitation to collaborate on the blog post: "${blog.title}.`,
        });

        await User.findByIdAndUpdate(
          blog.author,
          { $push: { notifications: collaboratorNotification._id } },
          { new: true }
        );
      }
    }

    revalidatePath(path);
    return {
      success: true,
      message: "Collaboration rejected successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const getEditBlog = async (id: string) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in" };
  }

  const currentBlog = await Blog.findById(id);

  if (!currentBlog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  const isAuthor = currentBlog.author.toString() === current_user._id.toString();
  const isCollaborator = currentBlog.collaborators?.some((collabId) => collabId.toString() === current_user._id.toString());
  console.log(isCollaborator);

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
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const updateDraft = async (blogData: updateBlogData) => {
  await connectToMongoDB();

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

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  };

  const currentBlog = await Blog.findOne({ _id: blogId, is_draft: true });

  if (!currentBlog) {
    return {
      success: false,
      message: "The blog you intent to edit does not exist!",
      status: 404,
    };
  };

  const isAuthor = currentBlog.author.toString() === current_user._id.toString();
  const isACollaborator = currentBlog.collaborators?.some((collabId) => collabId.toString() === current_user._id.toString());

  if (!isAuthor && !isACollaborator) {
    return {
      success: false,
      message: "You do not have the required permission to update this draft",
      status: 403,
    };
  };

  const newCollaboratorAdded = (collaborators?.length || 0) > (currentBlog.collaborators?.length || 0);
  console.log(newCollaboratorAdded)

  let newCollaborators = [];
  if (newCollaboratorAdded) {
    newCollaborators = blogData.collaborators?.filter((id) => !(currentBlog.collaborators || [])
    .some((existingId) => existingId.toString() === id.toString())) || [];

    if (newCollaborators && newCollaborators.length > 0) {
      const collaborators = await User.find({
        _id: { $in: newCollaborators },
        blogCollaborator: true,
      });

      const fullDetails = collaborators.map((collaborator) => {
        const capitalizedFirstName = capitalizeName(collaborator.surName || "");
        const capitalizedLastName = capitalizeName(collaborator.lastName || "");
        const fullName =
          `${capitalizedFirstName} ${capitalizedLastName}`.trim();

        return { fullName, email: collaborator.email };
      });

      const emailTemplate = await render(
        CollaborationEmailTemplate({
          blog_title: title,
          recipient: "Collaborator",
          author:
            current_user.role === "superAdmin"
              ? "The Nomeo Realtor Blog Team"
              : `${capitalizeName(current_user.surName || "")} ${capitalizeName(current_user.lastName || "")}`.trim(),
        })
      );

      const recipientPromises = fullDetails.map((detail) =>
        sendEmail({
          email: detail.email,
          subject: "You've been invited to collaborate on a new blog post!",
          html: emailTemplate.replace("Collaborator", detail.fullName),
        })
      );

      await Promise.all(recipientPromises);

      await User.updateMany(
        { _id: { $in: newCollaborators } },
        { $push: { collaborations: currentBlog._id } }
      );

      const notificationPromises = newCollaborators.map(
        async (collaborator) => {
          const newNotification = await Notification.create({
            recipient: collaborator,
            issuer: current_user._id,
            blogId: blogId,
            title: "New Collaboration Invitation",
            type: "blog-invitation",
            content: `You've been invited by ${`${capitalizeName(current_user.surName || "")} ${capitalizeName(current_user.lastName || "")}`.trim()} to collaborate on the blog post: "${title}".`,
          });
          return newNotification;
        }
      );

      const createdNotifications = await Promise.all(notificationPromises);

      const userUpdatePromises = createdNotifications.map((notification) => {
        return User.findByIdAndUpdate(
          notification.recipient,
          { $push: { notifications: notification._id } },
          { new: true }
        );
      });

      await Promise.all(userUpdatePromises);

      await User.updateMany(
        { _id: { $in: newCollaborators } },
        { $push: { collaborations: currentBlog._id } }
      );
    }
  };

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  try {
    await Blog.findByIdAndUpdate(
      blogId,
      {
        title,
        description,
        content,
        read_time,
        banner: banner,
      }
    );

    revalidatePath(path);
    return { success: true, message: "Blog updated successfully", status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const publishDraft = async (blogData: updateBlogData) => {
  await connectToMongoDB();

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

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  };

  const currentBlog = await Blog.findOne({ _id: blogId, is_draft: true });

  if (!currentBlog) {
    return {
      success: false,
      message: "The blog you intent to edit does not exist!",
      status: 404,
    };
  };

  const isAuthor = currentBlog.author.toString() === current_user._id.toString();
  const isACollaborator = currentBlog.collaborators?.some((collabId) => collabId.toString() === current_user._id.toString());

  if (!isAuthor || isACollaborator) {
    return {
      success: false,
      message: "You do not have the required permission to publish this draft",
      status: 403,
    };
  };

  const newCollaboratorAdded = (blogData.collaborators?.length || 0) > (currentBlog.collaborators?.length || 0);

  let newCollaborators = [];

  if (newCollaboratorAdded) {
    newCollaborators = blogData.collaborators?.filter((id) => !(currentBlog.collaborators || [])
    .some((existingId) => existingId.toString() === id.toString())) || [];

    if (newCollaborators && newCollaborators.length > 0) {
      const collaborators = await User.find({
        _id: { $in: newCollaborators },
        blogCollaborator: true,
      });

      const fullDetails = collaborators.map((collaborator) => {
        const capitalizedFirstName = capitalizeName(collaborator.surName || "");
        const capitalizedLastName = capitalizeName(collaborator.lastName || "");
        const fullName =
          `${capitalizedFirstName} ${capitalizedLastName}`.trim();

        return { fullName, email: collaborator.email };
      });

      const emailTemplate = await render(
        PostedCollaborationEmailTemplate({
          recipient: "Collaborator",
          author:
            current_user.role === "superAdmin"
              ? "The Nomeo Realtor Blog Team"
              : `${capitalizeName(current_user.surName || "")} ${capitalizeName(current_user.lastName || "")}`.trim(),
        })
      );

      const recipientPromises = fullDetails.map((detail) =>
        sendEmail({
          email: detail.email,
          subject: "Your Collaboration has been published!",
          html: emailTemplate.replace("Collaborator", detail.fullName),
        })
      );

      await Promise.all(recipientPromises);

      await User.updateMany(
        { _id: { $in: newCollaborators } },
        { $push: { collaborations: currentBlog._id } }
      );
    }
  };

  const banner = {
    secure_url: bannerImageUrl,
    public_id: bannerImagePublicId,
  };

  try {
    await Blog.findByIdAndUpdate(
      blogId,
      {
        title,
        description,
        content,
        read_time,
        banner: banner,
        collaborators: collaborators ?? currentBlog.collaborators,
        is_draft: false,
        is_published: true,
        blog_approval: current_user.role === 'superAdmin' ? 'approved' : 'pending',
      }
    );

    revalidatePath(path);
    return { success: true, message: "Blog successfully published", status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}

export const deletePost = async (blogId: string) => {
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const current_blog = await Blog.findById(blogId);

  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  if (current_blog.author.toString() !== current_user._id) {
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
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const restoreDeletedPost = async (blogId: string) => {
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const current_blog = await Blog.findById(blogId);

  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  if (current_blog.author.toString() !== current_user._id) {
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
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const fullPostDelete = async (blogId: string) => {
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const current_blog = await Blog.findById(blogId);

  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  if (current_blog.author.toString() !== current_user._id) {
    return {
      success: false,
      message: "You are not authorized to delete this blog",
      status: 403,
    };
  }

  if (current_blog.banner.public_id) {
    await deleteCloudinaryImages(current_blog.banner.public_id);
  }

  await User.findOneAndUpdate({ _id: current_blog.author }, {});

  try {
    await Blog.findByIdAndDelete(blogId);
    return {
      success: true,
      message: "Blog fully deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};

export const likeBlog = async ({ blogId, path }: { blogId: string; path: string }) => {
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const current_blog = await Blog.findById(blogId);

  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  const userId = new mongoose.Types.ObjectId(current_user._id);
  const hasLiked = current_blog.likes.some(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (hasLiked) {
    await Blog.findByIdAndUpdate(blogId, {
      $pull: { likes: userId },
      $inc: { total_likes: -1 },
    });

    await User.findByIdAndUpdate(current_user._id, {
      $pull: {likedBlogs: current_blog._id}
    })

    revalidatePath(path)
    return { success: true, message: "Blog unliked successfully", status: 200 };
  } else {
    await Blog.findByIdAndUpdate(blogId, {
      $push: { likes: userId },
      $inc: { total_likes: 1 },
    });

    await User.findByIdAndUpdate(current_user._id, {
      $push: {likedBlogs: current_blog._id}
    })

    revalidatePath(path)
    return { success: true, message: "Blog liked successfully", status: 200 };
  }
};

export const saveBlog = async ({ blogId, path }: { blogId: string; path: string }) => {   
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  const current_blog = await Blog.findById(blogId);

  if (!current_blog) {
    return { success: false, message: "Blog does not exist", status: 404 };
  }

  const userId = new mongoose.Types.ObjectId(current_user._id);
  const hasSaved = current_blog.saves.some(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );

  if (hasSaved) {
    await Blog.findByIdAndUpdate(blogId, {
      $pull: { saves: userId },
      $inc: { total_saves: -1 },
    });

    await User.findByIdAndUpdate(current_user._id, {
      $pull: {bookmarkedABlogs: current_blog._id}
    });

    revalidatePath(path)
    return { success: true, message: "Blog unsaved successfully", status: 200 };
  } else {
    await Blog.findByIdAndUpdate(blogId, {
      $push: { saves: userId },
      $inc: { total_saves: 1 },
    });

    await User.findByIdAndUpdate(current_user._id, {
      $push: {bookmarkedABlogs: current_blog._id}
    });

    revalidatePath(path)
    return { success: true, message: "Blog saved successfully", status: 200 };
  }
}; 

export const getSingleBlog = async (blogId:string) => {
  await connectToMongoDB();

  try {
    const current_blog = await Blog.findById(blogId)
    .populate(
      { path: 'author', 
        model: User,
        select: '_id  surName lastName profilePicture username role placeholderColor email'
      }
    ).populate(
      { path: 'collaborators',
        model: User,
        select: '_id  surName lastName profilePicture username role placeholderColor email'
      }
    ).exec()

    const blogData = JSON.parse(JSON.stringify(current_blog));
    return blogData;
    
  } catch (error) {
    return {success: false, message: 'Internal server error', status: 500}
  }

};

export const readBlog = async ({blogId, path, sessionKey}: {blogId: string; path: string; sessionKey: string}) => {
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  try {
    if (!sessionKey) {
      return { success: false, message: "Missing session identifier", status: 400 };
    }

    const blog = await Blog.findOne({ _id: new ObjectId(blogId) }).lean();

    if (!blog) {
      return { success: false, message: "Blog not found", status: 404 };
    }

    if (!current_user) {

      if (!blog.guest_readers?.includes(sessionKey)) {
        await Blog.updateOne(
          { _id: new ObjectId(blogId) },
          { $inc: { total_reads: 1 }, $addToSet: { guest_readers: sessionKey } }
        );
        revalidatePath(path);
      }
    } else {

      const userId = current_user._id.toString();
      const alreadyRead = blog.reads.some((id: any) => id.toString() === userId);

      if (!alreadyRead) {
        await Blog.updateOne(
          { _id: new ObjectId(blogId) },
          { $inc: { total_reads: 1 }, $addToSet: { reads: new ObjectId(userId) } }
        );
        await User.updateOne(
          { _id: new ObjectId(userId) },
          { $addToSet: { reads: new ObjectId(blogId) } }
        );
        revalidatePath(path);
      }
    }

    return { success: true, message: "Read registered", status: 200 };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
};



