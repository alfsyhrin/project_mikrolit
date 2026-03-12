const Module = require("../models/Module");
const eventBus = require("../events/eventBus");

exports.createModule = (req, res) => {

    const data = {
        title: req.body.title,
        description: req.body.description,
        learning_outcomes: req.body.learning_outcomes,
        created_by: req.user.id
    };

    Module.create(data, (err, result) => {

        if (err) return res.status(500).json({ error: err });

        const moduleData = {
            id: result.insertId,
            ...data
        };

        eventBus.emit("module_created", moduleData);

        res.json({
            message: "Module created",
            moduleId: result.insertId
        });

    });

};

exports.getModules = (req, res) => {
    Module.getByDosen(req.user.id, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

exports.getModuleDetail = (req, res) => {
    Module.getDetail(req.params.id, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows[0]);
    });
};