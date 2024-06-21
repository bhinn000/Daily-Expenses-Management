upload this through postman: http://192.168.1.4:5001/uploadMainBankID

 [
    { "mainBankId": "0000-MBI-001", "paisa": 10000 },
    { "mainBankId": "0000-MBI-002", "paisa": 10000 },
    { "mainBankId": "0000-MBI-003", "paisa": 10000 },
    { "mainBankId": "0000-MBI-004", "paisa": 10000 },
    { "mainBankId": "0000-MBI-005", "paisa": 10000 },
    { "mainBankId": "0000-MBI-006", "paisa": 10000 },
    { "mainBankId": "0000-MBI-007", "paisa": 10000 },
    { "mainBankId": "0000-MBI-008", "paisa": 10000 },
    { "mainBankId": "0000-MBI-009", "paisa": 10000 },
    { "mainBankId": "0000-MBI-010", "paisa": 10000 }
]


then do register :
[
    from frontend
]

then do login: from frontend

then bankBalance from Postman with where the register name , login name should match 

then also add receiverID from postman