const learningService = require("../services/learningService");
const StudentProgressModel = require("../models/ProgressModel");
const ModuleStepModel = require("../models/StepModel");
const path = require("path");
const fs = require("fs");

exports.startModule = async (req, res) => {

    try {

        const userId = req.user.id; 
        const moduleId = req.params.moduleId;

        const result = await learningService.startModule(
            userId,
            moduleId
        );

        return res.json({
            success: true,
            message: result.alreadyStarted
                ? "Module already started"
                : "Module started successfully",
            data: result
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to start module"
        });

    }

};

exports.startStep = async (req,res)=>{

    try{

    const userId = req.user.id;
    const moduleId = req.params.moduleId;
    const stepNumber = req.params.stepNumber;

    await learningService.startStep(userId,moduleId,stepNumber);

    res.json({
    success:true,
    message:"Step started"
    });

    }catch(err){

    res.status(500).json({
    success:false,
    message:err.message
    });

    }

};

exports.getModuleLearning = async (req, res) => {

    try {

        const userId = req.user.id;
        const moduleId = req.params.moduleId;

        const data =
        await learningService.getModuleLearning(
            userId,
            moduleId
        );

        res.json({
        success: true,
        data: data
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
        success: false,
        message: "Failed to load module learning"
        });

    }

};

exports.completeStep = async (req,res)=>{

try{

const userId = req.user.id;
const moduleId = req.params.moduleId;
const stepNumber = req.params.stepNumber;

await learningService.completeStep(userId,moduleId,stepNumber);

res.json({
success:true,
message:"Step completed"
});

}catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};

exports.getStudentModules = async (req, res) => {
    try {
        const userId = req.user.id;
        const modules = await learningService.getStudentModules(userId);

        res.json({
        success: true,
        data: modules
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
        success: false,
        message: "Failed to fetch modules"
        });
    }
};

exports.getModuleSteps = async (req, res) => {
    try {
        const userId = req.user.id;
        const moduleId = req.params.moduleId;

        const steps = await learningService.getModuleStepsWithStatus(
        userId,
        moduleId
        );

        res.json({
        success: true,
        data: steps
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
        success: false,
        message: "Failed to fetch steps"
        });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { moduleId, stepNumber, resourceType } = req.params;

        // 1. Validate step exists
        const step = await ModuleStepModel.getStepByNumber(moduleId, stepNumber);
        if (!step) {
            return res.status(404).json({ 
                success: false, 
                message: "Step tidak ditemukan" 
            });
        }

        // 2. Check access - user harus sudah start modul
        const progress = await StudentProgressModel.findModuleProgress(userId, moduleId);
        if (!progress) {
            return res.status(403).json({ 
                success: false, 
                message: "Akses ditolak - mulai modul terlebih dahulu" 
            });
        }

        // 3. Get resource dengan type tertentu
        const resources = await learningService.getStepResources([step.id]);
        const resource = resources.find(r => r.resource_type === resourceType);
        
        if (!resource) {
            return res.status(404).json({ 
                success: false, 
                message: `Resource dengan type '${resourceType}' tidak ditemukan` 
            });
        }

        // 4. ✅ Construct full path dengan path.join (OS-independent)
        const filePath = path.join(
            __dirname, 
            "..", 
            "uploads", 
            resource.resource_path
        );

        // 5. Validate file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: "File tidak ditemukan di server" 
            });
        }

        // 6. Download file
        // Dapatkan original filename dari path
        const fileName = path.basename(filePath);
        res.download(filePath, fileName);

    } catch (err) {
        console.error("[downloadFile] Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Download gagal: " + err.message 
        });
    }
};

exports.getStepDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { moduleId, stepNumber } = req.params;  // ✅ Ganti stepId → stepNumber

        const data = await learningService.getStepDetail(
            userId,
            moduleId,
            stepNumber  // ✅ Pass stepNumber
        );

        res.json({
            success: true,
            data: data
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to load step detail"
        });
    }
};