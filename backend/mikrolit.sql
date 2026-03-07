-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 07 Mar 2026 pada 20.17
-- Versi server: 9.6.0
-- Versi PHP: 8.5.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Basis data: `mikrolit`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `micro_units`
--

CREATE TABLE `micro_units` (
  `id` int NOT NULL,
  `module_id` int NOT NULL,
  `unit_type` enum('starter','reader','review','writing','reflect') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext,
  `attachment_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `modules`
--

CREATE TABLE `modules` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `learning_outcomes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `modules`
--

INSERT INTO `modules` (`id`, `title`, `description`, `learning_outcomes`, `created_by`, `created_at`) VALUES
(1, 'Pertemuan 1 – Introduction to Writing', 'Dasar penulisan akademik', 'Mahasiswa mampu memahami dasar penulisan', 1, '2026-03-02 06:42:04'),
(2, 'Pertemuan 2 – Grammar Essentials', 'Grammar dasar untuk writing', 'Mahasiswa mampu menggunakan grammar dasar', 1, '2026-03-02 06:42:04'),
(3, 'Pertemuan 3 – Reading Analysis', 'Analisis teks bacaan', 'Mahasiswa bisa menganalisis teks', 1, '2026-03-02 06:42:04'),
(4, 'Pertemuan 4 – Ideologi dalam Pemberitaan', 'Definisi ideologi media dan bagaimana ideologi mempengaruhi pemberitaan', 'Mahasiswa memahami bahwa media memiliki kepentingan dan ideologi tersendiri', 1, '2026-03-02 06:55:25');

-- --------------------------------------------------------

--
-- Struktur dari tabel `progress`
--

CREATE TABLE `progress` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `module_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `status` enum('not_started','in_progress','completed') DEFAULT 'not_started',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `reflections`
--

CREATE TABLE `reflections` (
  `id` int NOT NULL,
  `unit_id` int NOT NULL,
  `question` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `reflection_answers`
--

CREATE TABLE `reflection_answers` (
  `id` int NOT NULL,
  `reflection_id` int NOT NULL,
  `student_id` int NOT NULL,
  `answer` text,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `review_options`
--

CREATE TABLE `review_options` (
  `id` int NOT NULL,
  `question_id` int NOT NULL,
  `option_text` varchar(255) DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `review_questions`
--

CREATE TABLE `review_questions` (
  `id` int NOT NULL,
  `unit_id` int NOT NULL,
  `question` text NOT NULL,
  `type` enum('mcq','truefalse','short') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `nidn` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('dosen','mahasiswa','admin') DEFAULT 'mahasiswa',
  `photo` varchar(255) DEFAULT NULL,
  `status` enum('pending','diterima','ditolak') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `nidn`, `password`, `role`, `photo`, `status`, `created_at`) VALUES
(1, 'Abyan Dzakwan Baksir', 'dosen@example.com', '07352211064', '$2b$10$SCU3ddQhT6iqt04uAnrzsONyczwzu84uX8IsnXHgPG5coj.q2hIme', 'dosen', '1-1772429056251.png', 'diterima', '2026-02-12 08:13:01'),
(4, 'manray', 'array@gmail.com', '07352211092', '$2b$10$q2zr5UfYngZ56GG6aGRc/OuYSo6fVM2VTNlc/U8f3SBO5YgeCTCH2', 'mahasiswa', '4-1772669580448.png', 'pending', '2026-02-19 17:24:58'),
(6, 'reizxz', 'reizxz@gmail.com', '07352211090', '$2b$10$Vc55HPqIAjqR16Nl28nCzOzPtXYRMmy3A7hJ6KoOFNkdQUG6tM7ky', 'mahasiswa', '', 'diterima', '2026-02-19 17:40:18'),
(7, 'vice', 'vice@gmail.com', '07352211098', '$2b$10$Z..FAo3QnW4WjnMS3GYY5Ot9ZVXHVeq11wSLwjWrqfrj6mobHlDxS', 'mahasiswa', '', 'diterima', '2026-02-19 17:46:16'),
(8, 'a ming', 'aming@gmail.com', '12345678', '$2b$10$eE9HkXqsJhfUaEfI58xPse.e/Rdjb5b7SxcGt/43MHp34Xm0ifejG', 'mahasiswa', '', 'diterima', '2026-02-19 17:47:18'),
(10, 'Arie', 'void@gmail.com', '1234567', '$2b$10$xJX3AizCP8beZTi2cNSkc.cj9Nt1wzPemndAT8u3Df8zZN/xC04FK', 'mahasiswa', '', 'ditolak', '2026-02-19 17:52:08'),
(11, 'array', 'arrayy@gmail.com', '12345678', '$2b$10$33QnUZC9S5z3AOlVMEL9OuPb/KBHBW9ac1YV38dSPhqLH/Th27IV2', 'mahasiswa', '', 'diterima', '2026-02-19 17:53:20'),
(12, 'manray', 'array123@gmail.com', '07352211092', '$2b$10$6Xr4VbYGsAp4z.5KD0rA9OE7n9dapGOPE6JPLUim7HhdQ8u.7h5FK', 'mahasiswa', '', 'ditolak', '2026-02-19 18:03:35'),
(13, 'woy', 'woy@gmail.com', '123456', '$2b$10$u.ncJQy4RjBsuqMuAE743OKZxrWJcYw9B4nY8Tu/NGb2uT7JUVU3q', 'mahasiswa', '', 'diterima', '2026-02-25 16:33:02'),
(14, 'test', 'test@gmail.com', '12345098', '$2b$10$XqaF/OCHU3KcvjBw.mYzWO6nypGjQICvFhPNqs4n0Y4aYs0sBv..2', 'mahasiswa', '', 'diterima', '2026-02-25 16:42:17'),
(15, 'aaa', 'aa@gmail.com', '7873829', '$2b$10$pHtnAiVHacUZi88hVRbTMezM8Nwa2sRKrlCV41oHcivC1WS3Un38q', 'mahasiswa', '', 'diterima', '2026-02-25 16:42:57'),
(16, 'Gufran', 'gufranmm1@gmail.com', '07352211097', '$2b$10$6bzzudGpTBypWup15srJUupdul09eo7N7iV0/9NNae7TuyfOO1AEm', 'mahasiswa', '', 'diterima', '2026-02-25 16:45:25');

-- --------------------------------------------------------

--
-- Struktur dari tabel `writing_submissions`
--

CREATE TABLE `writing_submissions` (
  `id` int NOT NULL,
  `task_id` int NOT NULL,
  `student_id` int NOT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `answer_text` text,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `score` int DEFAULT NULL,
  `feedback` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `writing_submissions`
--

INSERT INTO `writing_submissions` (`id`, `task_id`, `student_id`, `file_url`, `answer_text`, `submitted_at`, `score`, `feedback`) VALUES
(1, 1, 4, '/uploads/tasks/4-1772479584633.pdf', 'ini jawaban saya', '2026-03-02 19:26:25', NULL, NULL),
(2, 2, 4, '/uploads/tasks/4-1772674246759.pdf', 'Jawaban', '2026-03-05 01:30:46', NULL, NULL),
(3, 4, 16, '/uploads/tasks/16-1772735950349.pdf', 'OK', '2026-03-05 18:39:11', NULL, NULL),
(4, 2, 16, '/uploads/tasks/16-1772736239776.pdf', 'ok', '2026-03-05 18:44:00', NULL, NULL),
(5, 4, 4, '/uploads/tasks/4-1772736393619.pdf', '', '2026-03-05 18:46:34', NULL, NULL),
(9, 5, 4, '/uploads/tasks/4-1772736762760.pdf', '', '2026-03-05 18:52:42', NULL, NULL),
(10, 5, 16, '/uploads/tasks/1772737149182-6818-18136-1-SM.pdf', '', '2026-03-05 18:59:09', NULL, NULL),
(11, 6, 16, '/uploads/tasks/16-1772737996353.pdf', '', '2026-03-05 19:13:16', NULL, NULL),
(12, 7, 16, '/uploads/tasks/16-1772738053209.pdf', '', '2026-03-05 19:14:13', NULL, NULL),
(13, 7, 4, '/uploads/tasks/4-1772738055567.pdf', '', '2026-03-05 19:14:15', NULL, NULL),
(14, 6, 4, '/uploads/tasks/4-1772738311800.docx', '', '2026-03-05 19:18:31', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `writing_tasks`
--

CREATE TABLE `writing_tasks` (
  `id` int NOT NULL,
  `unit_id` int DEFAULT NULL,
  `module_id` int DEFAULT NULL,
  `task_title` varchar(255) NOT NULL,
  `instructions` longtext,
  `attachment_url` varchar(255) DEFAULT NULL,
  `deadline` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `writing_tasks`
--

INSERT INTO `writing_tasks` (`id`, `unit_id`, `module_id`, `task_title`, `instructions`, `attachment_url`, `deadline`) VALUES
(1, NULL, 1, 'Tugas Pertama', 'Buatkan Essay 5 Lembar', '/uploads/tasks/1-1772550804624.pdf', '2026-03-09 23:59:00'),
(2, NULL, NULL, 'Latihan Tugas Essay Bagian 2', 'Tulis essay 800 Kata', '/uploads/tasks/1-1772470392091.pdf', '2026-03-05 23:59:00'),
(4, NULL, 3, 'Latihan Analisis', 'Buat Essay dari Analisis Wacana', '/uploads/tasks/1-1772675051552.docx', '2026-03-06 14:50:00'),
(5, NULL, NULL, 'TUGAS BARU', 'Test', '/uploads/tasks/1-1772736512054.pdf', '2026-03-07 10:50:00'),
(6, NULL, NULL, 'TUGAS', 'Tugas', '/uploads/tasks/1772737137127-modul_lms.pdf', '2026-03-07 01:58:00'),
(7, NULL, 2, 'Tugas', 'Tugas', '/uploads/tasks/Rancangan LMS Sasma.pdf', '2026-03-07 02:00:00'),
(8, NULL, NULL, 'Latihan Tugas Essay Bagian 5', 'Tugas 5', '/uploads/tasks/1-1772739524598.pdf', '2026-03-05 02:38:00');

--
-- Indeks untuk tabel yang dibuang
--

--
-- Indeks untuk tabel `micro_units`
--
ALTER TABLE `micro_units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indeks untuk tabel `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `module_id` (`module_id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indeks untuk tabel `reflections`
--
ALTER TABLE `reflections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indeks untuk tabel `reflection_answers`
--
ALTER TABLE `reflection_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reflection_id` (`reflection_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indeks untuk tabel `review_options`
--
ALTER TABLE `review_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indeks untuk tabel `review_questions`
--
ALTER TABLE `review_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `writing_submissions`
--
ALTER TABLE `writing_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indeks untuk tabel `writing_tasks`
--
ALTER TABLE `writing_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`),
  ADD KEY `fk_writing_tasks_module` (`module_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `micro_units`
--
ALTER TABLE `micro_units`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `reflections`
--
ALTER TABLE `reflections`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `reflection_answers`
--
ALTER TABLE `reflection_answers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `review_options`
--
ALTER TABLE `review_options`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `review_questions`
--
ALTER TABLE `review_questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `writing_submissions`
--
ALTER TABLE `writing_submissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `writing_tasks`
--
ALTER TABLE `writing_tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `micro_units`
--
ALTER TABLE `micro_units`
  ADD CONSTRAINT `micro_units_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`),
  ADD CONSTRAINT `progress_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `micro_units` (`id`);

--
-- Ketidakleluasaan untuk tabel `reflections`
--
ALTER TABLE `reflections`
  ADD CONSTRAINT `reflections_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `micro_units` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reflection_answers`
--
ALTER TABLE `reflection_answers`
  ADD CONSTRAINT `reflection_answers_ibfk_1` FOREIGN KEY (`reflection_id`) REFERENCES `reflections` (`id`),
  ADD CONSTRAINT `reflection_answers_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `review_options`
--
ALTER TABLE `review_options`
  ADD CONSTRAINT `review_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `review_questions` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `review_questions`
--
ALTER TABLE `review_questions`
  ADD CONSTRAINT `review_questions_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `micro_units` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `writing_submissions`
--
ALTER TABLE `writing_submissions`
  ADD CONSTRAINT `writing_submissions_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `writing_tasks` (`id`),
  ADD CONSTRAINT `writing_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `writing_tasks`
--
ALTER TABLE `writing_tasks`
  ADD CONSTRAINT `fk_writing_tasks_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `writing_tasks_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `micro_units` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
