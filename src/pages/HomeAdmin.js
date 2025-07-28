import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";


const AdminHome = () => {
  const [clientes, setClientes] = useState([]);
  const [choferes, setChoferes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admin")
      .then((res) => res.json())
      .then((data) => {
        setClientes(data.resumen_clientes || []);
        setChoferes(data.resumen_cadetes || []);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-cyan-400">
        Bienvenido al Panel de Administración 👋
      </h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Total de Envíos por Cliente</h2>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] h-80 bg-gray-800 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientes}>
                <XAxis dataKey="cliente" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis tick={{ fill: "#ccc", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "#666" }} />
                <Bar dataKey="semanal" fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Promedios de Entrega por Conductor</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-xl">
            <thead>
              <tr className="text-left text-cyan-300 border-b border-gray-700">
                <th className="p-3">Chofer</th>
                <th className="p-3">Total Semana</th>
                <th className="p-3">%</th>
                <th className="p-3">Parcial</th>
              </tr>
            </thead>
            <tbody>
              {choferes.map((ch, idx) => (
                <tr key={idx} className="hover:bg-gray-700">
                  <td className="p-3">{ch.chofer}</td>
                  <td className="p-3">${Number(ch.semanal).toLocaleString()}</td>
                  <td className="p-3">{ch["%"]}</td>
                  <td className="p-3">${Number(ch.parcial).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
