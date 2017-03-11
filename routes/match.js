var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    Transactions    = require("../models/transaction"),
    Register        = require("../models/register"),
    Balances        = require("../models/balances")
    middleware      = require("../middleware");  //index.js is automatically picked up because of it's name
//================================================
//MATCH ROUTES
//================================================
//
//INDEX route non-Reconciles Transactions Only
router.get("/",   middleware.isLoggedIn, function(req, res) {
    
  Transactions.find({ "reconciled.status": "No"}).sort({date: -1, accountName: 1 }).exec(function(err, alltransactions){
    if (err) throw err;

    
    alltransactions.forEach(function(testTrans) {
        
      var signedAmount = 0;
      if (testTrans.transaction_type === "debit") { 
        signedAmount = (testTrans.amount * (-1)).toFixed(2)
      } else { 
        signedAmount =testTrans.amount.toFixed(2)
      }
      //console.log("testTrans.date - " + testTrans.date.toLocaleDateString('en-US') + " / " + signedAmount + " / " + testTrans.merchant + " /" + testTrans.accountName + " /")
      
      var existingData = {date: testTrans.date,
                          merchant: testTrans.merchant,
                          amount: signedAmount,
                          accountName: testTrans.accountName
                          }
      var addNew = "no";
      updateTransaction(existingData, testTrans, addNew, function(err2,foundReg){
          if (err2){
                  console.log('error updated user: ',err2);
              }else{
                  console.log('user updated: ',foundReg);
                  }
      });
              
    });
        

      Register.find({"reconciled.status": "No"}).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
        if (err) throw err;
        res.render("match", {transaction: alltransactions, register: foundRegister});
        });
  });
});


//INDEX route All Transactions
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/all",   middleware.isLoggedIn, function(req, res) {
  Transactions.find().sort({"date": -1, "accountName": 1 }).exec(function(err, alltransactions){
    if (err) throw err;
  Register.find().sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
    if (err) throw err;
    res.render("match", {transaction: alltransactions, register: foundRegister});
    })
  });
});


//SHOW route
//This is the route to show info on one Balances
router.get("/:id",  middleware.isLoggedIn, function(req, res) {
  //  find the Balances with the ID provided
  //render the Show Template with that Balances
  Balances.findById(req.params.id).exec(function(err, foundBalances) {
    if (err) {
      console.log(err);
    } else {
      res.render("balances/", {balances: foundBalances});
    }
  });
});

//EDIT MATCH ROUTE
 
//router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
router.get("/:id/edit",  middleware.isLoggedIn, function(req, res) {
  Transactions.findById(req.params.id, function(err, foundTransaction){
    if (err) {
      console.log(err);
      res.redirect("back");
    } 
    res.render("match/edit", {transaction: foundTransaction});
  });
 });
 


//UPDATE MATCH ROUTE
 
router.put("/:id", middleware.isLoggedIn, function(req, res){
  Transactions.findById(req.params.id, function(err, foundTransaction){   
    if (err) {
      console.log("Match Transaction update error" + err );
      console.log("ID is " + req.body.match);
      res.redirect("back");
    } 
    var addNew = "No";

    console.log("Recon? - " + req.body.reconciled)   ;
    
    foundTransaction.reconciled.status=req.body.reconciled;
    foundTransaction.save();
    
    addNew = "yes"
    var existingData = {date: foundTransaction.date,
                        merchant: foundTransaction.merchant,
                        amount: foundTransaction.amount,
                        accountName: foundTransaction.accountName
                        }
    updateTransaction(existingData, foundTransaction, addNew, function(err2,foundReg){
      if (err2){
        console.log('error updated user 4: ',err2);
      } else {
        console.log('user updated: ',foundReg);
      }
    });

    res.redirect("/TransRecon/match");
  });
});

//FUNCTION TO CHECK IF REGISTER EXISTS
function updateTransaction(transData, foundTransaction, addNew, cb){
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
          if (err) {
              throw err
          }
      foundTrans.reconciled.id = regItem._id;
      foundTrans.reconciled.status = "Yes";
      foundTrans.date_reconciled = today;
      foundTrans.save();
          });
      if(err) {
              console.log(err);
              res.redirect("back")
              }
    }); 
    if (addNew === "yes") {
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
              if (err) { throw err }
              foundTrans.reconciled.id = newRegister._id;
              foundTrans.reconciled.status = foundTrans.reconciled.status;
              foundTrans.date_reconciled = new Date();
              foundTrans.save();
              });
                  
            };
          cb("updated", newRegister)
        });
      };

  });
};


module.exports = router;
