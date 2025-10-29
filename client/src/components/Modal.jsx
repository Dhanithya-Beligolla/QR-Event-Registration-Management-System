import React, { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children, actions }){
  const ref = useRef(null);

  useEffect(()=>{
    function onKey(e){ if (e.key === 'Escape' && onClose) onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return ()=> document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const stop = (e)=> e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={stop} ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {title && <div className="modal-header"><h3 id="modal-title">{title}</h3></div>}
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
