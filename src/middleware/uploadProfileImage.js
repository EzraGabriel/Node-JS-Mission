const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const uploadDirectory = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extensionByMimeType = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    callback(null, `${uuidv4()}${extensionByMimeType[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Format gambar harus JPG, PNG, WEBP, atau GIF"));
    }
    return callback(null, true);
  },
}).single("profileImage");

module.exports = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) return next();
    const status = error instanceof multer.MulterError ? 400 : 415;
    return res.status(status).json({ message: error.message });
  });
};
