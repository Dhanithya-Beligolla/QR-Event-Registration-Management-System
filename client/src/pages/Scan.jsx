import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function Scan(){
  const videoRef = useRef(null);
  const [text, setText] = useState('');

  useEffect(()=>{
    const codeReader = new BrowserMultiFormatReader();
    (async ()=>{
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const camera = devices.find(d=>d.kind==='videoinput');
        await codeReader.decodeFromVideoDevice(camera?.deviceId, videoRef.current, (result)=>{
          if (result) { const t = result.getText(); setText(t); window.location.href = t; }
        });
      } catch (e) { setText('Camera error: '+e.message); }
    })();
    return ()=>{ try { navigator.mediaDevices.getUserMedia({video:false}); } catch{} };
  }, []);

  return (
    <div className="card">
      <h3>Scan QR</h3>
      <video ref={videoRef} style={{width:'100%', maxWidth:480}} />
      <div className="badge" style={{marginTop:8}}>{text}</div>
    </div>
  );
}
