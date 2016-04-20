function init(){
socket = io();
username=getCookie('username'); // sender
receiver=$('#receive').html();
console.log("receiver "+receiver);

socket.on('connect', function () {
    sessionId = socket.io.engine.id;
    console.log('Connected private' + sessionId);
    var roomname=username<receiver?username.concat(receiver):receiver.concat(username);
    console.log(roomname);
    socket.emit('joinRoom', {room:roomname});
    socket.emit('usersList', { name: getCookie('username') });
  });

//attach new messages on message list
socket.on('broadcastPrivateMessage',function(data){
	console.log("broadcastPrivateMessage");
		var message = data.message;
    	var date=new Date();
    	var time=date.getHours()+':'+date.getMinutes();
    	$('#messages').prepend('<b style=\'float:left\'>' + receiver + '</b><b style=\'float:right\'>' + time + '</b><br />' + message + '<hr />');
	
});
}

$(document).on('ready', init);

//get messages from jade, send it to server
function sendprivatemessage(){
        $.ajax({
      url:  '/isbusy',
      type: 'GET',
      async: false,
      cache: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        console.log("data="+data.start);
        if(data.start)
            // document.write("~overwrite");
            window.location.href='/privatechat'; // purpose: to render busy.jade
        }
    });

    socket.emit('sendPrivateMessage',{message:$('#outgoingMessage').val(), sender:username, receiver:$('#receive').html()});
	console.log("sent");
	// append msg to myself
	var date=new Date();
    var time=date.getHours()+':'+date.getMinutes();
    $('#messages').prepend('<b style=\'float:left\'>Me</b><b style=\'float:right\'>' + time + '</b><br />' + $('#outgoingMessage').val() + '<hr />');
	$('#outgoingMessage').val('');
}


