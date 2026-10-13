const express = require("express");
const cors = require("cors");
const path = require("path");

const kelasRoutes = require("./routes/kelasRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Video Belajar berhasil berjalan!",
  });
});

app.use("/api/kelas", kelasRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
