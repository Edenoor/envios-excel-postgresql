import { useState } from "react";
import ExcelJS from "exceljs";

const Totales = () => {
  const [dataCadetes, setDataCadetes] = useState([]);
  const [dataClientes, setDataCientes] = useState([]);

  const dataRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/admin", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const unfiltered = await res.json();

      setDataCadetes(unfiltered.resumen_cadetes || []);
      setDataCientes(unfiltered.resumen_clientes || []);

      if (!res.ok) throw new Error("Error");

      alert("✅ MOSTRANDO DATOS");
    } catch (err) {
      console.error(err);
      alert("❌ ERROR TRAYENDO DATOS");
    }
  };

  const resetDatabase = async () => {
    try {
      const res = await fetch("http://localhost:5000/reset-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Error al reiniciar la base de datos");

      alert("🧹 Base de datos reiniciada con éxito");
      setDataCadetes([]);
      setDataCientes([]);
    } catch (err) {
      console.error(err);
      alert("❌ Error reiniciando la base de datos");
    }
  };

  const handleDownloadExcel = async () => {
    if (!dataCadetes.length && !dataClientes.length) {
      alert("No hay datos para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();

    // Paleta pastel/dorado
    const pastelHeader = "FFDEF7E5"; // verde pastel suave
    const pastelBody = "FFF0F4F8"; // gris claro pastel
    const dorado = "FFFFC300";
    const negro = "FF000000";
    const blanco = "FFFFFFFF";

    const addSheet = (title, data) => {
      const ws = workbook.addWorksheet(title);

      if (!data.length) return;

      const headers = Object.keys(data[0]);

      // Header
      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: negro } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: pastelHeader },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Body
      data.forEach((row) => {
        const values = headers.map((h) => row[h]);
        const r = ws.addRow(values);
        r.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: pastelBody },
          };
          cell.font = { color: { argb: negro } };
          cell.alignment = { vertical: "middle", horizontal: "left" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Auto width
      ws.columns.forEach((col) => {
        let max = 10;
        col.eachCell?.((cell) => {
          const len = cell.value?.toString().length || 0;
          if (len > max) max = len;
        });
        col.width = max + 2;
      });

      // Congelar fila de encabezado
      ws.views = [{ state: "frozen", ySplit: 1 }];

      // Fila final resaltada con totales si existe “semanal” y “parcial”
      // (las tablas que traés ya vienen con esos campos, lo dejamos opcional)
      const hasSemanal = headers.includes("semanal");
      const hasParcial = headers.includes("parcial");

      if (hasSemanal || hasParcial) {
        const totalSemanal = hasSemanal
          ? data.reduce(
              (acc, r) => acc + Number((r.semanal || "0").toString().replace(",", ".")),
              0
            )
          : null;

        const totalParcial = hasParcial
          ? data.reduce(
              (acc, r) => acc + Number((r.parcial || "0").toString().replace(",", ".")),
              0
            )
          : null;

        const totalsRowValues = headers.map((h) => {
          if (h === "semanal") return totalSemanal?.toFixed(2);
          if (h === "parcial") return totalParcial?.toFixed(2);
          if (h === headers[0]) return "TOTAL";
          return "";
        });

        const totalsRow = ws.addRow(totalsRowValues);
        totalsRow.eachCell((cell, colNumber) => {
          const isNumberCol =
            headers[colNumber - 1] === "semanal" ||
            headers[colNumber - 1] === "parcial";
          cell.font = {
          bold: isNumberCol || colNumber === 1,
          color: { argb: isNumberCol ? dorado : negro },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: blanco },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: isNumberCol ? "right" : "left" };
        });
      }
    };

    addSheet("Cadetes", dataCadetes);
    addSheet("Clientes", dataClientes);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `totales_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl text-cyan-400 font-bold mb-4 text-center">
        🚚 TOTALES
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={dataRequest}
          className="bg-lime-500 text-black font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition shadow-lg"
        >
          📊 Ver Totales
        </button>

        <button
          onClick={resetDatabase}
          className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition shadow-lg"
        >
          🧹 Reiniciar Base de Datos
        </button>

        {(dataCadetes.length > 0 || dataClientes.length > 0) && (
          <button
            onClick={handleDownloadExcel}
            className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition shadow-lg"
          >
            📥 Descargar
          </button>
        )}
      </div>

      {(dataCadetes.length > 0 || dataClientes.length > 0) && (
        <div className="flex gap-6 justify-center flex-wrap">
          {dataCadetes.length > 0 && (
            <div className="flex-1 min-w-[300px] max-w-[600px] overflow-auto max-h-[60vh] border border-gray-700 rounded-lg">
              <h3 className="text-center bg-gray-800 text-lime-300 py-2 font-semibold">
                Totales Cadetes
              </h3>
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    {Object.keys(dataCadetes[0]).map((key, i) => (
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
                  {dataCadetes.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800">
                      {Object.keys(dataCadetes[0]).map((key, j) => (
                        <td
                          key={j}
                          className="px-4 py-2 border-b border-gray-800"
                        >
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dataClientes.length > 0 && (
            <div className="flex-1 min-w-[300px] max-w-[600px] overflow-auto max-h-[60vh] border border-gray-700 rounded-lg">
              <h3 className="text-center bg-gray-800 text-lime-300 py-2 font-semibold">
                Totales Clientes
              </h3>
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    {Object.keys(dataClientes[0]).map((key, i) => (
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
                  {dataClientes.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800">
                      {Object.keys(dataClientes[0]).map((key, j) => (
                        <td
                          key={j}
                          className="px-4 py-2 border-b border-gray-800"
                        >
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Totales;
