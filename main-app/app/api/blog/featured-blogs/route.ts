import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";

let cachedFeatured: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 30;

export const GET = async (req: Request) => {
  await connectToMongoDB();

  try {
    const now = Date.now();

    if (!cachedFeatured.length || now - lastFetchTime > CACHE_DURATION) {
      cachedFeatured = await Blog.aggregate([
        { $match: { is_published: true, blog_approval: 'pending' } },
        { $sample: { size: 3 } },
        {
          $project: {
            _id: 1,
            description: 1,
            banner: 1,
            created_at: 1,
            read_time: 1,
            title: 1,
            total_likes: 1,
            total_comments: 1,
            total_saves: 1,
            likes: 1,
            saves: 1,
            reads: 1,
            total_reads: 1,
            collaboration: 1,
            is_published: 1,
            author: 1,
            collaborators: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [
              {
                $project: {
                  surName: 1,
                  lastName: 1,
                  username: 1,
                  profilePicture: 1,
                  email: 1,
                  placeholderColor: 1,
                  role: 1,
                  _id: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "collaborators",
            foreignField: "_id",
            as: "collaborators",
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  username: 1,
                  profilePicture: 1,
                  email: 1,
                  placeholderColor: 1,
                  role: 1,
                  _id: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      lastFetchTime = now;
    }

    return Response.json(cachedFeatured);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error, try again later" },{ status: 500 });
  }
};
