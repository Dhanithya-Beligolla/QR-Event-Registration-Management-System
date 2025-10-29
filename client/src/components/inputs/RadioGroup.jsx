import React from 'react';
export default function RadioGroup({ label, value, onChange, options=[] }){
  return (
    <div style={{flex: '1 1 280px'}}>
      <label>{label}</label>
      <div className="row">
        {options.map(o=> (
          <label key={o.value} style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="radio" checked={value===o.value} onChange={()=>onChange(o.value)} /> {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}
