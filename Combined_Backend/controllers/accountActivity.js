const mongoose=require("mongoose")
const accountActivitySchema=new mongoose.Schema({
    name:{
        type:String,
        unique: true
    },
    bankBalance:[
        {
            loadedAmount:{
                type:Number
            },
            loadedDate:{
                
                    type: Date,
                    default: () => new Date(Date.now() + (5.75 * 60 * 60 * 1000))    
            },
            currentBalance:{
                type:Number
            },
            loadedMonth:{
                type: Number,
                default: () => new Date().getMonth() + 1 
                
            },
            fieldLimit:[
                {
                selectedField:{
                    type:String
                },
                amount:{
                    type:Number
                }

            }
        ]
        }
           
    ],
    
    transactionHistory:[
        {
            currentBalance: {
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
    notificationSettings:[
        {
            title:{
                type:String,
                required:true,
            },
            date:{
                type:String,
                required:true
            }
        }
    ]
}) 

const accountActivity=mongoose.model(" accountActivitySchema" , accountActivitySchema)
module.exports=accountActivity
