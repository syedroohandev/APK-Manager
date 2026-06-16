import { useState } from 'react';
import axios from 'axios';

const DeleteModal = ({ apk, apiBase, onClose, onSuccess, onError }) => {
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${apiBase}/apks/${apk.id}`);
      onSuccess();
      onClose();
    } catch {
      onError('Delete failed — check server connection');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-title">
          <span>Delete app</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="divider" />

        <div className="delete-confirm-body">
          <div className="delete-icon-wrap">
            <i className="ti ti-trash" aria-hidden="true" />
          </div>
          <p className="delete-title">Delete "{apk.app_name}"?</p>
          <p className="delete-desc">
            This will permanently remove the APK file and its database record.
            This action cannot be undone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={doDelete}
            disabled={deleting}
          >
            <i className="ti ti-trash" aria-hidden="true" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;