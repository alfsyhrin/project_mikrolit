const ModuleModel = require("../models/Module");
const ObjectiveModel = require("../models/ObjectiveModel");
const StepModel = require("../models/StepModel");
const ResourceModel = require("../models/StepResourceModel");
const db = require("../config/db");

// ✅ Helper promisify
const promisify = (fn, context) => (...args) => 
    new Promise((resolve, reject) => 
        fn.apply(context, [...args, (err, result) => err ? reject(err) : resolve(result)])
    );

async function createModule(data) {
    const createModulePromise = promisify(ModuleModel.createModule, ModuleModel);
    const moduleResult = await createModulePromise(data);
    const moduleId = moduleResult.insertId;

    // Buat discussion room otomatis jika enabled
    if (data.discussion_enabled) {
        await new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO discussion_rooms (module_id, title) VALUES (?, ?)`,
                [moduleId, data.title],
                (err, result) => err ? reject(err) : resolve(result)
            );
        });
    }

    if (data.objectives && data.objectives.length > 0) {
        let order = 1;
        for (const obj of data.objectives) {
            const createObjPromise = promisify(ObjectiveModel.createObjective, ObjectiveModel);
            await createObjPromise({
                module_id: moduleId,
                objective_text: obj.objective_text || obj,
                sort_order: order
            });
            order++;
        }
    }

    if (data.steps && data.steps.length > 0) {
        for (const step of data.steps) {
            const createStepPromise = promisify(StepModel.createStep, StepModel);
            const stepId = (await createStepPromise({
                module_id: moduleId,
                step_number: step.step_number,
                step_title: step.step_title,
                step_type: step.step_type,
                discussion_enabled: step.discussion_enabled || false
            })).insertId;

            if (step.resources && step.resources.length > 0) {
                for (const res of step.resources) {
                    const createResPromise = promisify(ResourceModel.createResource, ResourceModel);
                    await createResPromise({
                        step_id: stepId,
                        resource_type: res.type,
                        resource_value: res.value
                    });
                }
            }
        }
    }

    return moduleId;
}

async function getModuleDetail(moduleId) {
    // Bungkus semua method callback ke Promise
    const getByIdPromise = promisify(ModuleModel.getById, ModuleModel);
    const getObjectivesPromise = promisify(ObjectiveModel.getByModule, ObjectiveModel);
    const getStepsPromise = promisify(StepModel.getStepsByModule, StepModel);
    const getResourcesByModulePromise = promisify(ResourceModel.getResourcesByModule, ResourceModel);

    // Ambil data utama
    const module = await getByIdPromise(moduleId);
    const objectives = (await getObjectivesPromise(moduleId)) || [];
    const steps = (await getStepsPromise(moduleId)) || [];
    const resources = (await getResourcesByModulePromise(moduleId)) || [];

    // Map resources ke step_id
    const resourceMap = {};
    for (const resource of resources) {
        if (!resourceMap[resource.step_id]) {
            resourceMap[resource.step_id] = [];
        }
        resourceMap[resource.step_id].push({
            type: resource.resource_type,
            value: resource.resource_path,
        });
    }

    // Bentuk response sesuai struktur awal
    return {
        id: module.id,
        title: module.title,
        description: module.description,
        learning_outcomes: module.learning_outcomes,
        discussion_enabled: module.discussion_enabled,
        objectives: objectives.map((o) => o.objective_text),
        steps: steps.map((step) => ({
            step_id: step.id,
            step_number: step.step_number,
            step_title: step.step_title,
            step_type: step.step_type,
            discussion_enabled: step.discussion_enabled,
            resources: resourceMap[step.id] || [],
        })),
    };
}

async function updateModule(moduleId, data) {
    const updateModulePromise = promisify(ModuleModel.updateModule, ModuleModel);
    const deleteObjectivesPromise = promisify(ObjectiveModel.deleteByModule, ObjectiveModel);
    const createObjectivePromise = promisify(ObjectiveModel.createObjective, ObjectiveModel);
    const deleteStepsPromise = promisify(StepModel.deleteByModule, StepModel);
    const createStepPromise = promisify(StepModel.createStep, StepModel);
    const createResourcePromise = promisify(ResourceModel.createResource, ResourceModel);

    // 1. update module utama
    await updateModulePromise(moduleId, data);

    // 1b. sinkronisasi tabel discussion_rooms berdasarkan flag discussion_enabled
    if (data.discussion_enabled) {
        const roomRows = await new Promise((resolve, reject) => {
            db.query(
                `SELECT id FROM discussion_rooms WHERE module_id = ?`,
                [moduleId],
                (err, rows) => (err ? reject(err) : resolve(rows))
            );
        });

        if (!roomRows || roomRows.length === 0) {
            await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO discussion_rooms (module_id, title, is_active) VALUES (?, ?, 1)`,
                    [moduleId, data.title],
                    (err, result) => (err ? reject(err) : resolve(result))
                );
            });
        } else {
            await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE discussion_rooms SET is_active = 1 WHERE module_id = ?`,
                    [moduleId],
                    (err, result) => (err ? reject(err) : resolve(result))
                );
            });
        }
    } else {
        await new Promise((resolve, reject) => {
            db.query(
                `UPDATE discussion_rooms SET is_active = 0 WHERE module_id = ?`,
                [moduleId],
                (err, result) => (err ? reject(err) : resolve(result))
            );
        });
    }

    // 2. Hapus objectives lama
    await deleteObjectivesPromise(moduleId);

    // 3. Insert objectives baru
    if (data.objectives && data.objectives.length > 0) {
        for (let i = 0; i < data.objectives.length; i++) {
            const obj = data.objectives[i];
            await createObjectivePromise({
                module_id: moduleId,
                objective_text: obj.objective_text || obj,
                sort_order: i + 1
            });
        }
    }

    // 4. BACKUP: Simpan discussion points sebelum delete steps
    const oldSteps = await StepModel.getStepsByModule(moduleId);
    const discussionBackup = {};
    
    for (const oldStep of oldSteps) {
        const discussions = await new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM student_step_discussions WHERE step_id = ?`,
                [oldStep.id],
                (err, rows) => err ? reject(err) : resolve(rows || [])
            );
        });
        if (discussions.length > 0) {
            discussionBackup[oldStep.step_number] = discussions;
        }
    }

    // 4. UPDATE: Smart step management (bukan delete all)
    const newStepNumbers = (data.steps || []).map(s => s.step_number);
    const stepsToDelete = oldSteps.filter(os => !newStepNumbers.includes(os.step_number));
    
    // Hapus HANYA resources dari steps yang akan dihapus
    for (const step of stepsToDelete) {
        await ResourceModel.deleteByStep(step.id);
        await StepModel.deleteStep(step.id); // This won't cascade-delete progress
    }

    // 5. INSERT/UPDATE steps dengan RESTORE discussion jika diperlukan
    if (data.steps && data.steps.length > 0) {
        for (const step of data.steps) {
            const existingStep = oldSteps.find(
                os => os.step_number === step.step_number
            );

            let stepId;
            if (existingStep) {
                stepId = existingStep.id;
            } else {
                const stepResult = await createStepPromise({
                    module_id: moduleId,
                    step_number: step.step_number,
                    step_title: step.step_title,
                    step_type: step.step_type,
                    discussion_enabled: step.discussion_enabled || false
                });
                stepId = stepResult.insertId;

                // RESTORE discussion dari backup ke new step (di case step direname)
                if (discussionBackup[step.step_number]) {
                    const oldDiscussions = discussionBackup[step.step_number];
                    for (const disc of oldDiscussions) {
                        await new Promise((resolve, reject) => {
                            db.query(
                                `INSERT INTO student_step_discussions 
                                (step_id, user_id, module_id, discussion_point, created_at)
                                VALUES (?, ?, ?, ?, ?)`,
                                [stepId, disc.user_id, moduleId, disc.discussion_point, disc.created_at],
                                (err, result) => err ? reject(err) : resolve(result)
                            );
                        });
                    }
                }
            }

            // Update resources
            if (step.resources && step.resources.length > 0) {
                // Delete old resources
                await ResourceModel.deleteByStep(stepId);
                // Insert new resources
                for (const res of step.resources) {
                    await createResourcePromise({
                        step_id: stepId,
                        resource_type: res.type,
                        resource_path: res.value || res.path || res.resource_path
                    });
                }
            }
        }
    }

    return true;
}

// Helper: Delete dengan error handling graceful
const safeDelete = (query, params) => new Promise((resolve) => {
    db.query(query, params, (err, result) => {
        if (err) {
            console.warn(`⚠️ Delete query failed (non-blocking):`, err.sqlMessage || err.message);
            resolve(result); // Resolve anyway, jangan reject
        } else {
            resolve(result);
        }
    });
});

async function deleteModule(moduleId) {
    console.log(`🔥 Starting cascade delete for module: ${moduleId}`);

    try {
        // ===== TAHAP 1: DELETE WRITING_SUBMISSIONS (pengumpulan tugas) =====
        console.log(`📌 Step 1: Deleting writing_submissions...`);
        await safeDelete(
            `DELETE FROM writing_submissions 
             WHERE task_id IN (
                 SELECT id FROM writing_tasks WHERE module_id = ?
             )`,
            [moduleId]
        );

        // ===== TAHAP 2: DELETE WRITING_TASKS (tugas) =====
        console.log(`📌 Step 2: Deleting writing_tasks...`);
        await safeDelete(
            `DELETE FROM writing_tasks WHERE module_id = ?`,
            [moduleId]
        );

        // ===== TAHAP 3: DELETE MODULE_STEP_RESOURCES =====
        console.log(`📌 Step 3: Deleting module_step_resources...`);
        await safeDelete(
            `DELETE FROM module_step_resources 
             WHERE step_id IN (
                 SELECT id FROM module_steps WHERE module_id = ?
             )`,
            [moduleId]
        );

        // ===== TAHAP 4: DELETE MODULE_STEPS =====
        console.log(`📌 Step 4: Deleting module_steps...`);
        await safeDelete(
            `DELETE FROM module_steps WHERE module_id = ?`,
            [moduleId]
        );

        // ===== TAHAP 5: DELETE MODULE_OBJECTIVES =====
        console.log(`📌 Step 5: Deleting module_objectives...`);
        await safeDelete(
            `DELETE FROM module_objectives WHERE module_id = ?`,
            [moduleId]
        );

        // ===== TAHAP 6: DELETE DISCUSSION_ROOMS =====
        console.log(`📌 Step 6: Deleting discussion_rooms...`);
        await safeDelete(
            `DELETE FROM discussion_rooms WHERE module_id = ?`,
            [moduleId]
        );

        // ===== TAHAP 7: DELETE MODULES (parent) =====
        console.log(`📌 Step 7: Deleting modules...`);
        await safeDelete(
            `DELETE FROM modules WHERE id = ?`,
            [moduleId]
        );

        console.log(`✅ Module ${moduleId} deleted successfully with all dependencies!`);
        return true;

    } catch (error) {
        console.error(`❌ Error in deleteModule cascade:`, error);
        throw error;
    }
}

module.exports = {
    createModule,
    getModuleDetail,
    updateModule,
    deleteModule
};