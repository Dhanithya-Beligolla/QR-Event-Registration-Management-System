import React from 'react';
import Modal from './Modal.jsx';

export default function LoadingDialog({ open, message='Working...' }){
  return (
    <Modal open={open} title={null} onClose={null}
      actions={null}
    >
      <div className="loading">
        <div className="spinner" />
        <div className="loading-text">{message}</div>
      </div>
    </Modal>
  );
}
