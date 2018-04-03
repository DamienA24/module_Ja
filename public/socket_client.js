$(document).ready(function () {
  var socket = io('http://localhost:8080');

  $('#demoBoxInfos-button-sell').click(() => {
    socket.emit('sendInstrument', data);
  })

  socket.on('messageFromServer', function (data) {
    console.log(data);
  });
});