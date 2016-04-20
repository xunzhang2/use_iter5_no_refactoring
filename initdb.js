var dbfile = "database.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbfile);

db.serialize(function() {
    db.run("DROP TABLE IF EXISTS Citizens;");
    db.run("DROP TABLE IF EXISTS Messages;");
    
    db.run('CREATE TABLE Citizens ' +
	   '("username" TEXT PRIMARY KEY, "password" TEXT, "status" TEXT DEFAULT null)');
    db.run('CREATE TABLE Messages ' +
	   '("message" TEXT, "timestampe" TEXT, "username" TEXT,' +
	   'FOREIGN KEY(username) REFERENCES Users(username))');
});

db.close();
