module.exports = function(app, db, testDB) {
    fs = require('fs');  
   	db.createDB("database.db");
   	testDB.createDB("testdb.db");


    var myVar = setTimeout(function(){
		db.addUser('SSNAdmin', 'admin','OK','administer');
    }, 1000);
	
    var isMeasuringPerformance=false;
    
    // =========== INDEX PAGE  ==============
    app.get('/', function(req, res) {
    	
	if ('username' in req.cookies)
	    res.redirect('/users');
	else 
	    res.redirect('/login');
    });

    // =========== LOGIN PAGE  ==============
    app.get('/login', function(req, res) {
    if(isMeasuringPerformance)
    	res.render('busy');
	else if ('username' in req.cookies) {
	    res.redirect('/users');
	} else {
	    res.locals.title = "Login";
	    res.render('login');
	}
    });

    // ========== USER DIRECTORY ===========
    app.get('/users', function(req, res) {	
    if(isMeasuringPerformance)
    	res.render('busy');
	else if ('username' in req.cookies) {
	    db.getUsers(callback);
	} else
	    res.render('login');
		
	function callback(result) {
	res.locals.result=result;		
	res.locals.title = "Users";
	res.locals.success = true;
	res.locals.message=req.session.message;
	res.render('users');
	}
    });

    // ========== USER DIRECTORY ===========[need REST API]
    app.get('/usersjson', function(req, res) {
		if(isMeasuringPerformance)
    		res.render('busy');
    	else{	    	
	   		db.getUsers(callback);
			res.redirect('/');
		}
		
    	function callback(result) {
		res.locals.result=result;
		res.locals.title = "Users";
		res.json(result);
    	}
    });
	    
    // ============== CHAT =============
    app.get('/chat', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
	    else if ('username' in req.cookies)
	        db.getMessages(function(doc){
	  		res.locals.title = "Chat";
	 		res.render("chat", {result: doc});
	    });
	    else
	     res.render('login');
    });

    // ============== MEASURE PERFORMANCE =============
    app.get('/measure', function(req,res){
    	if(isMeasuringPerformance)
    		res.render('busy');
		else if ('username' in req.cookies){
	  		res.locals.title = "MeasurePerformance";
	 		res.render('performance');
	    }
	    else
	     res.render('login');
    });

    app.get('/isbusy', function(req,res){
    	console.log("busy");
    	console.log("**"+isMeasuringPerformance);
    	if(isMeasuringPerformance)    		
    	res.send({start:true}); //not equivalent to "return"!
    	else
    		res.send({start:false});

    });

	// to set flag
    app.get('/startmeasurement', function(req,res){
    	

    	isMeasuringPerformance=true;
    	// flag=true;
    	console.log("start--set flag to "+ isMeasuringPerformance);
    	// console.log("start--set flag# to "+ flag);
    });

     app.get('/stopmeasurement', function(req,res){
    	
    	isMeasuringPerformance=false;
    	console.log("stop--set flag to "+ isMeasuringPerformance);
    	
    });

    app.post('/measurechat', function(req,res){

    	function callback(result){
    		if(result=="Messages Saved")
    			res.status(200).send("Success");
    	}
    	 testDB.saveMessages(req.body.message, req.body.timestamp, req.body.username, callback);
    });

    app.get('/measurechat', function(req,res){
    	function callback(result){
    		if(result!==undefined)
    			res.status(200).send("Success");
    	}
    	 testDB.getMessages(callback);
    });

    app.get('/resetmeasurement', function(){
    	testDB.deleteAllMessages();
    });

// ============== PRIVATE CHAT =============
    app.get('/privatechat', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
		else if ('username' in req.cookies)
	    	db.getPriMsg(req.cookies.username, req.param('receiver'), function(doc){
	    		res.locals.title = "PrivateChat";
				res.render("privatechat", {receiver: req.param('receiver'), result:doc});
	    	});
		else
	    	res.render('login');
    });


    // ============== ANNOUNCEMENT =============[need REST API]
    app.get('/announcejson', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
    	else{			
	    	db.getAnnouce(callback);
		}
		
		function callback(result){
		res.locals.result=result;
		res.locals.title = "PostAnnouncement";
		res.json(result);
		}
    });

       // ============== ANNOUNCEMENT =============
    app.get('/announce', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
		else if ('username' in req.cookies)
	    	db.getAnnouce(function(doc){
			res.locals.title = "Post Announcement";
			res.render("announce", {result: doc});
	   		});
		else
	    	res.render('login');
    });
 
    // ============== SET STATUS =============
    app.get('/status', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
		else if ('username' in req.cookies) {
	   		res.locals.title = "Status";
	    	res.render('status');
		} else {
	    	res.render('login');
		}
    });

    
    // ============== LOGOUT =============
    app.get('/logout', function(req, res) {
	res.cookie('username', '', {expires:new Date(1)});
	res.clearCookie('username');
	req.session.destroy();
	res.redirect('/');
    });

    
    // =========== POST LOGIN ==============
    app.post('/login', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');	
    	else{
    		var username = req.body.username;
			var password = req.body.password;
			var password2 = req.body.password2;
    		//check account status -- iter 5
    		var checkAccountStatusCallback = function(result){
				if(result!==undefined&&result.accountstatus=='inactive'){
					res.render('blocklogin');	
					return;		
				}
				else{
						if (fs.readFileSync('./banned.txt', 'utf8').split("\n").indexOf(username) > -1) {
	    					res.locals.failure = true;
	    					res.locals.message = "Username Banned";
	    					res.locals.title = "Login";
	    					res.render('login');
	    					return;
						}
		
					function callback(result) {
	    				if (result == "Success") {
							res.cookie('username', username, {maxAge:600000});
							req.session.success=true;
							req.session.message="Welcome, " + username;
							res.redirect('/users');
	    				} else if (result == "Password Incorrect") {
	    					res.locals.title = "Login";
							res.locals.failure = true;
							res.locals.message = "Password incorrect, please try again";
							res.render('login');
	    				} else if (result == "User does not exist") {
	    					if(password2==password){
								db.addUser(username, password, null,'citizen');
		    					res.cookie('username', username, {maxAge:200000});
		    					req.session.message = "New user created: " + username;
		    					res.redirect('/users');				
	    					}
	    				else
	    					res.render('loginsignup',{username:username, password:password});	
	    				}

					}
					db.userExists(username, password, callback);
				}				
			}	
			db.checkAccountStatus(username,checkAccountStatusCallback);
			//check account status ends
		}
    });

    // =========== POST STATUS ==============
    app.post('/status', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
    	else{
			var status = req.body.status;
			db.setStatus(req.cookies.username, status, callback);
		}
	
		function callback(result) {
	    	if (result == "Success") {
	    		req.session.success=true;
				req.session.message = "Successfully set status: " + status;
				res.redirect('/users');
	    	} else {
				res.locals.failure = true;
				res.locals.message = "Error";
				res.render('status');
	    	}
		}
    });


    // =============== SEARCH =================
    app.get('/search', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
		else if ('username' in req.cookies) {	    	
	    	db.getUsers(callback);
		} else
	    res.redirect('/');
		
    	function callback(result) {
		res.locals.title = "Search";
		res.locals.others=result;
		res.locals.current=req.cookies.username;
		res.render('search');
    	}
    });

    app.post('/search', function(req, res) {
    	if(isMeasuringPerformance)
    		res.render('busy');
    	else{
	    function nonStop(word) {
		return fs.readFileSync('./stop_words.txt', 'utf8').trim().split(",").indexOf(word) == -1 && word !== "";
	    }
	    
	function error(msg) {
	    function errorcall(result) {
		res.locals.title = "Result";
		res.locals.others=result;
		res.locals.current=req.cookies.username;
		res.locals.failure = true;
		res.locals.message = msg;
		res.render('search');
	    }
	    db.getUsers(errorcall);
	}
	

	// console.log(req.body);
	var target = req.body.target;	    
	if (target == "Users") {
	   // console.log("searching users");	   
	    var names = req.body.username.trim().split(" ").filter(noempty);
	    if (!names.length) {
		error("No username specified");
	    } else {
		db.searchUsers(names, usercall);
	    }	    
	} else if (target == "Status") {
	    if (!req.body.code) {
		error("No status code selected");
	    } else {		
		db.searchStatus(req.body.code, statuscall);
	    }
	} else if (target == "Announcements" || target == "Public" || target == "Private") {
	    function msgcall(result) {
		if (result.length) {
		    res.locals.title = "Results";
		    res.locals.msgs=result;
		    res.render('search');
		} else {
		    error("No matching announcements found");
		}		    
	    }
	    if (target == "Announcements") {
		var keywords = req.body.keyword[0].split(" ").filter(nonStop);
		if (!keywords.length) {
		    error("Either no keywords specified or only stop words specificed");
		} else {
		    db.searchAnnouncements(keywords, msgcall);
		}
	    } else if (target == "Public") {
		var keywords2 = req.body.keyword[1].split(" ").filter(nonStop);
		if (!keywords2.length) {
		    error("Either no keywords specified or only stop words specificed");
		} else {
		    db.searchPublic(keywords2, msgcall);
		}
	    } else {
		var k = req.body.keyword[2].split(" ").filter(nonStop);
		if (!k.length || !req.body.others) {
		    error("Please enter acceptable keywords and select private chat user");
		} else {
		    db.searchPrivate(k, req.body.others, req.cookies.username, msgcall);
		}
	    }
	} else {
	    error("No search target selected");
	}
}

function noempty(x) {
return x !== "";
}

function statuscall(result) {
    if (result.length) {
	res.locals.title = "Results";
	res.locals.status=result;
	res.render('search');
    } else {
	error("No matching statuses found");
    }
}

function usercall(result) {
    if (result.length) {
	res.locals.title = "Results";
	res.locals.users=result;
	res.render('search');
    } else {
	error("No matching users found");
    }
}
});


//====================PROFILE====================
app.get('/administer', function(req, res){
	res.render('users_admin');

});

app.get('/editprofile', function(req, res){
	req.session.oldusername=req.param('userprofile');
	res.locals.title='Edit Profile';
	res.render('profile',{oldusername: req.param('userprofile')});
});
// concurrency issue here!!!
app.post('/finishprofile', function(req, res){
	var accountstatus=req.body.accountstatus;
	var privilegelevel=req.body.privilegelevel;
	var username=req.body.username;
	var password=req.body.password;
	// console.log('oldusername='+req.session.oldusername);
	// console.log('accountstatus='+ accountstatus);
	// console.log('privilegelevel='+privilegelevel);
	// console.log('username='+username);
	// console.log('password='+password);

	if (fs.readFileSync('./banned.txt', 'utf8').split("\n").indexOf(username) > -1) {
	    res.locals.failure = true;
	    res.locals.message = "Username Banned";	    
	    res.locals.title='Edit Profile';
		res.render('profile');
	}
	else{
		res.locals.success = true;
		res.locals.message = "Edit Successfully";
		db.updateUser(req.session.oldusername, username, password, accountstatus, privilegelevel);
		res.locals.title='Choose Users';
		res.render('users_admin');
	}
});

app.get('/checkprivilege', function(req,res){
	var callback = function(result){
		res.send({privilege: result.privilege});
	}
	var username=req.param('username');
	db.checkPrivilege(username,callback);	
});

app.get('/checkaccountstatus', function(req,res){
	var callback = function(result){
		res.send({accountstatus: result.accountstatus});
	}
	var username=req.param('username');
	db.checkAccountStatus(username,callback);
});

app.get('/retrievesettings', function(req,res){
	var callback = function(result){
		res.send({result: JSON.stringify(result)});
		console.log(JSON.stringify(result));
	}
	var oldusername=req.param('oldusername');
	console.log('oldusername='+ oldusername);
	db.getUserInfo(oldusername,callback);
});

    //returns current time
	var current_time = function() {
		var d = new Date(Date.now());
		var datestring = d.toLocaleDateString();
		var timestring = d.toLocaleTimeString();
		return datestring.concat(" ", timestring);
	};

	var getMyTime = function(){
		var date=new Date();
		return date.getTime()+'';
	}
  
};
		
