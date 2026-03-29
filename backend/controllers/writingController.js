const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const Writing = require("../models/Writing");
const eventBus = require("../events/eventBus");

exports.createTask = async (req, res) => {
    const data = {
        module_id: req.body.module_id || null,
        unit_id: req.body.unit_id || null,
        task_title: req.body.task_title,
        instructions: req.body.instructions,
        attachment_url: req.file ? "/uploads/tasks/" + req.file.filename : null,
        deadline: req.body.deadline
    };

    Writing.createTask(data, (err, result) => { 
        if (err) return res.status(500).json({ error: err });

        const taskData = {
            id: result.insertId,
            ...data
        };

        eventBus.emit("task_created", taskData);

        res.json({ 
            message: "Task created",
            taskId: result.insertId
        });
    });

};

exports.updateTask = (req, res) => {
    if (req.user.role !== "dosen") {
        return res.status(403).json({ message: "Akses ditolak. Hanya dosen yang dapat memperbarui tugas." });
    }

    const id = req.params.id;
    const data = {
        module_id: req.body.module_id || null,
        unit_id: req.body.unit_id || null,
        task_title: req.body.task_title,
        instructions: req.body.instructions,
        attachment_url: req.file ? "/uploads/tasks/" + req.file.filename : null,
        deadline: req.body.deadline
    };

    Writing.updateTask(id, data, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Task updated" });
    });
};

exports.deleteTask = (req, res) => {
    if (req.user.role !== "dosen") {
        return res.status(403).json({ message: "Akses ditolak. Hanya dosen yang dapat menghapus tugas." });
    }
    const id = req.params.id;
    Writing.deleteTask(id, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Task deleted" });
    });
};

exports.getTasksByModule = (req, res) => {
    const moduleId = req.params.moduleId; // FIX PARAM
    Writing.getTasksByModule(moduleId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows); // JANGAN pake rows[0] karena bisa banyak task
    });
};

exports.getAllTasks = (req, res) => {
    Writing.getAllTasks((err, rows) => {
        if (err) {
            console.log("GET ALL TASK ERROR:", err);
            return res.status(500).json({ error: err });
        }
        console.log("[GET /api/writing] user=", req.user ? req.user.id : null, "rows=", Array.isArray(rows) ? rows.length : typeof rows);
        console.log("GET ALL TASKS RESULT:", rows);
        res.json(rows);
    });
};

// Di method submitWriting
exports.submitWriting = (req, res) => {
  const data = {
    task_id: req.body.task_id,
    student_id: req.user.id,
    file_url: req.file ? "/uploads/tasks/" + req.file.filename : null,
    answer_text: req.body.answer_text
  };

  Writing.submitWriting(data, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    
    // Emit event untuk notifikasi dosen
    const submission = {
      id: result.insertId,
      ...data
    };
    eventBus.emit("task_submitted", submission);
    
    res.json({ message: "Submission recorded" });
  });
};

exports.gradeSubmission = (req, res) => {
    const data = {
        id: req.params.submissionId,
        score: req.body.score,
        feedback: req.body.feedback
    };

    Writing.gradeSubmission(data, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Submission graded" });
    });
};

exports.getTasksForMahasiswa = (req, res) => {
    const studentId = req.user.id;
    Writing.getTasksForMahasiswa(studentId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

exports.getSubmissionsByTask = (req, res) => {
    const taskId = req.params.taskId;
    Writing.getSubmissions(taskId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

exports.downloadSubmissionsZip = (req, res) => {
    const taskId = req.params.taskId;
    Writing.getSubmissions(taskId, (err, submissions) => {
        if (err || !submissions) return res.status(500).json({ error: err || "No submissions" });

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="submissions_task_${taskId}.zip"`
        });

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        submissions.forEach(sub => {
            if (sub.file_url) {
                const filePath = path.join(__dirname, "..", sub.file_url);
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: `${sub.student_name || sub.student_id}_${path.basename(filePath)}` });
                }
            }
        });

        archive.finalize();
    });
};

function sanitizeDownloadName(name = "") {
    return String(name || "")
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .trim();
}

function buildTaskAttachmentDownloadName(taskTitle = "", attachmentUrl = "") {
    const safeTitle = sanitizeDownloadName(taskTitle) || "lampiran_tugas";
    const ext = path.extname(attachmentUrl || "");
    return `${safeTitle}${ext}`;
}

exports.downloadTaskFile = (req, res) => {
    const taskId = req.params.taskId;

    console.log("[downloadTaskFile] incoming request:", { taskId, userId: req.user?.id });

    Writing.getTaskById(taskId, (err, task) => {
        if (err) {
            console.error("[downloadTaskFile] getTaskById error:", err);
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data tugas"
            });
        }

        if (!task) {
            console.warn("[downloadTaskFile] task not found:", { taskId });
            return res.status(404).json({
                success: false,
                message: "Task tidak ditemukan"
            });
        }

        if (!task.attachment_url || !String(task.attachment_url).trim()) {
            console.warn("[downloadTaskFile] no attachment:", { taskId });
            return res.status(404).json({
                success: false,
                message: "No attachment for this task"
            });
        }

        const normalizedAttachmentPath = String(task.attachment_url)
            .replace(/^\/+/, "")
            .replace(/\\/g, "/");

        const filePath = path.resolve(__dirname, "..", normalizedAttachmentPath);
        const uploadsRoot = path.resolve(__dirname, "..", "uploads");

        console.log("[downloadTaskFile] resolved paths:", {
            attachment_url: task.attachment_url,
            normalizedAttachmentPath,
            filePath,
            uploadsRoot
        });

        if (!filePath.startsWith(uploadsRoot)) {
            console.error("[downloadTaskFile] invalid path traversal attempt:", {
                taskId,
                attachment_url: task.attachment_url,
                filePath
            });
            return res.status(400).json({
                success: false,
                message: "Path file tidak valid"
            });
        }

        if (!fs.existsSync(filePath)) {
            console.warn("[downloadTaskFile] file missing on server:", {
                taskId,
                filePath
            });
            return res.status(404).json({
                success: false,
                message: "Attachment file not found on server"
            });
        }

        const downloadName = buildTaskAttachmentDownloadName(
            task.task_title,
            normalizedAttachmentPath
        );

        console.log("[downloadTaskFile] downloading file:", {
            taskId,
            filePath,
            downloadName
        });

        return res.download(filePath, downloadName, (downloadErr) => {
            if (!downloadErr) return;

            if (downloadErr.code === "ECONNABORTED") {
                console.warn("[downloadTaskFile] client aborted download:", {
                    taskId,
                    code: downloadErr.code,
                    message: downloadErr.message
                });
                return;
            }

            console.error("[downloadTaskFile] res.download callback error:", downloadErr);

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengirim file tugas"
                });
            }
        });
    });
};