import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logo.svg";

const MinimalNavbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="w-full bg-yellow-500 shadow-md">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo y nombre */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-10" />
          <h1 className="text-2xl font-bold text-white tracking-wide font-sans">
            <span className="text-black">L</span>
            <span className="text-white">yn</span>
            <span className="text-black">x</span>
          </h1>
        </div>

        {/* Botón minimal */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition"
          >
            ☰
          </button>

          {open && (
            <div className="absolute right-0 mt-2 bg-gray-900 text-white rounded-lg shadow-lg p-2 w-44 animate-fade-in z-50">
              <ul className="space-y-2">
                <li
                  className="hover:text-cyan-400 cursor-pointer"
                  onClick={() => navigate("/admin")}
                >
                  Inicio
                </li>
                <li
                  className="hover:text-cyan-400 cursor-pointer"
                  onClick={() => navigate("/admin/envios")}
                >
                  Envíos
                </li>
                <li
                  className="hover:text-red-400 cursor-pointer font-semibold"
                  onClick={handleLogout}
                >
                  🔓 Cerrar sesión
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MinimalNavbar;

