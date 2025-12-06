// testUpload.js
import multer from "multer";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Simple multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "test-uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `test-${Date.now()}-${file.originalname}`;
    console.log("Saving as:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage });

app.use(express.json());

app.post("/api/test-upload", upload.single("cover_image"), (req, res) => {
  console.log("Test upload received:");
  console.log("Body:", req.body);
  console.log("File:", req.file);
  
  res.json({
    success: true,
    file: req.file,
    body: req.body,
  });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Uploads will be saved to: ${path.join(__dirname, "test-uploads")}`);
});