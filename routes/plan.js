var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    tools         = require('../shared/pgtools'),
    //Plan        = require("../models/plan"),
    //Transactions = require("../models/transaction"),
    //Register    = require("../models/register"),
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
  //var args = ["bank", "credit"];
  var text = 'SELECT * FROM plans ORDER BY date ASC';
  tools.runQuery(text, [], (err, allPlans) => {
  //Plan.find({}).sort({dayOfMonth: -1}).exec(function(err, allPlans){
    //if (err){
      //console.log(err);
    //} else {
    res.render("plan", {plans: allPlans});
    })
  });



//All plan routes are defaulted to "/plans" prefix on route
//


//NEW ROUTE
//router.get("/new", middleware.isLoggedIn, function(req, res) {
router.get("/new", middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT DISTINCT account_name FROM transactions ORDER BY  account_name';
  tools.runQuery(text, [], (err, accts) => {
  //Transactions.find().distinct('accountName', function(error, accts){
    res.render("plan/new", {accts: accts});
  });
});
 
   
//CREATE ROUTE

router.post("/", middleware.isLoggedIn, function(req, res){

  var text = 'INSERT INTO plans (date, merchant, amount, account_name, frequency, until_date, memo)' +
                              'VALUES ($1, $2, $3, $4, $5, $6, $7)'
  var values = [req.body.date, req.body.merchant, req.body.amount, req.body.account_name, req.body.frequency,
                            req.body.until_date, req.body.memo,]
  tools.runQuery(text, values, (err, results) => {
    if (err) {
        console.log(err);
        res.redirect("back")
      } 
    res.redirect("/TransRecon/plan/new");
  });
});


 //EDIT PLAN ROUTE
 
 //router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
  //var text = 'SELECT * FROM plans WHERE id = $1;' 
  var text = 'SELECT * FROM plans WHERE id = ' + req.params.id  + ';'
  //console.log("Id is - " + req.params.id)
  //console.log("Query - " + text)
  var args = [req.params.id]
  tools.runQuery(text, [], (err, foundPlan) => {
    //console.log("plan rowCount = " + foundPlan[0].merchant)
    //Plan.findById(req.params.id, function(err, foundPlan){
    if (err) {
        console.log(err);
        res.redirect("back");
    } else {
      //console.log(foundPlan[0].date)
      //res.render("plan/edit", {id: req.params.id, plan: foundPlan});
      var text = 'SELECT DISTINCT account_name FROM transactions ORDER BY  account_name';
      tools.runQuery(text, [], (err, accts) => {
      //Transactions.find().distinct('accountName', function(error, accts){
        res.render("plan/edit", {plan: foundPlan, accts:accts });
      })
    }
  });
 });
 

//UPDATE REGISTER ROUTE
 
//router.put("/:id", middleware.isLoggedIn, function(req, res){
router.put("/:plans_id", middleware.isLoggedIn, function(req, res){
  console.log(req.params.plans_id)
  var text = 'UPDATE plans SET (date, merchant, amount, account_name, frequency, until_date, memo)'  +
                ' = (' +  '\'' + req.body.date + '\', \'' + req.body.merchant + '\', ' + req.body.amount + ', \'' + req.body.account_name + 
                '\',  \'' + req.body.frequency + '\', \'' + req.body.until_date + '\', \'' + req.body.memo + '\') WHERE id = ' + req.params.plans_id
  console.log(text)
  tools.runQuery(text, [], (err, foundPlan) => {
    //Plan.findByIdAndUpdate(req.params.id, req.body.plan, function(err, foundPlan){   
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
  var text = 'SELECT * FROM plans WHERE id = $1';
  var args = [req.params.id]
  tools.runQuery(text, args, (err, foundPlan) => {
    //Plan.findById(req.params.id, function(err, foundPlan){
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
    //console.log("Got to delete for " + req.params.id)
    res.render("plan/delete", {plan: foundPlan});
    }
  });
 });

 //DELETE REGISTER ROUTE
 
router.delete("/:id", middleware.isLoggedIn, function(req, res){
  var text = 'DELETE FROM plans WHERE id = ' +req.params.id;
  tools.runQuery(text, [], (err, foundPlan) => {
    //Plan.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect("/TransRecon/plan");
    }
  });
 });
 

module.exports = router;
