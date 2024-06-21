const mongoose=require("mongoose")
const trashAccountSchema=new mongoose.Schema({
    name:{
        type:String,
        
    },
    bankBalance:[
        {
            lastLoadedAmount:{
                type:Number
            },
            lastLoadedDate:{
                
                    type: Date,
                    default: () => new Date(Date.now() + (5.75 * 60 * 60 * 1000))    
            },
            lastLoadedMonth:{
                type: Number,
                default: () => new Date().getMonth() + 1 
                
            },
         
           
        }
           
    ],
    
    transactionHistory:[
        {
            lastUpdatedBalance: {
                type:Number,
                // required:true
            },
            payDate:{
                type:Date,
                required:true,
                default:() => new Date(Date.now() + (5.75 * 60 * 60 * 1000))
            },
            payMonth:{
                type: Number,
                default: () => new Date().getMonth() + 1 
                
            },
            type:{
                type:String,
                enum:['credit' , 'debit'],
                required:true
            },
           amount:{
                type:Number,
                required:true
            },
            field:{
                type:String
            }
        }
    ],
    preSettings:[
        {
            title:{
                type:String,
                required:true,
            },
            budget:{
                type:Number,
                required:true,
            }
        
        }
    ],

}) 

const trashAccount=mongoose.model("trashAccountSchema" , trashAccountSchema)
module.exports=trashAccount
