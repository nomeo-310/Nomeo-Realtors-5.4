import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";
import User from "@/models/user";

export const GET = async (req: Request) => {
  await connectToMongoDB();

  try {
    const latestBlogs = await Blog.find({is_published: true, is_deleted: false, blog_approval: 'pending'
    })
    .limit(4)
    .select(
      "_id description banner created_at read_time title total_likes total_comments total_saves total_reads"
    )
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
    .sort({ created_at: -1 })
    .exec();

    return Response.json(latestBlogs)
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error, try again later" },{ status: 500 });
  }
};