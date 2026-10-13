const kelasService = require("../services/kelasService");

const getAllKelas = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const allowedSorts = ["price_asc", "price_desc", "title_asc", "title_desc", "rating_desc", "rating_asc"];

    if (sort && !allowedSorts.includes(sort)) {
      return res.status(400).json({ message: "Urutan kelas tidak valid" });
    }

    const data = await kelasService.getAllKelas({ category, search, sort });

    res.status(200).json({
      message: "Berhasil mengambil semua kelas",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data kelas",
      error: error.message,
    });
  }
};

const getKelasById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "ID kelas tidak valid",
      });
    }

    const data = await kelasService.getKelasById(id);

    if (!data) {
      return res.status(404).json({
        message: "Kelas tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil data kelas",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data kelas",
      error: error.message,
    });
  }
};

const createKelas = async (req, res) => {
  try {
    const {
      title,
      price,
      normal_price,
      discount,
      id_tutor,
      id_kategori_kelas,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Title wajib diisi",
      });
    }

    const numericFields = {
      price,
      normal_price,
      discount,
      id_tutor,
      id_kategori_kelas,
    };

    for (const [field, value] of Object.entries(numericFields)) {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Number.isFinite(Number(value)) || Number(value) < 0)
      ) {
        return res.status(400).json({
          message: `${field} harus berupa angka nonnegatif`,
        });
      }
    }

    const data = await kelasService.createKelas(req.body);

    res.status(201).json({
      message: "Kelas berhasil dibuat",
      data,
    });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Tutor atau kategori kelas tidak ditemukan",
      });
    }

    res.status(500).json({
      message: "Gagal membuat kelas",
      error: error.message,
    });
  }
};

// PUT memperbarui kelas
const updateKelas = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "ID kelas tidak valid",
      });
    }

    const {
      title,
      id_tutor,
      id_kategori_kelas,
      price,
      normal_price,
      discount,
    } = req.body;

    // Validasi title
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Title wajib diisi",
      });
    }

    // Validasi harga dan diskon
    const numericFields = { price, normal_price, discount };

    for (const [field, value] of Object.entries(numericFields)) {
      if (
        value !== undefined &&
        (!Number.isFinite(Number(value)) || Number(value) < 0)
      ) {
        return res.status(400).json({
          message: `${field} harus berupa angka nonnegatif`,
        });
      }
    }

    // Validasi ID tutor dan kategori
    const foreignKeys = { id_tutor, id_kategori_kelas };

    for (const [field, value] of Object.entries(foreignKeys)) {
      if (
        value !== undefined &&
        value !== null &&
        (!Number.isInteger(Number(value)) || Number(value) <= 0)
      ) {
        return res.status(400).json({
          message: `${field} harus berupa ID positif atau null`,
        });
      }
    }

    const data = await kelasService.updateKelas(id, req.body);

    if (!data) {
      return res.status(404).json({
        message: "Kelas tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Kelas berhasil diperbarui",
      data,
    });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Tutor atau kategori kelas tidak ditemukan",
      });
    }

    res.status(500).json({
      message: "Gagal memperbarui kelas",
      error: error.message,
    });
  }
};

// DELETE menghapus kelas
const deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "ID kelas tidak valid",
      });
    }

    const deleted = await kelasService.deleteKelas(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Kelas tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Kelas berhasil dihapus",
    });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "Kelas tidak dapat dihapus karena masih memiliki order",
      });
    }

    res.status(500).json({
      message: "Gagal menghapus kelas",
      error: error.message,
    });
  }
};
module.exports = {
  getAllKelas,
  getKelasById,
  createKelas,
  updateKelas,
  deleteKelas,
};
