var active=$('#active');
var inactive=$('#inactive');
var administrator=$('#administrator');
var coordinator=$('#coordinator');
var monitor=$('#monitor');
var citizen=$('#citizen');
var username=$('#username');
var password=$('#password');
var oldusername=$('#oldusername').text();
console.log('***oldusername='+oldusername);

//retrieve settings
$.ajax({
      url:  '/retrievesettings?oldusername='+ oldusername,
      type: 'GET',
      async: false,
      cache: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        console.log("data="+JSON.stringify(data));
        
        }
});

var cancelEdit = function(){
	window.location.href='/users';
}

active.attr('checked', true);

username.attr("placeholder", "Type your answer here");

document.getElementById('cancel').addEventListener("click", cancelEdit);