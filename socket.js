var HashMap = require('hashmap');
module.exports = function(io, db) {

  var map = new HashMap();
  io.on("connection", function(socket){

//============================ collect online users  =====================================

    socket.on('usersList', function (data) {
      if(map.has(data.name)){
        var list = map.get(data.name);
        list.push(socket.id);
        map.set(data.name,list);
      }else{
        var newlist = [];
        newlist.push(socket.id);
        map.set(data.name, newlist);
      }
  
       console.log("online users "+map.keys()); 
    });
//============================ send userlist   =====================================
    socket.on('usersListReq', function(){

          for (var x in map.keys()){
            db.setOnOff(map.keys()[x], "online");
          }
         function callback(result) {
            socket.emit('alllUsers', result);
            
            // for(x in result){
            //    console.log(result[x].username+" "+ result[x].isonline);
            // }
            
         }
         db.getUsers(callback);
    });

//============================ PUBLIC CHAT =====================================
    // reveive new public message from user, send it to other users
    socket.on('sendPublicMessage', function(data){
      io.emit("broadcastPublicMessage", data);
      db.saveMessages(data.message, current_time(), data.name, function(){});
      
    });

//============================ PRIVATE CHAT =====================================

    socket.on("joinRoom",function(data){
      socket.join(data.room);
    });


    socket.on('sendPrivateMessage', function(data){
      // console.log("~~receiver "+data.receiver);
      var roomname=data.sender<data.receiver?data.sender.concat(data.receiver):data.receiver.concat(data.sender);
      // console.log(roomname);
      socket.broadcast.to(roomname).emit("broadcastPrivateMessage", data);
	db.savePriMsg(data.message, current_time(), data.sender, data.receiver, function(result){});
    });

   
//============================ ANNOUNCEMENT =====================================
 // reveive announcements from user
    socket.on('announcement', function(data){
      io.emit("newAnn", {msg: data.msg, time: current_time(), name:data.name});
      db.saveAnnouce(data.msg, current_time(), data.name, function() {});
    });
  //============================ DISCONNECT =====================================   

    socket.on('disconnect', function(){
       deleteID(socket.id);
    });
 });


 //delete offline users
    var deleteID = function(id) {

       map.forEach(function(value, key) {
           if( value.indexOf(id) > -1){
              value = value.splice(value.indexOf(id), value.indexOf(id));
              if(value.length < 1){
                db.setOnOff(key,"offline");
                map.remove(key);
              }
           }

       });
    };

//returns current time
  var current_time = function() {
    var d = new Date(Date.now());
    var datestring = d.toLocaleDateString();
    var timestring = d.toLocaleTimeString();
    return datestring.concat(" ", timestring);
  }; 


};
