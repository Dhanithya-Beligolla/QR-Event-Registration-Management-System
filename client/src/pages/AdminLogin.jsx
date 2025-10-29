import React, { useState } from 'react';
import { api } from '../api';
import { setToken } from '../auth';
import LoadingDialog from '../components/LoadingDialog.jsx';
import AlertDialog from '../components/AlertDialog.jsx';

export default function AdminLogin(){
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open:false, title:'', content:null });

  const submit = async (e)=>{
    e.preventDefault();
    try {
      setLoading(true);
      const r = await api.login(email, password);
      setToken(r.token);
      window.location.href = '/admin';
    } catch (e) {
      setErr('');
      setAlert({ open:true, title:'Login failed', content: (<div>Please check your credentials and try again.</div>) });
    } finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h3>Admin Login</h3>
      <form onSubmit={submit} className="row">
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
        {err && <div className="error">{err}</div>}
        <button className="btn" type="submit">Login</button>
      </form>
      <LoadingDialog open={loading} message="Signing you in..." />
      <AlertDialog open={alert.open} title={alert.title} onClose={()=>setAlert(a=>({...a, open:false}))}>
        {alert.content}
      </AlertDialog>
    </div>
  );
}
