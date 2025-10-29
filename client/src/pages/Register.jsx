import React, { useState } from 'react';
import { api } from '../api';
import TextField from '../components/inputs/TextField';
import Select from '../components/inputs/Select';
import RadioGroup from '../components/inputs/RadioGroup';
import DateTimeInput from '../components/inputs/DateTimeInput';
import QRCard from '../components/QRCard';
import LoadingDialog from '../components/LoadingDialog.jsx';
import AlertDialog from '../components/AlertDialog.jsx';
import { useToaster } from '../components/ToastProvider.jsx';

export default function Register(){
  const { addToast } = useToaster();
  const [form, setForm] = useState({ name:'', email:'', phone:'', department:'', ticketType:'Regular', category:'Onsite', eventDateTime:'', via:'sms' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open:false, title:'', content:null });
  const set = (k,v)=> setForm(f=>({...f,[k]:v}));

  const submit = async (e)=>{
    e.preventDefault();
    const payload = { ...form, eventDateTime: form.eventDateTime ? new Date(form.eventDateTime).toISOString() : null };
    try {
      setLoading(true);
      const r = await api.publicRegister(payload);
      setResult(r);
      setAlert({ open:true, title:'Registration complete', content:(
        <div>
          <div>Your check-in link has been generated.</div>
          <div className="badge" style={{marginTop:8, display:'inline-block'}}>URL: {r.url}</div>
          <div style={{marginTop:8}}>Delivery: {JSON.stringify(r.delivery)}</div>
        </div>
      )});
      addToast('Registered successfully');
    } catch (e) {
      setAlert({ open:true, title:'Registration failed', content:(<div>Something went wrong. Please try again.</div>) });
    } finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h3>Register</h3>
      <form onSubmit={submit} className="row">
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
        <button className="btn" type="submit">Register</button>
      </form>
  {result?.url && <div style={{marginTop:12}}><QRCard url={result.url} dataUrl={result.qr} /></div>}
      {result?.delivery && <div className="badge" style={{marginTop:8}}>Delivery: {JSON.stringify(result.delivery)}</div>}
      <LoadingDialog open={loading} message="Submitting your registration..." />
      <AlertDialog open={alert.open} title={alert.title} onClose={()=>setAlert(a=>({...a, open:false}))}>
        {alert.content}
      </AlertDialog>
    </div>
  );
}
