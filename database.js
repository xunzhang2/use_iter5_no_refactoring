var sqlite3 = require("sqlite3").verbose();
var fs      = require("fs");

function database(filename) {
    this.db = new sqlite3.Database(filename);
}

//=================================== DB INITIALIZATION =============================================

database.prototype.createDB = function(filename){
    if(fs.existsSync(filename) === false) {
	fs.openSync(filename,"w");
    }

	this.db.run("CREATE TABLE IF NOT EXISTS Users (" +
	"username TEXT NOT NULL, " +
	"password TEXT NOT NULL, " +
	"onoff TEXT, " +
	"status TEXT, " + 
	"accountstatus TEXT, " + 
	"privilege TEXT )");

    this.db.run("CREATE TABLE IF NOT EXISTS Messages (" +
		"timestamp TEXT NOT NULL, " +
		"username TEXT NOT NULL, " +
		"message TEXT)");

    this.db.run("CREATE TABLE IF NOT EXISTS PriMsg (" +
		"message TEXT NOT NULL, " +
		"timestamp TEXT NOT NULL, " +
		"sender TEXT NOT NULL, " +
		"receiver TEXT NOT NULL)");


    this.db.run("CREATE TABLE IF NOT EXISTS Announ (" +
		"timestamp TEXT NOT NULL, " +
		"username TEXT NOT NULL, " +
		"message TEXT NOT NULL)");

},

//=============================  VALIDATE USER INFO  ===================================
database.prototype.userExists = function(username, password, call){
    var query = "SELECT password FROM Users WHERE username='"+username+"';";
    this.db.get(query, function(err, row){
	if (err)
	    console.log(err);
	else if (row) { // if non empty result (aka username exists)
	    if (row.password == password) 
			call("Success");		
	    else 
			call("Password Incorrect");    
	}
	else
		call("User does not exist");
    });
},

database.prototype.checkUser = function(username, call){
    var query = "EXISTS(SELECT 1 FROM Users WHERE username='"+username+"' LIMIT 1)";
    this.db.get("SELECT " + query, function(err, row){
	if (err) 
	    console.log(err);
	else 
	    call(row[query]);
    });
},



//=============================   USER DIRECTORY  ===================================
database.prototype.addUser = function(username, password, status, privilege){
	this.db.run("INSERT INTO Users (username,password,onoff,status,accountstatus,privilege) VALUES (?,?,?,?,?,?)",username,password,"online",status,"active",privilege);
},

database.prototype.getUsers = function(call){
    var query = "SELECT username, status, onoff FROM Users ORDER BY username;";
    this.db.all(query, function(err, rows) {
	if (err)
	    console.log(err);
	call(rows);
    });
},
//=================================  PUBLIC CHAT  ===================================
database.prototype.getMessages = function(callback){
    var query = "SELECT * FROM Messages";
    this.db.all(query, function(err, rows) {

	if(err) {
	    console.log(err);
	}
	callback(rows);
    });
},

database.prototype.getUserMessages = function(username, callback){
    var query = "SELECT * FROM Messages WHERE username ='" + username + "';";
    this.db.all(query, function(err, rows) {
	if(err) {
	    console.log(err);
	}
	callback(rows);
    });
},

//
database.prototype.saveMessages = function(messages, timestamp, username, call){
    this.db.run("INSERT INTO Messages(message, timestamp, username) VALUES (?, ?, ?)", messages, timestamp, username);
    call("Messages Saved");
},

// //============================  TEST  ===================================
database.prototype.deleteAllMessages = function() {
    var query = "DELETE FROM Messages;";
    this.db.run(query);
},

//============================  POST ANNOUNCEMENT  ===================================
database.prototype.getAnnouce = function(callback){
    var query = "SELECT * FROM Announ";
    this.db.all(query, function(err, rows) {
	if(err) {
	    console.log(err);
	}
	callback(rows);
    });
},
//
database.prototype.saveAnnouce= function(messages, timestamp, username, call){
    this.db.run("INSERT INTO Announ(message, timestamp, username) VALUES (?, ?, ?)", messages, timestamp, username);
    call("Annoucement Saved");
},

//=================================  PRIVATE CHAT  ===================================
database.prototype.getPriMsg = function(user1, user2, callback){
    var query = "SELECT * FROM PriMsg WHERE (sender=? and receiver=?) OR (sender=? and receiver=?)";
    this.db.all(query, user1, user2, user2, user1, function(err, rows) {
	
	if(err) {
	    console.log(err);
	}
	callback(rows);
    });
},
//
database.prototype.savePriMsg = function(messages, timestamp, user1, user2, call){
    this.db.run("INSERT INTO PriMsg(message, timestamp, sender, receiver) VALUES (?, ?, ?, ?)", messages, timestamp, user1, user2, call("Success"));
},

database.prototype.getConvos = function(user, call) {
    var query1 = "SELECT sender AS other FROM PriMsg WHERE receiver='" + user + "' ";
    var query2 = "SELECT receiver AS other FROM PriMsg WHERE sender='" + user + "' ";
    this.db.all(query1 + " UNION " + query2 + ";", function(err, rows) {
	if (err) {
	    console.log(err);
	}
	function extract(x) {
	    return x.other;
	}
	rows = rows.map(extract);
	console.log(rows);
	call(rows);
    });
},

//=================================  SHARE STATUS  ===================================
database.prototype.setStatus = function(username, status, call){

    this.db.run("UPDATE Users SET status = '" +status+ "' WHERE username = '" +username+ "';", function(err) {
	console.log(this.changes);
	if (this.changes) {
	    call("Success");
	} else {
	    call("Error");
	}
    });
},

database.prototype.setOnOff = function(username, onoff ){

    this.db.run("UPDATE Users SET onoff = '" +onoff+ "' WHERE username = '" +username+ "';", function(err) {
	console.log(this.changes);
    });
},

/////////////////////////////////////////////////////////////////////////////////////
// SEARCH: "SELECT [col] FROM [table] WHERE [col] LIKE "%[keyword]%" OR [col]='value';
/////////////////////////////////////////////////////////////////////////////////////

database.prototype.searchUsers = function(usernames, call) {
    var query = "SELECT username FROM Users WHERE username LIKE '%" + usernames.join("%' OR username LIKE '%") + "%';";
    this.db.all(query, function(err, rows) {
	if (err)
	    console.log(err);
	call(rows);
    });
},

database.prototype.searchStatus = function(status, call) {
    var query = "SELECT username, status FROM Users WHERE status LIKE '%" + status + "%';";
    this.db.all(query, function(err, rows) {
	if (err)
	    console.log(err);
	call(rows);
    });
},

database.prototype.searchAnnouncements = function(keywords, call) {
    var query = "SELECT * FROM Announ WHERE message LIKE '%" + keywords.join("%' OR message LIKE '%") + "%';";
    this.db.all(query, function(err, rows) {
	if (err)
	    console.log(err);
	call(rows);
    });
},


database.prototype.searchPublic = function(keywords, call) {
    var query = "SELECT * FROM Messages WHERE message LIKE '%" + keywords.join("%' OR message LIKE '%") + "%';";
    this.db.all(query, function(err, rows) {
	if (err)
	    console.log(err);
	call(rows);
    });
},

database.prototype.searchPrivate = function(keywords, user1, user2, call) {
    var query = "SELECT * FROM PriMsg WHERE message LIKE '%" + keywords.join("%' OR message LIKE '%") + "%' AND (sender='" + user1 +"' OR sender='" + user2 + "') AND (receiver='" + user1 +"' OR receiver='" + user2 +"');";
    this.db.all(query, function(err, rows) {
	if (err)
	    console.log(err);
	call(rows);
    });
},

//=============================   PROFILE  ===================================
database.prototype.updateUser = function(oldusername, username, password, accountstatus, privilegelevel){	
	this.db.run("UPDATE Users SET username='" + username + "', password='" + password + "', accountstatus='" + accountstatus + "', privilege='" + privilegelevel + "' WHERE username='" + oldusername + "';");
},

database.prototype.checkPrivilege = function(username,call){
	var query = "SELECT privilege FROM Users WHERE username='" +username + "';"; 
	this.db.all(query, function(err, rows){
		if(err)
			console.log(err);
		else
			call(rows[0]);
		// console.log("rows="+JSON.stringify(rows[0]));
	});
},

database.prototype.checkAccountStatus = function(username,call){
	var query = "SELECT accountstatus FROM Users WHERE username='" + username + "';";
	this.db.all(query, function(err, rows){
		if(err)
			console.log(err);
		else
			call(rows[0]);
	});
},

database.prototype.getUserInfo = function(username,call){
	var query = "SELECT * FROM Users WHERE username='" + username + "';";
	this.db.all(query, function(err,rows){
		if(err)
			console.log(err);
		else{
			call(rows);
			console.log(rows);
		}
		
	});
}

module.exports = database;
