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

    // 2. hapus objectives lama
    await deleteObjectivesPromise(moduleId);

    // 3. insert objectives baru (jika ada)
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

    // 4. hapus semua steps lama
    await deleteStepsPromise(moduleId);

    // 5. insert steps baru
    if (data.steps && data.steps.length > 0) {
        for (const step of data.steps) {
            const stepResult = await createStepPromise({
                module_id: moduleId,
                step_number: step.step_number,
                step_title: step.step_title,
                step_type: step.step_type,
                discussion_enabled: step.discussion_enabled || false
            });
            const stepId = stepResult.insertId;

            // 6. insert resources (jika ada)
            if (step.resources && step.resources.length > 0) {
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

module.exports = {
    createModule,
    getModuleDetail,
    updateModule
};