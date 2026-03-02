const Reflect = require("../models/Reflect");

exports.createReflection = (req, res) => {
    Reflect.createReflection(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Reflection question added", id: result.insertId });
    });
};

exports.getReflectionQuestions = (req, res) => {
    Reflect.getQuestions(req.params.unitId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

exports.submitReflection = (req, res) => {
    const data = {
        reflection_id: req.body.reflection_id,
        student_id: req.user.id,
        answer: req.body.answer
    };

    Reflect.submitAnswer(data, err => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Reflection submitted" });
    });
};