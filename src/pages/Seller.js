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
    if (!data.length) return;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Envios");

    const pastelHeader = "FFDEF7E5";
    const pastelBody = "FFF0F4F8";
    const dorado = "FFFFC300";
    const blanco = "FFFFFFFF";
    const negro = "FF000000";
    function formatColumnByHeader(sheet, headerText, format) {
      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        if (cell.value === headerText) {
          sheet.getColumn(colNumber).eachCell((c, rowNumber) => {
            if (rowNumber > 1 && typeof c.value === "number") {
              c.numFmt = format;
            }
          });
        }
      });
    }

    const headersRow = sheet.addRow(headers);
    headersRow.eachCell((cell) => {
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

    data.forEach((row) => {
      const rowData = headers.map((h) => {
        if (h === "precio_cliente") return Number(row[h]);
        if (h === "descuento") return Number(row[h]);
        return row[h];
      });
      const newRow = sheet.addRow(rowData);
      newRow.eachCell((cell) => {
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
    formatColumnByHeader(sheet, "precio_cliente", '"$"#,##0.00');
    formatColumnByHeader(sheet, "descuento", '0.00"%"');
    sheet.addRow([]);

    const resumen = [
      ["Resumen de Envíos"],
      ["Total de envíos", totales.totalEnvios],
      ["Monto bruto", `$${totales.montoTotal.toFixed(2)}`],
      ["Descuento (%)", `${(discount * 100).toFixed(2)}%`],
      ["Neto final a cobrar", `$${totales.netoFinal.toFixed(2)}`],
    ];

    resumen.forEach(([label, value], index) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = { bold: true, color: { argb: negro } };
      row.getCell(2).font = {
        bold: index === 4,
        color: { argb: index === 4 ? dorado : negro },
      };
      row.eachCell((cell) => {
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
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    });

    sheet.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.((cell) => {
        const len = cell.value?.toString().length || 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `envios_${username}.xlsx`;
    link.click();
    setShowExportOptions(false);
  };

  const handleDownloadPDF = () => {
    if (!data.length) return;

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(`Envíos de ${username}`, 14, 16);

    const body = data.map((row) => headers.map((h) => row[h]));

    if (typeof autoTable !== "function") {
      console.error("autoTable no está disponible. Asegurate de importar 'jspdf-autotable'");
      alert("❌ Error generando PDF. Faltan dependencias.");
      return;
    }

    autoTable(doc, {
      head: [headers],
      body,
      startY: 22,
      styles: {
        fontSize: 9,
        fillColor: [248, 250, 252],
        textColor: [33, 37, 41],
      },
      headStyles: {
        fillColor: [255, 239, 184],
        textColor: [51, 51, 51],
        fontStyle: "bold",
      },
      margin: { top: 20 },
    });

    doc.save(`envios_${username}.pdf`);
    setShowExportOptions(false);
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
