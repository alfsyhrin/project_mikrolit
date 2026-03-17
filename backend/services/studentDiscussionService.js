const DiscussionModel = require('../models/studentDiscussionModel');
const StepService = require('./learningService');
const ModuleStepModel = require('../models/StepModel');

exports.submitDiscussion = async (userId,moduleId,stepNumber,point)=>{

const step = await ModuleStepModel.getStepByNumber(moduleId,stepNumber);

if(!step){
throw new Error("Step tidak ditemukan");
}

await DiscussionModel.insertDiscussion(
userId,
moduleId,
step.id,
point
);

/* setelah diskusi dikirim step langsung selesai */

await StepService.completeStep(
userId,
moduleId,
stepNumber
);

return true;

};