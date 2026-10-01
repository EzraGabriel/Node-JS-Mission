const { pool } = require("../config/database");

// GET semua kelas
const getAllKelas = async () => {
  const [rows] = await pool.execute("SELECT * FROM kelas");

  return rows;
};

// GET kelas berdasarkan ID
const getKelasById = async (id) => {
  const [rows] = await pool.execute("SELECT * FROM kelas WHERE id_kelas = ?", [
    id,
  ]);

  return rows[0] || null;
};
const createKelas = async (data) => {
  const {
    id_tutor,
    id_kategori_kelas,
    title,
    description,
    price,
    normal_price,
    discount,
    foto,
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO kelas (
      id_tutor,
      id_kategori_kelas,
      title,
      description,
      price,
      normal_price,
      discount,
      foto
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id_tutor ?? null,
      id_kategori_kelas ?? null,
      title,
      description ?? null,
      price ?? 0,
      normal_price ?? 0,
      discount ?? 0,
      foto ?? null,
    ],
  );

  return getKelasById(result.insertId);
};

// PUT memperbarui kelas
const updateKelas = async (id, data) => {
  const {
    id_tutor,
    id_kategori_kelas,
    title,
    description,
    price,
    normal_price,
    discount,
    foto,
  } = data;

  await pool.execute(
    `UPDATE kelas SET
      id_tutor = ?,
      id_kategori_kelas = ?,
      title = ?,
      description = ?,
      price = ?,
      normal_price = ?,
      discount = ?,
      foto = ?
    WHERE id_kelas = ?`,
    [
      id_tutor ?? null,
      id_kategori_kelas ?? null,
      title,
      description ?? null,
      price ?? 0,
      normal_price ?? 0,
      discount ?? 0,
      foto ?? null,
      id,
    ],
  );

  return getKelasById(id);
};

// DELETE menghapus kelas
const deleteKelas = async (id) => {
  const [result] = await pool.execute("DELETE FROM kelas WHERE id_kelas = ?", [
    id,
  ]);

  return result.affectedRows > 0;
};

module.exports = {
  getAllKelas,
  getKelasById,
  createKelas,
  updateKelas,
  deleteKelas,
};
