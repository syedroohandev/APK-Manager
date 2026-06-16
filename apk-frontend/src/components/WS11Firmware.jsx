import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import "./WS11Firmware.css";

const WS11Firmware = forwardRef(({ apiBase, onUploadFirmware }, ref) => {
  const [firmware, setFirmware] = useState(null);

  const loadFirmware = async () => {
    try {
      const res = await axios.get(`${apiBase}/firmware`);
      setFirmware(res.data.firmware);
    } catch {
      setFirmware(null);
    }
  };

  // Yeh hissa App.jsx ko permission deta hai refresh karne ki
  useImperativeHandle(ref, () => ({
    refresh() {
      loadFirmware();
    }
  }));

  useEffect(() => {
    loadFirmware();
  }, []);

  return (
    <div className="ws11-page">
      <div className="ws11-header">
        <h2>WS-11 Firmware Manager</h2>

        <button
          className="ws11-btn primary"
          onClick={onUploadFirmware}
        >
          <i className="ti ti-upload" />
          Upload Firmware
        </button>
      </div>

      {firmware ? (
        <div className="firmware-card">
          <p>
            <strong>Version:</strong> {firmware.version}
          </p>

          <p>
            <strong>Device:</strong> {firmware.app_name}
          </p>

          <p>
            <strong>File:</strong> {firmware.file_path}
          </p>
        </div>
      ) : (
        <div className="empty-state">
          No firmware uploaded
        </div>
      )}
    </div>
  );
});

export default WS11Firmware;