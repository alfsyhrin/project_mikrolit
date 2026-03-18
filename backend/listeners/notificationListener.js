const eventBus = require("../events/eventBus");
const NotificationService = require("../services/notificationService");
const TeacherNotificationService = require("../services/TeacherNotificationService");
const Writing = require("../models/Writing");
const UserModel = require("../models/UserModel");

// ============ NOTIFIKASI MAHASISWA ============

eventBus.on("module_created", async (module) => {
  try {
    await NotificationService.createNotification({
      title: "Modul Baru",
      message: `Modul '${module.title}' telah tersedia`,
      type: "module",
      reference_id: module.id,
      reference_type: "module"
    });
  } catch (error) {
    console.error("Error creating module notification:", error);
  }
});

eventBus.on("task_created", async (task) => {
  try {
    await NotificationService.createNotification({
      title: "Tugas Baru",
      message: `Tugas '${task.task_title}' telah tersedia`,
      type: "task",
      reference_id: task.id,
      reference_type: "task"
    });
  } catch (error) {
    console.error("Error creating task notification:", error);
  }
});

// ============ NOTIFIKASI DOSEN ============

// 1. Mahasiswa mengumpulkan tugas
eventBus.on("task_submitted", async (submission) => {
  try {
    // Gunakan promise-based untuk konsistensi
    const task = await new Promise((resolve, reject) => {
      Writing.getTaskById(submission.task_id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!task) {
      console.warn("Task not found for submission:", submission.task_id);
      return;
    }

    const student = await new Promise((resolve, reject) => {
      UserModel.findById(submission.student_id, (err, results) => {
        if (err) reject(err);
        else resolve(results ? results[0] : null);
      });
    });

    if (!student) {
      console.warn("Student not found for submission:", submission.student_id);
      return;
    }

    await TeacherNotificationService.createTeacherNotification({
      student_id: submission.student_id,
      title: "Pengumpulan Tugas",
      message: `${student.name} telah mengumpulkan tugas '${task.task_title}'`,
      type: "task_submitted",
      reference_id: submission.id,
      reference_type: "task"
    });

    console.log("Teacher notification created for task submission");
  } catch (error) {
    console.error("Error in task_submitted listener:", error);
  }
});

// 2. Mahasiswa menyelesaikan modul
eventBus.on("module_completed", async (progress) => {
  try {
    const student = await new Promise((resolve, reject) => {
      UserModel.findById(progress.student_id, (err, results) => {
        if (err) reject(err);
        else resolve(results ? results[0] : null);
      });
    });

    if (!student) {
      console.warn("Student not found for module completion:", progress.student_id);
      return;
    }

    await TeacherNotificationService.createTeacherNotification({
      student_id: progress.student_id,
      title: "Penyelesaian Modul",
      message: `${student.name} telah menyelesaikan modul`,
      type: "module_completed",
      reference_id: progress.module_id,
      reference_type: "module"
    });

    console.log("Teacher notification created for module completion");
  } catch (error) {
    console.error("Error in module_completed listener:", error);
  }
});

// 3. Mahasiswa kirim pesan diskusi
eventBus.on("discussion_message_sent", async (message) => {
  try {
    const student = await new Promise((resolve, reject) => {
      UserModel.findById(message.student_id, (err, results) => {
        if (err) reject(err);
        else resolve(results ? results[0] : null);
      });
    });

    if (!student) {
      console.warn("Student not found for discussion message:", message.student_id);
      return;
    }

    await TeacherNotificationService.createTeacherNotification({
      student_id: message.student_id,
      title: "Pesan Diskusi Baru",
      message: `${student.name} mengirim pesan di forum diskusi`,
      type: "message_sent",
      reference_id: message.room_id,
      reference_type: "discussion"
    });

    console.log("Teacher notification created for discussion message");
  } catch (error) {
    console.error("Error in discussion_message_sent listener:", error);
  }
});

// 4. Mahasiswa baru mendaftar / status pending
eventBus.on("user_registered", async (user) => {
  try {
    if (user.role === "mahasiswa") {
      await TeacherNotificationService.createTeacherNotification({
        student_id: user.id,
        title: user.status === "pending" ? "Pendaftaran Mahasiswa Baru" : "Mahasiswa Berstatus Pending",
        message: `${user.name} (${user.email}) berstatus ${user.status}`,
        type: "student_registered",
        reference_id: user.id,
        reference_type: "student"
      });

      console.log("Teacher notification created for user registration");
    }
  } catch (error) {
    console.error("Error in user_registered listener:", error);
  }
});