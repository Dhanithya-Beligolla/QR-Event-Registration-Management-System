import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

export default function Attend(){
  const [state, setState] = useState({ status: 'loading' });
  const token = new URL(window.location.href).searchParams.get('token');

  useEffect(()=>{
    (async ()=>{
      if (!token) return setState({ status: 'error', msg: 'Missing token' });
      const v = await api.validateToken(token);
      if (!v.valid) return setState({ status: 'notfound' });
      if (v.participant.attendedAt) return setState({ status: 'already', at: v.participant.attendedAt, name: v.participant.name });
      const r = await api.markAttendance(token);
      setState({ status: 'ok', at: r.attendedAt, name: v.participant.name });
    })();
  }, [token]);

  if (state.status==='loading') return <div className="card">Checking in...</div>;
  if (state.status==='error') return <div className="card">Error: {state.msg}</div>;
  if (state.status==='notfound') return (
    <div className="card">
      <h3>We couldn't find your registration</h3>
      <p>Please <Link to="/register">register here</Link> and we'll send you your QR immediately.</p>
    </div>
  );
  if (state.status==='already') return (
    <div className="card">
      <h3>Welcome back, {state.name}!</h3>
      <p>You've already checked in at <b>{new Date(state.at).toLocaleString()}</b>.</p>
    </div>
  );
  return (
    <div className="card">
      <h3>Thanks, {state.name}! ✅</h3>
      <p>Your attendance has been recorded at <b>{new Date(state.at).toLocaleString()}</b>.</p>
    </div>
  );
}
