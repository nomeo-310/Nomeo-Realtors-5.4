import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Blog from "@/models/blog";
import User from "@/models/user";

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

// Cache for frequently accessed data
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Pre-defined select fields for better performance
const BLOG_SELECT_FIELDS = "_id description banner created_at read_time title total_likes total_comments total_saves likes saves reads total_reads collaboration";
const USER_SELECT_FIELDS = "surName lastName username profilePicture email placeholderColor role _id";

// Pre-compiled visibility conditions
const VISIBILITY_CONDITIONS = {
  blog_approval: 'pending',
  is_published: true,
  is_deleted: false,
};

// Cache cleanup function
function cleanupCache() {
  const now = Date.now();
  const entries = Array.from(searchCache.entries()); // Convert to array first
  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
}

export const GET = async (req: Request) => {
  const startTime = Date.now();
  
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(DEFAULT_PAGE, parseInt(searchParams.get("page") || DEFAULT_PAGE.toString()));
    const query = (searchParams.get("query") || "").trim();
    const limit = Math.min(MAX_LIMIT, parseInt(searchParams.get("limit") || DEFAULT_LIMIT.toString()));

    // Generate cache key
    const cacheKey = `blogs:${page}:${limit}:${query}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Response.json(cached.data);
    }

    const skip = (page - 1) * limit;

    // Build search query efficiently
    const searchQuery: any = { ...VISIBILITY_CONDITIONS };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Execute queries in parallel for better performance
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(searchQuery)
        .select(BLOG_SELECT_FIELDS)
        .populate({
          path: "author",
          model: User,
          select: USER_SELECT_FIELDS,
        })
        .populate({
          path: "collaborators",
          model: User,
          select: USER_SELECT_FIELDS,
          options: { 
            limit: 10 
          },
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      Blog.countDocuments(searchQuery).exec()
    ]);

    const totalPages = Math.ceil(totalBlogs / limit);
    
    const responseData = {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    // Cache the result
    searchCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    cleanupCache();

    console.log(`Blogs API completed in ${Date.now() - startTime}ms`);
    
    return Response.json(responseData);
    
  } catch (error) {
    console.error("Blogs API Error:", error);
    return Response.json(
      { error: "Internal server error, try again later" },
      { status: 500 }
    );
  }
};

// Optional: Add cache invalidation endpoint
export const POST = async (req: Request) => {
  try {
    const { action } = await req.json();
    
    if (action === 'clear_cache') {
      const deletedCount = searchCache.size;
      searchCache.clear();
      return Response.json({ 
        success: true, 
        message: `Cleared ${deletedCount} cache entries` 
      });
    }
    
    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
};