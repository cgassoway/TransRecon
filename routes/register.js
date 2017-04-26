var express     = require("express"),
    router      = express.Router({mergeParams: true}),
  //  Register    = require("../models/register"),
  //  Transactions = require("../models/transaction"),
    flash       = require("connect-flash"),
    middleware  = require("../middleware"),  //index.js is automatically picked up because of it's name
    tools       = require("../shared/pgtools"),
    Validator   = require('validator');

//================================================
//REGISTER ROUTES
//================================================
//
//All register routes are defaulted to "/registers" prefix on route
//
//INDEX route
router.get("/",  middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT * FROM registers ORDER BY date DESC';
  tools.runQuery(text, [], (err, allRegisters) => {
    res.render("register", {registers: allRegisters});
    })
  });

//INDEX route
router.get("/unrecon",  middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT * FROM registers WHERE status = \'No\' ORDER BY date DESC, merchant, account_name ASC';
  tools.runQuery(text, [], (err, allRegisters) => {
    res.render("register", {registers: allRegisters});
  })
});

//NEW ROUTE
/*
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
*/

router.get("/new", middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT DISTINCT account_name FROM transactions ORDER BY  account_name';
  tools.runQuery(text, [], (err, accts) => {
    var textI = 'SELECT DISTINCT institution FROM transactions ORDER BY institution';
    tools.runQuery(text, [], (err, institutions) => {
      //Transactions.find().distinct('accountName', function(error, accts){
      res.render("register/new", {accts:accts, institutions:institutions });
    })
  });
});

//NEW  recurring one-time register item ROUTE
router.get("/new/recur", middleware.isLoggedIn, function(req, res) {
  Transactions.find().distinct('accountName', function(err, accts){
    if (err) {
      console.log("Transactions.find().distinct  - " + err );
      throw err;
    }
    Transactions.find().distinct('institution', function(err, institution){
      if (err) {
          console.log("Register.find().distinct  - " + err);
          throw err;
      }
    res.render("register/new", {accts:accts, institution:institution });
    });
  });
});
    
  
//CREATE ROUTE

router.post("/", middleware.isLoggedIn, function(req, res){
  var text = 'INSERT INTO registers (date, merchant, amount, account_name, memo, status, status_date, register_id)' +
                              'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  var dateToday = new Date();
  var values = [req.body.date, req.body.merchant, req.body.amount, req.body.account_name, req.body.memo,
                            '\'No\'', dateToday, 0];
  tools.runQuery(text, values, (err, results) => {
    if (err) {
        console.log(err);
        res.redirect("back")
      } 
    res.redirect("/TransRecon/register/new");
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
  var text = 'SELECT * FROM registers WHERE id = ' + req.params.id  + ';'
  var args = [req.params.id]
  tools.runQuery(text, [], (err, foundRegister) => {
    if (err) {
        console.log(err);
        res.redirect("back");
    } else {
      var text = 'SELECT DISTINCT account_name FROM transactions ORDER BY  account_name';
      tools.runQuery(text, [], (err, accts) => {
        res.render("register/edit", {register: foundRegister, accts:accts });
      })
    }
  });
 }); 

//UPDATE REGISTER ROUTE
router.put("/:registers_id", middleware.isLoggedIn, function(req, res){
  console.log(req.params.registers_id)
  var text = 'UPDATE registers SET (date, account_name, institution, merchant, amount, memo, status, status_date)'  +
                ' = (' +  '\'' + req.body.date + '\', \'' + req.body.account_name + '\', \'' + req.body.merchant + '\', ' + req.body.amount + 
                ', \'' + req.body.memo + '\', \'' + req.body.status + '\', \'' + req.body.status_date + '\') WHERE id = ' + req.params.register_id
  console.log(text)
  tools.runQuery(text, [], (err, foundRegister) => { 
    if (err) {
      console.log("Register update error - " + err );
      res.redirect("back");
    } else {
      res.redirect("/TransRecon/register/");
    }
    });
});


// DELETE REGISTER CONFIRM  ROUTE
 router.get("/:id/delete", middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT * FROM registers WHERE id = $1';
  var args = [req.params.id]
  tools.runQuery(text, args, (err, foundRegister) => {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
    //console.log("Got to delete for " + req.params.id)
    res.render("register/delete", {register: foundRegister});
    }
  });
 });

 //DELETE REGISTER ROUTE
router.delete("/:id", middleware.isLoggedIn, function(req, res){
  var text = 'DELETE FROM registers WHERE id = ' +req.params.id;
  tools.runQuery(text, [], (err, foundRegister) => {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect("/TransRecon/register");
    }
  });
 });
 

module.exports = router;
