var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),

    User        = require("../models/user");
    

//module.exports = function(app, passport) {

//
//AUTH ROUTES
//
router.get("/", function(req, res) {
    res.render("landing");
});

router.get("/signup", function(req, res){
    res.render("signup");
});

//===================
// Login form
//===================
router.get("/login", function(req, res){
    //res.render("login");
    res.render('login', { message: req.flash('loginMessage') })
});

//===================
// Login logic
//===================

router.post("/login", passport.authenticate("local-login", {
    successRedirect: "/TransRecon/transactions",
    failureRedirect: "/TransRecon/login",
    failureFlash : true // allow flash messages
		}));

    //}), function(req, res) {
    //});


//LOGOUT
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out...");
    res.redirect("/TransRecon") ;
});

// SIGNUP =================================

router.get("/signup", function(req, res){
    res.render("signup", { message: req.flash('loginMessage') });
});
	
// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/TransRecon/transactions', // redirect to the secure profile section
  failureRedirect : '/TransRecon/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));
    


		

module.exports = router;
	
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	
		// SIGNUP =================================
		// show the signup form
/*		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('loginMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));


// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/login', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));



};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}*/