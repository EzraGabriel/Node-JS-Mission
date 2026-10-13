const authService = require("../services/authService");
const fs = require("fs/promises");
const path = require("path");

const signup = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body || {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    typeof phoneNumber !== "string" ||
    !phoneNumber.trim() ||
    password.length < 8
  ) {
    return res.status(400).json({
      message: "Nama, email, dan nomor telepon wajib diisi; password minimal 8 karakter",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: "Format email tidak valid" });
  }

  const normalizedPhone = phoneNumber.replace(/[\s()-]/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(normalizedPhone)) {
    return res.status(400).json({ message: "Format nomor telepon tidak valid" });
  }

  try {
    const user = await authService.signup({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phoneNumber: normalizedPhone,
    });

    if (!user) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    return res.status(201).json({
      message: "Pendaftaran berhasil",
      data: user,
    });
  } catch (error) {
    // Unique index juga mencegah duplikasi jika dua signup bersamaan.
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    console.error("Signup gagal:", error.message);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      message: "Email dan password wajib diisi",
    });
  }

  try {
    const result = await authService.login(email.trim(), password);

    if (!result) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    if (result.emailUnverified) {
      return res.status(403).json({ message: "Email belum diverifikasi" });
    }

    return res.status(200).json({
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    console.error("Login gagal:", error.message);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body || {};
  if (typeof token !== "string" || !token.trim()) {
    return res.status(400).json({ message: "Token verifikasi wajib diisi" });
  }

  try {
    const verified = await authService.verifyEmail(token.trim());
    if (!verified) {
      return res.status(400).json({ message: "Invalid Verification Token" });
    }
    return res.status(200).json({ message: "Email Verified Successfully" });
  } catch (error) {
    console.error("Verifikasi email gagal:", error.message);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Pilih gambar profile terlebih dahulu" });
  }

  const profileImage = `/uploads/${req.file.filename}`;
  try {
    const previousImage = await authService.updateProfileImage(req.user.id_user, profileImage);
    if (previousImage) {
      await fs.unlink(path.join(__dirname, "../../", previousImage.replace(/^\/+/, ""))).catch(() => {});
    }
    return res.status(200).json({
      message: "Gambar profile berhasil diperbarui",
      data: { profileImage },
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    console.error("Upload gambar profile gagal:", error.message);
    return res.status(500).json({ message: "Gagal menyimpan gambar profile" });
  }
};

module.exports = { signup, login, verifyEmail, uploadProfileImage };
