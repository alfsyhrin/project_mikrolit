const MonitoringService = require("../services/monitoringService");
const authMiddleware = require("../middleware/authMiddleware");

exports.getStudentMonitoring = async (req, res) => {
  try {
    const data = await MonitoringService.getStudentMonitoring();

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDashboard = async (req,res)=>{

try{

const data = await MonitoringService.getModuleMonitoring();

res.json({
success:true,
data:data
});

}catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};

exports.getCompletedStudents = async (req, res) => {

try {

const moduleId = req.params.moduleId;

const data = await MonitoringService.getCompletedStudents(moduleId);

res.json({
success: true,
total: data.length,
data: data
});

} catch (err) {

res.status(500).json({
success: false,
message: err.message
});

}

};