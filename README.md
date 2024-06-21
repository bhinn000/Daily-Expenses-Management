At first, if it doesn't open subfolder 'Combined' , then please go to folder " Daily Expenses Frontend".

In this app , you have to choose whether you want to create an account or log in . 
If you want to create then after submitting the form , you will move to dashboard you can only load money if you have loaded the balance which you can only do using Postman, in this format : 

{
  "name": "Sam",
  "bankBalance": [
    {
      "loadedAmount": 2500,
      "currentBalance": -2500 
    }
  ]
}

And also , remember that only the user having account in the main bank can register so to assume that, you have to do this before creating the account: 
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
