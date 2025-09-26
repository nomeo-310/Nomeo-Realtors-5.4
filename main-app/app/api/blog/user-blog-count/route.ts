import { getCurrentUser } from "@/app/action/user-actions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";

export const GET = async () => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const totalPublishedBlogs = await Blog.countDocuments({author: current_user._id, is_published: true, is_deleted: false });
    const totalDraftedBlogs = await Blog.countDocuments({author: current_user._id, is_deleted: false, is_draft: true });
    const totalDeletedBlogs = await Blog.countDocuments({author: current_user._id, is_deleted: true, });
    const totalCollaborations = await Blog.countDocuments({collaboration: true, collaborators: current_user._id});

    const allBlogCounts = {
      published: totalPublishedBlogs,
      draft: totalDraftedBlogs,
      deleted: totalDeletedBlogs,
      collaboration: totalCollaborations,
    };

    return Response.json(allBlogCounts);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error, try again later" },
      { status: 500 }
    );
  }
};
