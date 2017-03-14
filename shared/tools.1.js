var Transactions    = require("../models/transaction"),
    Register        = require("../models/register")

module.exports = {

  updateTransaction: function(transData, foundTransaction, addNew, cb){
    Register.find(transData, function (err, regFound) {
      regFound.forEach(function(regItem){
      //console.log("Data to match - " + transData.date + ' - ' + transData.merchant + ' - ' + transData.amount + ' -' + transData.accountName)
        cb('Name exists already',null);
        addNew = "no";
        regItem.reconciled.id = foundTransaction._id;
        regItem.reconciled.status = foundTransaction.reconciled.status;
        regItem.reconciled.date = foundTransaction.date;
        regItem.reconciled.merchant = foundTransaction.merchant;
        regItem.reconciled.amount = foundTransaction.amount;
        regItem.reconciled.transaction_type = foundTransaction.transaction_type;
        regItem.reconciled.accountName = foundTransaction.accountName;
        regItem.save();
        
        var today = new Date();
        Transactions.findById(foundTransaction.id, function(err, foundTrans){
            if (err) throw err
        foundTrans.reconciled.id = regItem._id;
        foundTrans.reconciled.status = "Yes";
        foundTrans.date_reconciled = today;
        foundTrans.save();
            });
        if(err) {
                console.log(err);
                res.redirect("back")
              }
        return;
      }); 

      //if (addNew === "yes") {
        var newRegister =   {date: foundTransaction.date,
                amount: transData.amount,
                accountName: foundTransaction.accountName,
                merchant: foundTransaction.merchant,
                institution: foundTransaction.institution,
                memo: " ",
                
                };
        // Create new Register
        Register.create(newRegister, function(err, newRegister){
          if(err) {
            console.log(err);
            res.redirect("back")
            } else {
              newRegister.reconciled.id = foundTransaction._id
              newRegister.reconciled.status = foundTransaction.reconciled.status
              newRegister.reconciled.date = foundTransaction.date
              newRegister.reconciled.merchant = foundTransaction.merchant
              newRegister.reconciled.amount = foundTransaction.amount
              newRegister.reconciled.transaction_type = foundTransaction.transaction_type
              newRegister.reconciled.accountName = foundTransaction.accountName
              newRegister.reconciled.institution = foundTransaction.institution                 
              
              newRegister.save();
              
              //console.log("transaction updated second time");
              //Transactions.findByIdAndUpdate(foundTransaction.id, {reconciled:{status: "Yes"}, reconciled: {id: newRegister._id}}, function(err){
              Transactions.findById(foundTransaction.id, function(err, foundTrans){
                if (err) throw err 
                foundTrans.reconciled.id = newRegister._id;
                foundTrans.reconciled.status = foundTrans.reconciled.status;
                foundTrans.date_reconciled = new Date();
                foundTrans.save();
                });
                    
              };
            cb("updated", newRegister)
          });
    });
  }
}
