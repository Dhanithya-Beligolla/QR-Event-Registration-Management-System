import React from 'react';
import { Link } from 'react-router-dom';
export default function Home(){
  return (
    <div className="card">
      <h3>Welcome</h3>
      <p>Use your QR link to mark attendance. If you haven't registered, use the button below.</p>
      <Link to="/register" className="btn">Register</Link>
    </div>
  );
}
