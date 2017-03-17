// Call this via CLI with $ node app.js /PathTo/Your.csv
//var parse = require('csv-parse'),
var mongoose    = require("mongoose"),
    Transaction = require("./models/transaction.js"),
    Balance     = require("./models/balances"),
    Register    = require("./models/register"),
    Plan        = require("./models/plan"),
    fs          = require('fs'),
    config      = require('config'),
    tools       = require('./shared/tools'),
    parse       = require('csv-parse');

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

var url= database || "mongodb://localhost/fininfotest";
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
    // format account and Financial Institution so app can use it in a 
    // listbox
    var accountRef = item.account.replace(/\s/g, '_');
    var finInstRef = item.fi.replace(/\s/g, '_');
    // all amounts in the transactions are positive
    // to get the correct sign, must negate it, since debits and credits are the 
    // opposite of the sign for deposits and expenses. Income is negative and expenses are positive.
    // 
    var dolAmount = item.amount * (-1);
    var typeTrans = "credit";
    if (item.isDebit) {
      typeTrans = "debit";
    }

    var merchant = item.omerchant;
    if (item.isTransfer) {
      merchant = item.merchant
    }

    //
    //  Check to see if transaction was added by prior day's update
    //  All transactions before a date specified in the download are 
    //  sent and are included in the transactions.  These must be sorted out and not re-added
    //  to the database
    //

    // Check to see if already in the database
    Transaction.count({"date": refDate, 
      "merchant": merchant, 
      "amount": dolAmount,
      "transaction_type": typeTrans}, function(err, numFound) {

        if (numFound === 0) {
          //  transaction was not in the database, so add to it
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
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date();
  if (jsonContent) {
    console.log("starting Balances update" );
    jsonContent.forEach( function(item) {
      if (item.currentBalance != 0){
        Balance.findOne({accountId: item.accountId, month: monthNames[today.getMonth()], year: today.getFullYear()}, function(err, updated) {
        if (err) {
          console.log("Error updating Balances  " + err);
          throw err
        }
        if (updated != null){
          tools.updateBalances(updated, item);
          /*
          updated.currentBalance = item.currentBalance;
          updated.accountName = item.accountName;
          updated.fiName = item.fiName;
          updated.accountType = item.accountType;
          updated.dueDate = item.dueDate;
          updated.dueAmt = item.dueAmt;
          updated.save();
          */
          balUpdated = balUpdated + 1;
          } else {  
            tools.addNewBalance(item, today);
            /*
            if (updated === null) {     
              balance = Balance({
                year: today.getFullYear(),
                month: monthNames[today.getMonth()],
                fiName: item.fiName,
                accountName: item.accountName,
                accountId: item.accountId,
                currentBalance: item.currentBalance,
                startingBalance: item.currentBalance,
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
                };*/
              };                    
            });
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
  var today = new Date()
  var fullDate = new Date(planItem.date.getFullYear(), today.getMonth()+2, planItem.date.getDate())
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
      tools.addNewRegister(newRegister);
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
                merchant: planItem.merchant,
                amount: planItem.amount,
                accountName: planItem.accountName,
                memo: planItem.memo,
                reconciled: {status: "No"}
                }   
    Register.find(newRegister).exec(function(err, foundReg) {
      if (!foundReg.length) {
        Register.create(newRegister, function(err, newReg) {
        if (err) {
          console.log("create error for " + planItem.merchant)
          } else {
            newReg.reconciled.id = 0,
            newReg.reconciled.status = "No",
            newReg.reconciled.date = "" ,
            newReg.reconciled.merchant = "",
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