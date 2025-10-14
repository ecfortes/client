import React from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm">
        <p>{message}</p>
        <div className="actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </Modal>
  );
}
