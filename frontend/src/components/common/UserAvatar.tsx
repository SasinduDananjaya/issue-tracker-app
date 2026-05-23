import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types/userTypes";

interface UserAvatarProps {
  user: User;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-16 h-16 text-xl",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

//user avatar that displays users initials with different sizes
const UserAvatar = ({ user, className, size = "md" }: UserAvatarProps) => (
  <Avatar className={cn(SIZE_CLASSES[size], className)}>
    <AvatarFallback className="bg-primary-100 text-primary-900 font-medium">{getInitials(user.name)}</AvatarFallback>
  </Avatar>
);

export default UserAvatar;
