
const express=require("express")
const app=express()
const mongoose=require("mongoose")
const QRCode=require("qrcode")
require("./controllers/accountHolder")
const accountHolderDetails=require("./controllers/accountHolder") // this has confusion//userSchema
const accountActivityDetails=require("./controllers/accountActivity")//accountDetails ***
const trashAccountDetails=require("./controllers/trashUser")
const adminDetails=require("./controllers/admin")
const feedbackDetails=require("./controllers/feedback")
const receiverSchema=require("./controllers/receiverSchema")
const mainBankIDdetails=require("./controllers/mainBankID")
// const preSetting_model=require("./controllers/preSettings")
app.use(express.json())
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const util = require('util');
const fs = require('fs');
const path = require('path'); 
const accountHolder = require("./controllers/accountHolder")
// const axios=require("axios") 

const mongoUrl=
"mongodb+srv://020bim007:hello123@cluster0-nodejs.rrz0edi.mongodb.net/Combined?retryWrites=true&w=majority"

const JWT_SECRET="8f31a198011b9a0203262c0f278a40ec15a5b2f313cb191af4be3692c8c8686a"

//port number
app.listen(5001,()=>{
    console.log("NodeJS is running")
})

//routes and response
// to the root URL path
app.get('/',(req,res)=>{
    res.send({status:"Started"})
})




app.post('/register', async (req, res) => {
    const { name, email, phoneNumber, password, mainID } = req.body;
 
    try {
        // Check if the mainID exists in the mainBankIDdetails collection
        const haveMainBankId = await mainBankIDdetails.findOne({ mainBankId: mainID });
        if (!haveMainBankId) {
            return res.send({ status: "not ok", data: "You should have your account in GlobalIME Bank" });
        }

        // Check if the accountHolderDetails collection is empty
        const isAccountHolderDetailsEmpty = (await accountHolderDetails.countDocuments()) === 0;

        let uidMainID;
        if (!isAccountHolderDetailsEmpty) {
            // Generate the UID version of the mainID
            uidMainID = mainID.replace('MID', 'UID');

            // Check if the UID version of the mainID exists in the accountHolder collection
            // const oldUser = await accountHolder.findOne({ userId: uidMainID });
            const oldUser = await accountHolder.findOne({ name: name });
            if (oldUser) {
                return res.send({ status: "not ok", data: "User already existed" });
            }
        }

        // Encrypt the password
        const encryptedPwd = await bcrypt.hash(password, 10);

        // Create a new user in the database
        await accountHolderDetails.create({
            name: name,
            email: email,
            // userId:uidMainID,
            phoneNumber: phoneNumber,
            password: encryptedPwd,
            mainID: mainID
        });

        // Send the response with the new User ID
        res.send({ status: "ok", data: `User created, your User ID is ${uidMainID || mainID}` });
    } catch (error) {
        console.error(error);
        res.send({ status: "error", data: "An error occurred during registration" });
    }
});


app.post('/login',async(req,res)=>{
    const {name}=req.body
    console.log("Received login request with name:", name);
    try{
        const userExists=await accountHolderDetails.findOne({name:name})//backend:frontend
        // const userExists=await accountHolderDetails.findOne({name:'Ramun'})//backend:frontend
        if(!userExists){
            console.log("User not found:", name); 
            return res.send({status:"Not available" , data:"User doesn't exist"})
        }
        // Generate JWT token upon successful login
        const token = jwt.sign({ name: userExists.name }, JWT_SECRET);

        console.log("test token name" , token)
        console.log("User found:", name);
        return res.status(200).json({ status: "ok", token: token});
        // return res.status(200).json({ status: "ok", token: token , data:"User exists" });
        // return res.send({status:"ok" , data:"User exists"})
    }
    catch(err){
        console.log(err)
        return res.status(500).send({ error: "Internal server error" });
    }
})


// app.post('/login', async (req, res) => {
//     const { name, userId, password } = req.body;
//     console.log("Received login request with name:", name);

//     try {
//         // Find the user by name in the database
//         const user = await accountHolderDetails.findOne({ name: name });
//         if (!user) {
//             console.log("User not found:", name);
//             return res.status(404).json({ status: "error", message: "User not found" });
//         }

//         // Check if all provided data matches the stored data
//         if (user.userId !== userId || user.password !== password) {
//             console.log("Invalid credentials for user:", name);
//             return res.status(401).json({ status: "error", message: "Invalid credentials" });
//         }

//         // Generate JWT token upon successful login
//         const token = jwt.sign({ name: user.name }, JWT_SECRET);

//         console.log("User logged in:", name);
//         return res.status(200).json({ status: "ok", token: token });
//     } catch (err) {
//         console.error("Error during login:", err);
//         return res.status(500).json({ status: "error", message: "Internal server error" });
//     }
// });

// check this (suryam)
// app.post('/login', async (req, res) => {
//     const { name, userId, password } = req.body;
//     console.log("Received login request with name:", name);

//     try {
//         // Find the user by name in the database
//         const user = await accountHolderDetails.findOne({ name: name });
//         if (!user) {
//             console.log("User not found:", name);
//             return res.status(404).json({ status: "error", message: "User not found" });
//         }

//         // Check if all provided data matches the stored data
//         if (user.userId !== userId || user.password !== password) {
//             console.log("Invalid credentials for user:", name);
//             return res.status(401).json({ status: "error", message: "Invalid credentials" });
//         }

//         // Generate JWT token upon successful login
//         const token = jwt.sign({ name: user.name }, JWT_SECRET);

//         console.log("User logged in:", name);
//         return res.status(200).json({ status: "ok", token: token });
//     } catch (err) {
//         console.error("Error during login:", err);
//         return res.status(500).json({ status: "error", message: "Internal server error" });
//     }
// });


app.post('/userData',async(req,res)=>{
    //JSON Web Token is an open standard for securely transferring data within parties using a JSON object
    const {token}=req.body
    try{ 
        const user=jwt.verify(token,JWT_SECRET)
        const userName=user.name
        await accountActivityDetails.findOne({name:userName})
        .then((data)=>{
            // console.log("From userdata",data)
            return res.send({status:"ok" , data:data})
        })
        .catch(error => {
            return res.status(500).json({ status: "error", error: "Problem in fetching user data due to internal server error" });
        });
    }
    catch(error){
        return res.send({ status: "error", error: "Invalid token" });
    }
})
 


//for view transactions history
app.post('/viewTransactions',async(req,res)=>{
    const {token}=req.body
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if (!user) {
            return res.status(404).send({ status: "error", error: "User not found" });
        }

        //  // Sort transactions in descending order by date (assuming `payDate` is a Date object)
        //  const sortedTransactions = user.transactionHistory.sort((a, b) => new Date(b.payDate) - new Date(a.payDate));
        
        //  return res.send({ status: "success", data: sortedTransactions });

        return res.send({ status: "success", data: user.transactionHistory });

    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
})

app.post('/DrCrTransactions', async (req, res) => {
    const { token , selectedTransactionOption} = req.body;
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if (!user) {
            return res.status(404).send({ status: "error", error: "User not found" });
        }

        const debitTransactions = user.transactionHistory.filter(transaction => transaction.type === selectedTransactionOption)
        return res.send({ status: "success", data: debitTransactions });

    } catch (error) {
        console.error("Error verifying token or fetching transactions:", error);
        return res.status(500).send({ status: "error", error: error.message });
    }
});



app.post('/fieldTransactions' , async(req,res)=>{
    const { token , selectedFieldOption} = req.body;
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if (!user) {
            return res.status(404).send({ status: "error", error: "User not found" });
        }

        const debitTransactions = user.transactionHistory.filter(transaction => transaction.field === selectedFieldOption)
        return res.send({ status: "success", data: debitTransactions });

    } catch (error) {
        console.error("Error verifying token or fetching transactions:", error);
        return res.status(500).send({ status: "error", error: error.message });
    }
})



//to delete all bank Balance of all users
app.delete('/deleteAll',async(req,res)=>{
      await accountActivityDetails.deleteMany({}) //to delete all 
      res.status(200).send("All data of this collection has been deleted successfully")
    
  })

// connect to the database
mongoose.connect(mongoUrl).then(()=>{
    console.log("Database connected")
}).catch((e)=>{
    console.log(e)
})

app.post('/preSetting', async (req, res) => {
    const { token, budgets } = req.body;
    console.log(token)
    console.log(budgets)
    try {
       
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        // console.log(user)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Clear existing   
        user.preSettings = [];
        console.log(user.preSettings)
        budgets.forEach(budget => {
            user.preSettings.push(budget)
        });
        await user.save()
        console.log(user.preSettings)
        return res.status(200).json({ message: "Pre Settings info has been uploaded" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Pre Settings info could not be uploaded" });
    }

   
});

app.get('/preSetting', async (req, res) => {
    // const { token} = req.body;
    const token = req.headers.authorization.split(' ')[1];
    try {
       
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        // console.log(user)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user.preSettings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Pre Settings info could not be downloadeds" });
    }
});


app.post('/notificationSetting', async (req, res) => {
    const { token, notifications } = req.body;
    console.log(notifications)

    try {    
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        // console.log(user)
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

        notifications.forEach(notification => {
            user.notificationSettings.push(notification)
        });
        await user.save()
        return res.status(200).json({ message: "Payment Okay Settings info has been uploaded" });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Payment Okay info could not be uploaded" });
    }

   
});



    // calculate acc to the budget
    // check if it is enough
    // show how much remaining
    // connect to the database , search for presetting for diff category
    // check if the amount is not blank
    // main budget chai month ko ek choti dine hunxa na ki as the wholebudget updated tesko chai portion
    // show budget of each field as same as of wholeBudget
    // amount thyakai enough , not enough , ghatayepaxi min balance maintain hunxa ki nai 
    // update budget of both each field and whole Budget
    // you have to update the limit after expenses
    // amount should be changed in next case. the state should not hold it after tapping 'Okay'
    // after you pay 'expenses', the wholeBudget in the frontend also has to be updated
    // the field Budget should be only of those which had been first loaded for first time , it should only be changed when the totally new budget has been added
    // need two days payDate and loadedDate

// to pay , before that to check it is within limit acc to percent , before that calc the limit


app.post('/fieldDetails', async (req, res) => {
    const { token, selectedField } = req.body;
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log("++++++++");
        console.log(util.inspect(user, { depth: null, colors: true }));

        let wholeBudget = user.bankBalance[0].loadedAmount;
        let fieldLimit = null;

        if (user.transactionHistory.length > 0) {
            if (user.transactionHistory[0].payMonth == user.bankBalance[0].loadedMonth) {
                console.log("In this month, the first payment has already been done after money loaded for this month");

                const fieldDefined = user.bankBalance[0].fieldLimit.some(field => field.selectedField === selectedField);

                if (fieldDefined) {
                    const selectedFieldLimit = user.bankBalance[0].fieldLimit.find(fl => fl.selectedField === selectedField);
                    console.log("Test", selectedFieldLimit);
                    return res.send({ status: "ok", message: [selectedFieldLimit] });

                } else {
                    user.preSettings.forEach(preSetting => {
                        if (selectedField === preSetting.title) {
                            user.bankBalance[0].fieldLimit = user.bankBalance[0].fieldLimit.filter(fl => fl.selectedField !== selectedField);
                            fieldLimit = preSetting.budget / 100 * wholeBudget;
                            user.bankBalance[0].fieldLimit.push({
                                selectedField,
                                amount: fieldLimit
                            });

                            console.log("FieldLimit first=>", user.bankBalance[0].fieldLimit);
                            return res.send({ status: "ok", message: user.bankBalance[0].fieldLimit.filter(fl => fl.selectedField === selectedField) });
                        }
                    });
                }
            } else if (user.transactionHistory[0].payMonth > user.bankBalance[0].loadedMonth) {
                console.log("You need to load at first to pay for that month because payMonth is greater than loaded Month");
                return res.send({ status: "not ok", message: "Not possible" });
            } else {
                user.preSettings.forEach(preSetting => {
                    if (selectedField === preSetting.title) {
                        fieldLimit = preSetting.budget / 100 * wholeBudget;
                        user.bankBalance[0].fieldLimit.push({
                            selectedField,
                            amount: fieldLimit
                        });
                        console.log("FieldLimit first=>", user.bankBalance[0].fieldLimit);
                        return res.send({ status: "ok", message: user.bankBalance[0].fieldLimit.filter(fl => fl.selectedField === selectedField) });
                    }
                });
            }
        } else {
            user.preSettings.forEach(preSetting => {
                if (selectedField === preSetting.title) {
                    fieldLimit = preSetting.budget / 100 * wholeBudget;
                    user.bankBalance[0].fieldLimit.push({
                        selectedField,
                        amount: fieldLimit
                    });
                    console.log("FieldLimit first=>", user.bankBalance[0].fieldLimit);
                    return res.send({ status: "ok", message: user.bankBalance[0].fieldLimit.filter(fl => fl.selectedField === selectedField) });
                }
            });
        }
        await user.save();
    } catch (err) {
        console.log(err);
    }
});

app.post('/payOkay', async (req, res) => {
    const { token, amount, selectedField, receiverID } = req.body;
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log("selectedField", selectedField);

        const selectedFieldData = user.bankBalance[0].fieldLimit.find(item => item.selectedField === selectedField);
        if (selectedFieldData.amount < amount) {
            return res.send({ status: "not ok", message: "You don't have that much balance for this field" });
        } else if (user.bankBalance[0].fieldLimit - amount < 10) {
            return res.send({ status: "not ok", message: "Minimum balance to maintain is Rs. 10" });
        } else {
            selectedFieldData.amount -= amount;
            user.bankBalance[0].currentBalance -= amount;

            const newTransaction = {
                currentBalance: user.bankBalance[0].currentBalance,
                payDate: new Date(Date.now() + (5.75 * 60 * 60 * 1000)),
                type: 'debit',
                amount: amount,
                field: selectedField
            };
            user.transactionHistory.push(newTransaction);

            user.transactionHistory.sort((a, b) => {
                const dateA = new Date(a.payDate);
                const dateB = new Date(b.payDate);
                return dateB - dateA;
            });

            await user.save();
            const receiver = await receiverSchema.findOne({ receiverID: receiverID });
            if (!receiver) {
                return res.status(404).json({ status: "not ok", message: "Receiver not found" });
            }
            await receiver.save();

            return res.send({
                status: "ok",
                message: "Payment Successful",
                currentBalance: user.bankBalance[0].currentBalance,
                fieldLimit: selectedFieldData.amount
            });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

app.post('/fieldDetails1', async(req,res)=>{   
    const {token, selectedField}= req.body
    try{
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }
        // console.log(user)
        console.log("++++++++")
        console.log(util.inspect(user, { depth: null, colors: true }));

        let wholeBudget=user.bankBalance[0].loadedAmount
        let fieldLimit = null;  
        
        
        // user.transactionHistory[0].payMonth=4//random
        //check if itis in descending order or not
        if(user.transactionHistory.length>0)            
            {            
                if(user.transactionHistory[0].payMonth == user.bankBalance[0].loadedMonth) {
                    console.log(util.inspect(user, { depth: null, colors: true }));
                    console.log("In this month, the first payment has already been done after money loaded for this month");
  

                    const fieldDefined = user.bankBalance[0].fieldLimit.some(field => {
                        console.log("field.selectedField", field.selectedField);
                        return field.selectedField === selectedField;
                    });

                    if(fieldDefined) {

                        const selectedFieldLimit = user.bankBalance[0].fieldLimit.find(fl => fl.selectedField === selectedField);
                        console.log("Test", selectedFieldLimit)
                        return res.send({ status: "ok", message: selectedFieldLimit });

                    } else {
                        user.preSettings.forEach(preSetting=>{
                            if(selectedField===preSetting.title){
                                user.bankBalance[0].fieldLimit = user.bankBalance[0].fieldLimit.filter(fl => fl.selectedField !== selectedField);
                                fieldLimit = preSetting.budget / 100 * wholeBudget; 
                                user.bankBalance[0].fieldLimit.push({  
                                    selectedField,
                                    amount: fieldLimit
                                });
    
                                console.log("FieldLimit first=>" , user.bankBalance[0].fieldLimit)
                                return res.send({status:"ok" , message:user.bankBalance[0].fieldLimit})
    
                            }
                        }) 
         
                        console.log("FieldLimit calculated=>", user.bankBalance[0].fieldLimit);
                        return res.send({ status: "ok", message: user.bankBalance[0].fieldLimit });
                    }
                }
                else if(user.transactionHistory[0].payMonth >  user.bankBalance[0].loadedMonth){
                    console.log("Are you idiot? You need to load at first to pay for that month because payMonth" , user.transactionHistory[0].payMonth , "is greater than loaded Month", user.bankBalance[0].loadedMonth)
                    return res.send({status:"not ok" , message:"Not possible"})
                }
                else if(user.transactionHistory[0].payMonth < user.bankBalance[0].loadedMonth){
                    console.log("In this month, the first payment has yet to be done after money loaded for this month")
                    user.preSettings.forEach(preSetting=>{
                        if(selectedField===preSetting.title){
                            console.log(" Test preSetting.budget" , preSetting.budget)
                           
                            user.bankBalance[0].fieldLimit = user.bankBalance[0].fieldLimit.filter(fl => fl.selectedField !== selectedField);
                            fieldLimit = preSetting.budget / 100 * wholeBudget; 
                            user.bankBalance[0].fieldLimit.push({  
                                selectedField,
                                amount: fieldLimit
                            });

                          
                            console.log("FieldLimit first=>" , user.bankBalance[0].fieldLimit)
                            return res.send({status:"ok" , message:user.bankBalance[0].fieldLimit})

                        }
                    }) 
            }
            
            }
        else{
            user.preSettings.forEach(preSetting=>{
              
                if(selectedField===preSetting.title){
                   
                    user.bankBalance[0].fieldLimit = user.bankBalance[0].fieldLimit.filter(fl => fl.selectedField !== selectedField);
                    fieldLimit = preSetting.budget / 100 * wholeBudget; 
                    user.bankBalance[0].fieldLimit.push({  
                        selectedField,
                        amount: fieldLimit
                    });    
                    console.log("FieldLimit first=>" , user.bankBalance[0].fieldLimit)
              
                    console.log(util.inspect(user, { depth: null, colors: true }));
                    return res.send({status:"ok" , message:user.bankBalance[0].fieldLimit})


                }
            }) 
        }   
        await user.save();

      
    }
    catch(err){
        console.log(err)
    }
})




app.delete('/deleteReceiverData', async (req, res) => {
    try {
        const { receiverID } = req.body;

        // Validation to ensure receiverID is present
        if (!receiverID) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        // Delete the receiver from the database
        const deletedReceiver = await receiverSchema.findOneAndDelete({ receiverID });
        console.log(deletedReceiver)
        // If receiver not found
        if (!deletedReceiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Respond with the deleted receiver
        res.status(200).json({ message: 'Receiver deleted successfully', deletedReceiver });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}); 

app.delete('/deleteAllReceiverData', async (req, res) => {
    try {
        // Delete all receivers from the database
        const result = await receiverSchema.deleteMany({});
        console.log(result);

        // Respond with the result of the deletion
        res.status(200).json({ message: 'All receivers deleted successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/uploadReceiverData', async (req, res) => {
    try {
        const receivers = req.body;

        // Check if the request body is an array
        if (!Array.isArray(receivers)) {
            return res.status(400).json({ message: 'Data should be an array of receiver objects' });
        }

        const results = [];

        for (const receiverData of receivers) {
            const { name, receiverID, phoneNumber, balance, organisation} = receiverData;

            // Validation to ensure all fields are present
            if (!name || !receiverID || !phoneNumber || !balance || !organisation) {
                return res.status(400).json({ message: 'All fields are required for each receiver' });
            }

            // Ensure name contains both first and last name
            const nameParts = name.trim().split(' ');
            if (nameParts.length < 2) {
                return res.status(400).json({ message: 'Name must contain both first and last name' });
            }

            // Ensure phone number is a 10-digit number starting with 97 or 98
            const phonePattern = /^(98|97)\d{8}$/;
            if (!phonePattern.test(phoneNumber.toString())) {
                return res.status(400).json({ message: 'Phone number must be a 10-digit number starting with 97 or 98' });
            }

            // Check if receiverID already exists
            const existingReceiver = await receiverSchema.findOne({ receiverID });
            if (existingReceiver) {
                return res.status(400).json({ message: `Receiver ID ${receiverID} already exists` });
            }

            // Create a new receiver
            const newReceiver = new receiverSchema({
                name,
                receiverID, 
                phoneNumber,
                balance, 
                organisation
            });

            // Generate QR code for receiver data
            const receiverDataString = JSON.stringify({receiverID, phoneNumber});
            const qrCodeFilePath = path.join(__dirname, `qr_codes/${receiverID}.png`);

            await QRCode.toFile(qrCodeFilePath, receiverDataString); // Generate and save QR code image

            newReceiver.qrCode = qrCodeFilePath; // Save the path to the QR code image in the database

            // Save the receiver to the database
            const savedReceiver = await newReceiver.save();
            results.push(savedReceiver);
        }

        // Respond with the saved receivers
        res.status(201).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error',  error: error.message  });
    }
});





app.post('/removeAccount', async(req,res)=>{
    const {adminToken }=req.body
    try{
        const decodedToken = jwt.verify(adminToken, JWT_SECRET);
        const adminName = decodedToken.name;
        const admin= await accountActivityDetails.findOne({ name: adminName });
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
})



// Route for admin login
app.post('/adminLogin', async (req, res) => {
    const { adminId, password } = req.body;

    try {
        const admin = await adminDetails.findOne({ adminId });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        const passwordMatch=await bcrypt.hash(password,10)

        if (!passwordMatch) {
            return res.status(401).json({ error: "Incorrect Password" });
        }

        res.status(200).json({ message: "Login successful", admin });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });
    }
});

// Route to handle admin data upload
app.post('/uploadAdminData', async (req, res) => {
    try {
        const { name, adminId, password } = req.body;
        if (!name || !adminId || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingAdmin = await adminDetails.findOne({ adminId });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin ID already exists.' });
        }

        const admin = new adminDetails({
            name,
            adminId,
            password,
        });

        await admin.save();
        res.status(201).json({ message: 'Admin data uploaded successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});


app.post('/feedback', async (req, res) => {
    const { token, rating } = req.body;
    console.log(token)

    if (!rating) {
        return res.status(400).json({ error: 'Rating is required' });
    }

    try {
        // Decode the token to get the user's information
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
      
        // Update the account holder document with the provided rating
        await accountHolder.findOneAndUpdate(
            { name: userName }, // Find the account holder by name
            { $set: { rating: rating } }, // Update the rating field
            { new: true } // Return the updated document
        );

        return res.status(200).json({ status: 'ok', message: 'Rating submitted successfully' });
    } catch (err) {
        console.error('Error submitting rating:', err);
        return res.status(500).json({ status: 'error', error: err.message });
    }
});

app.get('/userRating', async (req, res) => {
    const { token } = req.body;

    try {
        // Decode the token to get the user's information
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
      
        // Find the account holder document by name
        const user = await accountHolder.findOne({ name: userName });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve the rating from the user document
        const rating = user.rating || 0; // If rating field is not present, default to 0

        return res.status(200).json({ status: 'ok', rating });
    } catch (err) {
        console.error('Error retrieving rating:', err);
        return res.status(500).json({ status: 'error', error: err.message });
    }
});




app.post('/deleteAccount', async (req, res) => {
    const {token}=req.body
    try{

        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

        // Create a new document in the trashAccountDetails collection
        const trashUser = new trashAccountDetails({
            name: user.name,
            bankBalance: user.bankBalance.map(balance => ({
                lastLoadedAmount: balance.loadedAmount,
                lastLoadedDate: balance.loadedDate,
                lastLoadedMonth: balance.loadedMonth,
            })),
            transactionHistory: user.transactionHistory.map(transaction => ({
                lastUpdatedBalance: transaction.currentBalance,
                payDate: transaction.payDate,
                payMonth: transaction.payMonth,
                type: transaction.type,
                amount: transaction.amount,
                field: transaction.field
            })),
            preSettings: user.preSettings,
            notificationSettings: user.notificationSettings
        });

        await trashUser.save();
        // Delete the user from the accountActivityDetails collection
        await accountActivityDetails.deleteOne({ name: userName });

        res.send({ status: 'ok', message: 'Account deleted and moved to trash' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: 'error', message: err.message }); 
    }
}); 

// app.post('/uploadMainBankID', async(req,res)=>{
//     const {mainBankId, paisa}=req.body
//     if (!mainBankId || !paisa) {
//         return res.status(400).json({ error: "Both fields are required." });
//       }
//     try{
//         const mainBank = new mainBankIDdetails({
//             mainBankId,
//             paisa
//         });

//         await mainBank.save();
//         res.status(201).json({ message: 'Main Bank ID uploaded successfully.' });
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// })


app.post('/uploadMainBankID', async (req, res) => {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: "Request body must be an array of objects." });
    }

    for (const item of data) {
        if (!item.mainBankId || !item.paisa) {
            return res.status(400).json({ error: "Each object must have 'mainBankId' and 'paisa' fields." });
        }
    }

    try {
        await mainBankIDdetails.insertMany(data);
        res.status(201).json({ message: 'Main Bank IDs uploaded successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});


//if you want to do from the button -but still wrong
// app.post('/loadBalance' , async(req,res)=>{
//     const { token, loadAmount } = req.body
//     try{
//         const decodedToken = jwt.verify(token, JWT_SECRET);
//         const mainID = decodedToken.mainID;
//         console.log(mainID)
//         const userName = decodedToken.name;
//         console.log(userName)// i still dont understand handleBudgetDataChange() and schema of preSettings and onChangeText , mood vayeko bela ma check
        
//         const user=await accountHolder.findOne({name:userName})
//         const client = await mainBankIDdetails.findOne({ mainID:mainID });
//         client.paisa-=loadAmount
//         await mainBankIDdetails.save()
//         // If the user exists, append new balance entries to the bankBalance array
//         user.bankBalance.push(...bankBalance);
//         user.bankBalance.sort((a,b)=>new Date(b.loadedDate) - new Date(a.loadedDate))
//         await user.save();
//         return res.status(200).json({ message: "Bank balance updated successfully", user });     
//     }
//     catch(err){
//         res.status(500).send({ status: 'error', message: err.message }); n
//     }
// })

// //upload bankBalance of all bank account holders' whose may or maynot have our digital wallet
// // to insert the bank balance of all database
app.post('/bankBalance', async (req, res) => {
    const { name, bankBalance } = req.body;
  
    if (!name || !bankBalance) {
      return res.status(400).json({ message: "UserID and bank balance are required." });
    }
   
    try {

      const userExists=await accountHolderDetails.findOne({ name});
      if(!userExists){
        return res.status(500).json({message: "User account has not been created"})
      }
      // Find the user by name
      const user = await accountActivityDetails.findOne({ name });
   
      if (user) {
        // If the user exists, append new balance entries to the bankBalance array`
        user.bankBalance.push(...bankBalance);
        user.bankBalance.sort((a,b)=>new Date(b.loadedDate) - new Date(a.loadedDate))
        await user.save();
        return res.status(200).json({ message: "Bank balance updated successfully", user });
      } else {
        // If the user does not exist, create a new user
        const newUser = new accountActivityDetails({name, bankBalance });
        await newUser.save();
        return res.status(201).json({ message: "New user created and data inserted successfully", user: newUser });
      }
    } catch (error) {
      console.error("Error inserting/updating data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

 

app.post('/viewSummary', async (req, res) => {
    const { token } = req.body;
    
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userName = decodedToken.name;
        const user = await accountActivityDetails.findOne({ name: userName });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Initialize an object to store the total expenses for each heading
        const totalExpenses = {};
        
        // Iterate through the user's transaction history
        user.transactionHistory.forEach(transaction => {
            // Check if the transaction field exists in the totalExpenses object
            if (!totalExpenses[transaction.field]) {
                // If not, initialize it to the transaction amount
                totalExpenses[transaction.field] = transaction.amount;
            } else {
                // If it exists, add the transaction amount to the existing total
                totalExpenses[transaction.field] += transaction.amount;
            }
        });

        // Calculate the total expenses across all headings
        const totalAllHeadings = Object.values(totalExpenses).reduce((acc, curr) => acc + curr, 0);

        // Calculate the percentage of expenses covered by each heading
        const expensesCoveredPercentage = {};
        Object.keys(totalExpenses).forEach(heading => {
            // Calculate the percentage
            const percentage = ((totalExpenses[heading] / totalAllHeadings) * 100).toFixed(2);
            expensesCoveredPercentage[heading] = percentage;
        });

        return res.json({ status: "success", data: { totalExpenses, totalAllHeadings, expensesCoveredPercentage } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

app.post('/adminDeleteUser', async (req, res) => {
    console.log("Hell")
    const { userName } = req.body;
    

    try {
        const user = await accountActivityDetails.findOne({ name: userName });
        console.log(user)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log(user)

        // Delete the user from the accountActivityDetails collection
        await accountActivityDetails.deleteOne({ name: userName });

        res.send({ status: 'ok', message: 'Account deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: 'error', message: err.message }); 
    }
});

app.post('/getUserDetails', async (req, res) => {
    const { userName } = req.body;

    try {
        const user = await accountHolder.findOne({ name: userName });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ status: 'ok', user });
    } catch (err) {
        console.error('Error fetching user details:', err.message);
        res.status(500).json({ status: 'error', message: err.message }); 
    }
});
