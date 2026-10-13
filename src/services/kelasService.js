const { pool } = require("../config/database");

const selectKelas = `
  SELECT k.id_kelas AS id, k.title, k.description,
    k.price, k.normal_price, k.discount, k.foto AS image,
    kk.nama_kategori AS category,
    t.nama_tutor AS mentor, t.nama_pekerjaan AS job,
    t.nama_perusahaan AS company,
    COALESCE(rv.rating, 0) AS rating,
    COALESCE(rv.totalReview, 0) AS totalReview
  FROM kelas k
  LEFT JOIN kategori_kelas kk ON kk.id_kategori_kelas = k.id_kategori_kelas
  LEFT JOIN tutors t ON t.id_tutor = k.id_tutor
  LEFT JOIN (
    SELECT id_kelas, AVG(rating) AS rating, COUNT(*) AS totalReview
    FROM review GROUP BY id_kelas
  ) rv ON rv.id_kelas = k.id_kelas`;

const formatKelas = (row) => row ? {
  ...row,
  price: Number(row.price),
  normal_price: Number(row.normal_price),
  discount: Number(row.discount),
  rating: Number(row.rating),
  totalReview: Number(row.totalReview),
} : null;

const getAllKelas = async ({ category, search, sort } = {}) => {
  const conditions = [];
  const values = [];
  if (typeof category === "string" && category.trim() && category !== "Semua Kelas") {
    conditions.push("kk.nama_kategori = ?");
    values.push(category.trim());
  }
  if (typeof search === "string" && search.trim()) {
    const query = `%${search.trim()}%`;
    conditions.push("(k.title LIKE ? OR k.description LIKE ? OR kk.nama_kategori LIKE ? OR t.nama_tutor LIKE ?)");
    values.push(query, query, query, query);
  }
  const orderBy = {
    price_asc: "k.price ASC, k.id_kelas DESC",
    price_desc: "k.price DESC, k.id_kelas DESC",
    title_asc: "k.title ASC, k.id_kelas DESC",
    title_desc: "k.title DESC, k.id_kelas DESC",
    rating_desc: "rv.rating DESC, k.id_kelas DESC",
    rating_asc: "rv.rating ASC, k.id_kelas DESC",
  }[sort] || "k.id_kelas DESC";
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await pool.execute(`${selectKelas}${where} ORDER BY ${orderBy}`, values);
  return rows.map(formatKelas);
};

const getKelasById = async (id) => {
  const [rows] = await pool.execute(`${selectKelas} WHERE k.id_kelas = ?`, [id]);
  return formatKelas(rows[0]);
};

async function resolveRelatedRows(connection, data) {
  let tutorId = data.id_tutor ?? null;
  let categoryId = data.id_kategori_kelas ?? null;

  if (data.mentor?.trim()) {
    const [tutors] = await connection.execute(
      `SELECT id_tutor FROM tutors
       WHERE nama_tutor = ? AND COALESCE(nama_pekerjaan, '') = ?
         AND COALESCE(nama_perusahaan, '') = ? LIMIT 1`,
      [data.mentor.trim(), data.job?.trim() || "", data.company?.trim() || ""],
    );
    if (tutors[0]) {
      tutorId = tutors[0].id_tutor;
    } else {
      const [result] = await connection.execute(
        "INSERT INTO tutors (nama_tutor, nama_pekerjaan, nama_perusahaan) VALUES (?, ?, ?)",
        [data.mentor.trim(), data.job?.trim() || null, data.company?.trim() || null],
      );
      tutorId = result.insertId;
    }
  }

  if (data.category?.trim()) {
    const [categories] = await connection.execute(
      "SELECT id_kategori_kelas FROM kategori_kelas WHERE nama_kategori = ? LIMIT 1",
      [data.category.trim()],
    );
    if (categories[0]) {
      categoryId = categories[0].id_kategori_kelas;
    } else {
      const [result] = await connection.execute(
        "INSERT INTO kategori_kelas (nama_kategori) VALUES (?)",
        [data.category.trim()],
      );
      categoryId = result.insertId;
    }
  }

  return { tutorId, categoryId };
}

const createKelas = async (data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { tutorId, categoryId } = await resolveRelatedRows(connection, data);
    const [result] = await connection.execute(
      `INSERT INTO kelas
        (id_tutor, id_kategori_kelas, title, description, price, normal_price, discount, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tutorId, categoryId, data.title.trim(), data.description ?? null,
        data.price ?? 0, data.normal_price ?? data.price ?? 0,
        data.discount ?? 0, data.foto ?? data.image ?? null],
    );
    await connection.commit();
    return getKelasById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateKelas = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { tutorId, categoryId } = await resolveRelatedRows(connection, data);
    const [result] = await connection.execute(
      `UPDATE kelas SET id_tutor = ?, id_kategori_kelas = ?, title = ?,
        description = ?, price = ?, normal_price = ?, discount = ?, foto = ?
       WHERE id_kelas = ?`,
      [tutorId, categoryId, data.title.trim(), data.description ?? null,
        data.price ?? 0, data.normal_price ?? data.price ?? 0,
        data.discount ?? 0, data.foto ?? data.image ?? null, id],
    );
    await connection.commit();
    return getKelasById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteKelas = async (id) => {
  const [result] = await pool.execute("DELETE FROM kelas WHERE id_kelas = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = { getAllKelas, getKelasById, createKelas, updateKelas, deleteKelas };
