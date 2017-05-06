// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var configDB = require('./database.js');
var Sequelize = require('sequelize');
var pg = require('pg').native;
var pghstore = require('pg-hstore');
var sequelize = new Sequelize(configDB.url);
var User       = sequelize.import('../models/user');
User.sync();

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {	
	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
			done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id).then(function(user){
			done(null, user);
		}).catch(function(e){
			done(e, false);
		});
	});

	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with username
		usernameField : 'username',
		passwordField : 'password',
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		},
		function(req, username, password, done) {		
			User.findOne({ where: { username: username }})
				.then(function(user) {
					if (!user) {
						done(null, false, req.flash('loginMessage', 'Unknown user'));
					} else if (!user.validPassword(password)) {
						done(null, false, req.flash('loginMessage', 'Wrong password'));
					} else {
						done(null, user);
					}
				})
				.catch(function(e) { 
					done(null, false, req.flash('loginMessage',e.name + " " + e.message));
				});				
		}
	));

    

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        username : 'username',
				firstname : 'firstname',
				middleinitial : 'middleinitial',
				lastname : 'lastname',
        password : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, username, password, done) {        
		//  Whether we're signing up or connecting an account, we'll need
		//  to know if the username address is in use.
		console.log('In local signup')
		User.findOne({ where: { username: username }})
			.then(function(existingUser) {
				console.log('starting userid check')				
				
				// check to see if there's already a user with that username
				if (existingUser) {
					console.log('found user')
					return done(null, false, req.flash('loginMessage', 'That username is already taken.'));
				}
				else {
					// create the user
					console.log('starting to create user')
					var newUser = User.build ({username: username, firstname: firstname, middleinitial: middleinitial,
						 lastname: lastname, password: User.generateHash(password)});	
					newUser.save().then(function() {done (null, newUser);}).catch(function(err) { done(null, false, req.flash('loginMessage', err));});
					console.log('complete create user')
				}
			})
			.catch(function (e) {
				done(null, false, req.flash('loginMessage',e.name + " " + e.message));				
			})
    }));


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	console.log('In isLoggedIn')
	if (req.isAuthenticated())
		return next();
	req.flash("error", "Please Login first if you wish to do that...");
	res.redirect("/TransRecon/login");
}

};