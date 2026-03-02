const MicroUnit = require("../models/MicroUnit");

exports.createUnit = (req, res) => {
    const data = {
        module_id: req.body.module_id,
        unit_type: req.body.unit_type,
        title: req.body.title,
        content: req.body.content,
        attachment_url: req.file ? "/uploads/" + req.file.filename : null
    };

    MicroUnit.create(data, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Unit created", unitId: result.insertId });
    });
};

exports.getUnitsByModule = (req, res) => {
    MicroUnit.getByModule(req.params.moduleId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

exports.getUnitDetail = (req, res) => {
    MicroUnit.getDetail(req.params.unitId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows[0]);
    });
};

exports.updateUnit = (req, res) => {
    const data = {
        id: req.params.unitId,
        title: req.body.title,
        content: req.body.content,
        attachment_url: req.file ? "/uploads/" + req.file.filename : req.body.attachment_url
    };

    MicroUnit.update(data, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Unit updated" });
    });
};

exports.deleteUnit = (req, res) => {
    MicroUnit.delete(req.params.unitId, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Unit deleted" });
    });
};