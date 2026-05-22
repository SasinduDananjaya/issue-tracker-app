import { Outlet } from "react-router-dom";
import Header from "./Header";

const AppLayout = () => (
  <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
    <Header />
    <main className="flex-1 overflow-hidden">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
