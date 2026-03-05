const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const Writing = require("../models/Writing");

exports.createTask = (req, res) => {
    const data = {
        module_id: req.body.module_id || null,
        unit_id: req.body.unit_id || null,
        task_title: req.body.task_title,
        instructions: req.body.instructions,
        attachment_url: req.file ? "/uploads/tasks/" + req.file.filename : null,
        deadline: req.body.deadline
    };

    Writing.createTask(data, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Task created" });
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

exports.submitWriting = (req, res) => {
    const data = {
        task_id: req.body.task_id,
        student_id: req.user.id,
        file_url: req.file ? "/uploads/tasks/" + req.file.filename : null,
        answer_text: req.body.answer_text
    };

    Writing.submitWriting(data, (err) => {
        if (err) return res.status(500).json({ error: err });
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
                    archive.file(filePath, { name: `${sub.student_npm || sub.student_id}_${path.basename(filePath)}` });
                }
            }
        });

        archive.finalize();
    });
};

exports.downloadTaskFile = (req, res) => {
    const taskId = req.params.taskId;
    Writing.getTaskById(taskId, (err, task) => {
        if (err || !task) return res.status(500).json({ error: err || "Task not found" });
        if (!task.attachment_url) return res.status(404).json({ error: "No attachment for this task" });
        res.sendFile(path.join(__dirname, "..", task.attachment_url));
    });
};