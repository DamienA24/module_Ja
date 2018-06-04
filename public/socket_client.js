$(document).ready(function () {
  var socket = io('http://localhost:8080/');

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

  $('#demoBoxInfos-button-sell').click(() => {
    if ($('#demoBoxInfos-button-sell').hasClass('show') && !$('#demoBoxInfos-button-buy').hasClass('show') && !$('#demoBoxDisplay-pending').hasClass('show')) {
      moduleDemo.postTrade(socket);
    }
    if ($('#demoBoxInfos-button-sell').hasClass('buttonModify') && $('#demoBoxInfos-button-buy').hasClass('show')) {
      alert('modify')
    }
    if ($('#demoBoxDisplay-pending').hasClass('show')) {
      let sendTrade = moduleDemo.sendTrade();
      if (sendTrade.lot < 1) {
        $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
      } else {
        moduleDemo.changeInterface();
        moduleDemo.tradeTake.type = 'on';
      }
    }
  });

  $('#demoBoxInfos-button-buy').click(() => {
    if ($('#demoBoxInfos-button-buy').hasClass('show') && !$('#demoBoxInfos-button-sell').hasClass('show') && !$('#demoBoxDisplay-pending').hasClass('show')) {
      moduleDemo.postTrade(socket);
    }
    if ($('#demoBoxInfos-button-buy').hasClass('buttonClose') && $('#demoBoxInfos-button-sell').hasClass('show')) {
      moduleDemo.tradeTake.type = 'off';
      moduleDemo.closeTrade();
      moduleDemo.tradeTake.pending = false;
    }
    if ($('#demoBoxDisplay-pending').hasClass('show') && $('#demoBoxInfos-button-buy').hasClass('buttonClose')) {
      moduleDemo.changeInterface();
      moduleDemo.tradeTake.type = 'on';
    }
    if ($('#demoBoxDisplay-pending').hasClass('show') && $('#demoBoxInfos-button-buy').hasClass('show') && !$('#demoBoxInfos-button-sell').hasClass('show')) {
      let sendTrade = moduleDemo.sendTrade();
      if (sendTrade.lot < 1) {
        $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
      } else {
        moduleDemo.changeInterface();
        moduleDemo.tradeTake.type = 'on';
        moduleDemo.tradeTake.valSL = $("input[data-ref=demoBoxDisplay-stop]").val();
        moduleDemo.tradeTake.valTP = $("input[data-ref=demoBoxDisplay-take]").val();
        moduleDemo.tradeTake.valPE = $("input[data-ref=demoBoxDisplay-pending]").val();
        moduleDemo.tradeTake.pending = true;
        moduleDemo.postTradePendingTouch();
      }
    }
  });

  socket.on('messageFromServer', function (data) {
    let recupData = data;
    moduleDemo.drawChart(recupData);
  });

  socket.on('messageFromServerPostTrade', function () {
    moduleDemo.tradeTake.endY = moduleDemo.endY;
    moduleDemo.tradeTake.firstCurrency = moduleDemo.firstC;
    moduleDemo.tradeTake.secondCurrency = moduleDemo.secondC;
    moduleDemo.tradeTake.lastPrice = moduleDemo.lastPrice;
    moduleDemo.tradeTake.type = 'on';
    moduleDemo.tradeTake.valSL = $("input[data-ref=demoBoxDisplay-stop]").val();
    moduleDemo.tradeTake.valTP = $("input[data-ref=demoBoxDisplay-take]").val();

    moduleDemo.drawTradeTake(moduleDemo.tradeTake);
    moduleDemo.changeInterface();
  });

  /*  socket.on('messageFromServerTradeClose', function () {
     moduleDemo.closeTrade()
   }); */

  socket.on('ServerSendRealTime', function (data) {
    console.log(data);
    moduleDemo.drawUpdatePrice(data);
  });

  let dataInitial = {
    currency: 'EUR/USD',
    interval: 'h1'
  };

  moduleDemo.init();
  socket.emit('sendInstrument', dataInitial);
  socket.emit('realTime');
});