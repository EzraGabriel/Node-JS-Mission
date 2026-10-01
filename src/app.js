const express = require("express");
const cors = require("cors");

const kelasRoutes = require("./routes/kelasRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Video Belajar berhasil berjalan!",
  });
});

app.use("/api/kelas", kelasRoutes);

module.exports = app;
