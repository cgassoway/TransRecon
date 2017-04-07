// Call this via CLI with $ node app.js /PathTo/Your.csv
//var parse = require('csv-parse'),
var pg          = require("pg"),
    fs          = require('fs'),
    config      = require('config'),
    tools       = require('./shared/pgtools'),
    signon = config.get('config');
    parse       = require('csv-parse');

const _ = require('underscore');

console.log("Database is " + config.config.database)
var pool = new pg.Pool(signon)
if (!pool) {
  console.log("Login Problem")
}
   
var parmsPath = "./parms.json";
var parmsContent = "";
var filePathTrans = config.get('transPath');
var filePathBal = config.get('balancePath');;
//var database = config.get('database');
//var logindb = config.get('config');
var numAdded = 0;
var newFlag = 0;
var oldFlag = 0;
var today = new Date();
var balCount = 0;
var balUpdated = 0;
var regCount = 0;

console.log("Starting process")

console.log("reading transactions")
fs.readFile(filePathTrans, function (err, data) { // Read the contents of the file
  if (err) throw err;
  console.log("starting Transactions update " + data.length);
  var jsonContent = JSON.parse(data)
  jsonContent.forEach( function(item) {
    //console.log("Read transaction record")
    //
    //  Use date from the odate entry, but date seems to be one day short
    //  of transaction date.  Add one day to the date to correct.
    //
    var refDate = new Date(item.odate+86400000)
    var s = "000" + (refDate.getMonth() + 1);
    var refMonth =  s.substr(s.length-2);
    s = "000" + refDate.getDate();
    var refDay = s.substr(s.length-2);
    var transDate = refDate.getFullYear() + '-' + refMonth + '-' + refDay
    //console.log(transDate )
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
    var params = {
            date: transDate,
            merchant: merchant,
            amount: dolAmount,
            transaction_type: typeTrans,
            category: item.category,
            accountName: accountRef,
            institution: finInstRef        
          };
         
    //var args = [params.date, params.merchant, params.amount];
    //var query = "SELECT * FROM transactions WHERE date = '" + params.date + "' and merchant = '" + params.merchant + "' and amount = '" + params.amount + ";";   
    var query = "SELECT * FROM transactions WHERE date = '" + params.date + "' and merchant = '" + params.merchant + "' and amount = " + params.amount;
    //console.log("date - " + params.date + "  merchant - " + params.merchant + " amount - " + params.amount)
    console.log("Query - " + query)
    tools.runQuery(query, [], (err, results) => {
      if (err) {
        throw err;
      }
      console.log('Rows from query');
      _.each(results.rows, (r) => {
        console.log(r.date, r.merchant, r.amount)
        });
        process.exit();
        });
      });
  });


    /*
    pool.query(query, args, function(err, result) {
      if (result) console.log("Result length is " + result.length)
      if (!result || result.rowCount === 0) {
        var args = {
          text: 'INSERT INTO transactions (date, merchant, amount, transactiontype, category, accountname, institution, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING transaction_id',
          values: [params.date, params.merchant, params.amount, params.transaction_type, params.category, params.accountName, params.institution, "No"]
        }
        pool.query(args, function(err, result) {
          if (err) {
            throw err;
          }
         console.log("Added new transaction - id = " + result.rows[0].transaction_id)
        });
      }
    });
  });
    //process.exit(0)
});
*/


/*
function runQuery(args) {
    var isHere = false;
    console.log("Got to runQuery")
    pool.connect((err, client, done) => {
      console.log("Did connect")
      if (err) {
      //likely a connection error that will print to console.
      console.log("into err")
      done();
      throw err;
      }
      console.log("starting query")
      var query = client.query(args, function(err, result) {
      console.log("got by query")
      if (!result || result.rowCount === 0) {
        console.log('Returned false');
        isHere = false
        } else {
        isHere = true
        console.log("returned true"); 
        console.log(result.rows[0].date + "  -  " + result.rows[0].merchant + "  -  " + result.rows[0].amount)
      }
      return isHere;
      })
    })
  }
  
  Transaction.count({"date": refDate, 
      "merchant": merchant, 
      "amount": dolAmount,
      "transaction_type": typeTrans}, function(err, numFound) {
        if (item.category ==="Credit Card Payment")
          numFound = 1;
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
      if (item.currentBalance != 0) {
        Balance.findOne({accountId: item.accountId, month: monthNames[today.getMonth()], year: today.getFullYear()}, function(err, updated) {
          if (err) {
            console.log("Error updating Balances  " + err);
            throw err
          }
          if (updated != null){
            tools.updateBalances(updated, item);
            balUpdated = balUpdated + 1;
          } else {  
            tools.addNewBalance(item, today, monthNames);
            numAdded = numAdded + 1;
          }
        });
      } 
    });
  };         
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
  var fullDate = new Date(planItem.date.getFullYear(), today.getMonth(), planItem.date.getDate())
  var newRegister =   {date: fullDate,
              merchant: planItem.merchant,
              amount: planItem.amount,
              accountName: planItem.accountName,
              memo: planItem.memo,
              reconciled: {status: "No"}
              }   
  Register.findOne(newRegister).exec(function(err, foundReg) {
    if(!foundReg) {
      tools.addNewRegister(newRegister);
      regCount = regCount+1
    } 
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
  }, 10000);

*/