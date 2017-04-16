//ALL MIDDLEWARE GOES HERE
//var Transaction = require("../models/transaction");
//var Register = require("../models/register");
var flash = require("connect-flash");
var middlewareObject = {};

/*
middlewareObject.checkTransactionOwnership = function(req, res, next) {
    //Is user logged in?
    if (req.isAuthenticated()){
        Transaction.findById(req.params.id, function(err, foundTransaction){
        if (err) {
            req.flash("error", err.message);
            console.log(err);
            res.redirect("back");
            next();
        } else {
            //Does the user own campground
            //Use .equals() method because req.params.id is string and author.id is object
            //.equals() handles the two different types.
            if (foundTransaction.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You must have ownership of the campground to update it...");
                res.redirect("back");
                }
        }
    
        
        });
     } else {
        req.flash("error", "Please Login first if you wish to do that...");
        // Return user to previous page
        res.redirect("back");
        }
};

middlewareObject.checkRegisterOwnership = function(req, res, next) {
   //Is user logged in?
if (req.isAuthenticated()){
    Register.findById(req.params.register_id, function(err, foundRegister){
    if (err) {
        console.log(err);
        res.redirect("back");
    } /*else {
        //Does the user own register
        //Use .equals() method because req.params.id is string and author.id is object
        //.equals() handles the two different types.
        if (foundRegister.author.id.equals(req.user._id)) {
            next();
        } else {
            req.flash("error", "You must be the have ownership of the register to update it...");
            res.redirect("back");
            }
    }
    
    });
} else {
    // Return user to previous page
    res.redirect("back");
    }
};
*/
middlewareObject.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
      }
      req.flash("error", "Please Login first if you wish to do that...");
      res.redirect("/TransRecon/login");
};
    
module.exports = middlewareObject;
