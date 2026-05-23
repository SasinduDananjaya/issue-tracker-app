import { CheckCircle2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const FEATURES = ["Kanban & list views", "Priority & severity tracking", "Full audit history"];

//layout for auth pages with left text panel and right form panel
const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="min-h-screen flex">
    {/* left panel */}
    <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-linear-to-br from-primary-900 via-primary-700 to-primary">
      {/* decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-900/40 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-8 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 pointer-events-none" />

      {/* logo */}
      <img src="/issuly_logo.webp" alt="Issuly" className="h-9 w-28 relative z-10 brightness-0 invert justify-center" />

      {/* headline and features txt */}
      <div className="relative z-10 space-y-10">
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Track. Resolve.
            <br />
            <span className="text-amber-400">Ship faster.</span>
          </h1>
          <p className="text-primary-200 text-base leading-relaxed max-w-xs">The modern issue tracker built for teams who care about quality and speed.</p>
        </div>

        <ul className="space-y-3">
          {FEATURES.map((feat) => (
            <li key={feat} className="flex items-center gap-3 text-primary-100">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span className="text-sm">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-primary-100 text-xs relative z-10">© {new Date().getFullYear()} Issuly</p>
    </div>

    {/* right panel - auth form */}
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        {/* mobile logo */}
        <div className="flex justify-center mb-8 md:hidden">
          <img src="/issuly_logo.webp" alt="Issuly" className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">{children}</div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
