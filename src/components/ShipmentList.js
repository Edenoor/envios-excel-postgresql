import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const ShipmentList = () => {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(ws, { defval: "" });
      setData(parsedData);
    };
    reader.readAsBinaryString(file);
  };

  const enviarDatos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar");

      alert("✅ Datos guardados en PostgreSQL");
    } catch (err) {
      console.error(err);
      alert("❌ Error de red");
    }
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value.toLowerCase());
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((cell) =>
      String(cell).toLowerCase().includes(filterText)
    )
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <h2 className="text-2xl mb-4 text-lime-400 font-bold">
        📦 Subí un Excel y visualizá los envíos
      </h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
        file:text-sm file:font-semibold file:bg-lime-500 file:text-white
        hover:file:bg-lime-400 transition mb-6"
      />

      {data.length > 0 && (
        <>
          {/* Botones para otras pantallas */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => navigate("/totales-clientes")}
              className="bg-lime-500 text-black font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition shadow-lg"
            >
              📊 Totales Clientes
            </button>
            <button
              onClick={() => navigate("/totales-choferes")}
              className="bg-lime-500 text-black font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition shadow-lg"
            >
              🧾 Totales Choferes
            </button>
          </div>

          {/* Filtro de texto */}
          <input
            type="text"
            placeholder="🔍 Filtrar por chofer, cliente, etc."
            value={filterText}
            onChange={handleFilterChange}
            className="bg-gray-800 border border-lime-400 text-white px-4 py-2 rounded-md w-full md:w-1/2 mb-4 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />

          {/* Botón de envío */}
          <button
            onClick={enviarDatos}
            className="bg-lime-500 text-gray-900 px-4 py-2 rounded-md font-semibold hover:brightness-125 transition mb-6 ml-2"
          >
            📤 Enviar a PostgreSQL
          </button>

          {/* Tabla de datos */}
          <div className="overflow-auto max-h-[60vh] border border-gray-700 rounded-lg">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  {Object.keys(data[0]).map((key, i) => (
                    <th key={i} className="px-4 py-2 border-b border-gray-700 text-lime-300">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-800">
                    {Object.keys(data[0]).map((key, j) => (
                      <td key={j} className="px-4 py-2 border-b border-gray-800">
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipmentList;


