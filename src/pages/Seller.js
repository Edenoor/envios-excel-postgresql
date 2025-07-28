import { useState } from "react";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Seller = () => {
  const username = localStorage.getItem("username");
  const [data, setData] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [totales, setTotales] = useState({
    totalEnvios: 0,
    montoTotal: 0,
    netoFinal: 0,
  });
  const [showExportOptions, setShowExportOptions] = useState(false);

  const dataRequest = async (e) => {
    e?.preventDefault?.();
    try {
      const res = await fetch("http://localhost:5000/client/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error");

      const rows = payload.result || [];

      console.log("📦 Datos recibidos del backend:", rows);

      const totalEnvios = rows.length;
      const montoTotal = rows.reduce(
        (acc, row) => acc + parseFloat(row.precio_cliente || 0),
        0
      );

      const pct =
        rows.length &&
        rows[0].descuento !== undefined &&
        rows[0].descuento !== null
          ? parseFloat(rows[0].descuento.toString().replace(",", ".")) || 0
          : 0;

      const netoFinal = montoTotal * (1 - pct);

      setData(rows);
      setDiscount(pct);
      setTotales({ totalEnvios, montoTotal, netoFinal });

      alert("✅ MOSTRANDO ENVIOS");
    } catch (err) {
      console.error(err);
      alert("❌ ERROR TRAYENDO DATOS");
    }
  };

  const headers = data.length ? Object.keys(data[0]) : [];

  const handleDownloadStyledXLS = async () => {
    // ...queda igual...
  };

  const handleDownloadPDF = () => {
    // ...queda igual...
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h2 className="text-3xl text-cyan-400 font-bold mb-4">
        🧾 Bienvenid@, {username}
      </h2>

      <div className="mb-4 flex items-center gap-3 relative">
        <button
          onClick={dataRequest}
          className="bg-lime-500 text-black font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition shadow-lg"
        >
          📦 Mis Envíos
        </button>

        {data.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowExportOptions((prev) => !prev)}
              className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition shadow-lg"
            >
              📥 Descargar
            </button>

            {showExportOptions && (
              <div className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 w-44">
                <button
                  onClick={handleDownloadPDF}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                >
                  📄 PDF
                </button>
                <button
                  onClick={handleDownloadStyledXLS}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                >
                  📊 Excel (.xlsx)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Si no hay resultados */}
      {data.length === 0 && (
        <p className="text-center text-gray-400 mt-8">
          No se encontraron envíos para tu usuario. Verificá que tu nombre esté
          bien cargado en los datos.
        </p>
      )}

      {data.length > 0 && (
        <div className="w-full flex gap-4 relative z-10">
          {/* Tabla */}
          <div className="w-2/3 overflow-auto max-h-[70vh] border border-gray-700 rounded-lg p-2">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  {headers.map((key, i) => (
                    <th
                      key={i}
                      className="px-4 py-2 border-b border-gray-700 text-lime-300"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-800">
                    {headers.map((key, j) => (
                      <td key={j} className="px-4 py-2 border-b border-gray-800">
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="w-1/3 bg-black text-white p-4 rounded-lg shadow-lg flex flex-col justify-center">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
              📊 Resumen de facturación
            </h3>

            <p className="mb-2 text-lg">
              <span className="text-white font-semibold">Total de envíos:</span>{" "}
              {totales.totalEnvios}
            </p>

            <p className="mb-2 text-lg">
              <span className="text-white font-semibold">Total bruto:</span>{" "}
              ${totales.montoTotal.toFixed(2)}
            </p>

            <p className="mb-2 text-lg">
              <span className="text-white font-semibold">Descuento:</span>{" "}
              {(discount * 100).toFixed(2)}%
            </p>

            <p className="text-lg font-semibold text-yellow-400">
              Neto final: ${totales.netoFinal.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seller;
