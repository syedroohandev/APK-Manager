import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatsRow from "./StatsRow";
import ApkTable from "./ApkTable";
import ApkGrid from "./ApkGrid";
import UploadModal from "./UploadModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import Toast from "./Toast";
import WS11Firmware from "./WS11Firmware";
import ManageUsers from "./ManageUsers";

import "../App.css";

function Dashboard({ onLogout }) {
  const [apks, setApks] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [viewMode, setViewMode] = useState("table");
  const [currentView, setCurrentView] = useState("all");

  const [pageTitle, setPageTitle] = useState("All Apps");
  const [serverOnline, setServerOnline] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState("apk");

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState(null);

  const firmwareRef = useRef();

  const API = import.meta.env.VITE_API_URL;

  // 🔐 Security & UI: LocalStorage se current logged-in user ki details fetch ki
  const currentLoggedRole =
    localStorage.getItem("role")?.toLowerCase() || "manager";

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchApks = async () => {
    try {
      const res = await axios.get(`${API}/apks`);
      setApks(res.data);
      setServerOnline(true);
    } catch {
      setServerOnline(false);
      showToast("Cannot connect to server at localhost:3000", true);
    }
  };

  const fetchUsersCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Yahan ab res.data.users check karein
      if (res.data && res.data.success && Array.isArray(res.data.users)) {
        setUsersCount(res.data.users.length);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsersCount(0);
    }
  };

  useEffect(() => {
    fetchApks();
    fetchUsersCount();
  }, []);

  const handleSidebarNav = (view) => {
    setCurrentView(view);
    switch (view) {
      case "recent":
        setPageTitle("Recently Added");
        break;
      case "ws11-firmware":
        setPageTitle("WS-11 Firmware Manager");
        break;
      case "manage-users":
        setPageTitle("System User Management");
        break;
      default:
        setPageTitle("All Apps");
        break;
    }
  };

  const getFilteredApks = () => {
    let list = [...apks];
    if (currentView === "recent") {
      list = list.reverse().slice(0, 5);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.app_name.toLowerCase().includes(q) ||
          a.version.toLowerCase().includes(q),
      );
    }
    return list;
  };

  const visibleApks = getFilteredApks();
  const latestVersion = apks.length > 0 ? apks[apks.length - 1].version : "—";

  return (
    <div className="app-wrapper">
      <Sidebar onNav={handleSidebarNav} onLogout={onLogout} />

      <div className="main">
        <Topbar
          title={pageTitle}
          viewMode={viewMode}
          onViewChange={setViewMode}
          onLogout={onLogout}
        />

        <div className="content">
          {/* 🌟 ACTION BAR: Search aur Fixed Width Button Layout */}
          {(currentView === "all" || currentView === "recent") && (
            <div
              className="dashboard-action-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                gap: "15px",
                width: "100%",
              }}
            >
              {/* Search Field Wrapper */}
              <div className="search-bar" style={{ margin: 0, flex: 1 }}>
                <i className="ti ti-search" />
                <input
                  type="text"
                  placeholder="Search apps by name or version..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 🔥 FIXED BUTTON LOGIC: Isko width specify karke flex-grow se rok diya */}
              <button
                className="upload-master-btn"
                onClick={() => {
                  setUploadType("apk");
                  setUploadOpen(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "0 24px",
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  height: "42px",
                  width: "auto", // 👈 Poori line lene se rokega
                  minWidth: "140px", // 👈 Ek standard size bana kar rakhega
                  flexShrink: 0, // 👈 Kisi bhi haal me layout kharab nahi karega
                }}
              >
                <i className="ti ti-plus" style={{ fontSize: "1rem" }} />
                <span>Upload APK</span>
              </button>
            </div>
          )}

          {/* ========================================================
              🧭 RENDERING SWITCH CASES MAPS
             ======================================================== */}

          {currentView === "ws11-firmware" ? (
            <WS11Firmware
              ref={firmwareRef}
              apiBase={API}
              onUploadFirmware={() => {
                setUploadType("firmware");
                setUploadOpen(true);
              }}
            />
          ) : currentView === "manage-users" ? (
            <ManageUsers />
          ) : (
            <>
              <StatsRow
                total={apks.length}
                latestVersion={latestVersion}
                userCount={usersCount}
              />

              {viewMode === "table" ? (
                <ApkTable
                  apks={visibleApks}
                  apiBase={API}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  onNew={() => {
                    setUploadType("apk");
                    setUploadOpen(true);
                  }}
                  searchQuery={searchQuery} // 👈 Yeh line add karein
                  onClearSearch={() => setSearchQuery("")} // 👈 Yeh line add karein
                />
              ) : (
                <ApkGrid
                  apks={visibleApks}
                  apiBase={API}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================================================
          📦 MODALS MANAGEMENT SYSTEM
         ======================================================== */}
      {uploadOpen && (
        <UploadModal
          type={uploadType}
          apiBase={API}
          onClose={() => setUploadOpen(false)}
          onSuccess={() => {
            if (uploadType === "firmware") {
              firmwareRef.current?.refresh();
            } else {
              fetchApks();
            }
            showToast(
              uploadType === "firmware"
                ? "Firmware uploaded successfully"
                : "APK uploaded successfully",
            );
          }}
          onError={(msg) => showToast(msg, true)}
        />
      )}

      {editTarget && (
        <EditModal
          apk={editTarget}
          apiBase={API}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            fetchApks();
            showToast("App updated successfully");
          }}
          onError={(msg) => showToast(msg, true)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          apk={deleteTarget}
          apiBase={API}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            fetchApks();
            showToast("App deleted");
          }}
          onError={(msg) => showToast(msg, true)}
        />
      )}

      {toast && <Toast message={toast.message} isError={toast.isError} />}
    </div>
  );
}

export default Dashboard;
