import React from 'react';
export default function TextField({ label, value, onChange, type='text', placeholder='' }){
  return (
    <div style={{flex: '1 1 280px'}}>
      <label>{label}</label>
      <input className="input" type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
