const Review = require("../models/Review");

exports.createQuestion = (req, res) => {
    Review.createQuestion(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Question created", questionId: result.insertId });
    });
};

exports.createOption = (req, res) => {
    Review.createOption(req.body, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Option added" });
    });
};

exports.getQuiz = (req, res) => {
    const unitId = req.params.unitId;

    Review.getQuestionsByUnit(unitId, async (err, questions) => {
        if (err) return res.status(500).json({ error: err });

        for (let q of questions) {
            q.options = await new Promise(resolve => {
                Review.getOptionsByQuestion(q.id, (_, options) => resolve(options));
            });
        }

        res.json(questions);
    });
};