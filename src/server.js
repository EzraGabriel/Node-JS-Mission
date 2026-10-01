require("dotenv").config();

const app = require("./app");
const { testConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`Server berjalan di port ${PORT}`);
    });
  } catch (error) {
    console.error("Server gagal dijalankan:", error);
    process.exit(1);
  }
};

startServer();
