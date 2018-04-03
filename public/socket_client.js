$(document).ready(function () {
  var socket = io('http://localhost:8080');

  $('.demoBoxDisplay-devise').click((data) => {
    let _div = data;
    let sentData = moduleDemo.getData(_div);
    socket.emit('sendInstrument', sentData);
  })

  socket.on('messageFromServer', function (data) {
    let recupData = data;
    moduleDemo.getMinMax(recupData);
  });
});