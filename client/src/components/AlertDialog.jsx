import React from 'react';
import Modal from './Modal.jsx';

export default function AlertDialog({ open, title='Notice', children, onClose, primaryLabel='Close', onPrimary }){
  return (
    <Modal open={open} title={title} onClose={onClose}
      actions={(
        <div className="row" style={{justifyContent:'flex-end'}}>
          <button className="btn" onClick={onPrimary || onClose}>{primaryLabel}</button>
        </div>
      )}
    >
      <div className="dialog-content">{children}</div>
    </Modal>
  );
}
