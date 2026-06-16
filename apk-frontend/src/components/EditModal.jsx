import { useState } from 'react';
import axios from 'axios';
import { getInitials } from '../utils';

const EditModal = ({ apk, apiBase, onClose, onSuccess, onError }) => {
  const [appName, setAppName] = useState(apk.app_name);
  const [version, setVersion] = useState(apk.version);
  const [saving, setSaving] = useState(false);

  const doEdit = async () => {
    if (!appName.trim() || !version.trim()) { onError('Fields cannot be empty'); return; }
    setSaving(true);
    try {
      await axios.put(`${apiBase}/apks/${apk.id}`, {
        app_name: appName.trim(),
        version: version.trim(),
      });
      onSuccess();
      onClose();
    } catch {
      onError('Update failed — check server connection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-title">
          <span>Edit app details</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="divider" />

        <div className="edit-app-preview">
          <div className="edit-app-icon">{getInitials(apk.app_name)}</div>
          <div>
            <div className="edit-app-name">{apk.app_name}</div>
            <div className="edit-app-id">ID #{apk.id}</div>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">App name</label>
          <input
            className="field-input"
            value={appName}
            onChange={e => setAppName(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Version</label>
          <input
            className="field-input"
            value={version}
            onChange={e => setVersion(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={doEdit}
            disabled={saving}
          >
            <i className="ti ti-check" aria-hidden="true" />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;