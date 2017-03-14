var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Register    = require("../models/register"),
    Transactions = require("../models/transaction"),
    middleware  = require("../middleware");  //index.js is automatically picked up because of it's name
        


module.exports = {

  //reconcileTransaction: function(foundTransaction,cb){
  reconcileTransaction: function(foundTransaction){
    var chkDate = foundTransaction.date.toString();
    var chkFromDate = chkDate.substr(0,15);
    var day = Number(chkFromDate.substr(8,2))+1    
    var strDay = day.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})
    var chkToDate = chkFromDate.substr(0,8) + strDay + chkFromDate.substr(10,15);
  
    Register.findOne({merchant: foundTransaction.merchant,
        date: {$gte : chkFromDate, $lt: chkToDate}, 
        accountName:foundTransaction.accountName,
        amount: {$eq: foundTransaction.amount}}).exec(function (err, regItem) {
      
      if(regItem === undefined || regItem === null) {
        //console.log('Adding new record')
        addNewRegister(foundTransaction)
      } else {
        //cb('Name exists already',null);
        updateReconStatus(regItem, foundTransaction) 
      }; 
    })
  },
  
  //date.substr(4, 3) + " " + date.substr(8, 2) + " " + date.substr(11, 4)
  
  
  formatDateyyyymmdd: function(date) {
    var strDate = date.toString();
    var year = Number(strDate.substr(0, 4));
    var month = Number(strDate.substr(5, 2));
    var day = Number(strDate.substr(8, 2));
    retDate = new Date(year, month, day)
    console.log('Date year - ' + date.getYear())
    console.log(year + ' - ' + month + ' - ' + day)
    console.log('returned date - ' + retDate.toString() )
    return retDate;
  }
};

////////
//  Local Functions
////////

function updateReconStatus(regItem, foundTransaction){
  //console.log("Updating register status")
  //console.log("Status is " + foundTransaction.reconciled.status)
  regItem.reconciled.id = foundTransaction._id;
  regItem.reconciled.status = foundTransaction.reconciled.status;
  regItem.reconciled.date = foundTransaction.reconciled.date;
  regItem.save();
}

function addNewRegister(foundTransaction) {
  var newRegister =   {date: foundTransaction.date,
                              amount: foundTransaction.amount,
                              accountName: foundTransaction.accountName,
                              merchant: foundTransaction.merchant,  
                              memo: " "
                              } 
      
  Register.create(newRegister, function(err, newRegister){
    if(err) {
      console.log(err);
      res.redirect("back")
    } else{
      newRegister.reconciled.id = foundTransaction._id;
      newRegister.reconciled.status = foundTransaction.reconciled.status;
      newRegister.reconciled.date = foundTransaction.reconciled.date;
      newRegister.save();
      if(err) {
        console.log(err);
        res.redirect("back")
      } else {console.log( newRegister.reconciled.id + ' - ' + newRegister.reconciled.status + ' - ' + newRegister.reconciled.date);}      
    }
  });
}

// Create new Register
/*
function bldNewRegister(foundTransaction) {
  /*var newRegister =   {date: foundTransaction.date,
              amount: foundTransaction.amount,
              accountName: foundTransaction.accountName,
              merchant: foundTransaction.merchant,
              memo: " "
              }; 
  //Register.create(newRegister, function(err, newRegister){
    Register.create(foundTransaction, function(err, newRegister){
  if(err) {
    console.log(err);
    res.redirect("back")
  }
  return newRegister;
});*/

