import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LayoutList, History, LogOut, User, Copy, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/api/authApi";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/issues", icon: LayoutList, label: "Issues" },
  { to: "/activity", icon: History, label: "Activity Logs" },
];

const Header = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyCode = () => {
    if (!user?.organizationCode) return;
    navigator.clipboard.writeText(user.organizationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
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
                    isActive ? "bg-primary-50 text-primary-900 font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* right side - user */}
        <div className="flex items-center gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <UserAvatar user={user} className="cursor-pointer hover:ring-2 hover:ring-primary-200 transition-all" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setProfileOpen(true)}>
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

      {/* profile dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <UserAvatar user={user!} size="xl" />
            <div className="text-center">
              <p className="font-semibold text-primary-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {user?.isOrgOwner && (
            <div className="mt-2 rounded-lg bg-primary-50 border border-primary-200 p-4">
              <p className="text-xs font-medium text-primary-700 mb-2 uppercase tracking-wide">Company Code</p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-bold text-primary-900 tracking-widest">{user.organizationCode}</span>
                <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-700 transition-colors font-medium">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-primary-600 mt-2">Share this code with teammates so they can join your workspace.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
