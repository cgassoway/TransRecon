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
var filePathJSON = config.get('balancePath');;
var database = config.get('database');

var numAdded = 0;
var newFlag = 0;
var oldFlag = 0;
var today = new Date();


//var url= process.env.DATABASEURL || "mongodb://localhost/TestDB";
var url= database || "mongodb://localhost/TestDB";
var db = mongoose.connect(url);

                  

fs.readFile(filePathTrans, function (err, data) { // Read the contents of the file
    if (err) throw err;
    var jsonContent = JSON.parse(data)
    console.log("starting Transactions update");
    jsonContent.forEach( function(item) {
        //console.log("date - " + item.date + "ref Date - " + today.getFullYear() + "/" + item.date.substr(0,3) + "/" + item.date.substr(4,2))
        //var refDate = new Date(today.getFullYear(), getTransMonth(item.date.substr(0,3)), item.date.substr(4,2))
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
        //console.log("date - " + refDate);
        Transaction.count({"date": refDate, 
            "description": item.merchant, 
            "original_description": item.omerchant,
            "amount": dolAmount,
            "transaction_type": typeTrans}, function(err, numFound) {
                //console.log("refDate - " +  refDate);
                
                if (numFound === 0) {
                    transaction = Transaction({
                        date: refDate,
                        description: item.merchant,
                        original_description: item.omerchant,
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
                    } /*else {
                    
                    
                    //  This is wrong
                    //I need do a foreach to find the ones that are the same
                    //  accountName and description but different dates and maybe amounts.
                    //  if I find two with the same description and accountName but less than 2 days apart
                    //  I will update reconciled with "check" flag to show they may be related 
                    //  with one being the pending and the other the final transaction.
                    //  reconcilitation process will pull them together, and operator will indicate the old 
                    //  is to be flagged as deleted and the right one will be reconciled or not as required.    
                    
                    
                  
                    var msDay = 60*60*24*1000;
                    Transaction.find({"description": item[1], "amount": item[3], "accountName": item[6]},
                        function(err,found){
                            if (err) {
                                console.log(err);
                            } else {
                            var dateDiff = Math.floor((transaction.date - found.date) / msDay)
                            if (dateDiff <= 3 && dateDiff != 0) {
                                found.reconciled = "yes"
                                found.save;
                                console.log("transaction found")
                                }
                                
                            }                   
                        });*/
                });
        });
        
    });

fs.readFile(filePathJSON, function (err, data) { // Read the contents of the file   
  if (err) throw err
  var jsonContent = JSON.parse(data)
  if (jsonContent) {
    console.log("starting Balances update  - Length - " + data.length  );
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
          updated.save();
          } else {  
            if (updated === null) {     
              balance = Balance({
                fiName: item.fiName,
                accountName: item.accountName,
                accountId: item.accountId,
                currentBalance: item.currentBalance,
                accountType: item.accountType
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


setTimeout(function() {
    db.disconnect(function(err) {
        if (err) {
            console.log("error closing connection " + err);
        }
    });
    console.log("number added - " + numAdded);
    console.log("Database closed");
    }, 20000);

