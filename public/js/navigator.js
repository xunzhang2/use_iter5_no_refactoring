
console.log("username="+getCookie('username'));
$.ajax({
      url:  '/checkprivilege?username='+ getCookie('username'),
      type: 'GET',
      async: false,
      cache: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        // console.log("data="+data.privilege);
        switch(data.privilege){
          case 'citizen':
            document.getElementById('announcements').style.display='none';
          case 'coordinator':
            document.getElementById('administer').style.display='none';
            document.getElementById('performance').style.display='none';
            break;
          case 'monitor':
            document.getElementById('announcements').style.display='none';
            document.getElementById('administer').style.display='none';
            break;
        }
      }
});

var checkAccountStatus = function(){
  $.ajax({
      url:  '/checkaccountstatus?username='+ getCookie('username'),
      type: 'GET',
      async: false,
      cache: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        console.log("data="+data.accountstatus);
        switch(data.accountstatus){
          case 'active':
            break;
          case 'inactive':
            alert("Your account status is inactive.");
            break;
        }
        }
});
}

document.getElementById('logout').addEventListener("click", checkAccountStatus);


