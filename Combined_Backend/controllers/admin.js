const mongoose=require('mongoose')

const adminModel=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    adminId:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        requied:true
    }
})

const adminAccount=mongoose.model('adminModel',adminModel)
module.exports=adminAccount 