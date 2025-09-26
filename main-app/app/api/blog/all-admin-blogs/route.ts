import { getCurrentUser } from "@/app/action/user-actions";
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
    return Response.json({ error: "Unauthorized, login to access features" }, { status: 403 });
  }

  const adminRoles = ["admin", "superAdmin"];

  if (!adminRoles.includes(current_user.role)) {
    return Response.json({ error: "Unauthorized, you do not have the clearance for this feature" }, { status: 403 });
  }

  try {
    const skip = (page - 1) * limit;

    let searchQuery;

    if (query === '') {
      searchQuery = { is_published: true, is_deleted: false};
    } else {
      searchQuery = { is_published: true, is_deleted: false, $or: [{ title: new RegExp(query, 'i')},{ description: new RegExp(query, 'i') }]};
    };

    const blogs = await Blog.find(searchQuery)
      .select("_id description banner created_at read_time title total_likes total_comments total_saves likes saves reads total_reads collaboration")
      .populate({
        path: "author",
        model: User,
        select: "firstName lastName username profilePicture email placeholderColor role _id",}
      )
      .populate({
        path: "collaborators",
        model: User,
        select: "firstName lastName username profilePicture email placeholderColor role _id",}
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments(searchQuery);

    const data = {
      blogs,
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
