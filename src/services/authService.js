const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const { pool } = require("../config/database");

const createMailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error("Konfigurasi SMTP_HOST, SMTP_USER, dan SMTP_PASSWORD wajib diisi");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
};

const sendVerificationEmail = async (email, name, token) => {
  const transporter = createMailTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Verifikasi akun EduCourse",
    text: `Halo ${name}, gunakan token berikut untuk memverifikasi email Anda: ${token}`,
    html: `<p>Halo ${name},</p><p>Gunakan token berikut untuk memverifikasi email Anda:</p><strong>${token}</strong>`,
  });
};

const signup = async ({ name, email, password, phoneNumber }) => {
  const [existingUsers] = await pool.execute(
    "SELECT id_user, name, email, phone_number, email_verified FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  if (existingUsers.length > 0) {
    const existingUser = existingUsers[0];
    if (!existingUser.email_verified) {
      const verificationToken = uuidv4();
      await pool.execute(
        "UPDATE users SET verification_token = ? WHERE id_user = ?",
        [verificationToken, existingUser.id_user],
      );
      await sendVerificationEmail(email, existingUser.name, verificationToken);
      return existingUser;
    }
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = uuidv4();
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password, phone_number, verification_token, email_verified) VALUES (?, ?, ?, ?, ?, 0)",
    [name, email, passwordHash, phoneNumber, verificationToken],
  );

  await sendVerificationEmail(email, name, verificationToken);

  return {
    id_user: result.insertId,
    name,
    email,
    phone_number: phoneNumber,
  };
};

const verifyEmail = async (token) => {
  const [result] = await pool.execute(
    "UPDATE users SET email_verified = 1, verification_token = NULL WHERE verification_token = ?",
    [token],
  );
  return result.affectedRows > 0;
};

const login = async (email, password) => {
  const [rows] = await pool.execute(
    "SELECT id_user, name, email, password, phone_number, profile_image, email_verified FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }
  if (!user.email_verified) return { emailUnverified: true };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET belum dikonfigurasi");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
  const token = jwt.sign(
    { id_user: user.id_user, email: user.email },
    secret,
    { expiresIn },
  );

  return {
    token,
    user: {
      id_user: user.id_user,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      profile_image: user.profile_image,
    },
  };
};

const updateProfileImage = async (userId, profileImage) => {
  const [rows] = await pool.execute("SELECT profile_image FROM users WHERE id_user = ? LIMIT 1", [userId]);
  if (!rows.length) throw new Error("User tidak ditemukan");
  const previousImage = rows[0].profile_image;
  await pool.execute("UPDATE users SET profile_image = ? WHERE id_user = ?", [profileImage, userId]);
  return previousImage;
};

module.exports = { signup, verifyEmail, login, updateProfileImage };
