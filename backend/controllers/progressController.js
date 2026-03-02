const Progress = require("../models/Progress");

exports.startUnit = (req, res) => {
    Progress.startUnit(req.body, err => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Progress started" });
    });
};

exports.completeUnit = (req, res) => {
    Progress.completeUnit(req.body, err => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Unit completed" });
    });
};

exports.getProgressByModule = (req, res) => {
    Progress.getProgressByModule(req.params.moduleId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};