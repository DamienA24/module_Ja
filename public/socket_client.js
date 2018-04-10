$(document).ready(function () {
  var socket = io('http://localhost:8080');

  $('.demoBoxDisplay-devise').click((data) => {
    let _div = data;
    let sentData = moduleDemo.getData(_div);
    socket.emit('sendInstrument', sentData);
  });

  $('.demoBoxDisplay-nav').click((data) => {
    moduleDemo.tickInterval = data.currentTarget.dataset.value;
    let _div = data;
    let sentData = moduleDemo.getData(_div);
    socket.emit('sendInstrument', sentData);
  });

  $('#demoBoxInfos-button-buy').click((data) => {
    if ($('#demoBoxInfos-button-buy').hasClass("show")) {
      let sendTrade = moduleDemo.sendTrade();
      socket.emit('sendTrade', sendTrade);
    }
  });

  $('#demoBoxInfos-button-sell').click((data) => {
    if ($('#demoBoxInfos-button-sell').hasClass("show")) {
      let sendTrade = moduleDemo.sendTrade();
      socket.emit('sendTrade', sendTrade);
    }
  });

  socket.on('messageFromServer', function (data) {
    let recupData = data;
    moduleDemo.getMinMax(recupData);
  });

  moduleDemo.init();
});