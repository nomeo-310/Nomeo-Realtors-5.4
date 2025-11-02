import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
 
export function ImageAvatar({image, username, color}:{image?:string, username?:string, color?:string}) {
  const placeholder = (username ?? '').slice(0, 2);

  return (
    <Avatar className="text-white size-9 lg:size-10">
      <AvatarImage src={image ? image : ''} alt="avatar" />
      <AvatarFallback className="uppercase" style={{backgroundColor: color ? color : "#000" }}>{placeholder}</AvatarFallback>
    </Avatar>
  )
}