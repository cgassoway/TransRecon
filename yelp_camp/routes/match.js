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
            //console.log("testTrans.date - " + testTrans.date.toLocaleDateString('en-US') + " / " + signedAmount + " / " + testTrans.description + " /" + testTrans.accountName + " /")
            
            var existingData = {date: testTrans.date,
                                description: testTrans.description,
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

//Reports Selection Route

router.get("/reports",   middleware.isLoggedIn, function(req, res) {
    //console.log("All query strings: " + JSON.stringify(req.query.dateFrom));
    Transactions.find().distinct('institution', function(error, finInst){
        res.render("match/bldreports", {finInst: finInst});
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
    if (req.query.regTrans === "Register") {
        Register.find(parsedParams).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
            if (err) {
                throw err;
            } else {
                res.render("match/rptgener", {registers: foundRegister});
                }
            });
        } else {
            Transactions.find(parsedParams).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
            if (err) {
                throw err;
            } else {
                res.render("match/rptgener", {registers: foundRegister});
                }
            });
        };
        
});

/*

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
         } else {
            //res.render("balances/edit", {balances_id: req.params.id, balances: foundBalances});
            res.render("match/edit", {transaction: foundTransaction});
         }
     });
 });
 */


//UPDATE MATCH ROUTE
 
//router.put("/:id", middleware.isLoggedIn, function(req, res){
router.put("/:id", middleware.isLoggedIn, function(req, res){
    Transactions.findById(req.params.id, function(err, foundTransaction){   
    if (err) {
        console.log("Match Transaction update error" + err );
        console.log("ID is " + req.body.match);
        res.redirect("back");
        }   else {
            var addNew = "No";
            //if (req.body.reconciled === "Yes") {
                
                    
                foundTransaction.reconciled.status=req.body.reconciled;
                foundTransaction.save();
                
                //var signedAmount = foundTransaction.amount;
                //if (foundTransaction.transaction_type === "debit") {
                //    signedAmount =  signedAmount * (-1);
                //}
                addNew = "yes"
                var existingData = {date: foundTransaction.date,
                                    description: foundTransaction.description,
                                    amount: foundTransaction.amount,
                                    accountName: foundTransaction.accountName
                                    }
                updateTransaction(existingData, foundTransaction, addNew, function(err2,foundReg){
                    if (err2){
                            console.log('error updated user: ',err2);
                        }else{
                            console.log('user updated: ',foundReg);
                            }
                    });
                /*
                } else {  
                    foundTransaction.reconciled.status=req.body.reconciled  
                    foundTransaction.save();
                }
                */
        //res.redirect("/balances/" + req.params.id);
        res.redirect("/TransRecon/match");
        }
    });
});

 //FUNCTION TO CHECK IF REGISTER EXISTS
function updateTransaction(transData, foundTransaction, addNew, cb){
    Register.find(transData, function (err, regFound) {
        
        regFound.forEach(function(regItem){
            
            //console.log("register id - " + regItem._id)

            cb('Name exists already',null);
            addNew = "no";
            //if (!regItem.reconciled.id) {
  
            regItem.reconciled.id = foundTransaction._id;
            regItem.reconciled.status = foundTransaction.reconciled.status;
            regItem.reconciled.date = foundTransaction.date;
            regItem.reconciled.description = foundTransaction.description;
            regItem.reconciled.amount = foundTransaction.amount;
            regItem.reconciled.transaction_type = foundTransaction.transaction_type;
            regItem.reconciled.accountName = foundTransaction.accountName;
            regItem.save();
            
            var today = new Date();
            //var updTrans = {
            //    reconciled: {
            //        id: regItem._id,
            //        status: "Yes"
            //    },
            //    date_reconciled: today
            //}
            //console.log("Update Transaction");
            //Transactions.findByIdAndUpdate(foundTransaction.id, updTrans, function(err){
            Transactions.findById(foundTransaction.id, function(err, foundTrans){
                if (err) {
                    throw err
                }
            foundTrans.reconciled.id = regItem._id;
            foundTrans.reconciled.status = "Yes";
            foundTrans.date_reconciled = today;
            foundTrans.save();
                    //code
                });
            //{reconciled:{status: "Yes"}, reconciled: {id: regId}}
            if(err) {
                    console.log(err);
                    res.redirect("back")
                    }
                                      
            //};
            //foundTransaction.reconciled = "Yes";
            //console.log("Reconciled updated - ");
        }); 
        if (addNew === "yes") {
            var newRegister =   {date: foundTransaction.date,
                    description: foundTransaction.description,
                    amount: transData.amount,
                    accountName: foundTransaction.accountName,
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
                        newRegister.reconciled.description = foundTransaction.description
                        newRegister.reconciled.amount = foundTransaction.amount
                        newRegister.reconciled.transaction_type = foundTransaction.transaction_type
                        newRegister.reconciled.accountName = foundTransaction.accountName
                        newRegister.save();
                        
                        //console.log("transaction updated second time");
                        //Transactions.findByIdAndUpdate(foundTransaction.id, {reconciled:{status: "Yes"}, reconciled: {id: newRegister._id}}, function(err){
                        Transactions.findById(foundTransaction.id, function(err, foundTrans){
                        if (err) {
                            throw err
                        }
                        foundTrans.reconciled.id = newRegister._id;
                        foundTrans.reconciled.status = foundTrans.reconciled.status;
                        foundTrans.date_reconciled = new Date();
                        foundTrans.save();
                        //code
                        });
                            
                        };
                    cb("updated", newRegister)
                    });
                };
 
        });
            //cb("updated", newRegister)
    };
/* 
 //DELETE MATCH ROUTE
//router.delete("/:id", middleware.isLoggedIn, function(req, res){
router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Balances.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/TransRecon/balances/" + req.params.id);
        }
    });
 });
*/ 

module.exports = router;
