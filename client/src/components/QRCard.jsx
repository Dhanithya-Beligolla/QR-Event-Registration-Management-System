import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
export default function QRCard({ url, dataUrl: provided }){
  const [dataUrl, setDataUrl] = useState(provided || '');
  useEffect(()=>{
    let cancelled = false;
    async function run(){
      if (provided) { setDataUrl(provided); return; }
      if (url) {
        const d = await QRCode.toDataURL(url, { margin:1, width:220 });
        if (!cancelled) setDataUrl(d);
      }
    }
    run();
    return ()=>{ cancelled = true; };
  }, [url, provided]);
  const download = ()=>{
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'event-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  if(!url && !dataUrl) return null;
  return (
    <div className="card" style={{maxWidth:300}}>
      <div className="badge">QR</div>
      {dataUrl && <img src={dataUrl} alt="QR" style={{maxWidth:260}} />}
      {url && <div style={{wordBreak:'break-all', marginTop:8}}>{url}</div>}
      {dataUrl && <div className="row" style={{marginTop:8}}>
        <button className="btn" onClick={download}>Download QR</button>
      </div>}
    </div>
  );
}
