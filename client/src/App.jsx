import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider.jsx';

export default function App(){
  const [theme, setTheme] = useState(()=> localStorage.getItem('theme') || 'dark');
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = ()=> setTheme(t=> t==='dark' ? 'light' : 'dark');
  return (
    <ToastProvider>
      <div className="container">
        <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
          <h2>🎟️ Event QR</h2>
          <nav className="row nav">
            <Link to="/" className="btn">Home</Link>
            <Link to="/register" className="btn">Register</Link>
            <Link to="/scan" className="btn">Scan</Link>
            <Link to="/admin/login" className="btn secondary">Admin</Link>
            <button className="btn" onClick={toggleTheme} title="Toggle theme">{theme==='dark' ? 'Light' : 'Dark'} Mode</button>
          </nav>
        </div>
        <Outlet />
      </div>
    </ToastProvider>
  );
}
