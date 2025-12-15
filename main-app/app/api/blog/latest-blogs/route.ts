import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";
import User from "@/models/user";

export const GET = async (req: Request) => {
  await connectToMongoDB();

  try {
    const latestBlogs = await Blog.find({
      is_published: true, 
      is_deleted: false, 
      blog_approval: 'pending'
    })
    .limit(4)
    .populate({
      path: "author",
      model: User,
      select:
        "firstName lastName profilePicture email username placeholderColor role _id",
    })
    .populate({
      path: "collaborators",
      model: User,
      select:
        "firstName lastName profilePicture email username placeholderColor role _id",
    })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    // Add virtual fields manually
    const blogsWithVirtuals = latestBlogs.map(blog => ({
      ...blog,
      total_likes: blog.likes?.length || 0,
      total_saves: blog.saves?.length || 0,
      total_comments: blog.comments?.length || 0,
      total_reads: (blog.reads?.length || 0) + (blog.guest_readers?.length || 0)
    }));

    return Response.json(blogsWithVirtuals)
  } catch (error) {
    console.error("Error fetching latest blogs:", error);
    return Response.json({ error: "Internal server error, try again later" },{ status: 500 });
  }
};