import { useState } from "react";
import ExcelJS from "exceljs";
import JSZip from "jszip";

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
        const values = headers.map((h) => {
        // Ensure numeric values for currency columns
        if (h === "semanal" || h === "parcial" || h === '%') {
          return Number((row[h] || "0").toString().replace(",", "."));
        }
        return row[h];
        });
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
      if (hasSemanal) formatColumnByHeader(ws, "semanal", '"$"#,##0.00');
      if (hasParcial) formatColumnByHeader(ws, "parcial", '"$"#,##0.00');
      formatColumnByHeader(ws, "%", '0.00"%"');
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

const handleDownloadAllClients = async () => {
  if (!dataClientes.length) return alert("No hay datos para exportar");

  const zip = new JSZip();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dd = String(yesterday.getDate()).padStart(2, '0');
  const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yyyy = yesterday.getFullYear();
  const formattedDate = `${dd}-${mm}-${yyyy}`;

  for (const cliente of dataClientes) {
    const nombre = cliente.cliente;

    try {
      const res = await fetch("http://localhost:5000/client/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: nombre }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.result?.length) {
        console.warn(`⚠️ Sin datos para: ${nombre}`);
        continue;
      }

      const rows = payload.result;
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

      const headers = Object.keys(rows[0]);
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

      rows.forEach((row) => {
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

      if (payload.totales && payload.discount !== undefined) {
        const totalCobros = rows.reduce((acc, row) => acc + (parseFloat(row.total) || 0), 0);
        const netoFinal = payload.totales.netoFinal;
        const netoMenosCobros = netoFinal - totalCobros;

        const resumen = [
          ["Resumen de Envíos"],
          ["Total de envíos", payload.totales.totalEnvios],
          ["Monto bruto", `$${payload.totales.montoTotal.toFixed(2)}`],
        ];

        if (payload.discount > 0) {
          resumen.push(["Descuento (%)", `${(payload.discount * 100).toFixed(2)}%`]);
        }

        resumen.push(["Neto final", `$${netoFinal.toFixed(2)}`]);
        resumen.push(["Total cobros a descontar", `$${totalCobros.toFixed(2)}`]);

        const etiquetaFinal = netoMenosCobros >= 0 ? "Total a abonar" : "Total a rendir";
        resumen.push([etiquetaFinal, `$${Math.abs(netoMenosCobros).toFixed(2)}`]);

        resumen.forEach(([label, value], index) => {
          const row = sheet.addRow([label, value]);
          row.getCell(1).font = { bold: true, color: { argb: negro } };
          row.getCell(2).font = {
            bold: index >= resumen.length - 1,
            color: { argb: index >= resumen.length - 1 ? dorado : negro },
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
      }

      sheet.columns.forEach((col) => {
        let max = 10;
        col.eachCell?.((cell) => {
          const len = cell.value?.toString().length || 0;
          if (len > max) max = len;
        });
        col.width = max + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      zip.file(`Detalle_${nombre}_${formattedDate}.xlsx`, buffer);
    } catch (err) {
      console.error(`❌ Error con ${nombre}:`, err);
    }
  }

  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `envios_todos_los_clientes_${formattedDate}.zip`;
    link.click();
  } catch (zipErr) {
    console.error("❌ Error generando ZIP:", zipErr);
    alert("Ocurrió un error al generar el ZIP");
  }
};




const handleDownloadAllDrivers = async () => {
  if (!dataCadetes.length) return alert("No hay datos para exportar");

  const zip = new JSZip();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const dd = String(yesterday.getDate()).padStart(2, '0');
  const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yyyy = yesterday.getFullYear();
  const formattedDate = `${dd}-${mm}-${yyyy}`;

  for (const cadete of dataCadetes) {
    const nombre = cadete.chofer;

    try {
      const res = await fetch("http://localhost:5000/driver/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: nombre }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.result?.length) {
        console.warn(`⚠️ Sin datos para: ${nombre}`);
        continue;
      }

      const rows = payload.result;
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

      const headers = Object.keys(rows[0]);
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

      rows.forEach((row) => {
        const rowData = headers.map((h) => {
          if (h === "precio_chofer") return Number(row[h]);
          if (h === "porcentaje_chofer") return Number(row[h]);
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
      formatColumnByHeader(sheet, "precio_chofer", '"$"#,##0.00');
      formatColumnByHeader(sheet, "porcentaje_chofer", '0.00"%"');
      sheet.addRow([]);

      if (payload.totales && payload.discount !== undefined) {
        const resumen = [
          ["Resumen de Envíos"],
          ["Total de envíos", payload.totales.totalEnvios],
          ["Monto bruto", `$${payload.totales.montoTotal.toFixed(2)}`],
          ["Descuento (%)", `${(payload.discount * 100).toFixed(2)}%`],
          ["Neto final a cobrar", `$${payload.totales.netoFinal.toFixed(2)}`],
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
      }

      sheet.columns.forEach((col) => {
        let max = 10;
        col.eachCell?.((cell) => {
          const len = cell.value?.toString().length || 0;
          if (len > max) max = len;
        });
        col.width = max + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      zip.file(`Detalle_${nombre}_${formattedDate}.xlsx`, buffer);
    } catch (err) {
      console.error(`❌ Error con ${nombre}:`, err);
    }
  }

  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `envios_todos_los_choferes_${formattedDate}.zip`;
    link.click();
  } catch (zipErr) {
    console.error("❌ Error generando ZIP:", zipErr);
    alert("Ocurrió un error al generar el ZIP");
  }
};





const handleDownloadIndividual = async (nombre, tipo) => {
  try {
    const endpoint = tipo === "cadete" ? "/driver/me" : "/client/me";

    // 🟡 Log para verificar el nombre y el endpoint que se están enviando
    console.log("📦 Descargando archivo individual:", {
      nombre,
      tipo,
      endpoint,
    });

    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nombre?.trim() }),
    });

    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || "Error al obtener datos");

    const rows = payload.result || [];
    console.log("👉 Datos del primer envío:", rows[0]);
    
    if (!rows.length) return alert("❌ No hay datos para exportar");

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

    const headers = Object.keys(rows[0]);
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

    rows.forEach((row) => {
      const rowData = headers.map((h) => {
        if (h === "precio_cliente") return Number(row[h]);
        if (h === "descuento") return Number(row[h]);
        if (h === "precio_chofer") return Number(row[h]);
        if (h === "porcentaje_chofer") return Number(row[h]);
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
    if(tipo === 'cadete'){
      formatColumnByHeader(sheet, "precio_chofer", '"$"#,##0.00');
      formatColumnByHeader(sheet, "porcentaje_chofer", '0.00"%"');
    }
    else if(tipo === 'cliente'){
      formatColumnByHeader(sheet, "precio_cliente", '"$"#,##0.00');
      formatColumnByHeader(sheet, "descuento", '0.00"%"');
    }
    

    sheet.addRow([]);

    if (payload.totales && payload.discount !== undefined) {
      const resumen = [
        ["Resumen de Envíos"],
        ["Total de envíos", payload.totales.totalEnvios],
        ["Monto bruto", `$${payload.totales.montoTotal.toFixed(2)}`],
        ["Descuento (%)", `${(payload.discount * 100).toFixed(2)}%`],
        ["Neto final a cobrar", `$${payload.totales.netoFinal.toFixed(2)}`],
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
    }

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
    link.download = `envios_${tipo}_${nombre}.xlsx`;
    link.click();
  } catch (err) {
    console.error("❌ Error en handleDownloadIndividual:", err);
    alert("❌ Error exportando archivo");
  }
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
          📅 Descargar
        </button>
      )}
      <button
  onClick={handleDownloadAllDrivers}
  className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition shadow-lg"
>
  🚛 Descargar todos los choferes (.zip)
</button>

      <button
        onClick={handleDownloadAllClients}
        className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition shadow-lg"
      >
        📦 Descargar todos los clientes (.zip)
      </button>
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
                  <th className="px-4 py-2 border-b border-gray-700 text-lime-300">
                    Descargar
                  </th>
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
                    <td className="px-4 py-2 border-b border-gray-800">
                      <button
                        onClick={() => {
                          handleDownloadIndividual(row?.chofer ?? row?.nombre ?? row?.username ?? "", "cadete")
                        }}
                        className="text-green-400 hover:underline"
                      >
                        📊
                      </button>
                    </td>
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
                  <th className="px-4 py-2 border-b border-gray-700 text-lime-300">
                    Descargar
                  </th>
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
                    <td className="px-4 py-2 border-b border-gray-800">
                      <button
                        onClick={() => {
                          console.log("\ud83e\udd14 Cliente:", row);
                          handleDownloadIndividual(row.cliente, "cliente")
                        }}
                        className="text-green-400 hover:underline"
                      >
                        📊
                      </button>
                    </td>
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
}

export default Totales;
