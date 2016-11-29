var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Register    = require("../models/register"),
    Transactions = require("../models/transaction"),
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
    console.log("req.params.id - " + req.params.id)
    Register.find({}).sort({date: -1, accountName: 1, description: 1}).exec(function(err, allRegisters){
        if (err){
            console.log(err);
        } else {
            res.render("register", {registers: allRegisters});
        }
    });
});

//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/unrecon",  middleware.isLoggedIn, function(req, res) {
    console.log("req.params.id - " + req.params.id)
    Register.find({'reconciled.status': "No"}).sort({date: -1, accountName: 1, description: 1}).exec(function(err, allRegisters){
        if (err){
            console.log(err);
        } else {
            res.render("register", {registers: allRegisters});
        }
    });
});

//All register routes are defaulted to "/registers" prefix on route
//


//NEW ROUTE
//router.get("/new", middleware.isLoggedIn, function(req, res) {
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Transactions.find().distinct('accountName', function(error, accts){
        res.render("register/new", {accts: accts});
    });
});
  
//NEW  recurring one-time register item ROUTE
//router.get("/new/recur", middleware.isLoggedIn, function(req, res) {
router.get("/new/recur", middleware.isLoggedIn, function(req, res) {
    Transactions.find().distinct('accountName', function(error, accts){
        res.render("register/new", {accts: accts});
    });
});
  
//CREATE ROUTE

router.post("/", middleware.isLoggedIn, function(req, res){

    var newRegister =   {date: req.body.date,
                        description: req.body.description,
                        amount: req.body.amount,
                        accountName: req.body.accountName,
                        memo: req.body.memo
    }   

        // Create new Register
    Register.create(newRegister, function(err, newRegister){
        if(err) {
            console.log(err);
            res.redirect("back")
        } else {
            newRegister.reconciled.id = 0,
            newRegister.reconciled.status = "No",
            newRegister.reconciled.date = "" ,
            newRegister.reconciled.description = "",
            newRegister.reconciled.amount =  0,
            newRegister.reconciled.transaction_type =  "",
            newRegister.reconciled.accountName =  "",
            newRegister.save();
            console.log("ID - " + newRegister.reconciled.id);
        res.redirect("/TransRecon/register/new");
        }
    });
    //}
});
 
//SHOW route
//This is the route to show info on one Register
router.get("/:id", middleware.isLoggedIn, function(req, res) {
    //  find the Register with the ID provided
    //render the Show Template with that Register
    Register.findById(req.params.id).exec(function(err, foundRegister) {
        if (err) {
            console.log(err);
        } else {
            res.render("register/", {register: foundRegister});
        }
    });
});

 
 //EDIT REGISTER ROUTE
 
 //router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
    Register.findById(req.params.id, function(err, foundRegister){
         if (err) {
             console.log(err);
             res.redirect("back");
         } else {
            //res.render("register/edit", {register_id: req.params.id, register: foundRegister});
            Transactions.find().distinct('accountName', function(error, accts){
                res.render("register/edit", {register: foundRegister, accts:accts });
            })
         }
        });
 });
 

//UPDATE REGISTER ROUTE
 
//router.put("/:id", middleware.isLoggedIn, function(req, res){
router.put("/:id", middleware.isLoggedIn, function(req, res){
    //console.log("Starting update - accountName is  " + req.body.accountName);
    Register.findByIdAndUpdate(req.params.id, req.body.register, function(err, foundRegister){   
    if (err) {
        console.log("Register update error - " + err );
        //console.log("ID is " + req.body.date);
        res.redirect("back");
     } else {
            //console.log("Got past update - Register is " + foundRegister.accountName);
            //res.redirect("/register/" + req.params.id);
            res.redirect("/TransRecon/register/");
            }
    });
});

// DELETE REGISTER CONFIRM  ROUTE
 
router.get("/:id/delete", middleware.isLoggedIn, function(req, res) {
    Register.findById(req.params.id, function(err, foundRegister){
         if (err) {
             console.log(err);
             res.redirect("back");
         } else {
            //console.log("Got to delete for " + req.params.id)
            res.render("register/delete", {register: foundRegister});
            }
         })
 });

 //DELETE REGISTER ROUTE
 
router.delete("/:id", middleware.isLoggedIn, function(req, res){
    Register.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/TransRecon/register");
        }
    });
 });
 

module.exports = router;
