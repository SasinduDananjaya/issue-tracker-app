interface AuthLayoutProps {
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout = ({ subtitle, children }: AuthLayoutProps) => (
  <div className="min-h-screen bg-linear-to-br from-purple-950 via-purple-800 to-purple-600 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <img src="/issuly_logo.webp" alt="Issuly" className="h-12 w-auto mb-4 drop-shadow-lg" />
        <p className="text-purple-200 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
