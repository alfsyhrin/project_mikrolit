const StudentProgressModel = require("../models/ProgressModel");
const ModuleModel = require("../models/Module");
const StudentLearningModel = require("../models/StudentLearningModel");
const ModuleStepModel = require("../models/StepModel");
const db = require("../config/db");

// helper promisify (sama pattern di modulService.js)
const promisify = (fn, context) => (...args) =>
    new Promise((resolve, reject) =>
        fn.apply(context, [...args, (err, result) => (err ? reject(err) : resolve(result))])
    );

    const learningService = {
    async startModule(userId, moduleId) {
        // 1. validasi module exists
        const getModuleById = promisify(ModuleModel.getById, ModuleModel);
        try {
        await getModuleById(moduleId);
        } catch (err) {
        throw new Error("Module not found");
        }

        // 2. cek apakah sudah mulai
        const existingProgress = await StudentProgressModel.findModuleProgress(userId, moduleId);

        if (existingProgress) {
        return {
            alreadyStarted: true,
            progress: existingProgress
        };
        }

        // 3. hitung steps & buat progress baru
        const totalSteps = await StudentProgressModel.countModuleSteps(moduleId);

        const progressId = await StudentProgressModel.createModuleProgress(
        userId,
        moduleId,
        totalSteps
        );

        return {
        alreadyStarted: false,
        progress_id: progressId,
        total_steps: totalSteps
        };
    },

    async startStep(userId, moduleId, stepNumber) {
    const step = await ModuleStepModel.getStepByNumber(moduleId, stepNumber);
    if (!step) throw new Error("Step tidak ditemukan");

    const result = await StudentProgressModel.startStep(userId, moduleId, step.id);
    return result;
    },

    async getModuleLearning(userId, moduleId) {
        const module = await StudentLearningModel.getModule(moduleId);
        if (!module) {
        throw new Error("Module not found");
        }

        const steps = await StudentLearningModel.getModuleSteps(moduleId);

        const progress = await StudentLearningModel.getStudentProgress(userId, moduleId);

        const completedSteps = progress ? progress.completed_steps : 0;

        const stepIds = steps.map((step) => step.id);

        const resources = await StudentLearningModel.getStepResources(stepIds);

        const resourceMap = {};
        resources.forEach((res) => {
        if (!resourceMap[res.step_id]) {
            resourceMap[res.step_id] = [];
        }
        resourceMap[res.step_id].push({
            type: res.resource_type,
            value: res.resource_path
        });
        });

        const stepsWithStatus = steps.map((step) => {
        let status = "locked";

        if (step.step_number <= completedSteps) {
            status = "completed";
        } else if (step.step_number === completedSteps + 1) {
            status = "current";
        }

        return {
            step_id: step.id,
            step_number: step.step_number,
            step_title: step.step_title,
            step_type: step.step_type,
            status: status,
            resources: resourceMap[step.id] || []
        };
        });

        return {
        module: {
            ...module,
            progress_percent: progress ? progress.progress_percent : 0
        },
        steps: stepsWithStatus
        };
    },

    async completeStep(userId, moduleId, stepNumber) {
        const step = await ModuleStepModel.getStepByNumber(moduleId, stepNumber);
        if (!step) throw new Error("Step tidak ditemukan");
        const stepId = step.id;

        // helper to recompute module progress and update student_module_progress
        const checkModuleCompletion = (userId, moduleId) =>
            new Promise((resolve, reject) => {
                const countQuery = `
                    SELECT COUNT(*) AS completed
                    FROM student_step_progress
                    WHERE user_id = ? AND module_id = ? AND status = 'completed'
                `;
                db.query(countQuery, [userId, moduleId], async (err, rows) => {
                    if (err) return reject(err);
                    const completed = rows && rows[0] ? Number(rows[0].completed) : 0;

                    // get total steps for module
                    try {
                        const steps = await StudentProgressModel.getModuleSteps(moduleId);
                        const total = steps ? steps.length : 0;
                        const progressPercent = total > 0 ? Math.floor((completed / total) * 100) : 0;
                        const status = completed === total ? "completed" : "in_progress";

                        await StudentProgressModel.updateModuleProgress(
                            userId,
                            moduleId,
                            completed,
                            progressPercent,
                            status
                        );

                        resolve({ completed, total, progressPercent, status });
                    } catch (e) {
                        reject(e);
                    }
                });
            });

        return new Promise((resolve, reject) => {
            const query = `
                UPDATE student_step_progress
                SET
                    status = 'completed',
                    completed_at = NOW()
                WHERE
                    user_id = ?
                    AND module_id = ?
                    AND step_id = ?
            `;

            db.query(query, [userId, moduleId, stepId], async (err, result) => {
                if (err) return reject(err);
                try {
                    await checkModuleCompletion(userId, moduleId);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    

    async getStudentModules(userId) {
        const modules = await StudentProgressModel.getModulesWithProgress(userId);
        return modules;
    },

    async getModuleStepsWithStatus(userId, moduleId) {
        const steps = await StudentLearningModel.getModuleSteps(moduleId);
        const progress = await StudentProgressModel.getModuleProgress(userId, moduleId);
        const completedSteps = progress ? progress.completed_steps : 0;

        return steps.map(step => {
            let status = "locked";
            if (step.step_number <= completedSteps) status = "completed";
            else if (step.step_number === completedSteps + 1) status = "current";

            return {
            step_id: step.id,
            step_number: step.step_number,
            title: step.step_title || step.title,
            description: step.step_description || null,
            status
            };
        });
    }
};

module.exports = learningService;