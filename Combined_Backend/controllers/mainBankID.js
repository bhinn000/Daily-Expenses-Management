//done through postman
const mongoose=require('mongoose')

const mainBankIDSchema=new mongoose.Schema({
    mainBankId:{
        type:String,
        required:true,
    },
    paisa:{
        type:String,
        required:true,
    }
  
})

const mainBankID=mongoose.model('mainBankIDSchema',mainBankIDSchema)
module.exports=mainBankID