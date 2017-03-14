var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    Transactions    = require("../models/transaction"),
    Register        = require("../models/register"),
    Balances        = require("../models/balances")
    tools           = require("../shared/tools"),
    middleware      = require("../middleware");  //index.js is automatically picked up because of it's name
//================================================
//MATCH ROUTES
//================================================
//
//INDEX route non-Reconciles Transactions Only
router.get("/",   middleware.isLoggedIn, function(req, res) {
    
  Transactions.find({ "reconciled.status": "No"}).sort({date: -1, accountName: 1 }).exec(function(err, alltransactions){
    if (err) throw err;

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
    tools.updateTransaction(existingData, foundTransaction, addNew, function(err2,foundReg){
      if (err2){
        console.log('error updated user 4: ',err2);
      } else {
        console.log('user updated: ',foundReg);
      }
    });

    res.redirect("/TransRecon/match");
  });
});




module.exports = router;
