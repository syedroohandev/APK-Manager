import './Topbar.css';

const Topbar = ({ title, viewMode, onViewChange }) => {
  // Check karte hain ki current page firmware manager hai ya nahi
  const isFirmwarePage = title === "WS-11 Firmware Manager";

  return (
    <header className="topbar">
      <div className="topbar-title">
        <i className={`ti ${isFirmwarePage ? 'ti-cpu' : 'ti-package'}`} aria-hidden="true" />
        {title}
      </div>

      <div className="topbar-actions">
        {/* Grid/Table view toggler sirf tabhi dikhega jab hum APK views par hain */}
        {!isFirmwarePage && (
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewChange('table')}
              title="Table view"
            >
              <i className="ti ti-table" aria-hidden="true" />
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewChange('grid')}
              title="Grid view"
            >
              <i className="ti ti-layout-grid" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;