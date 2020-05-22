/* tslint:disable */
var ws;
var chatUsersCtr = document.querySelector('#chatUsers');
window.addEventListener('DOMContentLoaded', function () {
  ws = new WebSocket('ws://localhost:3000/ws');
  ws.addEventListener('open', onConnectionOpen);
  ws.addEventListener('message', onMessageReceived);
});

function onConnectionOpen() {
  console.log('Connection Opened');
  var queryParams = getQueryParams();

  if (!queryParams.name || !queryParams.group) {
    window.location.href = 'chat.html';
    return;
  }
  var event = {
    event: 'join',
    groupName: queryParams.group,
    name: queryParams.name
  };
  ws.send(JSON.stringify(event));
}

function onMessageReceived(event) {
  console.log('Connection Received');
  event = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
  console.log('Data : ', event);

  switch (event.event) {
    case 'users':
      chatUsersCtr.innerHTML = '';
      event.data.forEach((u) => {
        var userEl = document.createElement('div');
        userEl.className = 'chat-user';
        userEl.innerHTML = u.name;

        chatUsersCtr.appendChild(userEl);
      });
      break;

    default:
      break;
  }
}

function getQueryParams() {
  var search = window.location.search.substring(1);
  var pairs = search.split('&');
  var params = {};
  for (var pair of pairs) {
    var parsts = pair.split('=');
    params[decodeURIComponent(parsts[0])] = decodeURIComponent(parsts[1]);
  }

  return params;
}
