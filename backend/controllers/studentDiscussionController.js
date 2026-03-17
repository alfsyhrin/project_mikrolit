const DiscussionService = require('../services/studentDiscussionService');

exports.submitDiscussion = async (req,res)=>{

try{

const userId = req.user.id;
const moduleId = req.params.moduleId;
const stepNumber = req.params.stepNumber;
const { discussion_point } = req.body;

if(!discussion_point){
return res.status(400).json({
success:false,
message:"Discussion point wajib diisi"
});
}

await DiscussionService.submitDiscussion(
userId,
moduleId,
stepNumber,
discussion_point
);

res.json({
success:true,
message:"Diskusi berhasil dikirim dan step selesai"
});

}catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};