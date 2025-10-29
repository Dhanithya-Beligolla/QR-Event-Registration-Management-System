import React from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, title='Confirm', message, confirmLabel='Confirm', cancelLabel='Cancel', onConfirm, onCancel }){
  return (
    <Modal open={open} title={title} onClose={onCancel}
      actions={(
        <div className="row" style={{justifyContent:'flex-end'}}>
          <button className="btn secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      )}
    >
      <div className="dialog-content">{message}</div>
    </Modal>
  );
}
