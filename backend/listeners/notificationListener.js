const eventBus = require("../events/eventBus");
const NotificationService = require("../services/notificationService");

eventBus.on("module_created", async (module) => {

    await NotificationService.createNotification({
        title: "Modul Baru",
        message: `Modul '${module.title}' telah tersedia`,
        type: "module",
        reference_id: module.id,
        reference_type: "module"
    });

});

eventBus.on("task_created", async (task) => {

    await NotificationService.createNotification({
        title: "Tugas Baru",
        message: `Tugas '${task.task_title}' telah tersedia`,
        type: "task",
        reference_id: task.id,
        reference_type: "task"
    });

});