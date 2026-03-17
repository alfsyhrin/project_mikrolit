const learningService = require("../services/learningService");

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

exports.downloadResource = async (req, res) => {
    try {
        const resourceId = req.params.resourceId;
        const resource = await learningService.getResourceById(resourceId);
        if (!resource) {
        return res.status(404).json({
            success: false,
            message: "Resource not found"
        });
        }
        res.download(resource.file_path, resource.file_name);
    } catch (err) {
        console.error(err);
        res.status(500).json({
        success: false,
        message: "Failed to download resource"
        });
    }
};