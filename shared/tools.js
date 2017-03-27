var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Register    = require("../models/register"),
    Transactions = require("../models/transaction"),
    Balance     = require("../models/balances"),
    middleware  = require("../middleware");  //index.js is automatically picked up because of it's name  

module.exports = {

  reconcileTransaction: function(foundTransaction){
    var chkDate = foundTransaction.date.toString();
    var chkFromDate = chkDate.substr(0,15);
    var day = Number(chkFromDate.substr(8,2))+1    
    var strDay = day.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})
    var chkToDate = chkFromDate.substr(0,8) + strDay + chkFromDate.substr(10,15);
  
    //Register.findOne({merchant: foundTransaction.merchant,
    //    date: {$gte : chkFromDate, $lt: chkToDate}, 
    //    accountName:foundTransaction.accountName,
    //    amount: {$eq: foundTransaction.amount}}).exec(function (err, regItem) {
    Register.findById(foundTransaction.reconciled.id,  function (err, regItem) {
      if(regItem === undefined || regItem === null) {
        tools.addNewRegister(foundTransaction)
      } else {
        updateReconStatus(regItem, foundTransaction) 
      }; 
    })
  },
  
/*  formatDateyyyymmdd: function(date) {
    var strDate = date.toString();
    var year = Number(strDate.substr(0, 4));
    var month = Number(strDate.substr(5, 2));
    var day = Number(strDate.substr(8, 2));
    retDate = new Date(year, month, day)
    console.log('Date year - ' + date.getYear())
    console.log(year + ' - ' + month + ' - ' + day)
    console.log('returned date - ' + retDate.toString() )
    return retDate;
  },
*/

  addNewRegister: function(foundTransaction) {
    var holdMemo = ' '
    if(foundTransaction.memo !== undefined && foundTransaction.memo !== null) {
      holdMemo = foundTransaction.memo
    }

    var newRegister =   {date: foundTransaction.date,
                                amount: foundTransaction.amount,
                                accountName: foundTransaction.accountName,
                                merchant: foundTransaction.merchant,  
                                memo: holdMemo,
                                reconciled: {id: 0},
                                reconciled: {date: foundTransaction.date},
                                reconciled: {status: "No"}
                        } 
        
    Register.create(newRegister, function(err, newRegister){
      if(err) {
        console.log(err);
        res.redirect("back")
      } else{
        if (foundTransaction.reconciled.status === 'Yes') {
          newRegister.reconciled.id = foundTransaction._id;
          newRegister.reconciled.date = foundTransaction.reconciled.date;
        }
        newRegister.reconciled.status = foundTransaction.reconciled.status;
        
        newRegister.save();
        if(err) {
          console.log(err);
          res.redirect("back")
        } 

        Transactions.findById(newRegister.reconciled.id, function(err, trans) {
          if(err) {
            console.log(err);
            res.redirect("back")
          }
          if (trans) {
          trans.reconciled.id = newRegister._id;
          trans.save();
          if(err) {
            console.log(err);
            res.redirect("back")
          }  
        }
        });
      } 
    })
  },

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

  bldQuery: function(queryParms) {
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var rptFromDate = monthNames[Number(queryParms.dateFrom.substr(0,2) - 1)] + " " +
                                        queryParms.dateFrom.substr(3,2) + " " +
                                        queryParms.dateFrom.substr(6,4);
    var rptToDate = monthNames[Number(queryParms.dateTo.substr(0,2) - 1)] + " " +
                                        (Number(queryParms.dateTo.substr(3,2)) +1).toString() + " " +
                                        queryParms.dateTo.substr(6,4);
    var rptDate = '{"date": {"$gte": "' + rptFromDate + '", "$lte": "' + rptToDate + '"}';
    
    var rptParams = rptDate;
    var rptCreditDebit = "";

    if (queryParms.credDeb === "Debit") {
      rptCreditDebit = '"amount": {"$lte": 0}';
      } 
    if (queryParms.credDeb === "Credit") {
      rptCreditDebit = '"amount": {"$gte": 0}';
      }
    if (rptCreditDebit != "") {
      rptParams = rptParams + ", " + rptCreditDebit;
      }  
  //Check for if reconciled wanted ot not
    var repReconciled = "";
    if (queryParms.reconciled === "Yes" ) {
      repReconciled = '"reconciled.status": "Yes"';
    }
    if (queryParms.reconciled === "No" ) {
      repReconciled = '"reconciled.status": "No"';
    }
    if (repReconciled != "") {
      rptParams = rptParams + ", " + repReconciled
    }
    if (queryParms.merchant != "All") {
      var repMerchant = '"merchant": "';
      repMerchant = repMerchant + queryParms.merchant;
      repMerchant = repMerchant + '"';
      rptParams = rptParams +  ", " + repMerchant;
    }
    if (queryParms.finInst != "All"){
      var repFinInst = '"institution": "';
      repFinInst = repFinInst + queryParms.finInst;
      repFinInst = repFinInst + '"';
      rptParams = rptParams +  ", " + repFinInst;
    }
    rptParams = rptParams + "}"
      
    return rptParams;
  }
};

////////
//  Local Functions
////////

function updateReconStatus(regItem, foundTransaction){
  regItem.reconciled.id = foundTransaction._id;
  regItem.reconciled.status = foundTransaction.reconciled.status;
  regItem.reconciled.date = foundTransaction.reconciled.date;
  regItem.save();
}

