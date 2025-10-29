import React from 'react';
export default function DateTimeInput({ label, value, onChange }){
  return (
    <div style={{flex: '1 1 280px'}}>
      <label>{label}</label>
      <input className="input" type="datetime-local" value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
