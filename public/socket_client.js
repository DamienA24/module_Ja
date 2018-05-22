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
    if ($('#demoBoxInfos-button-sell').hasClass('show') && !$('#demoBoxInfos-button-buy').hasClass('show')) {
      let sendTrade = moduleDemo.sendTrade();
      if (sendTrade.lot < 1) {
        $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
      } else {
        moduleDemo.tradeTake.order = 'sell';
        socket.emit('sendTrade', sendTrade);
      }
    }
    if ($('#demoBoxInfos-button-sell').hasClass('buttonModify') && $('#demoBoxInfos-button-buy').hasClass('show')) {
      alert('modify')
    }
  });

  $('#demoBoxInfos-button-buy').click(() => {
    if ($('#demoBoxInfos-button-buy').hasClass('show') && !$('#demoBoxInfos-button-sell').hasClass('show')) {
      let sendTrade = moduleDemo.sendTrade();
      if (sendTrade.lot < 1) {
        $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
      } else {
        moduleDemo.tradeTake.order = 'buy';
        socket.emit('sendTrade', sendTrade);
      }
    }
    if ($('#demoBoxInfos-button-buy').hasClass('buttonClose') && $('#demoBoxInfos-button-sell').hasClass('show')) {
      moduleDemo.tradeTake.type = 'off';
      moduleDemo.closeTrade();
    }
  });
//to do order pending
  if ($('#demoBoxDisplay-pending').hasClass('show')) {
    let sendTrade = moduleDemo.sendTrade();
    if (sendTrade.lot < 1) {
      $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
    } else {
      socket.emit('sendTrade', sendTrade);
    }
  };

  socket.on('messageFromServer', function (data) {
    let recupData = data;
    /*     moduleDemo.getMinMax(recupData);
     */
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

  /* socket.on('test2', function (data) {
  console.log(data);
   moduleDemo.drawUpdatePrice(data);
  }); */

  let dataInitial = {
    currency: 'EUR/USD',
    interval: 'h1'
  };

  moduleDemo.init();
  socket.emit('test2');
  socket.emit('sendInstrument', dataInitial);

});