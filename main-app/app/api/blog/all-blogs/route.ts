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

  try {
    const skip = (page - 1) * limit;

    const visibilityConditions = {
      $and: [ { author: current_user._id }, { is_published: true }, { is_deleted: false },],
    };

    let searchQuery: any = visibilityConditions;

    if (query) {
      const textSearchConditions = {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };

      searchQuery = { $and: [visibilityConditions, textSearchConditions] };
    }

    const blogs = await Blog.find(searchQuery)
      .select(
        "_id description banner created_at read_time title total_likes total_comments total_saves likes saves reads total_reads collaboration"
      )
      .populate({
        path: "author",
        model: User,
        select:
          "surName lastName username profilePicture email placeholderColor role _id",
      })
      .populate({
        path: "collaborators",
        model: User,
        select:
          "surName lastName username profilePicture email placeholderColor role _id",
      })
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