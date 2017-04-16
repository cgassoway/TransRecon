var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    tools         = require('../shared/pgtools'),
    middleware  = require("../middleware");  //index.js is automatically picked up because of it's name
//================================================
//BALANCES ROUTES
//================================================
//
//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/",  middleware.isLoggedIn, function(req, res) {
    var reportType = "all";
    var text = 'SELECT * FROM balances WHERE current_balance <> 0 or starting_balance <> 0 ORDER BY institution ASC, account_name ASC';
    tools.runQuery(text, [], (err, allBalances) => {
     if (err) throw err;
     res.render("balances", {balances: allBalances, report: reportType});
      });
    });

//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/recon",  middleware.isLoggedIn, function(req, res) {
  var reportType = "bank";
  var args = ["bank", "credit"];
  var text = 'SELECT * FROM balances WHERE account_type = $1 OR account_type = $2 ORDER BY account_type ASC, account_name ASC';
  tools.runQuery(text, args, (err, allBalances) => {
    if (err) throw err;
    res.render("balances", {balances: allBalances, report: reportType});
  });
});


//INDEX route
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/invest",  middleware.isLoggedIn, function(req, res) {
  var reportType = "invest";
  var text = 'SELECT * FROM balances WHERE account_type = $1 and (current_balance <> 0 or starting_balance <> 0) ORDER BY account_type ASC, account_name ASC';
  var args = ["investment"];
  tools.runQuery(text, args, (err, allBalances) => {
  if (err) throw err;
    res.render("balances", {balances: allBalances, report: reportType});
  })
});


//All balances routes are defaulted to "/balances" prefix on route
//

module.exports = router;
