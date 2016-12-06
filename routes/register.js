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
router.get("/",  middleware.isLoggedIn, function(req, res) {
  Register.find({}).sort({date: -1, accountName: 1, description: 1}).exec(function(err, allRegisters){
    if (err){
        console.log(err);
    } else {
        res.render("register", {registers: allRegisters});
    }
  });
});

//INDEX route
router.get("/unrecon",  middleware.isLoggedIn, function(req, res) {
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
router.get("/new", middleware.isLoggedIn, function(req, res) {

  //console.log("Find distinct accountname");
  Transactions.find().distinct('accountName', function(err, accts){
    if (err) {
      console.log("Transactions.find().distinct  - " + err );
      throw err;
    } else {
    //console.log("Find distinct institution")
    Transactions.find().distinct('institution', function(err, finInst){
      if (err) {
        console.log("Register.find().distinct  - " + err);
        throw err;
      } else {
        //console.log("render register/new")
        res.render("register/new", {accts:accts, finInst:finInst });
        //console.log("past render register/new")
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
    //console.log(":id/edit institution find")
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
                      description: req.body.description,
                      amount: req.body.amount,
                      accountName: req.body.accountName,
                      institution: req.body.institution,
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
      //console.log("ID - " + newRegister.reconciled.id);
      res.redirect("/TransRecon/register/new");
    }
  });
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
      //console.log(":id/edit Transactions find")
      Transactions.find().distinct('accountName', function(err, accts){
        if (err) {
          console.log("Transactions.find().distinct  - " + err );
          throw err;
        }
        //console.log(":id/edit institution find")
        Transactions.find().distinct('institution', function(err, finInst){
          if (err) {
            console.log("Register.find().distinct  - " + err);
            throw err;
          }
        
        res.render("register/edit", {register: foundRegister, accts:accts, finInst:finInst });
        });
      });
    };
  });
});
 

//UPDATE REGISTER ROUTE
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
