"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface avatarProps {
  src?: string;
  alt?: string;
  className?: string;
  name?: string;
  placeholderColor?: string;
}

const ImageAvatar = ({src, alt, className, name, placeholderColor}: avatarProps) => {

  const initials = name ? name.trim().split(" ").map((word) => word.charAt(0).toUpperCase()).slice(0, 2).join("") : null; 
  console.log(initials)

  const wrapperClass = cn("relative size-8 rounded-full overflow-hidden flex items-center justify-center font-semibold text-white text-sm md:text-xl", className);

  return (
    <div className={wrapperClass} style={{backgroundColor: !src && !initials ? "transparent" : placeholderColor || "#FFD700"}}>
      { src ? (
          <Image src={src} alt={alt || "user_avatar"} fill className="object-cover" />) : 
        initials ? ( <span className="tracking-wider font-quicksand">{initials}</span> ) : (
        <Image src="/images/default_user.png" alt="default_avatar" fill className="object-cover" />
      )}
    </div>
  );
};

export default ImageAvatar;
