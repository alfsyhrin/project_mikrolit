const Writing = require("../models/Writing");

exports.createTask = (req, res) => {
    const data = {
        module_id: req.body.module_id,
        instructions: req.body.instructions,
        attachment_url: req.file ? "/uploads/attachment/" + req.file.filename : null,
        deadline: req.body.deadline
    };

    Writing.createTask(data, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Task created" });
    });
};

exports.getTask = (req, res) => {
    Writing.getTaskByUnit(req.params.unitId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows[0]);
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