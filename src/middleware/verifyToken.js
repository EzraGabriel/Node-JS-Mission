const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") || [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token akses diperlukan" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET belum dikonfigurasi");
    return res.status(500).json({ message: "Konfigurasi autentikasi server belum tersedia" });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token sudah kedaluwarsa. Silakan login kembali" });
    }
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

module.exports = verifyToken;
