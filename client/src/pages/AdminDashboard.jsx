import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { clearToken } from '../auth';
import DataTable from '../components/DataTable';
import TextField from '../components/inputs/TextField';
import Select from '../components/inputs/Select';
import RadioGroup from '../components/inputs/RadioGroup';
import DateTimeInput from '../components/inputs/DateTimeInput';
import LoadingDialog from '../components/LoadingDialog.jsx';
import AlertDialog from '../components/AlertDialog.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import { useToaster } from '../components/ToastProvider.jsx';
import QRCard from '../components/QRCard.jsx';

export default function AdminDashboard(){
  const { addToast } = useToaster();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name:'', email:'', phone:'', department:'', ticketType:'Regular', category:'Onsite', eventDateTime:'' , via:'sms' });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [alert, setAlert] = useState({ open:false, title:'', content:null });
  const [confirm, setConfirm] = useState({ open:false, id:null });
  const [qrView, setQrView] = useState({ open:false, url:'', token:'', imgError:false });
  const [showRegQR, setShowRegQR] = useState(false);
  const set = (k,v)=> setForm(f=>({...f,[k]:v}));

  const refresh = async ()=>{
    const r = await api.listParticipants({ page, limit: 20, q });
    setList(r.items); setPages(r.pages);
  };
  useEffect(()=>{ refresh(); }, [page, q]);

const upsert = async (e) => {
  e.preventDefault();
  // remove 'via' from payload before upsert
  const { via, ...rest } = form;
  const payload = { 
    ...rest, 
    eventDateTime: form.eventDateTime ? new Date(form.eventDateTime).toISOString() : null 
  };
  try {
    setLoading(true); setLoadingMsg('Saving participant...');
    const saved = await api.upsertParticipant(payload);
    setLoadingMsg('Sending QR via ' + via.toUpperCase() + '...');
    const r = await api.sendQR(saved._id, via);
    setForm({ name:'', email:'', phone:'', department:'', ticketType:'Regular', category:'Onsite', eventDateTime:'', via:'sms' });
    await refresh();
    setAlert({ open:true, title:'QR sent', content:(
      <div>
        <div className="badge" style={{display:'inline-block'}}>URL: {r.url}</div>
        {r.qr && <div style={{marginTop:8}}><img src={r.qr} alt="QR" style={{maxWidth:220}} /></div>}
        {r.qr && <div style={{marginTop:8}}><a className="btn" href={r.qr} download="event-qr.png">Download QR</a></div>}
        <div style={{marginTop:8}}>SMS: {r.sms || 'n/a'}</div>
        <div>Email: {r.email || 'n/a'}</div>
      </div>
    )});
    addToast('QR sent successfully');
  } catch (e) {
    setAlert({ open:true, title:'Operation failed', content:(<div>Unable to save or send. Please verify participant details and env configuration.</div>) });
  } finally { setLoading(false); setLoadingMsg(''); }
};


  const send = async (id, via='sms')=>{
    try {
      setLoading(true); setLoadingMsg('Sending via ' + via.toUpperCase() + '...');
      const r = await api.sendQR(id, via);
      setAlert({ open:true, title:'QR sent', content:(
        <div>
          <div className="badge" style={{display:'inline-block'}}>URL: {r.url}</div>
          {r.qr && <div style={{marginTop:8}}><img src={r.qr} alt="QR" style={{maxWidth:220}} /></div>}
          {r.qr && <div style={{marginTop:8}}><a className="btn" href={r.qr} download="event-qr.png">Download QR</a></div>}
          <div style={{marginTop:8}}>SMS: {r.sms || 'n/a'}</div>
          <div>Email: {r.email || 'n/a'}</div>
        </div>
      )});
      addToast('QR sent successfully');
    } catch (e) {
      setAlert({ open:true, title:'Send failed', content:(<div>Unable to send. Check SMS/SMTP env and participant contact info.</div>) });
    } finally { setLoading(false); setLoadingMsg(''); }
  };
  const retoken = async (id)=>{
    setConfirm({ open:true, id });
  };
  const confirmRetoken = async ()=>{
    const id = confirm.id;
    setConfirm({ open:false, id:null });
    try {
      setLoading(true); setLoadingMsg('Resetting token...');
      await api.retoken(id); await refresh();
      setAlert({ open:true, title:'Token reset', content:(<div>The participant token has been regenerated.</div>) });
      addToast('Token reset');
    } catch (e) {
      setAlert({ open:true, title:'Reset failed', content:(<div>Unable to reset token.</div>) });
    } finally { setLoading(false); setLoadingMsg(''); }
  };

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <h3>Admin Dashboard</h3>
        <button className="btn" onClick={()=>{ clearToken(); window.location.href='/admin/login'; }}>Logout</button>
      </div>

      <div className="card">
        <h4>Search</h4>
        <input className="input" placeholder="Search name..." value={q} onChange={e=>{ setQ(e.target.value); setPage(1); }} />
      </div>

      <div className="card">
        <h4>Add / Update Participant & Send QR</h4>
        <form onSubmit={upsert} className="row">
          <TextField label="Full Name" value={form.name} onChange={v=>set('name',v)} />
          <TextField label="Email" value={form.email} onChange={v=>set('email',v)} />
          <TextField label="Phone" value={form.phone} onChange={v=>set('phone',v)} />
          <TextField label="Department" value={form.department} onChange={v=>set('department',v)} />
          <Select label="Ticket Type" value={form.ticketType} onChange={v=>set('ticketType',v)} options={[{value:'Regular',label:'Regular'},{value:'VIP',label:'VIP'},{value:'Student',label:'Student'}]} />
          <RadioGroup label="Category" value={form.category} onChange={v=>set('category',v)} options={[{value:'Onsite',label:'Onsite'},{value:'Online',label:'Online'}]} />
          <DateTimeInput label="Event Date & Time" value={form.eventDateTime} onChange={v=>set('eventDateTime',v)} />
          <Select label="Delivery Channel" value={form.via} onChange={v=>set('via',v)} options={[
            {value:'sms', label:'SMS'},
            {value:'email', label:'Email'},
            {value:'both', label:'Both'},
          ]} />
          <button className="btn" type="submit">Save & Send</button>
        </form>
      </div>

      <h4>Participants</h4>
      <div className="card">
        <h4>Registration QR to Display</h4>
        <div className="row" style={{alignItems:'center'}}>
          <QRCard url={`${import.meta.env.VITE_PUBLIC_BASE_URL.replace(/\/$/,'')}/register`} />
          <div className="row" style={{alignItems:'center'}}>
            <button className="btn" onClick={()=>setShowRegQR(true)}>Open Fullscreen</button>
          </div>
        </div>
        <Modal open={showRegQR} onClose={()=>setShowRegQR(false)} title="Registration QR (Fullscreen)">
          <div style={{display:'flex',justifyContent:'center'}}>
            <QRCard url={`${import.meta.env.VITE_PUBLIC_BASE_URL.replace(/\/$/,'')}/register`} />
          </div>
        </Modal>
      </div>

      <DataTable
        columns={[
          { key:'name', title:'Name' },
          { key:'phone', title:'Phone' },
          { key:'email', title:'Email' },
          { key:'token', title:'QR Link', render:(p)=>`${import.meta.env.VITE_PUBLIC_BASE_URL.replace(/\/$/,'')}/attend?token=${encodeURIComponent(p.token)}` },
          { key:'attendedAt', title:'Attended', render:(p)=> p.attendedAt ? new Date(p.attendedAt).toLocaleString() : '-' },
          { key:'actions', title:'Actions', render:(p)=> (
            <div className="row">
              <button className="btn" onClick={()=> setQrView({ open:true, url: `${import.meta.env.VITE_PUBLIC_BASE_URL.replace(/\/$/,'')}/attend?token=${encodeURIComponent(p.token)}`, token: p.token, imgError:false })}>View QR</button>
              <button className="btn" onClick={()=>send(p._id,'sms')}>SMS</button>
              <button className="btn" onClick={()=>send(p._id,'email')}>Email</button>
              <button className="btn" onClick={()=>send(p._id,'both')}>Both</button>
              <button className="btn secondary" onClick={()=>retoken(p._id)}>Reset Token</button>
            </div>
          )}
        ]}
        data={list}
      />

      <div className="row">
        <button className="btn" onClick={()=> setPage(p=>Math.max(1, p-1))}>Prev</button>
        <div className="badge">Page {page} / {pages}</div>
        <button className="btn" onClick={()=> setPage(p=>Math.min(pages, p+1))}>Next</button>
      </div>
      <LoadingDialog open={loading} message={loadingMsg || 'Working...'} />
      <AlertDialog open={alert.open} title={alert.title} onClose={()=>setAlert(a=>({...a, open:false}))}>
        {alert.content}
      </AlertDialog>
      <ConfirmDialog
        open={confirm.open}
        title="Reset token?"
        message="This will invalidate the old QR link for this participant. Continue?"
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={confirmRetoken}
        onCancel={()=>setConfirm({ open:false, id:null })}
      />
      <Modal open={qrView.open} onClose={()=>setQrView({ open:false, url:'', token:'', imgError:false })} title="Participant QR">
        {qrView.url && (
          <div>
            <div className="badge" style={{marginBottom:8}}>Direct Link</div>
            <div style={{wordBreak:'break-all'}}>{qrView.url}</div>
            <div style={{marginTop:12}}>
              {(()=>{
                const apiBase = (import.meta.env.VITE_API_BASE || '').replace(/\/$/,'');
                const pngUrl = qrView.token && apiBase ? `${apiBase}/qr/${encodeURIComponent(qrView.token)}.png` : '';
                return (
                  <>
                    {pngUrl && !qrView.imgError && (
                      <img src={pngUrl} alt="QR"
                           onError={()=>setQrView(v=>({...v, imgError:true}))}
                           style={{maxWidth:240}} />
                    )}
                    {(qrView.imgError || !pngUrl) && (
                      <QRCard url={qrView.url} />
                    )}
                  </>
                );
              })()}
            </div>
            <div className="row" style={{marginTop:10}}>
              {(()=>{
                const apiBase = (import.meta.env.VITE_API_BASE || '').replace(/\/$/,'');
                const pngUrl = qrView.token && apiBase ? `${apiBase}/qr/${encodeURIComponent(qrView.token)}.png` : '';
                return pngUrl ? (
                  <a className="btn" href={pngUrl} download={`event-qr-${Date.now()}.png`}>Download QR</a>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
