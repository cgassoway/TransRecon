var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Balances     = require("../models/balances"),
    middleware  = require("../middleware");  //index.js is automatically picked up because of it's name
//================================================
//BALANCES ROUTES
//================================================
//
//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/",  middleware.isLoggedIn, function(req, res) {
    var reportType = "all";
    Balances.find({}).sort({fiName: 1, accountName: 1}).exec(function(err, allBalances){
        if (err){
            console.log(err);
        } else {
            res.render("balances", {balances: allBalances, report: reportType});
            //res.render("balances", {balances: allBalances});
        }
    });
});


//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/recon",  middleware.isLoggedIn, function(req, res) {
    var reportType = "bank";
    Balances.find({$or: [{accountType: "bank"}, {accountType: "credit"}]}).sort({accountType: 1, accountName: 1}).exec(function(err, allBalances){
        if (err){
            console.log(err);
        } else {
            res.render("balances", {balances: allBalances, report: reportType});
            //res.render("balances", {balances: allBalances});
        }
    });
});

//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/invest",  middleware.isLoggedIn, function(req, res) {
    var reportType = "invest";
    Balances.find({accountType: "investment"}).sort({accountType: 1, accountName: 1}).exec(function(err, allBalances){
        if (err){
            console.log(err);
        } else {
            res.render("balances", {balances: allBalances, report: reportType});
            //res.render("balances", {balances: allBalances});
        }
    });
});

//All balances routes are defaulted to "/balances" prefix on route
//

/*
//NEW ROUTE
//router.get("/new", middleware.isLoggedIn, function(req, res) {
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("balances/new");
         })
  

//CREATE ROUTE
//router.post("/", middleware.isLoggedIn, function(req, res){
router.post("/", middleware.isLoggedIn, function(req, res){

   var newBalances =    {dateDue: req.body.dateDue,
                        description: req.body.description,
                        planAmount: req.body.planAmount,
                        chargedAmount: req.body.chargedAmount,
                        frequency: req.body.frequency,
                        accountName: req.body.accountName};
   // Create new Balances
   Balances.create(newBalances, function(err, newBalances){
       if(err){
           console.log(err)
           throw err;
       } else{
           console.log("added new balances" + newBalances);
           res.redirect("/TransRecon/balances");       
       }
    });
 });
 
 
 
//SHOW route
//This is the route to show info on one Balances
router.get("/:id", middleware.isLoggedIn, function(req, res) {
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


 //EDIT BALANCES ROUTE
 
 //router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
     router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
     Balances.findById(req.params.id, function(err, foundBalances){
         if (err) {
             console.log(err);
             res.redirect("back");
         } else {
            //res.render("balances/edit", {balances_id: req.params.id, balances: foundBalances});
            res.render("balances/edit", {balance: foundBalances});
         }
     });
 });
 
//UPDATE BALANCES ROUTE
 
//router.put("/:id", middleware.isLoggedIn, function(req, res){
router.put("/:id", middleware.isLoggedIn, function(req, res){
    Balances.findByIdAndUpdate(req.params.id, req.body.balances, function(err, foundBalances){   
    if (err) {
        console.log("Balances update error" + err );
        console.log("ID is " + req.body.balances);
        res.redirect("back");
     } else {
         console.log("Got past update - Balances is " + req.body.Balances);
        //res.redirect("/balances/" + req.params.id);
        res.redirect("/TransRecon/balances/");
     }
 });
 });
 
 //DELETE BALANCES ROUTE
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
