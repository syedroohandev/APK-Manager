import './StatsRow.css';

// 🌟 Humne serverOnline ko hata kar userCount (ya aap direct users list ki length bhej sakte hain) add kiya
const StatsRow = ({ total, latestVersion, userCount = 0 }) => {
  return (
    <div className="stats-row">
      {/* CARD 1: Total APKs */}
      <div className="stat-card">
        <div className="stat-label">Total APKs</div>
        <div className="stat-value">{total}</div>
        <div className="stat-sub">in database</div>
      </div>

      {/* CARD 2: Latest Version */}
      <div className="stat-card">
        <div className="stat-label">Latest version</div>
        <div className="stat-value">{latestVersion}</div>
        <div className="stat-sub">most recent upload</div>
      </div>

      {/* 🔥 NEW CARD 3: System Users (Backend Status ki jagah) */}
      <div className="stat-card">
        <div className="stat-label">System Users</div>
        <div className={`stat-value stat-users-count`}>
          {userCount}
        </div>
        <div className="stat-sub">active access profiles</div>
      </div>
    </div>
  );
};

export default StatsRow;