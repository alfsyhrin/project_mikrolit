// frontend/dosen/assets/js/penilaian.js
import Modal from "../../../assets/modal.js";
import { getAllSubmissionScoresRequest, gradeSubmissionRequest } from "../../../assets/api.js";

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildSubmissionRow(index, submission) {
  const scoreText = submission.score === null || submission.score === undefined || submission.score === ""
    ? "-"
    : escapeHtml(submission.score);

  const actionButton = `
    <button
      class="isi-nilai btn-input-nilai"
      data-submission-id="${submission.submission_id}"
      data-task-id="${submission.task_id}"
      data-score="${submission.score === null || submission.score === undefined ? "" : escapeHtml(submission.score)}"
      data-student-name="${escapeHtml(submission.student_name || "-")}"
      data-student-npm="${escapeHtml(submission.student_npm || "-")}"
      data-task-title="${escapeHtml(submission.task_title || `Tugas ${submission.task_id}`)}"
    >
      <p><span class="material-symbols-outlined">edit</span></p>
      ${submission.score === null || submission.score === undefined || submission.score === "" ? "Input Nilai" : "Edit Nilai"}
    </button>
  `;

  return `
    <tr data-submission-id="${submission.submission_id}">
      <td class="nama">${index}</td>
      <td class="muted">${escapeHtml(submission.student_name || "-")}</td>
      <td class="muted">${escapeHtml(submission.student_npm || "-")}</td>
      <td class="muted nilai-tugas">${scoreText}</td>
      <td class="middle-td">${actionButton}</td>
    </tr>
  `;
}

function buildTaskCardHtml(taskId, taskTitle, submissions) {
  const rowsHtml = submissions.length
    ? submissions.map((submission, idx) => buildSubmissionRow(idx + 1, submission)).join("")
    : `<tr><td class="nama" colspan="5" style="text-align:center; color:#777;">Belum ada data mahasiswa untuk tugas ini</td></tr>`;

  return `
    <div class="card-tabel-penilaian">
      <h4>${escapeHtml(taskTitle || `Tugas ${taskId}`)}</h4>
      <div class="wrapper-tabel">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Mahasiswa</th>
              <th>NPM</th>
              <th>Nilai</th>
              <th class="middle-td">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function groupSubmissionsByTask(submissions) {
  const groups = {};

  submissions.forEach(sub => {
    const taskId = sub.task_id || "unknown";
    const taskTitle = sub.task_title || `Tugas ${taskId}`;

    if (!groups[taskId]) {
      groups[taskId] = {
        taskId,
        taskTitle,
        submissions: []
      };
    }

    groups[taskId].submissions.push(sub);
  });

  return Object.values(groups).sort((a, b) => {
    const idA = Number(a.taskId) || 0;
    const idB = Number(b.taskId) || 0;
    return idA - idB;
  });
}

async function showGradeModal(options) {
  const { submissionId, taskTitle, studentName, studentNpm, currentScore } = options;
  const token = localStorage.getItem("token");

  const formEl = document.createElement("div");
  formEl.innerHTML = `
    <div class="student-info-card">
      <div class="student-name">${escapeHtml(studentName)}</div>
      <div class="student-meta">NPM: ${escapeHtml(studentNpm)}</div>
      <div class="student-meta">Tugas: ${escapeHtml(taskTitle)}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Nilai (0 - 100)</label>
      <input type="number" id="gradeNilai" class="form-input" placeholder="Masukkan nilai" min="0" max="100" value="${escapeHtml(currentScore || "")}">
    </div>
  `;

  Modal.show({
    title: "Input / Edit Nilai",
    content: formEl,
    confirmText: "Simpan Nilai",
    cancelText: "Batal",
    size: "medium",
    onConfirm: async () => {
      const input = formEl.querySelector("#gradeNilai");
      const scoreValue = input ? input.value.trim() : "";

      if (scoreValue === "" || Number(scoreValue) < 0 || Number(scoreValue) > 100) {
        Modal.alert("Nilai harus diisi antara 0 dan 100");
        return;
      }

      try {
        const response = await gradeSubmissionRequest(submissionId, Number(scoreValue), token);
        if (!response || response.error) {
          console.error("gradeSubmissionRequest error:", response);
          Modal.alert("Gagal menyimpan nilai. Silakan coba lagi.");
          return;
        }

        await initPenilaianPage();
        Modal.alert("Nilai berhasil disimpan");
      } catch (err) {
        console.error("Error saat kirim nilai:", err);
        Modal.alert("Terjadi kesalahan saat menyimpan nilai.");
      }
    }
  });
}

export async function initPenilaianPage() {
  const token = localStorage.getItem("token");
  const headerContainer = document.querySelector(".container-manajemen-tugas");

  if (!headerContainer) {
    console.warn("[initPenilaianPage] .container-manajemen-tugas tidak ditemukan");
    return;
  }

  document.querySelectorAll(".card-tabel-penilaian").forEach(el => el.remove());

  let tableArea = document.getElementById("penilaianTables");
  if (!tableArea) {
    tableArea = document.createElement("div");
    tableArea.id = "penilaianTables";
    headerContainer.after(tableArea);
  }

  tableArea.innerHTML = `<p class="loading-penilaian">Memuat data penilaian...</p>`;

  try {
    const response = await getAllSubmissionScoresRequest(token);

    if (!response || !response.success || !Array.isArray(response.data)) {
      tableArea.innerHTML = `<p class="loading-penilaian">Gagal memuat data penilaian.</p>`;
      console.error("[initPenilaianPage] Response invalid:", response);
      return;
    }

    const groupedTasks = groupSubmissionsByTask(response.data);

    if (groupedTasks.length === 0) {
      tableArea.innerHTML = `<p class="loading-penilaian">Belum ada pengumpulan tugas.</p>`;
      return;
    }

    tableArea.innerHTML = groupedTasks
      .map(group => buildTaskCardHtml(group.taskId, group.taskTitle, group.submissions))
      .join("");
  } catch (error) {
    console.error("[initPenilaianPage] Error fetch penilaian:", error);
    tableArea.innerHTML = `<p class="loading-penilaian">Terjadi kesalahan saat memuat data penilaian.</p>`;
  }
}

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-input-nilai");
  if (!btn) return;

  const submissionId = btn.dataset.submissionId;
  const taskTitle = btn.dataset.taskTitle || "";
  const studentName = btn.dataset.studentName || "";
  const studentNpm = btn.dataset.studentNpm || "";
  const currentScore = btn.dataset.score || "";

  if (!submissionId) {
    console.warn("[penilaian] btn-input-nilai missing submissionId");
    return;
  }

  showGradeModal({ submissionId, taskTitle, studentName, studentNpm, currentScore });
});

window.initPenilaianPage = initPenilaianPage;