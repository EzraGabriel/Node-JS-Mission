

USE videobelajar;

CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_image VARCHAR(255) NULL,
    verification_token CHAR(36) NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kategori_kelas (
    id_kategori_kelas INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tutors (
    id_tutor INT AUTO_INCREMENT PRIMARY KEY,
    nama_tutor VARCHAR(150) NOT NULL,
    nama_pekerjaan VARCHAR(150),
    nama_perusahaan VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kelas (
    id_kelas INT AUTO_INCREMENT PRIMARY KEY,
    id_tutor INT,
    id_kategori_kelas INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    normal_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    foto VARCHAR(255),
    CONSTRAINT fk_kelas_tutor
        FOREIGN KEY (id_tutor) REFERENCES tutors(id_tutor)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_kelas_kategori
        FOREIGN KEY (id_kategori_kelas) REFERENCES kategori_kelas(id_kategori_kelas)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pretest (
    id_pretest INT AUTO_INCREMENT PRIMARY KEY,
    id_kelas INT NOT NULL,
    judul_pretest VARCHAR(200) NOT NULL,
    link_pretest VARCHAR(500),
    CONSTRAINT fk_pretest_kelas
        FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS modul_kelas (
    id_modul INT AUTO_INCREMENT PRIMARY KEY,
    id_kelas INT NOT NULL,
    judul_modul VARCHAR(200) NOT NULL,
    urutan_modul INT NOT NULL,
    CONSTRAINT fk_modul_kelas
        FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas)
        ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE KEY uq_urutan_modul (id_kelas, urutan_modul)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materi (
    id_materi INT AUTO_INCREMENT PRIMARY KEY,
    id_modul INT NOT NULL,
    judul_materi VARCHAR(200) NOT NULL,
    tipe_materi ENUM('rangkuman', 'video', 'quiz') NOT NULL,
    link_materi VARCHAR(500),
    CONSTRAINT fk_materi_modul
        FOREIGN KEY (id_modul) REFERENCES modul_kelas(id_modul)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    id_kelas INT NOT NULL,
    id_user INT NOT NULL,
    tanggal_order DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_kelas
        FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (id_user) REFERENCES users(id_user)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pembayaran (
    id_pembayaran INT AUTO_INCREMENT PRIMARY KEY,
    id_order INT NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded')
        NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_pembayaran_order
        FOREIGN KEY (id_order) REFERENCES orders(id_order)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kelas_saya (
    id_kelas_saya INT AUTO_INCREMENT PRIMARY KEY,
    id_kelas INT NOT NULL,
    id_user INT NOT NULL,
    CONSTRAINT fk_kelas_saya_kelas
        FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_kelas_saya_user
        FOREIGN KEY (id_user) REFERENCES users(id_user)
        ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE KEY uq_user_kelas (id_user, id_kelas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review (
    id_review INT AUTO_INCREMENT PRIMARY KEY,
    id_kelas INT NOT NULL,
    id_user INT NOT NULL,
    komentar TEXT,
    rating TINYINT NOT NULL,
    CONSTRAINT fk_review_kelas
        FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_review_user
        FOREIGN KEY (id_user) REFERENCES users(id_user)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
    UNIQUE KEY uq_review_user_kelas (id_user, id_kelas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
