const Module = require("../models/Module");
const eventBus = require("../events/eventBus");
const ModuleService = require("../services/modulService");

exports.createModule = async (req, res) => {
    try {
        const moduleId = await ModuleService.createModule(req.body);

        // ✅ Gunakan req.body atau moduleData yang didefinisikan
        eventBus.emit("module_created", {
            id: moduleId,
            ...req.body
        });

        res.json({
            success: true,
            module_id: moduleId
        });

    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getModules = (req, res) => {
    console.log("🔍 User ID:", req.user.id);
    
    Module.getModules(req.user.id, (err, rows) => {
        console.log("🔍 Callback err:", err);
        console.log("🔍 Callback rows:", rows);
        console.log("🔍 Rows type:", typeof rows, "Is array?", Array.isArray(rows));
        
        if (err) {
            console.error("❌ DB Error:", err);
            return res.status(500).json({ error: err.message });
        }
        
        // Jika rows undefined, kirim array kosong
        if (!rows) {
            console.warn("⚠️ Rows is null/undefined, sending empty array");
            return res.json([]);
        }
        
        console.log("✅ Response sent, count:", rows.length);
        res.json(rows);
    });
};

exports.getModuleDetail = async (req, res) => {
    console.log("🔍 getModuleDetail called for id:", req.params.id);

    try {
        const module = await ModuleService.getModuleDetail(req.params.id);
        console.log("✅ getModuleDetail result:", module);

        res.json({
        success: true,
        data: module
        });
    } catch (err) {
        console.error("❌ getModuleDetail error:", err);
        res.status(500).json({
        success: false,
        message: err.message
        });
    }
};

exports.updateModule = async (req, res) => {
    console.log("🔍 updateModule called for id:", req.params.id);

    try {
        await ModuleService.updateModule(req.params.id, req.body);
        console.log("✅ Module updated:", req.params.id);

        res.json({
        success: true,
        message: "Module updated successfully"
        });
    } catch (err) {
        console.error("❌ updateModule error:", err);
        res.status(500).json({
        success: false,
        message: err.message
        });
    }
};

exports.deleteModule = async (req, res) => {
    console.log("🔍 deleteModule called for id:", req.params.id)
    
    try {
        await Module.deleteModule(req.params.id);
        console.log("✅ Module deleted:", req.params.id);

        res.json({
        success: true,
        message: "Module deleted successfully"
        });
    } catch (err) {
        console.error("❌ deleteModule error:", err);
        res.status(500).json({
        success: false,
        message: err.message
        });
    }
};