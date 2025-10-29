import React from 'react';
export default function DataTable({ columns=[], data=[] }){
  return (
    <table className="table">
      <thead><tr>{columns.map(c=> <th key={c.key}>{c.title}</th>)}</tr></thead>
      <tbody>
        {data.map((row,i)=> (
          <tr key={row.id||row._id||i}>{columns.map(c=> <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
