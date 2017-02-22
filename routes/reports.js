var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    Transactions    = require("../models/transaction"),
    Register        = require("../models/register"),
    Balances        = require("../models/balances")
    middleware      = require("../middleware");  //index.js is automatically picked up because of it's name
//================================================
//Report ROUTES
//================================================
//

//Reports Selection Route

router.get("/",   middleware.isLoggedIn, function(req, res) {
  //console.log("All query strings: " + JSON.stringify(req.query.dateFrom));
  Transactions.find().distinct('institution', function(error, finInst){
    res.render("reports/bldreports", {finInst: finInst});
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
  if (req.query.finInst != "All"){
    var repFinInst = '"institution": "';
    repFinInst = repFinInst + req.query.finInst;
    repFinInst = repFinInst + '"';
    console.log(repFinInst)
    rptParams = rptParams +  ", " + repFinInst;
  }
  rptParams = rptParams + "}"
  console.log("rptParams - " + rptParams);
  console.log(rptParams)
  var parsedParams = JSON.parse(rptParams);
  console.log("Parsed - " + parsedParams);
  if (req.query.regTrans === "Register") {
    Register.find(parsedParams).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
      if (err) {
        throw err;
      } else {
        res.render("reports/rptgener", {registers: foundRegister});
        }
      });
    } else {
      Transactions.find(parsedParams).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
      if (err) {
        throw err;
      } else {
        res.render("reports/rptgener", {registers: foundRegister});
        }
      });
    };
});

module.exports = router;