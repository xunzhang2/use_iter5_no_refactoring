module.exports = function(app, db) {
    fs = require('fs');
    db.createDB("database.db");

    // =========== REGISTER USER  ==============
    app.post('/api/users', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	function callback(result) {
	    if (result == "Success") {
		res.status(200).send("Success");
	    } else if (result == "Password Incorrect") {
		res.status(400).send("Incorrect");
	    } else if (result == "User does not exist") {
		db.addUser(username, password, function(done) {
		    res.status(201).send("Created");
		});
	    }
	    console.log("call done:" + result);
	}
	if (fs.readFileSync('./banned.txt', 'utf8').split("\n").indexOf(username) > -1) {
	    res.status(400).send("Banned");
	} else {
	    db.userExists(username, password, callback);
	}
    });

    // =========== Retrieve Users  ==============
    app.get('/api/users', function(req, res) {	
	function callback(result) {
	    res.send(result);
	}
	db.getUsers(callback);
    });

    // =========== Update User Status  ==============
    app.post('/api/users/:username/setstatus/:status', function(req, res) {
	function callback(result) {
	    if (result == "Success") {
		res.status(201).send("Status Created");
	    } else {
		res.status(404).send("Not found");
	    }
	}
	if (req.params.status != "OK" &&
	    req.params.status != "Help" &&
	    req.params.status != "Emergency") {
	    res.status(400).send("Invalid Status");
	    return;
	}
	db.setStatus(req.params.username, req.params.status, callback);
    });

    // =========== Post Public Message  ==============
    app.post('/api/messages/public', function(req, res) {
	var username  = req.body.username;
	var message   = req.body.message;
	var timestamp = req.body.timestamp;
	function verify(exists) {
	    function call(result) {
		if (result == "Messages Saved") {
		    res.status(201).send("Message Created");
		} 
	    }
	    if (exists) {
		db.saveMessages(message, timestamp, username, call);
	    } else {
		res.status(404).send("Not Found");
	    }
	}
	db.checkUser(req.body.username, verify);
    });

    // =========== Get Public Message  ==============    
    app.get('/api/messages/public', function(req, res) {
	function callback(result) {
	    res.send(result);
	}
	db.getMessages(callback);
    });

    // =========== Get User's Public Message  ==============    
    app.get('/api/messages/public/:username', function(req, res) {
	function verify(exists) {
	    function callback(result) {
		res.send(result);
	    }
	    if (exists) {
		db.getUserMessages(req.params.username, callback);
	    } else {
		res.status(404).send("Not Found");
	    }
	}
	db.checkUser(req.params.username, verify);
    });

    // =========== Post Private Message  ==============    
    app.post('/api/messages/private', function(req, res) {
	var sender = req.body.sender;
	var target = req.body.target;
	var message= req.body.message;
	var timestamp=req.body.timestamp;
	function verify(exists) {
	    function again(both) {
		if (both) {
		    db.savePriMsg(message, timestamp, sender, target, function(result) {
			if (result == "Success") 
			    res.status(201).send("Message Created");
		    });
		} else {
		    res.status(404).send("Not Found");
		}
	    }
	    if (exists) {
		db.checkUser(target, again);
	    } else {
		res.status(404).send("Not Found");
	    }
	}
	db.checkUser(sender, verify);
    });

    // =========== Get Private Message  ==============    
    app.get('/api/messages/private/:user1/:user2', function(req, res) {
	var user1 = req.params.user1;
	var user2 = req.params.user2;
	function verify(exists) {
	    function again(both) {
		if (both) {
		    db.getPriMsg(user1, user2, function(result) {
			res.send(result);
		    });
		} else {
		    res.status(404).send("Not Found");
		}
	    }
	    if (exists) {
		db.checkUser(user2, again);
	    } else {
		res.status(404).send("Not Found");
	    }
	}
	db.checkUser(user1, verify);
    });


    // =========== Get Private Targets  ==============    
    app.get('/api/users/:username/private/', function(req, res) {
	var username = req.params.username;
	function verify(exists) {
	    function sendback(result) {
		res.send(result);
	    }
	    if (exists) {
		db.getConvos(username, sendback);
	    } else {
		res.status(404).send("Not Found");
	    }
	}
	db.checkUser(username, verify);
    });

    // =========== Post Announcement  ==============    
    app.post('/api/messages/announcements/', function(req, res) {
	var message = req.body.message;
	var timestamp = req.body.timestamp;
	function call(result) {
	    res.status(201).send("Created");
	}
	db.saveAnnouce(message, timestamp, "API ENTRY", call);
    });
    
    // =========== Get Announcements  ==============    
    app.get('/api/messages/announcements/', function(req, res) {
	function call(result) {
	    res.send(result);
	}
	db.getAnnouce(call);
    });

    
    function nonStop(word) {
	return fs.readFileSync('./stop_words.txt', 'utf8').trim().split(",").indexOf(word) === -1 && word !== "";
    }

    // =========== Search Users  ==============        
    app.post('/api/users/search/', function(req, res) {
	function noempty(x) {
	    return x !== "";
	}
	function searchcall(result) {
	    if (result.length) {
		res.send(result);
	    } else {
		res.status(404).send("No Match");
	    }		    
	}
	var names = req.body.usernames.filter(noempty);
	db.searchUsers(names, searchcall);
    });

    // =========== Search Status  ==============        
    app.post('/api/users/search/status/:status', function(req, res) {
	if (req.params.status != "OK" &&
	    req.params.status != "Help" &&
	    req.params.status != "Emergency") {
	    res.status(400).send("Invalid Status");
	    return;
	}
	function searchcall(result) {
	    if (result.length) {
		res.send(result);
	    } else {
		res.status(404).send("No Match");
	    }		    
	}	
	db.searchStatus(req.params.status, searchcall);
    });
    
    // =========== Search Announcements  ==============        
    app.post('/api/messages/announcements/search/', function(req, res) {
	function searchcall(result) {
	    if (result.length) {
		res.send(result);
	    } else {
		res.status(404).send("No Match");
	    }		    
	}	
	var keywords = req.body.keywords.filter(nonStop);
	db.searchAnnouncements(keywords, searchcall);
	
    });

    // =========== Search Public  ==============        
    app.post('/api/messages/public/search/', function(req, res) {
	function searchcall(result) {
	    if (result.length) {
		res.send(result);
	    } else {
		res.status(404).send("No Match");
	    }		    
	}	
	var keywords = req.body.keywords.filter(nonStop);
	db.searchPublic(keywords, searchcall);
    });


    // =========== Search Private ==============        
    app.post('/api/messages/private/:user1/:user2/search', function(req, res) {
	function searchcall(result) {
	    if (result.length) {
		res.send(result);
	    } else {
		res.status(404).send("No Match");
	    }		    
	}	
	var keywords = req.body.keywords.filter(nonStop);
	var user1 = req.params.user1;
	var user2 = req.params.user2;
	function verify(exists) {
	    function again(both) {
		if (both) {
		    db.searchPrivate(keywords, user1, user2, searchcall);
		} else {
		    res.status(404).send("Not Found");
		}
	    }
	    if (exists) {
		db.checkUser(user2, again);
	    } else {
		res.status(404).send("Not Found");
	    }
	}
	db.checkUser(user1, verify);
    });

    



    


};
