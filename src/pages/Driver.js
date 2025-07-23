import { useState } from "react";

const Driver = () => {

  const username = localStorage.getItem('username')
  const [data, setData] = useState([])

  const dataRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/driver/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username:username}),
      });
      const unfiltered = await res.json()
      const data = unfiltered.result
      
      setData(data)
      
      if (!res.ok) throw new Error("Error");

      alert("✅ MOSTRANDO ENVIOS");
    
    } catch (err) {
      console.error(err);
      alert('❌ ERROR TRAYENDO DATOS');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h2 className="text-3xl text-cyan-400 font-bold">🚚 Acá podés ver tus envíos</h2>
      <button
        onClick={dataRequest}
        className="bg-lime-500 text-black font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition shadow-lg"
      >
        📊 Mis Envios
      </button>
      {data.length > 0 && (
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
                {data.map((row, i) => (
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
      )}
    </div>
  );
};

export default Driver;
