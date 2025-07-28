import { useState } from "react";
import Navbar from "../components/MinimalNavbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [sidebarFixed, setSidebarFixed] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />

      <div className="flex-1 relative flex">
        {/* Sidebar: fijo o colapsado */}
        <div
          className={`fixed top-[56px] left-0 h-[calc(100vh-56px)] z-30 transition-all duration-300 ${
            sidebarFixed ? "w-64" : "w-0"
          }`}
        >
          <Sidebar setSidebarFixed={setSidebarFixed} />
        </div>

        {/* Contenido principal ajustable */}
        <main
          className={`transition-all duration-300 w-full ${
            sidebarFixed ? "ml-64" : "ml-0"
          }`}
        >
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


