const mongoose=require("mongoose")
const receiverSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    receiverID:{
        type:String, 
        required:true,
        unique: true 
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    balance:{
        type:Number,
        required:true
    },
    organisation:{
        type:String,
        required:true
    },
    qrCode: {
        type: String,
        required: true,
    }
})

const receiverModel=mongoose.model("receiverSchema", receiverSchema)
module.exports= receiverModel 