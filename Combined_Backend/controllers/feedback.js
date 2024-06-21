const mongoose=require('mongoose')

const feedbackModel=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    feedback:{
        type:String,
        required:true,
    }
   
})

const feedback=mongoose.model('feedbackModel',feedbackModel)
module.exports=feedback