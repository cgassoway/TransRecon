var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Register    = require("../models/register"),
    Transactions = require("../models/transaction"),
    flash       = require("connect-flash"),
    middleware  = require("../middleware"),  //index.js is automatically picked up because of it's name
    tools       = require("../shared/tools"),
    Validator   = require('validator');

//================================================
//REGISTER ROUTES
//================================================
//

//INDEX route
router.get("/",  middleware.isLoggedIn, function(req, res) {
  Register.find({}).sort({date: -1, merchant: 1, accountName: 1}).exec(function(err, allRegisters){
    if (err){
        console.log(err);
    } else {
        res.render("register", {registers: allRegisters});
    }
  });
});

//INDEX route
router.get("/unrecon",  middleware.isLoggedIn, function(req, res) {
  Register.find({'reconciled.status': "No"}).sort({date: -1,  merchant: 1, accountName: 1}).exec(function(err, allRegisters){
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
router.get("/new", middleware.isLoggedIn, function(req, res) {
  Transactions.find().distinct('accountName', function(err, accts){
    if (err) {
      console.log("Transactions.find().distinct  - " + err );
      throw err;
    } else {
    Transactions.find().distinct('institution', function(err, finInst){
      if (err) {
        console.log("Register.find().distinct  - " + err);
        throw err;
      } else {
        res.render("register/new", {accts:accts, finInst:finInst });
        }
      });
    };    
  });
});
  
//NEW  recurring one-time register item ROUTE
router.get("/new/recur", middleware.isLoggedIn, function(req, res) {
  Transactions.find().distinct('accountName', function(err, accts){
    if (err) {
      console.log("Transactions.find().distinct  - " + err );
      throw err;
    }
    Transactions.find().distinct('institution', function(err, finInst){
      if (err) {
          console.log("Register.find().distinct  - " + err);
          throw err;
      }
    
    res.render("register/new", {accts:accts, finInst:finInst });
    });
  });
});
    
  
//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
  var newRegister =   {date: req.body.date,
                      merchant: req.body.merchant,
                      amount: req.body.amount,
                      accountName: req.body.accountName,
                      memo: req.body.memo,
                      reconciled: {status: 'No',
                                  date: new Date(),
                                  id: 0}
  }   
  // Create new Register
  tools.addNewRegister(newRegister);
  res.redirect("/TransRecon/register/new");
});
 
//SHOW route
//This is the route to show info on one Register
//router.get("/:id", middleware.isLoggedIn, function(req, res) {
  //  find the Register with the ID provided
  //render the Show Template with that Register
  //Register.findById(req.params.id).exec(function(err, foundRegister) {
  //  if (err) {
  //      console.log(err);
  //  } else {
  //      res.render("register/", {register: foundRegister});
  //  }
  //});
  //console.log("got to show route")
//});

 
 //EDIT REGISTER ROUTE
  router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
  Register.findById(req.params.id, function(err, foundRegister){
    if (err) {
        console.log(err);
        res.redirect("back");
    } else {
      Transactions.find().distinct('accountName', function(err, accts){
        if (err) {
          console.log("Transactions.find().distinct  - " + err );
          throw err;
        }
        res.render("register/edit", {register: foundRegister, accts:accts });
      }); 
    };
  });
});
 

//UPDATE REGISTER ROUTE
router.put("/:id", middleware.isLoggedIn, function(req, res){
  Register.findByIdAndUpdate(req.params.id, req.body.register, function(err, foundRegister){   
  if (err) {
    console.log("Register update error - " + err );
    res.redirect("back");
    } else {
      res.redirect("/TransRecon/register");
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
