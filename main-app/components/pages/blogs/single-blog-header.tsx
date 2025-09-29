import { SingleBlog, userProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import LikeBlog from "./like-blog";
import BookmarkBlog from "./bookmark-blog";
import CommentsIndicator from "./comments-indicator";
import ReadsIndicator from "./reads-indicator";

const SingleBlogHeader = ({blog, user}: { blog: SingleBlog; user?: userProps }) => {
  
  return (
    <div className={cn("w-full md:h-[540px] lg:h-[640px] xl:h-[680px] h-[500px] relative mt-4 rounded-lg overflow-hidden")}>
      <div className="absolute left-0 top-0 w-full h-full bg-neutral-800/60 z-10" />
      <Image src={blog.banner?.secure_url} alt="banner" fill className={cn("object-cover object-center rounded-lg")} />
      <div className="z-20 absolute left-0 top-0 w-full h-full flex flex-col justify-end md:px-8 lg:px-10 xl:px-20 2xl:px-24 px-6 pb-6 md:pb-10 lg:pb-12">
        <h2 className="text-lg md:text-xl text-white lg:text-2xl capitalize font-semibold">
          {blog.title}
        </h2>
        <p className="md:text-base lg:text-lg text-white lg:w-[58%] md:w-[75%] mt-2 md:mt-3 w-full text-sm">
          {blog.description}
        </p>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-2 md:gap-0">
          <div className="flex gap-4 text-white items-center justify-end md:justify-normal">
            <LikeBlog blog={blog} user={user} />
            <BookmarkBlog blog={blog} user={user} />
            <CommentsIndicator total_comments={blog.total_comments} user={user} />
            <ReadsIndicator reads={blog.reads} user={user} total_reads={blog.total_reads} />
          </div>
          <div className="flex items-center gap-2"></div>
        </div>
      </div>
    </div>
  );
};

export default SingleBlogHeader;
