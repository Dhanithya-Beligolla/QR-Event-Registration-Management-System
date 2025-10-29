import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { api } from '../api';

export default function AdminScan(){
  const videoRef = useRef(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(()=>{
    const codeReader = new BrowserMultiFormatReader();
    let cancelled = false;
    (async ()=>{
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const camera = devices.find(d=>d.kind==='videoinput');
        await codeReader.decodeFromVideoDevice(camera?.deviceId, videoRef.current, async (qr)=>{
          if (!qr || cancelled) return;
          const t = qr.getText(); setText(t);
          try {
            const url = new URL(t);
            const token = url.searchParams.get('token');
            if (!token) { setError('QR does not contain a token'); return; }
            const v = await api.validateToken(token);
            if (!v.valid) { setError('Token not found'); return; }
            const mark = await api.markAttendance(token);
            setResult({ name: v.participant.name, attendedAt: mark.attendedAt });
          } catch (e) {
            setError('Invalid QR content');
          }
        });
      } catch (e) { setText('Camera error: '+e.message); }
    })();
    return ()=>{ cancelled = true; try { navigator.mediaDevices.getUserMedia({video:false}); } catch{} };
  }, []);

  return (
    <div className="card">
      <h3>Admin Scan & Mark Attendance</h3>
      <video ref={videoRef} style={{width:'100%', maxWidth:480}} />
      <div className="badge" style={{marginTop:8}}>{text}</div>
      {result && (
        <div className="card" style={{marginTop:12}}>
          <div>Marked attendance for <b>{result.name}</b> at {new Date(result.attendedAt).toLocaleString()}</div>
        </div>
      )}
      {error && <div className="error" style={{marginTop:8}}>{error}</div>}
    </div>
  );
}
