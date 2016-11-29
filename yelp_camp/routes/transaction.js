var express     = require("express"),
    router      = express.Router(),
    Transaction  = require("../models/transaction"),
    //Register     = require("../models/register"),
    middleware  = require("../middleware");  //index.js is automatically picked up because of it's name
    
//================================================

//===============================
//  TransactionS Route
//===============================

//INDEX route
router.get("/",  middleware.isLoggedIn, function(req, res) {
    Transaction.find({}).sort({date: -1, accountName: 1}).exec(function(err, allTransactions){
        //Transaction.find({}).sort({description: 1, original_description: 1}).exec(function(err, allTransactions){
        if (err){
            console.log(err);
        } else {
            res.render("transactions/index", {transactions: allTransactions});
        }
    });
});

//INDEX route Unreconciled
router.get("/unrecon",  middleware.isLoggedIn, function(req, res) {
    Transaction.find({"reconciled.status": "No"}).sort({date: -1, accountName: 1}).exec(function(err, allTransactions){
        //Transaction.find({}).sort({description: 1, original_description: 1}).exec(function(err, allTransactions){
        if (err){
            console.log(err);
        } else {
            res.render("transactions/index", {transactions: allTransactions});
        }
    });
});

//INDEX route y Account
router.get("/byacct",  middleware.isLoggedIn, function(req, res) {
    Transaction.find({}).sort({accountName: 1, date: -1}).exec(function(err, allTransactions){
        //Transaction.find({}).sort({description: 1, original_description: 1}).exec(function(err, allTransactions){
        if (err){
            console.log(err);
        } else {
            res.render("transactions/index", {transactions: allTransactions});
        }
    });
});

//INDEX route by Description
router.get("/bydesc",  middleware.isLoggedIn, function(req, res) {
    Transaction.find({}).sort({description: 1, date: -1}).exec(function(err, allTransactions){
        //Transaction.find({}).sort({description: 1, original_description: 1}).exec(function(err, allTransactions){
        if (err){
            console.log(err);
        } else {
            res.render("transactions/index", {transactions: allTransactions});
        }
    });
})
//CREATE route
router.post("/",  middleware.isLoggedIn,  function(req, res) {
   var newTransaction = {date: req.body.date,
                         description: req.body.description,
                         original_description: req.body.orig_desc,
                         amount: req.body.amount,
                         transaction_type: req.body.trans_type,
                         accountName: req.body.acct_name};
   // Create new Transaction
   Transaction.create(newTransaction, function(err, newTransaction){
       if (err) {
           console.log(err);
       } else {
           console.log(newTransaction);
            res.redirect("/TransRecon/transactions");
       }
    });
});


//NEW route
router.get("/new",  middleware.isLoggedIn, function(req, res) {
    res.render("transactions/new");
});

//SHOW route
//This is the route to show info on one Transaction
router.get("/:id", middleware.isLoggedIn, function(req, res) {
    //  find the Transaction with the ID provided
    //render the Show Template with that Transaction
    Transaction.findById(req.params.id).exec(function(err, foundTransaction) {
        if (err) {
            console.log(err);
        } else {
            res.render("transactions/show", {transaction: foundTransaction});
        }
    });
});

//SHOW BY ACCOUNT
router.get("/account/:account", middleware.isLoggedIn, function(req, res) {
    //  find the Transaction with the ID provided
    //render the Show Template with that Transaction
    Transaction.find({accountName: req.params.account, reconciled: {$ne: "yes"}}).sort({accountName: 1, description: 1, date: -1}).exec(function(err, allTransactions){
        if (err) {
            console.log(err);
        } else {
            allTransactions.forEach(function(transaction) { 
                console.log(transaction.date + "  " + transaction.accountName)
            });
            console.log("found transactions for " + '"' + req.params.account +'"');
            res.render("transactions/index", {transactions: allTransactions});
        }
    });
});


//EDIT Transaction ROUTE

//router.get("/:id/edit", middleware.checkTransactionOwnership, function(req, res) {
router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
    Transaction.findById(req.params.id, function(err, foundTransaction){
        if (err) {
            console.log(err);
            res.redirect("/TransRecon/transactions");
        } else {
            console.log("Found transaction record");
           res.render("transactions/edit", {transaction: foundTransaction});         
        }
    });
});


//UPDATE Transaction ROUTE

//router.put("/:id", middleware.checkTransactionOwnership, function(req, res) {
router.put("/:id", middleware.isLoggedIn, function(req, res) {
    // Find and update Transaction data
    Transaction.findByIdAndUpdate(req.params.id, req.body.Transaction, function(err, foundTransaction){
        if (err){
            console.log(err);
            res.redirect("/TransRecon/transactions");
        } else {
            res.redirect("/TransRecon/transactions/" + req.params.id);
        }
    });
});


//DESTROY Transaction ROUTE

router.delete("/:id", middleware.isLoggedIn, function(req, res) {
   Transaction.findByIdAndRemove(req.params.id, function(err){
       if (err) {
           console.log(err);
       } else
        res.redirect("/TransRecon/transactions");
   });
});


//Reports Selection Route
/*
router.get("/reports",   middleware.isLoggedIn, function(req, res) {
    //console.log("All query strings: " + JSON.stringify(req.query.dateFrom));
    Transactions.find().distinct('institution', function(error, finInst){
        res.render("transactions/bldreports", {finInst: finInst});
        });
    });

//Reports generation Route

router.get("/bldreports",   middleware.isLoggedIn, function(req, res) {
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    console.log("Fin Inst - " + req.query.finInst);
    var rptFromDate = monthNames[Number(req.query.dateFrom.substr(0,2) - 1)] + " " +
                                        req.query.dateFrom.substr(3,2) + " " +
                                        req.query.dateFrom.substr(6,4);
    var rptToDate = monthNames[Number(req.query.dateTo.substr(0,2) - 1)] + " " +
                                        req.query.dateTo.substr(3,2) + " " +
                                        req.query.dateTo.substr(6,4);
    var rptDate = '{"date": {"$gte": "' + rptFromDate + '", "$lte": "' + rptToDate + '"}';
    
    var rptParams = rptDate;
    var rptCreditDebit = "";

    if (req.query.credDeb === "Debit") {
        rptCreditDebit = '"amount": {"$lte": 0}';
        } 
    if (req.query.credDeb === "Credit") {
        rptCreditDebit = '"amount": {"$gte": 0}';
        }
    if (rptCreditDebit != "") {
        rptParams = rptParams + ", " + rptCreditDebit;
        }  
//Check for if reconciled wanted ot not
    var repReconciled = "";
    if (req.query.reconciled === "Yes" ) {
        repReconciled = '"reconciled.status": "Yes"';
    }
    if (req.query.reconciled === "No" ) {
        repReconciled = '"reconciled.status": "No"';
    }
    if (repReconciled != "") {
        rptParams = rptParams + ", " + repReconciled
    }
    var repFinInst = '"institution": "';
    repFinInst = repFinInst + req.query.finInst;
    repFinInst = repFinInst + '"';
    console.log(repFinInst)
    rptParams = rptParams +  ", " + repFinInst;
    rptParams = rptParams + "}"
    
    console.log(rptParams)
    var parsedParams = JSON.parse(rptParams);
    //console.log("Parsed - " + parsedParams);
    Transactions.find(parsedParams).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
    if (err) {
        throw err;
    } else {
        res.render("transactions/rptgener", {registers: foundRegister});
        }
    });
});
*/

module.exports = router;