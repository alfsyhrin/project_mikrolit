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

        // ✅ BARU: Fetch objectives
        const objectivesData = await StudentLearningModel.getModuleObjectives(moduleId);
        const objectives = objectivesData.map(obj => obj.objective_text);

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
                objectives: objectives,  // ✅ BARU
                progress_percent: progress ? progress.progress_percent : 0
            },
            steps: stepsWithStatus
        };
    },

async completeStep(userId, moduleId, stepNumber) {
    console.log(`\n[completeStep] START - userId: ${userId}, moduleId: ${moduleId}, stepNumber: ${stepNumber}`);
    
    try {
        // 1. Get step by number
        const step = await ModuleStepModel.getStepByNumber(moduleId, stepNumber);
        if (!step) throw new Error("Step tidak ditemukan");
        const stepId = step.id;
        console.log(`[completeStep] Step found - stepId: ${stepId}, stepNumber: ${step.step_number}`);

        // 2. Update student_step_progress to completed
        return new Promise((resolve, reject) => {
            const updateStepQuery = `
                UPDATE student_step_progress
                SET
                    status = 'completed',
                    completed_at = NOW()
                WHERE
                    user_id = ?
                    AND module_id = ?
                    AND step_id = ?
            `;
            
            console.log(`[completeStep] Updating step status...`);
            db.query(updateStepQuery, [userId, moduleId, stepId], async (err, result) => {
                if (err) {
                    console.error(`[completeStep] UPDATE STEP ERROR:`, err);
                    return reject(err);
                }
                
                console.log(`[completeStep] ✅ Step status updated`);
                
                try {
                    // 3. Get total completed steps untuk module ini
                    const completedSteps = await new Promise((res, rej) => {
                        const countCompletedQuery = `
                            SELECT COUNT(*) AS completed
                            FROM student_step_progress
                            WHERE user_id = ? AND module_id = ? AND status = 'completed'
                        `;
                        db.query(countCompletedQuery, [userId, moduleId], (err, rows) => {
                            if (err) {
                                console.error(`[completeStep] COUNT COMPLETED ERROR:`, err);
                                return rej(err);
                            }
                            const count = rows && rows[0] ? rows[0].completed : 0;
                            console.log(`[completeStep] Completed steps: ${count}`);
                            res(count);
                        });
                    });

                    // 4. Get total steps dalam module
                    const totalSteps = await new Promise((res, rej) => {
                        const countTotalQuery = `
                            SELECT COUNT(*) AS total
                            FROM module_steps
                            WHERE module_id = ?
                        `;
                        db.query(countTotalQuery, [moduleId], (err, rows) => {
                            if (err) {
                                console.error(`[completeStep] COUNT TOTAL ERROR:`, err);
                                return rej(err);
                            }
                            const count = rows && rows[0] ? rows[0].total : 0;
                            console.log(`[completeStep] Total steps: ${count}`);
                            res(count);
                        });
                    });

                    // 5. Hitung progress_percent
                    const progressPercent = totalSteps > 0 
                        ? Math.round((completedSteps / totalSteps) * 100) 
                        : 0;
                    console.log(`[completeStep] Progress: ${completedSteps}/${totalSteps} = ${progressPercent}%`);

                    // 6. Tentukan status
                    const moduleStatus = completedSteps >= totalSteps ? 'completed' : 'in_progress';
                    console.log(`[completeStep] Module status: ${moduleStatus}`);

                    // 7. Update student_module_progress
                    const updateModuleQuery = `
                        UPDATE student_module_progress
                        SET
                            completed_steps = ?,
                            progress_percent = ?,
                            status = ?,
                            completed_at = ${completedSteps >= totalSteps ? 'NOW()' : 'completed_at'},
                            updated_at = NOW()
                        WHERE
                            user_id = ?
                            AND module_id = ?
                    `;
                    
                    console.log(`[completeStep] Updating module progress...`);
                    db.query(
                        updateModuleQuery,
                        [completedSteps, progressPercent, moduleStatus, userId, moduleId],
                        (err, result) => {
                            if (err) {
                                console.error(`[completeStep] UPDATE MODULE ERROR:`, err);
                                return reject(err);
                            }
                            
                            console.log(`[completeStep] ✅ Module progress updated - status: ${moduleStatus}, progress: ${progressPercent}%`);

                            // 8. Emit event jika module complete
                            if (moduleStatus === 'completed') {
                                const eventBus = require("../events/eventBus");
                                eventBus.emit("module_completed", {
                                    student_id: userId,
                                    module_id: moduleId,
                                    completed_at: new Date(),
                                    progress_percent: progressPercent,
                                    completed_steps: completedSteps,
                                    total_steps: totalSteps
                                });
                                console.log(`✅ [completeStep] Module completed event emitted for user ${userId}, module ${moduleId}`);
                            }

                            resolve({
                                success: true,
                                completed_steps: completedSteps,
                                total_steps: totalSteps,
                                progress_percent: progressPercent,
                                status: moduleStatus
                            });
                        }
                    );
                } catch (error) {
                    console.error(`[completeStep] ERROR in completion check:`, error);
                    reject(error);
                }
            });
        });
        
    } catch (error) {
        console.error(`[completeStep] MAIN ERROR:`, error);
        throw error;
    }
},

    async getModuleDurationSeconds(userId, moduleId) {
        const [stepDuration, moduleDuration] = await Promise.all([
            this.getStepDurationSeconds(userId, moduleId),
            this.getModuleLevelDurationSeconds(userId, moduleId)
        ]);

        // step jadi sumber utama, module jadi fallback
        if (stepDuration > 0) return stepDuration;
        if (moduleDuration > 0) return moduleDuration;

        return 0;
    },
    
    async getStepDurationSeconds(userId, moduleId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    COALESCE(SUM(
                        TIMESTAMPDIFF(SECOND, started_at, completed_at)
                    ), 0) AS total_duration_seconds
                FROM student_step_progress
                WHERE user_id = ?
                AND module_id = ?
                AND started_at IS NOT NULL
                AND completed_at IS NOT NULL
            `;

            db.query(query, [userId, moduleId], (err, rows) => {
                if (err) return reject(err);
                resolve(Number(rows?.[0]?.total_duration_seconds || 0));
            });
        });
    },

    async getModuleLevelDurationSeconds(userId, moduleId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT
                    CASE
                        WHEN started_at IS NOT NULL AND completed_at IS NOT NULL
                            THEN TIMESTAMPDIFF(SECOND, started_at, completed_at)
                        ELSE 0
                    END AS total_duration_seconds
                FROM student_module_progress
                WHERE user_id = ?
                AND module_id = ?
                LIMIT 1
            `;

            db.query(query, [userId, moduleId], (err, rows) => {
                if (err) return reject(err);
                resolve(Number(rows?.[0]?.total_duration_seconds || 0));
            });
        });
    },

    async getStudentModules(userId) {
        const modules = await StudentProgressModel.getModulesWithProgress(userId);

        const modulesWithMeta = await Promise.all(
            modules.map(async (module) => {
                const totalSteps = await this.countModuleSteps(module.id);
                const totalDurationSeconds = await this.getModuleDurationSeconds(userId, module.id);

                return {
                    ...module,
                    total_steps: totalSteps,
                    completed_steps: module.completed_steps,
                    progress_percent: module.progress_percent,
                    total_duration_seconds: totalDurationSeconds
                };
            })
        );

        return modulesWithMeta;
    },

    // Helper function untuk hitung total steps di module
    async countModuleSteps(moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS total FROM module_steps WHERE module_id = ?`,
                [moduleId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result && result[0] ? result[0].total : 0);
                }
            );
        });
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
    },

async getStepDetail(userId, moduleId, stepNumber) {  // ✅ Ganti parameter
    // 1. Validate step exists - gunakan stepNumber
    const step = await StudentLearningModel.getStepByNumber(moduleId, stepNumber);  // ✅ Ganti method
    if (!step) {
        throw new Error("Step tidak ditemukan");
    }

    // 2. Get student progress untuk determine status
    const progress = await StudentLearningModel.getStudentProgress(userId, moduleId);
    const completedSteps = progress ? progress.completed_steps : 0;

    // 3. Tentukan status step
    let status = "locked";
    if (step.step_number <= completedSteps) {
        status = "completed";
    } else if (step.step_number === completedSteps + 1) {
        status = "current";
    }

    // 4. Get resources untuk step ini
    const resources = await StudentLearningModel.getStepResourcesById(step.id);  // ✅ Gunakan step.id yang didapat dari query

    // 5. Format resources berdasarkan type
    const formattedResources = resources.map(res => {
        const normalizedPath = String(res.resource_path || "").replace(/^\/+/, "");
        const publicUrl = `/uploads/${normalizedPath}`;

        return {
            type: res.resource_type,
            value: normalizedPath,
            title: res.resource_title || null,
            public_url: publicUrl,
            preview_url: res.resource_type === "image" ? publicUrl : null
        };
    });

    return {
        step: {
            step_id: step.id,
            step_number: step.step_number,
            step_title: step.step_title,
            step_type: step.step_type,
            step_description: step.step_description || null,
            status: status,
            discussion_enabled: step.discussion_enabled
        },
        resources: formattedResources
    };
},

async getStepResources(stepIds) {
    return StudentLearningModel.getStepResources(stepIds);
}
};

module.exports = learningService;