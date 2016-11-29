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

router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res) {
    var userName = new User({username: req.body.username});
    User.register(userName,req.body.password, function(err, user) {
//    User.register(new User({username: req.body.username}),req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelp Campground, " + user.username);
            res.redirect("/campgrounds");
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
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
    }), function(req, res) {
    });



//LOGOUT
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out...");
    res.redirect("/campgrounds") ;
});


module.exports = router;