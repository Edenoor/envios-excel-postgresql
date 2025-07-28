import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  {
    name: "Informes",
    icon: "📊",
    subItems: [
      "No Entregados",
      "Liq de Cobranzas",
      "En Mano",
      "Por Cliente",
      "Geo Choferes",
      "Por Zonas",
      "Dash Board",
      "Informe ML21",
      "Colecta",
    ],
  },
  {
    name: "Envíos",
    icon: "🚚",
    subItems: [
      "Subir Envío",
      "Hoja de Ruta",
      "Geoenvíos",
      "Envíos",
      "Lotes",
      "Asignaciones",
      "Estados Masivos",
      "Listas de Precios",
      "Subir Flex Manual",
      "Reimprimir No Flex",
      "Cargar Particular",
    ],
  },
  {
    name: "Sistema",
    icon: "🛠️",
    subItems: [
      "Zonas de Entrega",
      "Usuarios",
      "Configuración",
      "Datos de Paquetería",
      "Costo Chofer",
      "Mensajería App",
      "Listas de Precios",
      "Estado Ordenes",
    ],
  },
  {
    name: "Clientes",
    icon: "👥",
    subItems: ["Clientes"],
  },
  {
    name: "Paquetes",
    icon: "📦",
    subItems: ["Editar Paquetes", "A Planta", "Geo Envíos Masivos"],
  },
  {
    name: "Ruteate",
    icon: "🗺️",
    subItems: ["Ruteate", "En Mano_rut", "Asignaciones_rut", "GeoEnvios_rut"],
  },
  {
    name: "Liquidaciones",
    icon: "💰",
    subItems: ["Liquidaciones Cobr.", "Liquidación", "Cancelar"],
  },
];

const slugify = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const toPath = (section, child) =>
  `/admin/${slugify(section)}/${slugify(child)}`;

const Sidebar = ({ onExpandChange }) => {
  const [open, setOpen] = useState({});
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const expanded = pinned || hover;

  useEffect(() => {
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]); // ✅ warning solucionado

  const toggleSection = (name) =>
    setOpen((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleMouseLeave = () => {
    if (!pinned) {
      setOpen({});
      setHover(false);
    }
  };

  const handleClickSubItem = (section, sub) => {
    const path =
      section === "Liquidaciones" && sub === "Liquidación"
        ? "/admin/dashboard"
        : toPath(section, sub);
    navigate(path);
    if (!pinned) {
      setOpen({});
      setHover(false);
    }
  };

  return (
    <aside
      className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-900 text-white z-50 transition-all duration-200
        ${expanded ? "w-64" : "w-14"}
        border-r border-gray-800
      `}
      onMouseEnter={() => !pinned && setHover(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        {expanded ? (
          <span className="font-semibold text-cyan-400">Menú</span>
        ) : (
          <span className="text-xl">≡</span>
        )}

        {expanded && (
          <button
            className={`text-xs px-2 py-1 rounded ${
              pinned ? "bg-cyan-600" : "bg-gray-700"
            }`}
            onClick={() => setPinned((p) => !p)}
            title={pinned ? "Desfijar" : "Fijar"}
          >
            {pinned ? "📌" : "📍"}
          </button>
        )}
      </div>

      <nav className="overflow-y-auto h-[calc(100%-48px)]">
        <ul className="py-2">
          {menuItems.map((item) => {
            const isOpen = open[item.name];

            return (
              <li key={item.name}>
                <button
                  onClick={() =>
                    expanded ? toggleSection(item.name) : setHover(true)
                  }
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 transition
                    ${expanded ? "justify-between" : "justify-center"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    {expanded && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </div>
                  {expanded && (
                    <span className="text-xs">{isOpen ? "▾" : "▸"}</span>
                  )}
                </button>

                {expanded && isOpen && (
                  <ul className="pl-10 pr-2 py-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const section = item.name;
                      const to =
                        section === "Liquidaciones" && sub === "Liquidación"
                          ? "/admin/dashboard"
                          : toPath(section, sub);
                      return (
                        <li key={sub}>
                          <NavLink
                            to={to}
                            onClick={() => handleClickSubItem(section, sub)}
                            className={({ isActive }) =>
                              `
                              block text-sm rounded px-2 py-1
                              hover:bg-gray-800 transition
                              ${
                                isActive
                                  ? "text-cyan-400 font-semibold"
                                  : "text-gray-300"
                              }
                            `
                            }
                          >
                            {sub}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

