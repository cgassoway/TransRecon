var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    Transactions    = require("../models/transaction"),
    Register        = require("../models/register"),
    Balances        = require("../models/balances")
    tools           = require("../shared/tools")
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

// Display Reports
router.get("/bldRegReports",   middleware.isLoggedIn, function(req, res) {
  Transactions.find().distinct('institution', function(error, finInst){
    res.render("reports/bldRegReports", {finInst: finInst});
    });
});
  
router.get("/bldTransReports",   middleware.isLoggedIn, function(req, res) {
  Transactions.find().distinct('institution', function(error, finInst){
    res.render("reports/bldTransReports", {finInst: finInst});
    });
});
router.get("/bldSummaryReports",   middleware.isLoggedIn, function(req, res) {
  Transactions.find().distinct('institution', function(error, finInst){
    res.render("reports/bldSummaryReports");
    });
});


//Reports generation Route

router.get("/register",   middleware.isLoggedIn, function(req, res) {
  var queryParams = req.query;
  //Format params in query to the form to build JSON format query string
  var rptParams = tools.bldQuery(queryParams)
  //Convert to JSON object
  var parsedParams = JSON.parse(rptParams); 
  //Get selected documents and render the query
  Register.find(parsedParams).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
    if (err) throw err;
    res.render("reports/regReport", {registers: foundRegister, rptData: "Register"});
  }); 
});

router.get("/transactions",   middleware.isLoggedIn, function(req, res) {
  var queryParams = req.query;
  //Format params in query to the form to build JSON format query string
  var rptParams = tools.bldQuery(queryParams)
  //Convert to JSON object
  var parsedParams = JSON.parse(rptParams); 
  //Get selected documents and render the query
  Transactions.find(parsedParams).sort({"date": -1, "accountName": 1 }).exec(function(err, foundRegister) {
    if (err) throw err;
    res.render("reports/regReport", {registers: foundRegister, rptData: "Transaction"});
  }); 

});

router.get("/summary",   middleware.isLoggedIn, function(req, res) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var rptFromDate = monthNames[Number(req.query.dateFrom.substr(0,2) - 1)] + " " +
                                      req.query.dateFrom.substr(3,2) + " " +
                                      req.query.dateFrom.substr(6,4);
  var rptToDate = monthNames[Number(req.query.dateTo.substr(0,2) - 1)] + " " +
                                      req.query.dateTo.substr(3,2) + " " +
                                      req.query.dateTo.substr(6,4);
  var rptDate = '{"date": {"$gte": "' + rptFromDate + '", "$lte": "' + rptToDate + '"}';
  
  var rptParams = rptDate + "}";
  var parsedParams = JSON.parse(rptParams);
 
  var summaryCtrs = {
                    fromDate: rptFromDate,
                    toDate: rptToDate,
                    trans: {
                            spent: 0,
                            income: 0,
                            spentReconciled: 0,
                            incomeReconciled: 0,
                            count: 0,
                            countReconciled: 0
                    },
                    reg: {
                          committedSpent: 0,
                          expectedIncome: 0,
                          spentReconciled: 0,
                          incomeReconciled: 0,
                          count: 0,
                          countReconciled: 0
                    },
                  };
  Transactions.find(parsedParams).exec(function(err, foundTransactions) {
    if (err) throw err;
    foundTransactions.forEach (function(transData) {
      summaryCtrs.trans.count++;
      if (transData.amount > 0) {
        //summaryCtrs.trans.income += transData.amount;
        if (transData.reconciled.status === 'Yes') {
          summaryCtrs.trans.incomeReconciled += transData.amount
          summaryCtrs.trans.countReconciled++
        } else {summaryCtrs.trans.income += transData.amount;}
      } else {
        //summaryCtrs.trans.spent +=transData.amount;
        if (transData.reconciled.status === 'Yes') {
          summaryCtrs.trans.spentReconciled += transData.amount
          summaryCtrs.trans.countReconciled++
        } else {summaryCtrs.trans.spent +=transData.amount;}
      }
    });

      Register.find(parsedParams).exec(function(err, foundRegister) {
        if (err) throw err;
        foundRegister.forEach (function(regData) {
          console.log("regAmount = " + regData.amount)
          summaryCtrs.reg.count++
          if (regData.amount > 0) {
            //summaryCtrs.reg.expectedIncome += regData.amount;
            if (regData.reconciled.status === 'Yes') {
              summaryCtrs.reg.incomeReconciled += regData.amount
              summaryCtrs.reg.countReconciled++
            } else {summaryCtrs.reg.expectedIncome +=regData.amount;}
          } else {
            //summaryCtrs.reg.committedSpent += regData.amount;
            if (regData.reconciled.status === 'Yes') {
              summaryCtrs.reg.spentReconciled += regData.amount
              summaryCtrs.reg.countReconciled++
            } else {summaryCtrs.reg.committedSpent += regData.amount;}
          }
          
        });
        console.log("# reg transactions = " + summaryCtrs.reg.count)
        console.log("regSpent - " +  summaryCtrs.reg.committedSpent + "  regIncome = " + summaryCtrs.reg.expectedIncome)
        res.render("reports/summaryReport", {summaryCtrs: summaryCtrs});  
    });  
  
        
      //
      //  Balances go here
      //
  
  
  });
  
});

module.exports = router;