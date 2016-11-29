var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    User        = require("../models/user");
    
router.get("/", function(req, res) {
    res.render("landing");
});

//
//AUTH ROUTES
//

router.get("/signup", function(req, res){
    res.render("signup");
});

router.post("/signup", function(req, res) {
    var userName = new User({username: req.body.username,
                                firstName: req.body.firstName,
                                middleInitial: req.body.middleInitial,
                                lastName: req.body.lastName});
    User.register(userName,req.body.password, function(err, user) {
//    User.signup(new User({username: req.body.username}),req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Transaction Reconciliation, " + user.username);
            res.redirect("/TransRecon/transactions");
        });
    });
});

//===================
// Login form
//===================
router.get("/login", function(req, res){
    res.render("login");
});

//===================
// Login logic
//===================

router.post("/login", passport.authenticate("local", {
    successRedirect: "/TransRecon/transactions",
    failureRedirect: "/TransRecon/login"
    }), function(req, res) {
    });



//LOGOUT
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out...");
    res.redirect("/TransRecon") ;
});


module.exports = router;