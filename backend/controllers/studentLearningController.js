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

function buildReadableDownloadName(resourcePath = "") {
    const ext = path.extname(resourcePath || "");
    const rawBase = path.basename(resourcePath || "", ext);

    // format lama: 1774789834040-Infografis
    let cleanedBase = rawBase.replace(/^\d{10,}-/, "");

    // format baru nanti kalau pakai suffix unik: Infografis-a1b2c3d4
    cleanedBase = cleanedBase.replace(/-[a-f0-9]{8}$/i, "");

    if (!cleanedBase || !cleanedBase.trim()) {
        cleanedBase = "resource";
    }

    return `${cleanedBase}${ext}`;
}

exports.downloadFile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { moduleId, stepNumber, resourceType } = req.params;

        console.log("[downloadFile] incoming request:", {
            userId,
            moduleId,
            stepNumber,
            resourceType
        });

        // 1. Validate step exists
        const step = await ModuleStepModel.getStepByNumber(moduleId, stepNumber);
        if (!step) {
            console.warn("[downloadFile] step not found:", { moduleId, stepNumber });
            return res.status(404).json({
                success: false,
                message: "Step tidak ditemukan"
            });
        }

        // 2. Check access - user harus sudah start modul
        const progress = await StudentProgressModel.findModuleProgress(userId, moduleId);
        if (!progress) {
            console.warn("[downloadFile] access denied:", { userId, moduleId });
            return res.status(403).json({
                success: false,
                message: "Akses ditolak - mulai modul terlebih dahulu"
            });
        }

        // 3. Get resource dengan type tertentu
        const resources = await learningService.getStepResources([step.id]);
        const resource = resources.find(
            r => String(r.resource_type).toLowerCase() === String(resourceType).toLowerCase()
        );

        if (!resource) {
            console.warn("[downloadFile] resource not found:", {
                stepId: step.id,
                resourceType,
                availableTypes: resources.map(r => r.resource_type)
            });
            return res.status(404).json({
                success: false,
                message: `Resource dengan type '${resourceType}' tidak ditemukan`
            });
        }

        // 4. Normalize path supaya aman lintas OS
        const normalizedResourcePath = String(resource.resource_path || "")
            .replace(/^\/+/, "")
            .replace(/\\/g, "/");

        const filePath = path.resolve(
            __dirname,
            "..",
            "uploads",
            normalizedResourcePath
        );

        const uploadsRoot = path.resolve(__dirname, "..", "uploads");

        console.log("[downloadFile] resolved paths:", {
            resourcePath: resource.resource_path,
            normalizedResourcePath,
            filePath,
            uploadsRoot
        });

        // 5. Cegah path traversal
        if (!filePath.startsWith(uploadsRoot)) {
            console.error("[downloadFile] invalid path traversal attempt:", {
                resourcePath: resource.resource_path,
                filePath
            });
            return res.status(400).json({
                success: false,
                message: "Path file tidak valid"
            });
        }

        // 6. Validate file exists
        if (!fs.existsSync(filePath)) {
            console.warn("[downloadFile] file missing on server:", {
                filePath,
                resourcePath: resource.resource_path
            });
            return res.status(404).json({
                success: false,
                message: "File tidak ditemukan di server"
            });
        }

        // 7. Build nama download yang rapi
        const downloadName = buildReadableDownloadName(normalizedResourcePath);

        console.log("[downloadFile] downloading file:", {
            filePath,
            downloadName
        });

        return res.download(filePath, downloadName, (err) => {
            if (err) {
                console.error("[downloadFile] res.download callback error:", err);
                if (!res.headersSent) {
                    return res.status(500).json({
                        success: false,
                        message: "Gagal mengirim file"
                    });
                }
            }
        });

    } catch (err) {
        console.error("[downloadFile] Error:", err);
        return res.status(500).json({
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