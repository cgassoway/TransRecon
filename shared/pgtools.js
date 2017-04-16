var pg          = require("pg")
var config      = require('config')
var signon = config.get('config');
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
            //console.log("date - " + result.rows[i].account_name)
            resultsArray.push(result.rows[i]);
          };
        }
        callback(err, resultsArray);
      });
    });
  }
}
/*
  updateBalances: function(updated, item) {
     updated.currentBalance = item.currentBalance;
          updated.accountName = item.accountName;
          updated.fiName = item.fiName;
          updated.accountType = item.accountType;
          updated.dueDate = item.dueDate;
          updated.dueAmt = item.dueAmt;
          updated.save();
  },

  addNewBalance: function(item, today, monthNames) {
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
      }
    });
  },


  update: function(action, id, updates, values) { 
     
    let fieldsToUpdate = [];
    let valuesToUpdate = [];

    updates.forEach(function(updFld) {
      if (!updFld.length === 0)
        fieldsToUpdate.push(updFld)
    });
    values.forEach(function(updVal) {
      if (!updVal.length === 0)
        valuesToUpdate.push(updVal)
    })
    
    if (fieldsToUpdate.length === 0 || valuesToUpdate.length === 0) {
        throw new Error('no fields to update');
    }
    let placeHolderParams = (_.map(valuesToUpdate, (v, i) => {
        return `$${i + 1}`;
    })).join(', ');
    let idWhereClause = `where id = $${valuesToUpdate.length + 1}`;
    valuesToUpdate.push(options.id);
    let query = `update customers set (${fieldsToUpdate.join(', ')}) = (${placeHolderParams}) ${idWhereClause}`;
    tools.runQuery(query, valuesToUpdate, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log(result);
        if (result.rowCount === 0) {
            console.error('No record updated');
        }
      }
    });
  },

  create: function(query, args) {
    tools.runQuery(query, args, (err, results) => {
      if (err) {
          console.error(err);
      } else {
          console.log(results);
      }
    });
  }
}
*/