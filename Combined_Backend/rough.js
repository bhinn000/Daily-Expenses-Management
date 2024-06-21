 import React, { useState, useEffect } from 'react';
        import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
        import { ScrollView } from 'react-native-gesture-handler';
        import AsyncStorage from '@react-native-async-storage/async-storage';
        import axios from 'axios';
        import { useNavigation } from '@react-navigation/native';
        
        function EditPreSettings() {
        
            const navigation=useNavigation()
            const [budgetData, setBudgetData] = useState({});
            const [cafe,setCafe] = useState("");
            const [cafeVerify, setCafeVerify]=useState(false)
            const [canteen,setCanteen] = useState("");
            const [canteenVerify, setCanteenVerify]=useState(false)
            const [showSubmit,setShowSubmit]=useState(false)
        
            const handleBudgetDataChange = (category, value) => {
            
                setBudgetData(prevState => ({
                    ...prevState,
                    // [category]: {budget:value} 
                    [category]: {
                        // ...(prevState[category] || {}), // Ensure category object exists
                        budget: value
                    }
                   
                   
                }));    
            };
        
        
            useEffect(() => {
                fetchPresettings();
            }, []); 
        
        
            const fetchPresettings = async () => {
                try {
                    const token = await AsyncStorage.getItem('token_name');
                    const response = await axios.get('http://192.168.1.4:5001/preSetting', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    // to check whether the preSettings has already been filled or not
        
                    console.log("response.data=>", response.data.length)
                    if (response.data.length === 0) {
                        setBudgetData({});
                        return;
                    }
        
                    const latestBudgetData = {};
                    // response.data.forEach(item=>console.log(item))
                    response.data.forEach(item => {
        
                       //to keep the last data only
                         if (!latestBudgetData[item.title] || latestBudgetData[item.title]._id < item._id) { 
                            latestBudgetData[item.title] = {
                                _id: item._id,
                                budget: item.budget.toString() 
                            };                    
                        }
                        
                    });
                    
                    setBudgetData(latestBudgetData);          
                    
                    
        
                } catch (error) {
                    console.error('Error fetching presettings:', error);
                }
            };
            
        
            //check if the textInput had been changed or not , is wrong , have to understand asynchronus features
            // function handleChange(category){
            //     setPlaceholderData(budgetData[category].budget)
            //     console.log(placeholderData)
            //     if(placeholderData!=nowData){
            //         showSubmit()
            //     }
            // }
            
        
            function handleCafe(cafeVar){
                setCafe(cafeVar)
                setCafeVerify(cafeVar.length>0 && cafeVar > 5)    
            }
        
            function handleCanteen(canteenVar){
                setCanteen(canteenVar)
                setCanteenVerify(canteenVar.length>0 && canteenVar > 3)
            }
        
            function handleSubmitVisibility(){
                setShowSubmit(true)
            }
        
        //     function handleSubmitVisibility() {
        //     if (cafeVerify && canteenVerify) {
        //         setShowSubmit(true);
        //     } else {
        //         setShowSubmit(false);
        //     }
        // }
        
        
           
            async function handleSubmit() {
                const budgetList = Object.keys(budgetData).map(category => ({
                    title: category,
                    budget: budgetData[category].budget
                }));
        
                    const token = await AsyncStorage.getItem('token_name');
                    console.log("TestToken", token)
        
                    const response = await axios.get('http://192.168.1.4:5001/preSetting', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                   
                    response.data.forEach(item=>console.log(item))
        
                    if(cafeVerify && canteenVerify){
                        await axios.post('http://192.168.1.4:5001/preSetting', { token, budgets: budgetList }, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                            .then(res => {
                                console.log(res.data)
                                console.log(res.data.message)
                                navigation.navigate("ViewPreSettings")
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                    }
                    else{
                        console.log("Frontend requirements has not been done")
                    }
        
                    // // k ko lagi rakheko ho yaad vayena: for edit the preSettings
                    //     // 2 case=> either khali sabai , kunai khali ra nakhali , sab khali
                    //     if (!latestBudgetData[item.title] || latestBudgetData[item.title]._id < item._id) { //item._id which has already been checked
                    //         latestBudgetData[item.title] = {
                    //             _id: item._id,
                    //             budget: item.budget.toString() // Convert budget to string
                    //         };
                            
                    //     }
                   
                
            }
        
                return (
                    <ScrollView>
                        <Text style={styles.text}>Fields and Rate</Text>
                        {[
                            "Restaurant/Cafe",
                            "Canteen",
                            // "Travel",
                            // "Stationary",
                            // "Clothes",
                            // "Medical",
                            // "Groceries",
                            // "Entertainment",
                            // "Cosmetics"
                        ].map(category => (
                            <ScrollView key={category} style={styles.container}>
                                <Text style={styles.category}>{category}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter budget"
                                    keyboardType="numeric"
                                    value={budgetData[category] ? budgetData[category].budget : ''}
                                    
                                    onChangeText={value =>
                                        {
                                            handleBudgetDataChange(category, value)    
                                            // console.log("budgetData[category].budget" , budgetData[category].budget)//this is creating problem
                                            handleSubmitVisibility()                    
                                        }
                                    
                                    }
        
                                    
                                    onBlur={() => {
        
                                        if (category === "Restaurant/Cafe") {
                                            handleCafe(budgetData[category].budget);
                                        } else if (category === "Canteen") {
                                            handleCanteen(budgetData[category].budget);
                                        }
                                      
                                    }}
                                />
        
                             
                            
                            </ScrollView>
                        ))}
                            {showSubmit &&(
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                            <Text style={styles.submitText}>Submit</Text>
                        </TouchableOpacity>
                        )} 
                       
                        
                    </ScrollView>
                );
                
        
        }
        const styles = StyleSheet.create({
            container: {
                marginBottom: 20,
            },
            category: {
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: '#023F88', 
            },
            input: {
                borderWidth: 1,
                borderColor: '#023F88', 
                paddingHorizontal: 10,
                paddingVertical: 8,
                width: '50%',
                color: '#023F88', 
                borderWidth:2
            },
            text:{
                fontFamily:"monospace",
                fontWeight:"1000",
                fontSize:18,
                marginBottom:30
            },
            submitBtn: {
                backgroundColor: '#023F88', // Elegant blue color
                padding: 10,
                borderRadius: 5,
                alignItems: 'center', // Center content horizontally
                marginTop: 10, 
                width:"30%"
            },
            submitText: {
                color: 'white', // White text color
                fontWeight: 'bold',
                fontSize: 16,
            }
            
        });
        
        export default EditPreSettings;

        // trashAccountDetails