import React, { useState } from "react";
import * as XLSX from "xlsx";

const ShipmentList = () => {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");

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
    <div style={{ padding: 20 }}>
      <h2>📦 Subí un Excel y visualizá los envíos</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      <br /><br />
      {data.length > 0 && (
        <>
          <input
            type="text"
            placeholder="🔍 Filtrar por chofer, cliente, etc."
            value={filterText}
            onChange={handleFilterChange}
            style={{ padding: 8, width: "300px", marginBottom: 20 }}
          />
          <button onClick={enviarDatos}>📤 Enviar a PostgreSQL</button>
          <table border={1} cellPadding={5}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key, i) => (
                  <th key={i}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={i}>
                  {Object.keys(data[0]).map((key, j) => (
                    <td key={j}>{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ShipmentList;
