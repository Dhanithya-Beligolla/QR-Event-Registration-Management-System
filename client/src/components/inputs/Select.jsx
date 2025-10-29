import React from 'react';
export default function Select({ label, value, onChange, options=[] }){
  return (
    <div style={{flex: '1 1 280px'}}>
      <label>{label}</label>
      <select className="input" value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
