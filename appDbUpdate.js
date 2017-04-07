// Call this via CLI with $ node app.js /PathTo/Your.csv
//var parse = require('csv-parse'),
var pg          = require("pg"),
    fs          = require('fs'),
    config      = require('config'),
    tools       = require('./shared/pgtools'),
    signon = config.get('config');
    parse       = require('csv-parse');


console.log("Database is " + config.config.database)
var pool = new pg.Pool(signon)
if (!pool) {
  console.log("Login Problem")
}
   
var parmsPath = "./parms.json";
var parmsContent = "";
var filePathTrans = config.get('transPath');
var filePathBal = config.get('balancePath');;
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

  console.log("starting Transactions update " + data.length);
  var jsonContent = JSON.parse(data)
  jsonContent.forEach( function(item, index, chkArray) {
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

    var merchant = item.omerchant.replace(/\'/g, '');
    if (item.isTransfer) {
      merchant = item.merchant.replace(/\'/g, '');
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
          
    var values = [params.date, params.merchant, params.amount];
    var text = 'SELECT date FROM transactions WHERE date = $1 and merchant = $2 and amount = $3'
 
    pool.query(text, values, (err, results) => {
      if (!results || results.rowCount === 0) {
        var text = 'INSERT INTO transactions (account_name, merchant, amount, transaction_type, category, status_date, date, institution) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
        var values = [ params.accountName, params.merchant, params.amount, params.transaction_type, params.category, params.date, params.date, params.institution]
        tools.runQuery(text, values, (err, results) => {
          if (err) {
              throw err;
          } 
          numAdded++;
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
  var month = monthNames[today.getMonth()];
    
  if (jsonContent) {
    console.log("starting Balances update" );
    jsonContent.forEach( function(item) {
      if (item.currentBalance != 0 || item.accountSystemStatus === 'ACTIVE') {
        var dueDate = '';
        var dueAmt = 0;
        if (item.dueDate){
          var year = today.getFullYear();
          var dueYear = item.dueDate.substr(6, 4);
          var dueMonth = item.dueDate.substr(0, 2);
          var dueDay = item.dueDate.substr(3, 2);
          dueDate = new Date(dueYear, (Number(dueMonth)-1), dueDay);
          dueAmt = item.dueAmt;
        }
        var params = {
          month: monthNames[today.getMonth()],
          year: today.getFullYear(),
          institution: item.fiName,
          account_id: item.id,
          account_type: item.accountType,
          current_balance: item.currentBalance,
          starting_balance: item.currentBalance,
          due_date: dueDate,
          due_amt: item.dueAmt, 
          account_name: item.accountName
        };
        var query = 'SELECT account_id FROM balances WHERE account_id = ' + '\'' + params.account_id 
                      + '\' and month = \'' + params.month 
                      + '\' and year = ' + params.year; 
      
        pool.query(query, [], (err, results) => {
          if (!results || results.rowCount === 0) {
            var text = 'INSERT INTO balances ' + 
                              '(month, year, institution, account_id, account_type, ' +
                              'current_balance, starting_balance, due_date, due_amt, account_name) ' +
                              'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)'
            var values = [ params.month, params.year, params.institution, params.account_id, params.account_type, 
                            params.current_balance, params.starting_balance, params.due_date, params.due_amt, params.account_name]
            console.log('text = ' + text);
            console.log('values = ' + values);
            tools.runQuery(text, values, (err, results) => {
              if (err) {
                  throw err;
              } 
            });
            balCount++;   
          } else {
            //console.log("Record found " + query)
            text = 'UPDATE balances SET current_balance = $1 WHERE account_id = $2 and month = $3 and year = $4'
            values = [params.current_balance, params.account_id, params.month, params.year]
            //console.log("Record found " + query)
            tools.runQuery(text, values, (err, results) => {
              if (err) {
                  throw err;
              }
              balUpdated++; 
            });
          } 
        });
      };         
    });
  };
});

setTimeout(function() {
  console.log("Transaction records added - " + numAdded);
  console.log( "Balance records added - " + balCount);
  console.log( "Balance records updated - " + balUpdated);
  console.log("Register records added - " + regCount);
  process.exit(1);  
  }, 10000);  

