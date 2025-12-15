import { getCurrentUser } from "@/actions/user-actions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";
import User from "@/models/user";

export const GET = async (req: Request) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const query = searchParams.get("query") || "";
  const limit = 6;

  if (!current_user) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const collaborations = current_user.collaborations || [];

  try {
    const skip = (page - 1) * limit;

    let searchQuery;

    if (query === '') {
      searchQuery = { _id: {$in: collaborations.length > 0 ? collaborations : [null]}, is_deleted: false};
    } else {
      searchQuery = { _id: {$in: collaborations.length > 0 ? collaborations : [null]}, is_deleted: false, $or: [{ title: new RegExp(query, 'i')},{ description: new RegExp(query, 'i') }]};
    };

    const blogs = await Blog.find(searchQuery)
      .select("_id description banner created_at read_time title total_likes total_comments total_saves likes saves reads total_reads collaboration is_published")
      .populate({
        path: "author",
        model: User,
        select: "surName lastName username profilePicture email placeholderColor role _id",}
      )
      .populate({
        path: "collaborators",
        model: User,
        select: "surName lastName username profilePicture email placeholderColor role _id",}
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalBlogs = await Blog.countDocuments(searchQuery);

    const blogsWithVirtuals = blogs.map(blog => ({
      ...blog,
      total_likes: blog.likes?.length || 0,
      total_saves: blog.saves?.length || 0,
      total_comments: blog.comments?.length || 0,
      total_reads: (blog.reads?.length || 0) + (blog.guest_readers?.length || 0)
    }));

    const data = {
      blogs: blogsWithVirtuals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs,
        hasNextPage: page < Math.ceil(totalBlogs / limit),
        hasPrevPage: page > 1,
      },
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error, try again later" },
      { status: 500 }
    );
  }
};