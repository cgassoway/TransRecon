var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Plan        = require("../models/plan"),
    Transactions = require("../models/transaction"),
    Register    = require("../models/register"),
    flash       = require("connect-flash"),
    middleware  = require("../middleware"),  //index.js is automatically picked up because of it's name
    Validator   = require('validator');
    
    



//================================================
//REGISTER ROUTES
//================================================
//
//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/",  middleware.isLoggedIn, function(req, res) {
    //console.log("req.params.id - " + req.params.id)
    Plan.find({}).sort({dayOfMonth: -1}).exec(function(err, allPlans){
        if (err){
            console.log(err);
        } else {
            res.render("plan", {plans: allPlans});
        }
    });
});


//All plan routes are defaulted to "/plans" prefix on route
//


//NEW ROUTE
//router.get("/new", middleware.isLoggedIn, function(req, res) {
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Transactions.find().distinct('accountName', function(error, accts){
        res.render("plan/new", {accts: accts});
    });
});
 /* 
//NEW  recurring one-time plan item ROUTE
//router.get("/new/recur", middleware.isLoggedIn, function(req, res) {
router.get("/new/recur", middleware.isLoggedIn, function(req, res) {
    Transactions.find().distinct('accountName', function(error, accts){
        res.render("plan/new", {accts: accts});
    });
});
*/  
//CREATE ROUTE

router.post("/", middleware.isLoggedIn, function(req, res){

  var newPlan = {date: req.body.date,
                 merchant: req.body.merchant,
                 amount: req.body.amount,
                 accountName: req.body.accountName,
                 frequency: req.body.frequency,
                 untilDate: req.body.untilDate,
                 memo: req.body.memo
                }   
    /*var date = new Date();
    //var month = date.getMonth();
    //var year = date.getFullYear();
    var incr = 1;
    if (date.getDate() < req.body.dayOfMonth) {
        incr = 0
       }
    var fullDate = new Date(date.getFullYear(), (date.getMonth() + incr), req.body.dayOfMonth)
    console.log(fullDate)*/

    var newRegister =   {date: req.body.date,
                        merchant: req.body.merchant,
                        amount: req.body.amount,
                        accountName: req.body.accountName,
                        memo: req.body.memo
                        }   
    // Create new Plan
    Plan.create(newPlan, function(err, newPlan){
        if(err) {
            console.log(err);
            res.redirect("back")
            } 
        });
        // Create new Register
    Register.create(newRegister, function(err, newRegister){
        if(err) {
            console.log(err);
            res.redirect("back")
        } else {
            newRegister.reconciled.id = 0,
            newRegister.reconciled.date = "" ,
            newRegister.reconciled.merchant = "",
            newRegister.reconciled.amount =  0,
            newRegister.reconciled.transaction_type =  "",
            newRegister.reconciled.accountName =  "",
            newRegister.save();
            }
        res.redirect("/TransRecon/plan/new");
        });
    });


//SHOW route
//This is the route to show info on one Plan
/*router.get("/:id", middleware.isLoggedIn, function(req, res) {
    //  find the Plan with the ID provided
    //render the Show Template with that Plan
    Plan.findById(req.params.id).exec(function(err, foundPlan) {
        if (err) {
            console.log(err);
        } else {
            res.render("plan/", {plan: foundPlan});
        }
    });
});  */

 
 //EDIT REGISTER ROUTE
 
 //router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
    Plan.findById(req.params.id, function(err, foundPlan){
         if (err) {
             console.log(err);
             res.redirect("back");
         } else {
            //res.render("plan/edit", {plan_id: req.params.id, plan: foundPlan});
            Transactions.find().distinct('accountName', function(error, accts){
                res.render("plan/edit", {plan: foundPlan, accts:accts });
            })
         }
        });
 });
 

//UPDATE REGISTER ROUTE
 
//router.put("/:id", middleware.isLoggedIn, function(req, res){
router.put("/:id", middleware.isLoggedIn, function(req, res){
    Plan.findByIdAndUpdate(req.params.id, req.body.plan, function(err, foundPlan){   
    if (err) {
        console.log("Plan update error - " + err );
        //console.log("ID is " + req.body.dayOfMonth);
        res.redirect("back");
     } else {
            res.redirect("/TransRecon/plan/");
            }
    });
});

// DELETE REGISTER CONFIRM  ROUTE
 
router.get("/:id/delete", middleware.isLoggedIn, function(req, res) {
    Plan.findById(req.params.id, function(err, foundPlan){
         if (err) {
             console.log(err);
             res.redirect("back");
         } else {
            //console.log("Got to delete for " + req.params.id)
            res.render("plan/delete", {plan: foundPlan});
            }
         })
 });

 //DELETE REGISTER ROUTE
 
router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Plan.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/TransRecon/plan");
        }
    });
 });
 

module.exports = router;
