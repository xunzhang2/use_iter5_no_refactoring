var socket = io();

//send username to the server
socket.on('connect', function (data) {
   socket.emit('usersList', { name: getCookie('username') });
});

//get messages from jade, send it to server
$('form').submit(function(){
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
			window.location.href='/announce'; // purpose: to render busy.jade
		}
    });
		
	var message = $('#messages').val();
    socket.emit('announcement',{msg: message, name: getCookie('username')});
	$('#messages').val('');
	return false;
});

//attach new messages on the message list
socket.on('newAnn',function(data){
    $('#messagelist').append('<li id="msg"><b style="float:left;font-size:150%;">' + data.name + '</b><p style="float:right">' + data.time + '</p><br/> <h3>' + data.msg + '</h3><hr/></li>');
});
