// Setup express server
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);

// Additional extensions
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// Setup app settings
var routes = require('./routes');
var DATABASE = require('./database.js');
// set up database
var db = new DATABASE("database.db");
var testDB = new DATABASE("testdb.db");


// MVC variables set up
//var Connect = require('./models/database.js');
//var connector = new Connect();
// Models variables set Up
//var Announcement = require('./models/announce.js');
//var announcement = new Announcement(connector);
//var User = require('./models/users.js');
//var user = new User(connector);
//var Message = require('./models/messages.js');
//var messages = new Message(connector);
//var Status = require('./models/status.js');
//var status = new Status(connector);

app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: 'sessionsecret' }));

// Views
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

// Routes
require('./routes.js')(app, db, testDB);
require('./socket.js')(io, db);
require('./api.js')(app, db);

//Controller Setup
// require('./socket.js')(io, messages, announcement);
// require('./controllers/announcementController.js')(app,announcement);
// require('./controllers/logInOutController.js')(app,user);
// require('./controllers/publicChatController.js')(app,messages);
// require('./controllers/routeController.js')(app,connector); // ??
// require('./controllers/shareStatusController.js')(app,status);

// Start application
var PORT = 3000;
http.listen(PORT, function () {
    console.log('Server listening at port %d', PORT);
});

module.exports = app;

