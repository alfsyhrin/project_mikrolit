const Writing = require("../models/Writing");

exports.createTask = (req, res) => {
    const data = {
        module_id: req.body.module_id ||  null,
        instructions: req.body.instructions,
        attachment_url: req.file ? "/uploads/tasks/" + req.file.filename : null,
        deadline: req.body.deadline
    };

    Writing.createTask(data, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Task created" });
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
        res.json(rows);
    });
};

exports.submitWriting = (req, res) => {
    const data = {
        task_id: req.body.task_id,
        student_id: req.user.id,
        file_url: req.file ? "/uploads/" + req.file.filename : null,
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