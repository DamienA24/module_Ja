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

  $('#demoBoxInfos-buttons').click(() => {
    if ($('#demoBoxInfos-button-sell').hasClass("show") || $('#demoBoxInfos-button-buy').hasClass("show") && !$('#demoBoxDisplay-pending').hasClass('show')) {
      let sendTrade = moduleDemo.sendTrade();
      if (sendTrade.lot < 1) {
        $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
      } else {
        socket.emit('sendTrade', sendTrade);
      }
    }

    if ($('#demoBoxDisplay-pending').hasClass('show')) {
      let sendTrade = moduleDemo.sendTrade();
      if (sendTrade.lot < 1) {
        $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
      } else {
        socket.emit('sendTrade', sendTrade);
      }
    }
  });

  socket.on('messageFromServer', function (data) {
    let recupData = data;
    moduleDemo.getMinMax(recupData);
  });

  socket.on('messageServerPostData', function () {
    alert('trade pris!');
  });

  moduleDemo.init();
});