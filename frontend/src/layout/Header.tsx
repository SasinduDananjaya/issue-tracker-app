import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LayoutList, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/api/authApi";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [{ to: "/issues", icon: LayoutList, label: "Issues" }];

const Header = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      //ignore, clear anyway
    }
    clearAuth();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* left side - logo and nav */}
      <div className="flex items-center gap-6">
        <img src="/issuly_logo.webp" alt="Issuly" className="h-8 w-auto" />

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 h-8 rounded-md text-sm transition-colors",
                  isActive ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right side - user */}
      <div className="flex items-center gap-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <UserAvatar user={user} className="cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
