import { getInitials, getFileName, getIconColor } from "../utils";
import "./ApkGrid.css";

const ApkGrid = ({ apks, apiBase, onEdit, onDelete }) => {
  const API = import.meta.env.VITE_API_URL;

  if (!apks.length) {
    return (
      <div className="empty-state">
        <i className="ti ti-package-off" aria-hidden="true" />
        <p>No APKs found</p>
        <small>Upload your first APK to get started</small>
      </div>
    );
  }

  return (
    <div className="apk-grid">
      {apks.map((apk, i) => {
        const { bg, text } = getIconColor(i);

        // ✅ Updated: Use file_name instead of file_path
        const fileName = getFileName(apk.file_name);

        return (
          <div className="apk-card" key={apk.id}>
            <div
              className="apk-card-icon"
              style={{ background: bg, color: text }}
            >
              {getInitials(apk.app_name)}
            </div>

            <div className="apk-card-name">{apk.app_name}</div>

            <div className="apk-card-ver">v{apk.version}</div>

            {/* ✅ Updated: Display file_name */}
            <div className="apk-card-file">{fileName}</div>

            <div className="apk-card-actions">
              <a
                // ✅ Updated: Download uses file_name instead of file_path
                href={`${API}/apks/${fileName}`}
                download
                className="icon-btn"
                title="Download"
              >
                <i className="ti ti-download" aria-hidden="true" />
              </a>

              <button
                className="icon-btn"
                title="Edit"
                onClick={() =>
                  onEdit({
                    id: apk.id,
                    app_name: apk.app_name,
                    version: apk.version,
                  })
                }
              >
                <i className="ti ti-edit" aria-hidden="true" />
              </button>

              <button
                className="icon-btn danger"
                title="Delete"
                onClick={() => onDelete({ id: apk.id, app_name: apk.app_name })}
              >
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApkGrid;