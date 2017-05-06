var pg          = require("pg")
var config      = require('config')
var signon      = config.get('config');
const _         = require('underscore');
let pool = new pg.Pool(signon);
    
module.exports = {

runQuery: function(query, args, callback) {
  pool.connect((err, client, done) => {
    if (err) {
      //likely a connection error that will print to console.
      console.log("into err")
      done();
      throw err;
    } 
    client.query(query, args, (err, result) => {
      done();
      var resultsArray = [];
      var i = 0;
      if (result && result.rowCount > 0) {
        for (i=0; i< result.rowCount; i++)  {
          if (typeof result.rows[i] != "undefined" && result.rows[i].date) {
            var currentDate = result.rows[i].date
            var day = currentDate.getDate()
            var month = currentDate.getMonth() + 1
            var year = currentDate.getFullYear()
            result.rows[i].date = month + "/" + day + "/" + year
          }
          if (typeof result.rows[i] != "undefined" && result.rows[i].until_date) {
            currentDate = result.rows[i].until_date
            day = currentDate.getDate()
            month = currentDate.getMonth() + 1
            year = currentDate.getFullYear()
            result.rows[i].until_date = month + "/" + day + "/" + year
          } 
          if (typeof result.rows[i] != "undefined" && result.rows[i].status_date) {
            currentDate = result.rows[i].status_date
            day = currentDate.getDate()
            month = currentDate.getMonth() + 1
            year = currentDate.getFullYear()
            result.rows[i].status_date = month + "/" + day + "/" + year
          } 
          if (typeof result.rows[i] != "undefined" && result.rows[i].due_date) {
            currentDate = result.rows[i].due_date
            day = currentDate.getDate()
            month = currentDate.getMonth() + 1
            year = currentDate.getFullYear()
            result.rows[i].due_date = month + "/" + day + "/" + year
          }
          resultsArray.push(result.rows[i]);
        };
      callback(err, resultsArray);
      }
    });
  })
},


bldQuery: function(queryParms, type) {
  var rptParams = 'select * FROM ' + type + ' WHERE ';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var rptFromDate = monthNames[Number(queryParms.dateFrom.substr(0,2) - 1)] + " " +
                                      queryParms.dateFrom.substr(3,2) + " " +
                                      queryParms.dateFrom.substr(6,4);
  var rptToDate = monthNames[Number(queryParms.dateTo.substr(0,2) - 1)] + " " +
                                      (Number(queryParms.dateTo.substr(3,2)) +1).toString() + " " +
                                      queryParms.dateTo.substr(6,4);
  //var rptDate = '{"date": {"$gte": "' + rptFromDate + '", "$lte": "' + rptToDate + '"}';
  var rptDate = 'date >= \'' + queryParms.dateFrom + '\' AND date <= \'' + queryParms.dateTo + '\''
  var rptParams = rptParams + rptDate;
  
//Check for if reconciled wanted ot not
  var repReconciled = "";
  if (queryParms.reconciled === "Yes" ) {
    repReconciled = ' AND status = \'Yes\'';
  }
  if (queryParms.reconciled === "No" ) {
    repReconciled = ' AND status = \'No\'';
  }
  if (repReconciled != "") {
    rptParams = rptParams + ", " + repReconciled
  }
  if (queryParms.merchant != "All") {
    var repMerchant = ' AND merchant = \'';
    repMerchant = repMerchant + queryParms.merchant;
    repMerchant = repMerchant + '\'';
    rptParams = rptParams + repMerchant;
  }
  if (queryParms.finInst != "All"){
    var repFinInst = ' AND institution = \'';
    repFinInst = repFinInst + queryParms.finInst;
    repFinInst = repFinInst + '\'';
    rptParams = rptParams + repFinInst;
  }
  rptParams = rptParams + ' ORDER BY date DESC, account_name ASC;'
    
  return rptParams;
},

getNewDate: function(parmDate) {
  var currentDate = parmDate;
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var date = month + "/" + day + "/" + year;
  return date;
},

addNewRegister: function(foundTransaction, callback) {
  var holdMemo = ' '
  if(foundTransaction.memo !== undefined && foundTransaction[0].memo !== null) {
    holdMemo = foundTransaction[0].memo
  }

  var text = 'INSERT INTO registers (date, merchant, amount, account_name, memo, status, transaction_id, status_date)' +
                              'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  var dateToday = new Date();
  var values = [foundTransaction[0].date, foundTransaction[0].merchant, foundTransaction[0].amount, 
                  foundTransaction[0].account_name, foundTransaction[0].memo,
                  foundTransaction[0].status, foundTransaction[0].transaction_id, 
                  foundTransaction[0].status_date];
  tools.runQuery(text, values, (err, results) => {
  //runQuery(text, values, (err, results) => {
    if (err) {
      console.log(err);
      res.redirect("back")
    } 
    var transText = 'UPDATE transactions SET register_id = ' + results[0].register_id +
          ' WHERE transaction_id = ' + results[0].transaction_id
    tools.runQuery(transText, [], (err, trans) => {
    //runQuery(transText, [], (err, trans) => {
      if(err) {
        console.log(err);
        res.redirect("back")
      }
      callback();  
    })  
  });
 },

//updateReconStatus: function(regItem, foundTransaction, callback){
updateReconStatus: function(foundTransaction, callback){
  text = 'SELECT * FROM registers WHERE register_id = ' + foundTransaction[0].register_id
  tools.runQuery(text, [], (err, regItem) => {
    if (err) {
      console.log("Match Register seek error" + err );
      console.log("ID is " + foundTransaction.register_id);
      res.redirect("back");
    } 
    var text = 'UPDATE registers SET transaction_id = ' + foundTransaction.transaction_id +
                ', status = \'' + foundTransaction.status + 
                ', status_date = \'' + foundTransaction.status_date +
                ' WHERE register_id = ' + regItem.register_id
    tools.runQuery(text, [], (err, trans) => {
      if(err) {
        console.log(err);
        res.redirect("back")  
      }
    callback();
    });
  })
},


format_date: function(data_in) {  
  var i = 0;
        if (data_in.rowCount > 0) {
          for (i=0; i< data_in.rowCount; i++)  {
            var currentDate = date_in[i].date
            var day = currentDate.getDate()
            var month = currentDate.getMonth() + 1
            var year = currentDate.getFullYear()
            date_in[i].date = month + "/" + day + "/" + year
            if (date_in[i].until_date) {
              currentDate = date_in[i].until_date
              day = currentDate.getDate()
              month = currentDate.getMonth() + 1
              year = currentDate.getFullYear()
              date_in[i].until_date = month + "/" + day + "/" + year
            }
          };
        }

  return date
  }
}
///////
//  Local Functions
////////

