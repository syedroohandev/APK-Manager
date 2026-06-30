const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// app.use(cors());
app.use(cors()); // Hashing aur standard routing ke preflight errors ko bypass karne ke liye
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/files", express.static(path.join(__dirname, "uploads")));
// app.use("/api/apks", express.static("uploads"));

// 1. Storage aur File Validation Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === ".apk") {
      cb(null, true);
    } else {
      cb(new Error("Only .apk files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB ki limit
  },
});

const uploadBin = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === ".bin") {
      cb(null, true);
    } else {
      cb(new Error("Only .bin files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
}).single("firmware");

// 2. Database Connection (Traditional Callback Instance)
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Connection successful hone par log
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully!");
    connection.release(); // connection wapas pool mein chor do
  }
});

// Pool-level errors (jaise connection drop, etc.)
db.on('error', function (err) {
  console.error("⚠️ Database pool error:", err.code, "-", err.message);
});
// const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// db.on('error', function(err) {
//   console.error('Database error:', err);
//   if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
//     // Yahan aap connection ko re-establish karne ka logic likh sakte hain
//     console.log('Database connection was closed. Reconnecting...');
//     // handleDisconnect(); 
//   } else {
//     throw err;
//   }
// });

// Helper function to delete file safely
function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑 Deleted: ${filePath}`);
    }
  } catch (err) {
    console.error(`Delete Error: ${err.message}`);
  }
}

// ==========================================
// 🛡️ JWT AUTH MIDDLEWARE (Callback Style)
// ==========================================
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Expects: Bearer <token>

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "No token provided. Please login." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }
    req.user = decoded;
    next();
  });
};

app.get("/api", (req, res) => {
  res.send("API is working correctly!");
});

app.get("/", (req, res) => {
  res.send("Runnning!");
});

// 🔑 1. USER LOGIN API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email.trim()],
    (err, rows) => {
      if (err) {
        console.error("Database Login Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Server error during login" });
      }

      if (!rows || rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const user = JSON.parse(JSON.stringify(rows[0]));

      // Asli professional tareeqa: Bcrypt standard validation
      bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          return res
            .status(500)
            .json({ success: false, message: "Encryption match failed" });
        }

        if (!isMatch) {
          return res
            .status(401)
            .json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: "1d" },
        );

        res.json({
          success: true,
          message: "Logged in successfully",
          token,
          role: user.role,
        });
      });
    },
  );
});
// ==========================================
// ➕ 2. ADD NEW USER API (Callback Style)
// ==========================================
app.post("/api/users", verifyToken, (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  // Check unique email
  db.query("SELECT id FROM users WHERE email = ?", [email], (err, existing) => {
    if (err)
      return res.status(500).json({ success: false, message: "Server error" });

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already registered" });
    }

    // Bcrypt password hashing
    bcrypt.genSalt(10, (saltErr, salt) => {
      if (saltErr)
        return res
          .status(500)
          .json({ success: false, message: "Salt generation failed" });

      bcrypt.hash(password, salt, (hashErr, hashedPassword) => {
        if (hashErr)
          return res
            .status(500)
            .json({ success: false, message: "Hashing failed" });

        const userRole = role || "admin";

        db.query(
          "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
          [email, hashedPassword, userRole],
          (insertErr, result) => {
            if (insertErr)
              return res
                .status(500)
                .json({ success: false, message: "Failed to add user" });
            res
              .status(201)
              .json({ success: true, message: "New user added successfully" });
          },
        );
      });
    });
  });
});

// ==========================================
// 📝 3. EDIT USER API (Callback Style)
// ==========================================
app.put("/api/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { email, role, password } = req.body; // 👈 1. Password yahan catch kiya

  db.query(
    "SELECT id FROM users WHERE id = ?",
    [id],
    async (err, userCheck) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Server error" });

      if (userCheck.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // 🌟 DYNAMIC QUERY LOGIC: Default fields jo hamesha update hongi
      let queryStr = "UPDATE users SET email = ?, role = ?";
      let queryParams = [email, role || "admin"];

      // 👈 2. Agar frontend se password bheja gaya hai toh use query mein shamil karein
      if (password && password.trim() !== "") {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password.trim(), salt); // Password ko hash kiya

          queryStr += ", password = ?"; // Query mein password column add kiya
          queryParams.push(hashedPassword); // Params mein hashed password daala
        } catch (hashErr) {
          return res
            .status(500)
            .json({ success: false, message: "Error securing password" });
        }
      }

      // Query ke aakhri hisse mein WHERE clause lagaya
      queryStr += " WHERE id = ?";
      queryParams.push(id);

      // Final database query execute karein
      db.query(queryStr, queryParams, (updateErr, result) => {
        if (updateErr) {
          return res
            .status(500)
            .json({ success: false, message: "Failed to update user" });
        }

        res.json({
          success: true,
          message: "User updated successfully",
        });
      });
    },
  );
});
// ==========================================
// 🗑️ 4. DELETE USER API (Callback Style)
// ==========================================
app.delete("/api/users/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  db.query("SELECT id FROM users WHERE id = ?", [id], (err, userCheck) => {
    if (err)
      return res.status(500).json({ success: false, message: "Server error" });
    if (userCheck.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    db.query("DELETE FROM users WHERE id = ?", [id], (deleteErr, result) => {
      if (deleteErr)
        return res
          .status(500)
          .json({ success: false, message: "Failed to delete user" });
      res.json({ success: true, message: "User deleted from system" });
    });
  });
});

// ==========================================
// 📊 5. GET ALL USERS API (Callback Style)
// ==========================================
app.get("/api/users", verifyToken, (req, res) => {
  db.query("SELECT id, email, role, created_at FROM users", (err, users) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch users" });
    res.json({ success: true, users });
  });
});

// ==========================================
// 📦 APK MANAGEMENT ROUTES (Existing)
// ==========================================

// POST: Upload APK
app.post("/api/apks", upload.single("apk"), (req, res) => {
  console.log("--- New Upload Request ---");

  if (!req.file) {
    return res.status(400).send("No file uploaded or invalid file type!");
  }

  const { app_name, version } = req.body;

  const file_name = req.file.filename;

  const sql = "INSERT INTO apks (app_name, version, file_name) VALUES (?, ?, ?)";
  db.query(sql, [app_name, version, file_name], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send(err);
    }
    console.log("Success: APK saved to Database.");
    res.send({ message: "APK Uploaded Successfully", file: req.file.filename });
  });
});

// GET: List all APKs
// app.get("/api/apks", (req, res) => {
//   db.query("SELECT * FROM apks", (err, results) => {
//     if (err) return res.status(500).send(err);
//     res.json(results);
//   });
// });

// server.js mein ye check karein
app.get("/api/apks", (req, res) => {
  db.query("SELECT * FROM apks", (err, results) => {
    if (err) return res.status(500).send(err);
    console.log(results); 
    res.json(results);
  });
});

// PUT: Update Metadata
app.put("/api/apks/:id", (req, res) => {
  const { app_name, version } = req.body;
  db.query(
    "UPDATE apks SET app_name=?, version=? WHERE id=?",
    [app_name, version, req.params.id],
    (err) => {
      
      if (err) return res.status(500).send(err);
      res.send("Updated successfully");
    },
  );
});

// DELETE: Remove APK
app.delete("/api/apks/:id", (req, res) => {
  const { id } = req.params;

  // 1. Pehle database se file_name fetch karein
  db.query("SELECT file_name FROM apks WHERE id=?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "APK not found" });
    }

    const fileName = result[0].file_name;
    // 2. Server par file ka absolute path banayein
    const filePath = path.join(__dirname, "uploads", fileName);

    // 3. File delete karein (Agar exist karti ho)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted: ${fileName}`);
      } catch (unlinkErr) {
        console.error("File deletion error:", unlinkErr);
      }
    }

    // 4. Database se record delete karein
    db.query("DELETE FROM apks WHERE id=?", [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ success: false, message: "Failed to delete from DB" });
      }
      res.json({ success: true, message: "APK and record deleted successfully" });
    });
  });
});
// app.delete("/api/apks/:id", (req, res) => {
//   db.query(
//     "SELECT file_path FROM apks WHERE id=?",
//     [req.params.id],
//     (err, result) => {
//       if (err || result.length === 0)
//         return res.status(404).send("APK not found");

//       const filePath = result[0].file_path;
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//       db.query("DELETE FROM apks WHERE id=?", [req.params.id], (deleteErr) => {
//         if (deleteErr) return res.status(500).send(deleteErr);
//         res.send("Deleted successfully");
//       });
//     },
//   );
// });

// ==========================================
// 🛠️ HARDWARE DEVICE FIRMWARE ROUTES (Existing)
// ==========================================

// PUT - Upload / Replace Firmware
app.put("/api/firmware", (req, res) => {
  uploadBin(req, res, (uploadErr) => {
    if (uploadErr) {
      return res
        .status(400)
        .json({ success: false, message: uploadErr.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Firmware (.bin) file is required." });
    }

    const version = req.body.version?.trim();

    if (!version) {
      deleteFile(req.file.path);
      return res
        .status(400)
        .json({ success: false, message: "Version is required." });
    }

    const newFilePath = `/uploads/${req.file.filename}`;

    db.query(
      "SELECT file_path, version FROM hardware_device WHERE id = 1",
      (selectErr, rows) => {
        if (selectErr) {
          deleteFile(req.file.path);
          return res
            .status(500)
            .json({ success: false, message: selectErr.message });
        }

        const oldFirmware = rows[0];

        const sql = `
                INSERT INTO hardware_device (id, app_name, version, file_path)
                VALUES (1, 'WS_11', ?, ?)
                ON DUPLICATE KEY UPDATE
                    version = VALUES(version),
                    file_path = VALUES(file_path)
            `;

        db.query(sql, [version, newFilePath], (saveErr) => {
          if (saveErr) {
            deleteFile(req.file.path);
            return res
              .status(500)
              .json({ success: false, message: saveErr.message });
          }

          if (
            oldFirmware &&
            oldFirmware.file_path &&
            oldFirmware.file_path !== newFilePath
          ) {
            deleteFile(`.${oldFirmware.file_path}`);
          }

          res.status(200).json({
            success: true,
            message: "Firmware updated successfully.",
            version,
            file_path: newFilePath,
          });
        });
      },
    );
  });
});

// GET - Current Firmware
app.get("/api/firmware", (req, res) => {
  db.query("SELECT * FROM hardware_device WHERE id = 1", (err, rows) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "No firmware found" });

    res.json({ success: true, firmware: rows[0] });
  });
});

// DELETE - Remove Firmware
app.delete("/api/firmware", (req, res) => {
  db.query(
    "SELECT file_path FROM hardware_device WHERE id = 1",
    (err, rows) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, message: "No firmware found" });

      deleteFile(`.${rows[0].file_path}`);

      db.query("DELETE FROM hardware_device WHERE id = 1", (deleteErr) => {
        if (deleteErr)
          return res
            .status(500)
            .json({ success: false, message: deleteErr.message });
        res.json({ success: true, message: "Firmware deleted successfully" });
      });
    },
  );
});

// 4. Global Multer & Application Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send("File is too large! Maximum limit is 500MB.");
    }
    return res.status(400).send("Multer Error: " + err.message);
  }
  res.status(400).send({ error: err.message });
});

// 5. Server Start Configuration
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 System Server running on port ${PORT}`);
});

// Timeout yahan sahi tarah set hoga
server.timeout = 600000;
