
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , api = require('./routes/api')
  , userApi = require('./routes/userApi')
  , http = require('http')
  , path = require('path');

var app = express();

var mongoose = require('mongoose');

var config = require('./config');

var user = require('./models/user');

var passport = require('passport'),
	facebookStrategy = require('passport-facebook').Strategy;


//setting for passport
passport.serializeUser(function(user,done)
{
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	user.findOne({_id : id}, function(err, user){
		done(err,user);
	});
});

mongoose.connect(config.dev.dbUrl);

passport.use(new facebookStrategy({
	clientID: config.dev.fb.appId,
	clientSecret: config.dev.fb.appSecret,
	callbackURL: config.dev.fb.url + 'fbauthed',
}, function(accessToken, refreshToken, profile, done)
	{
		process.nextTick(function(){
			var query = user.findOne({'fbId': profile.id});
			query.exec(function(err, oldUser){
				
				if(oldUser)
				{
					console.log("found old user: " + oldUser.name + ": Logged in!");
					done(null, oldUser);
				}
				else{
					var newUser = new user();
					newUser.fbId = profile.id;
					newUser.name = profile.displayName;
					newUser.email = profile.emails[0].value;
					newUser.fbUserName = profile.username;
					console.log(newUser);
					newUser.save(function(err){
						if(err){
							throw err;
						}
						console.log("New user " + newUser.name + " was created");
						done(null, newUser);
					});
				}
			});
			
		});
	}
));

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({secret:'kjhsa312398sadck23h08'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//ROUTING
app.get('/', routes.index);

app.get('/lists', ensureAuthenticated, routes.lists);

app.post('/api/list/', ensureAuthenticated, api.addList);
app.post('/api/listAddOwner/', ensureAuthenticated, api.listAddOwner);

app.get('/list/:id', ensureAuthenticated, routes.showList);
app.get('/word/:id', ensureAuthenticated, routes.wordDetails);

app.post('/api/guess/', ensureAuthenticated, api.updateWordWithGuess);

app.get('/api/lists/', api.lists);

 app.post('/api/removeWord/', ensureAuthenticated, api.removeWord);

app.get('/api/user/', ensureAuthenticated, userApi.users);

app.get('/api/word/', ensureAuthenticated, api.words);
app.post('/api/word', ensureAuthenticated, api.addWord);
app.post('/api/updateWord/', ensureAuthenticated, api.updateWord);

app.post('/api/addTranslation/', ensureAuthenticated, api.addTranslation);
app.post('/api/removeTranslation/', ensureAuthenticated, api.removeTranslation);

app.get('/api/words/:id', api.wordsByList);
app.get('/api/word/:id', api.wordById);

app.post('/api/removeList/', ensureAuthenticated, api.removeList);

app.get('/fbauth', passport.authenticate('facebook', {scope:'email'}));

app.get('/fbauthed', passport.authenticate('facebook', {failureRedirect: '/'}), function(req,res){
	console.log(req.session);
	if (req.session.goto && req.session.goto.length > 1){
		var goto = req.session.goto;
		req.session.goto = '';
		res.redirect(goto);
		}
	else{
		res.redirect('/lists');
		}
});

app.get('/logout', function(req, res){
	req.logOut();
	res.redirect('/');
});

app.get('/error', function(req,res){
	res.send(401,'{err: bad login}');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Vocabulary server listening on port ' + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { 
    	return next(); 
    }
    if (req.url.length > 1)
    	req.session.goto = req.url;
    	
    res.redirect('/');
}

