import { useState } from "react";

const Driver = () => {

  // const username = localStorage.getItem('username')
  const username = 'daniela ancona'
  const [data, setData] = useState({})

  const dataRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/driver/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username:username}),
      });
      const data = await res.json()
      console.log(data);
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
    </div>
  );
};

export default Driver;
