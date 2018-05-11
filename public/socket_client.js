$(document).ready(function () {
  var socket = new io('ws://localhost:8080/');

  $('.demoBoxDisplay-devise').click((data) => {
    moduleDemo.tradeTake.type = 'off';
    moduleDemo._divDevise = data;
    let sentData = moduleDemo.getData(moduleDemo._divDevise);
    moduleDemo.renitializeInterface();
    socket.emit('sendInstrument', sentData);
  });

  $('.demoBoxDisplay-nav').click((data) => {
    moduleDemo.tickInterval = data.currentTarget.dataset.value;

    let _div = data;
    let sentData = moduleDemo.getData(_div);
    socket.emit('sendInstrument', sentData);
  });

  $('#demoBoxInfos-buttons').click((data) => {
    if ($('#demoBoxInfos-button-sell').hasClass("show") || $('#demoBoxInfos-button-buy').hasClass("show") && !$('#demoBoxDisplay-pending').hasClass('show')) {
      if ($('#demoBoxInfos-button-buy').hasClass("buttonClose")) {
        moduleDemo.tradeTake.type = 'off';
        let closeTrade = moduleDemo.closeTrade();
        socket.emit('closeTrade', closeTrade);

        let sentData = moduleDemo.getData(moduleDemo._divDevise);
        socket.emit('sendInstrument', sentData);
        moduleDemo.renitializeInterface();
      } else {
        let sendTrade = moduleDemo.sendTrade();
        if (sendTrade.lot < 1) {
          $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
        } else {
          socket.emit('sendTrade', sendTrade);
        }
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

  socket.on('messageFromServerPostTrade', function () {
    moduleDemo.tradeTake.endY = moduleDemo.endY;
    moduleDemo.tradeTake.firstCurrency = moduleDemo.firstC;
    moduleDemo.tradeTake.secondCurrency = moduleDemo.secondC;
    moduleDemo.tradeTake.lastPrice = moduleDemo.lastPrice;
    moduleDemo.tradeTake.type = 'on';
    moduleDemo.tradeTake.valSL = $("input[data-ref=demoBoxDisplay-stop]").val();
    moduleDemo.tradeTake.valTP = $("input[data-ref=demoBoxDisplay-take]").val();
    moduleDemo.tradeTake.posSL = $("#demoBoxDisplay-stop").position();
    moduleDemo.tradeTake.posTP = $("#demoBoxDisplay-take").position();

    moduleDemo.drawTradeTake(moduleDemo.tradeTake);
    moduleDemo.changeInterface();
  });

  moduleDemo.init();
});