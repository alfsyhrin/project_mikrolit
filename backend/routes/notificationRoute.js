const express = require("express");
const router = express.Router();

const NotificationModel = require("../models/NotificationModel");

router.get("/notification", async (req, res) => {

    const data = await NotificationModel.getAll();

    res.json({
        success: true,
        data
    });

});

module.exports = router;