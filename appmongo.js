// Call this via CLI with $ node app.js /PathTo/Your.csv
//var parse = require('csv-parse'),
var mongoose    = require("mongoose"),
    Transaction = require("./models/transaction.js"),
    Balance     = require("./models/balances"),
    Register    = require("./models/register"),
    Plan        = require("./models/plan"),
    fs          = require('fs'),
    config      = require('config');
    parse       = require('csv-parse');
//    passport    = require("passport"),
//    LocalStrategy = require("passport-local"),
    
//var mysql = require("mysql");
var parmsPath = "./parms.json";
var parmsContent = "";
var filePathTrans = config.get('transPath');
var filePathBal = config.get('balancePath');;
var database = config.get('database');

var numAdded = 0;
var newFlag = 0;
var oldFlag = 0;
var today = new Date();
var balCount = 0;
var balUpdated = 0;
var regCount = 0;

//var url= process.env.DATABASEURL || "mongodb://localhost/TestDB";
var url= database || "mongodb://localhost/TestDB";
var db = mongoose.connect(url);

fs.readFile(filePathTrans, function (err, data) { // Read the contents of the file
  if (err) throw err;
  var jsonContent = JSON.parse(data)
  console.log("starting Transactions update");
  jsonContent.forEach( function(item) {
    //
    //  Use date from the odate entry, but date seems to be one day short
    //  of transaction date.  Add one day to the date to correct.
    //
    var refDate = new Date(item.odate+86400000)
    //console.log(refDate)
    var accountRef = item.account.replace(/\s/g, '_');
    var finInstRef = item.fi.replace(/\s/g, '_');
    var dolAmount = item.amount * (-1);
    var typeTrans = "credit";
    if (item.isDebit) {
      //dolAmount = dolAmount * (-1);
      typeTrans = "debit";
    }

    var merchant = item.omerchant;
    if (item.isTransfer) {
      merchant = item.merchant
    }

    // If this is a credit transaction, reverse account and merchant
    /*
    var hold
    if (!item.isDebit && item.amount > 0) {
      console.log("before acct - "+ accountRef + "  merchant - " + merchant);
      hold = item.account;
      accountRef = merchant.replace(/\s/g, '_');
      merchant = hold;
      console.log("after - acct - "+ accountRef + "  merchant - " + merchant);
    }
    */

    //console.log("date - " + refDate);
    Transaction.count({"date": refDate, 
      "merchant": merchant, 
      "amount": dolAmount,
      "transaction_type": typeTrans}, function(err, numFound) {
        //console.log("refDate - " +  refDate);
        
        if (numFound === 0) {
          transaction = Transaction({
            date: refDate,
            merchant: merchant,
            amount: dolAmount,
            transaction_type: typeTrans,
            category: item.category,
            accountName: accountRef,
            institution: finInstRef,
            reconciled:{status: "No"},
            plan_id: ""           
            });
          //console.log("date - " + transaction.date);
          transaction.save(function(err) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                numAdded = numAdded + 1;
                };
            });
          } 
    });
  });
});

fs.readFile(filePathBal, function (err, data) { // Read the contents of the file   
  if (err) throw err
  var jsonContent = JSON.parse(data)
  if (jsonContent) {
    console.log("starting Balances update" );
    jsonContent.forEach( function(item) {
      if (item.currentBalance != 0){
        Balance.findOne({accountId: item.accountId}, function(err, updated) {
        if (err) {
          console.log("Error updating Balances  " + err);
          throw err
        }
        if (updated != null){
          updated.currentBalance = item.currentBalance;
          updated.accountName = item.accountName;
          updated.fiName = item.fiName;
          updated.accountType = item.accountType;
          updated.dueDate = item.dueDate;
          updated.dueAmt = item.dueAmt;
          updated.save();
          balUpdated = balUpdated + 1;
          } else {  
            if (updated === null) {     
              balCount = balCount + 1;
              balance = Balance({
                fiName: item.fiName,
                accountName: item.accountName,
                accountId: item.accountId,
                currentBalance: item.currentBalance,
                accountType: item.accountType,
                dueDate: item.dueDate,
                dueAmt: item.dueAmt
                });
              balance.save(function(err) {
                if (err) {
                  console.log(err);
                  throw err;
                } else {
                  numAdded = numAdded + 1;
                };
              });                    
            };
          } 
        });
      };    
         
    });
  }
});

Plan.find().exec(function(err, plans) {
    
  var date = new Date();
  
  plans.forEach(function(planItem) {
    if (checkIfDue(planItem)) {
      updateRegister(planItem);
    };
  });
});

function updateRegister(planItem) {
  var fullDate = new Date(planItem.date.getFullYear(), planItem.date.getMonth(), 1)
  var newRegister =   {date: fullDate,
              merchant: planItem.merchant,
              amount: planItem.amount,
              accountName: planItem.accountName,
              institution: planItem.institution,
              memo: planItem.memo,
              reconciled: {status: "No"}
              }   
  Register.find(newRegister).exec(function(err, foundReg) {
    if (!foundReg.length) {
      Register.create(newRegister, function(err, newReg) {
      if (err) {
        console.log("create error for " + planItem.description)
        } else {
          newReg.reconciled.id = 0,
          newReg.reconciled.status = "No",
          newReg.reconciled.date = "" ,
          newReg.reconciled.merchant = "",
          newReg.reconciled.amount =  0,
          newReg.reconciled.institution = "",
          newReg.reconciled.transaction_type =  "",
          newReg.reconciled.dateTo =  "",
          newReg.save();
          regCount = regCount + 1;
        };
      });
    };
  });
}


function checkIfDue(planData) {
  //console.log("enter date check");
  
  var today = new Date().toISOString();
  var untilDate = planData.untilDate.toISOString();
  var planDate = planData.date.toISOString();


  //console.log("year - " + untilDate.substring(0,4) + "  Month - " + untilDate.substring(5,7) + "  Day - " + untilDate.substring(8,10));

  var untilYear = untilDate.substring(0,4);
  var untilMonth = untilDate.substring(5,7);
  var untilDay = untilDate.substring(8,10);

  var planYear = planDate.substring(0,4);
  var planMonth = planDate.substring(5,7);
  var planDay = planDate.substring(8,10);

  var todayYear = today.substring(0,4);
  var todayMonth = today.substring(5,7);
  var todayDay = today.substring(8,10);
  
   // Check to see if plan expired
  if (today > untilDate ) {
    return false
  }

  if (planData.frequency === 'Once' || planData.frequency === 'Monthly') {  
    if (planMonth === todayMonth && planYear === todayYear) { 
        if (planMonth === todayMonth && planYear === todayYear) {
            return true;
        } else if (planMonth < todayMonth && planYear > todayYear) {
            return true;
        } else
          return false;
      }
    };

  if (planData.frequency === 'Quarterly' ) {  
    var chkForQtr =monthDiff(planData.date, today) % 3
    if (chkForQtr === 0) {
        return true;
    };
      return false;
  };
};

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

setTimeout(function() {
  db.disconnect(function(err) {
    if (err) {
        console.log("error closing connection " + err);
    }
  });
  
  console.log("Transaction records added - " + numAdded);
  console.log( "Balance records added - " + balCount);
  console.log( "Balance records updated - " + balUpdated);
  console.log("Register records added - " + regCount);
  console.log("Database closed");
  }, 20000);

/*
Plan.find().exec(function(err, plans) {
    
  var date = new Date();
  
  plans.forEach(function(planItem) {
    var incrMonth = 1,
        incrYear = 0;
    //console.log("getDate - " + date.getDate() + "  dayOfMonth is " + planItem.dayOfMonth);
    if (date.getDate() < planItem.dayOfMonth) {
      incrMonth = 0;
      }
    if (date.getMonth === 12 && incrMonth === 1) {
      incrYear = 1
      }
    //console.log("incrMonth = " + incrMonth)
    var fullDate = new Date(date.getFullYear() + incrYear, (date.getMonth() + incrMonth), planItem.dayOfMonth)
    var newRegister =   {date: fullDate,
                description: planItem.description,
                amount: planItem.amount,
                accountName: planItem.accountName,
                memo: planItem.memo,
                reconciled: {status: "No"}
                }   
    Register.find(newRegister).exec(function(err, foundReg) {
      if (!foundReg.length) {
        Register.create(newRegister, function(err, newReg) {
        if (err) {
          console.log("create error for " + planItem.description)
          } else {
            newReg.reconciled.id = 0,
            newReg.reconciled.status = "No",
            newReg.reconciled.date = "" ,
            newReg.reconciled.description = "",
            newReg.reconciled.amount =  0,
            newReg.reconciled.transaction_type =  "",
            newReg.reconciled.dateTo =  "",
            newReg.save();
          };
        })
      };
    });
  });
});

function getTransMonth(monthName){
  return new Date(monthName+'-1-01').getMonth()
}
*/