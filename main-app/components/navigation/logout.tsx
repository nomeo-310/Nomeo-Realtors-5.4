"use client";

import { cn } from "@/lib/utils";
import { ImageAvatar } from "../ui/image-avatar";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userProps } from "@/lib/types";

export const LogOut = ({ user }: { user: userProps }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className={cn("cursor-pointer")}>
          <ImageAvatar
            username={user?.username}
            color={user?.placeholderColor}
            image={user?.profilePicture}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit z-[800000] bg-white dark:bg-[#424242] mr-4 mt-3 lg:mt-4 cursor-pointer">
        <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Log Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const LogOutUser = ({
  user,
  notification,
}: {
  user: userProps;
  notification: boolean;
}) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className={cn("cursor-pointer", notification && "border-l pl-2")}>
          <ImageAvatar
            username={user?.username}
            color={user?.placeholderColor}
            image={user?.profilePicture}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit z-[8000000] bg-white dark:bg-[#424242] mr-4 mt-3 lg:mt-4 cursor-pointer">
        <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Log Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
