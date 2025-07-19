import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      login('admin');
      navigate('/dashboard');
    } else if (username === 'driver' && password === 'driver123') {
      login('driver');
      navigate('/driver');
    } else if (username === 'seller' && password === 'seller123') {
      login('seller');
      navigate('/seller');
    } else {
      alert('❌ Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center absolute top-16 px-6">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-[0_0_20px_white] tracking-wider animate-pulse">
          WynFlex is Powered By Lynx 🚀
        </h1>
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-xl shadow-2xl w-[90%] max-w-md mt-40"
      >
        <h2 className="text-2xl font-semibold text-lime-400 mb-6 text-center">
          Iniciar sesión
        </h2>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
        />

        <button
          type="submit"
          className="w-full bg-lime-500 text-black font-semibold py-2 rounded hover:brightness-110 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;


