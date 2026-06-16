import { useState, useRef } from "react";
import "./Modal.css";

const UploadModal = ({
  apiBase,
  onClose,
  onSuccess,
  onError,
  type = "apk",
}) => {
  const isFirmware = type === "firmware";

  const [appName, setAppName] = useState("");
  const [version, setVersion] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);

  const fileInputRef = useRef();

  const handleFileSelect = (f) => {
    if (!f) return;

    const validExtension = isFirmware
      ? f.name.toLowerCase().endsWith(".bin")
      : f.name.toLowerCase().endsWith(".apk");

    if (!validExtension) {
      onError(
        isFirmware
          ? "Only .bin files are allowed"
          : "Only .apk files are allowed"
      );
      return;
    }

    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const doUpload = () => {
    if (!version.trim() || !file) {
      onError("Please fill all required fields");
      return;
    }

    if (!isFirmware && !appName.trim()) {
      onError("App name is required");
      return;
    }

    const formData = new FormData();

    if (isFirmware) {
      formData.append("firmware", file);
      formData.append("version", version.trim());
    } else {
      formData.append("apk", file);
      formData.append("app_name", appName.trim());
      formData.append("version", version.trim());
    }

    const xhr = new XMLHttpRequest();

    xhr.open(
      isFirmware ? "PUT" : "POST",
      isFirmware
        ? `${apiBase}/firmware`
        : `${apiBase}/apks`
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round(
          (e.loaded / e.total) * 100
        );

        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onSuccess();
        onClose();
      } else {
        onError(
          xhr.responseText ||
            "Upload failed"
        );

        setProgress(null);
      }
    };

    xhr.onerror = () => {
      onError(
        "Network error. Please check server connection."
      );

      setProgress(null);
    };

    xhr.send(formData);
    setProgress(0);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="modal-panel">

        <div className="modal-title">
          <span>
            {isFirmware
              ? "Upload WS-11 Firmware"
              : "Upload New APK"}
          </span>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="divider" />

        {!isFirmware && (
          <div className="field-group">
            <label className="field-label">
              App Name
            </label>

            <input
              className="field-input"
              placeholder="e.g. My Awesome App"
              value={appName}
              onChange={(e) =>
                setAppName(
                  e.target.value
                )
              }
            />
          </div>
        )}

        <div className="field-group">
          <label className="field-label">
            Version
          </label>

          <input
            className="field-input"
            placeholder="e.g. 1.0.0"
            value={version}
            onChange={(e) =>
              setVersion(
                e.target.value
              )
            }
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            {isFirmware
              ? "Firmware File (.bin)"
              : "APK File"}
          </label>

          <div
            className={`file-drop ${
              dragging ? "drag" : ""
            }`}
            onClick={() =>
              fileInputRef.current.click()
            }
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() =>
              setDragging(false)
            }
          >
            <i className="ti ti-cloud-upload" />

            <p>
              {file
                ? file.name
                : isFirmware
                ? "Click or drag .bin firmware file here"
                : "Click or drag .apk file here"}
            </p>

            <small>
              Max file size 500 MB
            </small>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={
              isFirmware
                ? ".bin"
                : ".apk"
            }
            style={{
              display: "none",
            }}
            onChange={(e) =>
              handleFileSelect(
                e.target.files[0]
              )
            }
          />
        </div>

        {progress !== null && (
          <div className="progress-wrap">
            <div className="progress-meta">
              <span>
                Uploading...
              </span>

              <span>
                {progress}%
              </span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
          }}
          onClick={doUpload}
          disabled={
            progress !== null
          }
        >
          <i className="ti ti-upload" />

          {progress !== null
            ? "Uploading..."
            : isFirmware
            ? "Upload Firmware"
            : "Upload APK"}
        </button>

      </div>
    </div>
  );
};

export default UploadModal;