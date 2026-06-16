import { getInitials, getFileName, getIconColor } from '../utils';
import './ApkTable.css';

// 🌟 Humne 'searchQuery' aur 'onClearSearch' ko baqi props ke sath add kiya
const ApkTable = ({ apks, apiBase, onEdit, onDelete, onNew, searchQuery = "", onClearSearch }) => {
  
  // ========================================================
  // 💡 INTELLIGENCE STATE HOOKS: Har scenario ko auto-detect karna
  // ========================================================
  const isSearching = searchQuery.trim() !== "";

  // CASE A: Agar table ke paas data khali hai AUR user search kar raha tha (Matlab matching results zero hain)
  if (!apks.length && isSearching) {
    return (
      <div className="empty-state-card search-empty">
        <i className="ti ti-search-off" style={{ fontSize: '2.5rem', color: '#9ca3af' }} />
        <h3>No results found</h3>
        <p>No application matches <strong>"{searchQuery}"</strong>. Check spelling or try another term.</p>
        {onClearSearch && (
          <button className="clear-search-link-btn" onClick={onClearSearch}>
            Clear search query
          </button>
        )}
      </div>
    );
  }

  // CASE B: Agar table ke paas waqai data khali hai aur koi search chal hi nahi rahi (Matlab database bilkul zero hai)
  if (!apks.length) {
    return (
      <div className="empty-state-card">
        <i className="ti ti-cloud-upload" style={{ fontSize: '2.5rem', color: '#9ca3af' }} />
        <h3>No APKs uploaded yet</h3>
        <p>Get started by uploading your first application to the server.</p>
        <button className="upload-master-btn" onClick={onNew} style={{ marginTop: '8px' }}>
          <i className="ti ti-plus" /> Upload APK
        </button>
      </div>
    );
  }

  // CASE C: Perfect Match Found -> Normal Row Listing Card Framework Grid render hoga
  return (
    <div className="table-wrap">
      <table className="apk-table">
        <thead>
          <tr>
            <th>App</th>
            <th>Version</th>
            <th>File</th>
            <th>ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {apks.map((apk, i) => {
            const { bg, text } = getIconColor(i);
            return (
              <tr key={apk.id}>
                <td>
                  <div className="app-name-cell">
                    <div className="app-icon" style={{ background: bg, color: text }}>
                      {getInitials(apk.app_name)}
                    </div>
                    <span className="app-name">{apk.app_name}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-blue">v{apk.version}</span>
                </td>
                <td>
                  <span className="file-name">{getFileName(apk.file_path)}</span>
                </td>
                <td>
                  <span className="row-id">#{apk.id}</span>
                </td>
                <td>
                  <div className="actions-cell">
                    <a
                      href={`${apiBase}/${apk.file_path}`}
                      download
                      className="icon-btn"
                      title="Download"
                    >
                      <i className="ti ti-download" aria-hidden="true" />
                    </a>
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => onEdit({ id: apk.id, app_name: apk.app_name, version: apk.version })}
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ApkTable;