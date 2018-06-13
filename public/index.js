let moduleDemo = {
  canvasId: "demoBoxDisplay-chartCanvas",
  canvas: null,
  context: null,
  balance: 3000,
  dataIn: null,
  data: null,
  dates: null,
  myTimer: null,
  lastPrice: 0,
  min: 0,
  max: 30000,
  buffer: 0,
  endY: 0,
  endLine: 0,
  lot: null,
  candleCreate: false,
  type: null,
  _divDevise: null,
  typeIn: 'take',
  devise: "€",
  tickInterval: "h1",
  firstC: 'EUR',
  secondC: 'USD',
  tradeTake: {
    type: 'off',
    order: null,
    endY: 0,
    firstCurrency: '',
    secondCurrency: '',
    pending: false,
    lastPrice: 0,
    valPE: 0,
    valSL: 0,
    valTP: 0
  },

  init: () => {

    $('#demoBoxInfos-balance-value').html(moduleDemo.balance + " " + moduleDemo.devise);
    $('#demoBoxDisplay-tradeTake').hide();

    $(".demoBoxDisplay-devise.usd").addClass("on");
    $('.demoBoxDisplay-nav[data-value=h1]').addClass('on');

    moduleDemo.initBarAndInput("demoBoxDisplay-take", {
      axis: 'y',
      containment: '#demoBoxDisplay-chart',
      start: moduleDemo.takeProfitStartDrag,
      drag: moduleDemo.takeProfitDrag,
      stop: moduleDemo.takeProfitStopDrag
    });

    moduleDemo.initBarAndInput("demoBoxDisplay-stop", {
      axis: 'y',
      containment: '#demoBoxDisplay-chart',
      start: moduleDemo.stopLossStartDrag,
      drag: moduleDemo.stopLossDrag,
      stop: moduleDemo.stopLossStopDrag
    });

    moduleDemo.initBarAndInput("demoBoxDisplay-pending", {
      axis: 'y',
      containment: '#demoBoxDisplay-chart',
      start: moduleDemo.pendingStartDrag,
      drag: moduleDemo.pendingDrag,
      stop: moduleDemo.pendingStopDrag
    });
    $('#demoBoxDisplay-stopWhere-label').mousemove(() => {
      moduleDemo.closeTradeLineTouch();
    });

    $('#demoBoxInfos-stopLoss-value').keyup(() => {
      moduleDemo.closeTradeLineTouch();
    });

    $('#demoBoxDisplay-takeWhere-label').mousemove(() => {
      moduleDemo.closeTradeLineTouch();
    });

    $('#demoBoxInfos-takeProfit-value').keyup(() => {
      moduleDemo.closeTradeLineTouch();
    });

    $('#demoBoxDisplay-pendingWhere-close').click(() => {
      moduleDemo.closeTrade();
    });

    $(".numberBox-up[data-ref=demoBoxDisplay-amount]").click(function () {

      let myVal = $("input[data-ref=demoBoxDisplay-amount]").val();

      $("input[data-ref=demoBoxDisplay-amount]").val(moduleDemo.numberMore(myVal, 1));
      moduleDemo.setTradeSize();
    });

    $(".numberBox-down[data-ref=demoBoxDisplay-amount]").click(function () {

      let myVal = $("input[data-ref=demoBoxDisplay-amount]").val();

      $("input[data-ref=demoBoxDisplay-amount]").val(moduleDemo.numberMore(myVal, -1));
      moduleDemo.setTradeSize();
    });

    $(".numberBox-up[data-ref=demoBoxDisplay-stop]").click(function () {
      moduleDemo.closeTradeLineTouch();
    });

    $(".numberBox-down[data-ref=demoBoxDisplay-stop]").click(function () {
      moduleDemo.closeTradeLineTouch();
    });

    $(".numberBox-up[data-ref=demoBoxDisplay-take]").click(function () {
      moduleDemo.closeTradeLineTouch();
    });

    $(".numberBox-down[data-ref=demoBoxDisplay-take]").click(function () {
      moduleDemo.closeTradeLineTouch();
    });

    $('input[data-ref=demoBoxDisplay-amount]').keyup(function () {

      let myVal = $("input[data-ref=demoBoxDisplay-amount]").val();

      $("input[data-ref=demoBoxDisplay-amount]").val(moduleDemo.numberVerifDot(myVal));
      moduleDemo.setTradeSize();
    });

    $("#demoBoxInfos-amount-type-up").click(function () {
      $("#demoBoxInfos-amount-type").toggleClass("pourcentage");

      myAmount = $('input[data-ref=demoBoxDisplay-amount]').val();
      $('input[data-ref=demoBoxDisplay-amount]').val(Math.floor(moduleDemo.balance * myAmount / 100));
      moduleDemo.setTradeSize();
    });

    $("#demoBoxInfos-amount-type-down").click(function () {
      $("#demoBoxInfos-amount-type").toggleClass("pourcentage");
      if ($('#demoBoxInfos-amount-type').hasClass('pourcentage') && parseFloat($('input[data-ref=demoBoxDisplay-amount]').val()) > 20) {

        myAmount = $('input[data-ref=demoBoxDisplay-amount]').val();
        $('input[data-ref=demoBoxDisplay-amount]').val(Math.floor(100 / (moduleDemo.balance / myAmount)));
      }
      moduleDemo.setTradeSize();
    });

    $("#demoBoxInfos-stopLoss-close").click(function () {
      moduleDemo.removeBar('demoBoxDisplay-stop');
    });

    $('input[data-ref=demoBoxDisplay-stopPips]').keyup(function () {

      let myVal = $('input[data-ref=demoBoxDisplay-stopPips]').val();
      moduleDemo.addPips(myVal);
    });

    $("#demoBoxInfos-takeProfit-close").click(function () {
      moduleDemo.removeBar('demoBoxDisplay-take');
    });

    $('#demoBoxInfos-change-buttonBox').click(function () {

      $('#demoBoxInfos-change').toggleClass("pending");
      $('#demoBoxDisplay-pending').toggleClass("show");
      $('#demoBoxInfos-pending').slideToggle("fast");

      if ($('#demoBoxDisplay-pending').hasClass('show')) {

        var myVal = moduleDemo.dataIn[moduleDemo.dataIn.length - 1][2];

        $("input[data-ref=demoBoxDisplay-pending]").val(moduleDemo.reduceNumber(myVal, 10000000));
        moduleDemo.takeKeyUp("demoBoxDisplay-pending");
      } else {
        if (!$("#demoBoxDisplay-take").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-take]').val(moduleDemo.reduceNumber(moduleDemo.dataIn[moduleDemo.dataIn.length - 1][7], 10000000));
          moduleDemo.takeKeyUp("demoBoxDisplay-take");
        }
        if (!$("#demoBoxDisplay-stop").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-stop]').val(moduleDemo.reduceNumber(moduleDemo.dataIn[moduleDemo.dataIn.length - 1][7], 10000000));
          moduleDemo.takeKeyUp("demoBoxDisplay-stop");
        }
      }
      moduleDemo.setTradeSize();
    });
  },

  getData: (data) => {

    let myObj = data.currentTarget.attributes.class.nodeValue;

    myObj = myObj.replace("demoBoxDisplay-devise ", "");
    myObj = myObj.replace(" transition_0_2", "");
    myObj = myObj.replace("off", "");

    if (myObj == 'usd' || myObj == 'aud' || myObj == 'cad' || myObj == 'jpy') {
      $('.demoBoxDisplay-devise').removeClass("on");
      $(".demoBoxDisplay-devise." + myObj).addClass("on");
      moduleDemo.firstC = data.currentTarget.dataset.first;
      moduleDemo.secondC = data.currentTarget.dataset.second;
    }

    let myTickInterval = moduleDemo.tickInterval;

    $('.demoBoxDisplay-nav').removeClass('on');
    $('.demoBoxDisplay-nav[data-value=' + moduleDemo.tickInterval + ']').addClass('on');

    let recoverdData = {
      currency: `${moduleDemo.firstC}/${moduleDemo.secondC}`,
      interval: myTickInterval
    };
    return recoverdData;
  },

  sendTrade: () => {
    let trade = {};
    trade.take = $('input[data-ref=demoBoxDisplay-take]').val();
    trade.stop = $('input[data-ref=demoBoxDisplay-stop]').val();
    trade.modify = moduleDemo.tradeTake.type == 'on' ? 'yes' : 'no';

    if ($('#demoBoxDisplay-pending').hasClass('show')) {
      trade.rate = Number($('#demoBoxDisplay-pendingWhere-label').html());
    } else {
      trade.rate = 0;
    }
    trade.lot = moduleDemo.lot;
    trade.type = moduleDemo.type;
    trade.currency = `${moduleDemo.firstC}/${moduleDemo.secondC}`;
    console.log(moduleDemo.typeIn)

    return trade;
  },

  postTrade: (socket) => {
    let sendTrade = moduleDemo.sendTrade();
    /* if (sendTrade.lot < 1) {
      $('#demoBoxInfos-tradeSize').html("<font style=color:red>1 lot minimum</font>");
    } */if (moduleDemo.type === 'sell') {
      moduleDemo.tradeTake.order = 'sell';
      socket.emit('sendTrade', sendTrade);
    } else if (moduleDemo.type === 'buy') {
      moduleDemo.tradeTake.order = 'buy';
      socket.emit('sendTrade', sendTrade);
    }
  },

  closeTrade: () => {
    let closeTrade = {};
    closeTrade.amount = moduleDemo.lot;
    closeTrade.close = 'on';
    moduleDemo.tradeTake.order = null;
    moduleDemo.tradeTake.type = 'off';

    let options = {
      series: [{
        markLine: {
          silent: false,
          data: [{
            yAxis: 0,
          }]
        }
      }]
    };
    moduleDemo.canvas.setOption(options);
    moduleDemo.renitializeInterface();
  },

  closeTradeLineTouch: () => {
    let stop = $("input[data-ref=demoBoxDisplay-stop]").val();
    let take = $("input[data-ref=demoBoxDisplay-take]").val();
    let price = moduleDemo.lastPrice.toFixed(4);
    let stopBis = Number(stop).toFixed(4);
    let takeBis = Number(take).toFixed(4);

    if (moduleDemo.tradeTake.order === 'sell') {
      if (stopBis <= price || takeBis >= price) {
        moduleDemo.closeTrade();
      }
    } else if (moduleDemo.tradeTake.order === 'buy') {
      if (stopBis >= price || takeBis <= price) {
        moduleDemo.closeTrade();
      }
    }
  },

  postTradePendingTouch: () => {
    moduleDemo.changeInterface();
    moduleDemo.tradeTake.type = 'on';
    moduleDemo.tradeTake.valSL = $("input[data-ref=demoBoxDisplay-stop]").val();
    moduleDemo.tradeTake.valTP = $("input[data-ref=demoBoxDisplay-take]").val();
    moduleDemo.tradeTake.valPE = $("input[data-ref=demoBoxDisplay-pending]").val();
    moduleDemo.tradeTake.pending = true;

    let myFunction = setInterval(() => {
      let valSL = $("input[data-ref=demoBoxDisplay-stop]").val();
      moduleDemo.tradeTake.valPE = $("input[data-ref=demoBoxDisplay-pending]").val();
      if (moduleDemo.tradeTake.valPE == moduleDemo.lastPrice.toFixed(4)) {
        moduleDemo.tradeTake.order = valSL < moduleDemo.tradeTake.valPE ? 'buy' : 'sell';
        moduleDemo.removeBar('demoBoxDisplay-pending');
        moduleDemo.drawTradeTake();
        moduleDemo.tradeTake.pending = false;
        clearInterval(myFunction);
      }
    }, 500);
  },

  drawGridYYY: () => {
    let myHtml = "";
    let myVolume = moduleDemo.max - moduleDemo.min;

    let myStep = myVolume / 5;

    for (let i = 1; i < 5; i++) {
      let toShow = (moduleDemo.min + myStep * (5 - i));
      myHtml += "<div class='yyy' style='top:" + (240 / 5 * i) + "px'><div class='yyy-value'>" + moduleDemo.reduceNumber(toShow, 10000000) + "</div></div>";
    }
    $('#demoBoxDisplay-yyy').html(myHtml);
  },

  drawGridXXX: () => {

    let myTickInterval = moduleDemo.tickInterval;
    let myHtml = "";

    let myStep = 7;

    for (let i = 1; i < 8; i++) {
      if (moduleDemo.dataIn[i * myStep]) {

        var myDate = moment(moduleDemo.dataIn[i * myStep][0] * 1000);
      }
      if (myTickInterval == "d1") {
        myHtml += "<div class='xxx' style='left:" + (50 * i) + "px'><div class='xxx-value'>" + myDate.format("MMM Do") + "</div></div>";
      } else {
        myHtml += "<div class='xxx' style='left:" + (50 * i) + "px'><div class='xxx-value'>" + myDate.format("HH:mm") + "</div></div>";
      }
    }
    $('#demoBoxDisplay-xxx').html(myHtml);
  },

  drawChart: (_data) => {
    moduleDemo.dataIn = _data.candles;
    moduleDemo.lastPrice = _data.candles[49][2];

    moduleDemo.max = 0;
    moduleDemo.min = 10000;

    for (let candle of moduleDemo.dataIn) {
      moduleDemo.max = Math.max(moduleDemo.max, candle[3]);
      moduleDemo.min = Math.min(moduleDemo.min, candle[4]);
    }
    moduleDemo.type = 1;
    moduleDemo.buffer = (moduleDemo.max - moduleDemo.min) * 20 / 100;

    moduleDemo.min = moduleDemo.min - moduleDemo.buffer;
    moduleDemo.max = moduleDemo.max + moduleDemo.buffer;

    let ratio = 240 / (moduleDemo.max - moduleDemo.min);
    moduleDemo.endY = 240 - (moduleDemo.lastPrice - moduleDemo.min) * ratio;

    $('input[data-ref=demoBoxDisplay-take]').val(moduleDemo.lastPrice);
    moduleDemo.takeKeyUp('demoBoxDisplay-take');

    $('input[data-ref=demoBoxDisplay-stop]').val(moduleDemo.lastPrice);
    moduleDemo.takeKeyUp('demoBoxDisplay-stop');

    $("#demoBoxInfos-price-down").html(_data.candles[49][1]);
    $("#demoBoxInfos-price-up").html(_data.candles[49][2]);

    $('#demoBoxDisplay-pending').css('top', 120);

    /*     moduleDemo.getYYYValue("demoBoxDisplay-take", 77);
        moduleDemo.getYYYValue("demoBoxDisplay-stop", 157); */
    moduleDemo.getYYYValue("demoBoxDisplay-pending", 117);

    moduleDemo.dates = moduleDemo.dataIn.map(function (item) {
      let d = new Date(item[0] * 1000);
      return d.getHours();
    });

    moduleDemo.data = moduleDemo.dataIn.map(function (item) {
      return [+item[1], +item[2], +item[3], +item[4]];
    });

    moduleDemo.initChart(moduleDemo.data, moduleDemo.dates);
    moduleDemo.drawGridYYY();
    moduleDemo.drawGridXXX();
  },

  initChart: (dataCandle, time) => {
    moduleDemo.canvas = echarts.init(document.getElementById(moduleDemo.canvasId));

    let options = {
      xAxis: {
        data: time,
        show: false,
        axisLine: {
          lineStyle: {
            color: '#8392A5'
          }
        },
        axisTick: {
          interval: 5
        }
      },
      grid: {
        left: '1%',
        right: '11.5%',
        top: '0%',
        bottom: '0%'
      },
      yAxis: {
        scale: true,
        show: false,
        min: moduleDemo.min,
        max: moduleDemo.max
      },
      series: [{
        type: 'k',
        data: dataCandle,
        itemStyle: {
          normal: {
            color: '#0CF49B',
            color0: '#FD1050',
            borderColor: '#0CF49B',
            borderColor0: '#FD1050'
          }
        }
      }]
    };
    moduleDemo.canvas.setOption(options);
  },

  drawTradeTake: () => {

    let options = {
      series: [{
        markLine: {
          silent: true,
          data: [{
            yAxis: (moduleDemo.lastPrice).toFixed(4),
            lineStyle: {
              color: 'rgb(255,255,255)',
              width: 2
            }
          }]
        }
      }]
    };
    moduleDemo.canvas.setOption(options);
  },

  drawUpdatePrice: (update) => {
    let data = update.data.slice(0, 4);
    let newData = [...moduleDemo.data, ...[data]];
    let devise = `${moduleDemo.firstC}/${moduleDemo.secondC}`;
    let date = new Date();
    let newDate = date.getMinutes();

    if (update.data[4] === "h1" && newDate === 0 && moduleDemo.candleCreate === false) {
      moduleDemo.createNewCandle(data);
    } else if ((newDate === 0 || newDate === 30) && update.data[4] === "m30" && moduleDemo.candleCreate === false) {
      moduleDemo.createNewCandle(data);
    } else if (newDate != 0 && newDate != 30) {
      moduleDemo.candleCreate = false;
    }

    if (devise === update.pair) {
      moduleDemo.lastPrice = update.rate;
      $("#demoBoxInfos-price-up").html(update.rate);
      let options = {
        series: [{
          type: 'k',
          data: newData
        }]
      };
      moduleDemo.canvas.setOption(options);
    }
  },

  createNewCandle: (newCandle) => {
    moduleDemo.data.shift();
    moduleDemo.data.push(newCandle);
    moduleDemo.candleCreate = true;
  },

  initBarAndInput: (_div, _data) => {

    $("#" + _div).draggable(_data);
    $('#' + _div + "Where-close").click(function () {
      moduleDemo.removeBar(_div);
    });
    $('input[data-ref=' + _div + ']').keyup(function () {

      if (_div.indexOf('take') != -1) moduleDemo.typeIn = 'take';
      if (_div.indexOf('stop') != -1) moduleDemo.typeIn = 'stop';

      moduleDemo.takeKeyUp(_div);
    });
    $(".numberBox-up[data-ref=" + _div + "]").click(function () {

      if (_div.indexOf('take') != -1) moduleDemo.typeIn = 'take';
      if (_div.indexOf('stop') != -1) moduleDemo.typeIn = 'stop';

      var myVal = $("input[data-ref=" + _div + "]").val();

      $("input[data-ref=" + _div + "]").val(moduleDemo.numberMore(myVal, 1));
      moduleDemo.takeKeyUp(_div);
    });
    $(".numberBox-down[data-ref=" + _div + "]").click(function () {

      if (_div.indexOf('take') != -1) moduleDemo.typeIn = 'take';
      if (_div.indexOf('stop') != -1) moduleDemo.typeIn = 'stop';

      var myVal = $("input[data-ref=" + _div + "]").val();

      $("input[data-ref=" + _div + "]").val(moduleDemo.numberMore(myVal, -1));
      moduleDemo.takeKeyUp(_div);
    });
  },

  takeProfitStartDrag: (e, ui) => {
    moduleDemo.typeIn = 'take';
    $('#demoBoxDisplay-take').addClass("on");
    $('#demoBoxInfos-takeProfit').addClass("on");
    moduleDemo.getYYYValue("demoBoxDisplay-take", ui.position.top);
  },

  takeProfitStopDrag: (e, ui) => {
    moduleDemo.getYYYValue("demoBoxDisplay-take", ui.position.top);
  },

  takeProfitDrag: (e, ui) => {
    moduleDemo.getYYYValue("demoBoxDisplay-take", ui.position.top);
  },

  stopLossStartDrag: (e, ui) => {

    moduleDemo.typeIn = 'stop';
    $('#demoBoxDisplay-stop').addClass("on");
    $('#demoBoxInfos-stopLoss').addClass("on");
    moduleDemo.getYYYValue("demoBoxDisplay-stop", ui.position.top);
  },

  stopLossStopDrag: (e, ui) => {
    moduleDemo.getYYYValue("demoBoxDisplay-stop", ui.position.top);
  },

  stopLossDrag: (e, ui) => {
    moduleDemo.getYYYValue("demoBoxDisplay-stop", ui.position.top);
  },

  pendingStartDrag: (e, ui) => {
    moduleDemo.getYYYValue("demoBoxDisplay-pending", ui.position.top);
  },

  pendingStopDrag: (e, ui) => {
    moduleDemo.getYYYValue("demoBoxDisplay-pending", ui.position.top);
  },

  pendingDrag: (e, ui) => {

    moduleDemo.getYYYValue("demoBoxDisplay-pending", ui.position.top);
    if (!$("#demoBoxDisplay-take").hasClass('on')) {

      moduleDemo.getYYYValue("demoBoxDisplay-take", ui.position.top);
      moduleDemo.takeKeyUp("demoBoxDisplay-take");
    }
    if (!$("#demoBoxDisplay-stop").hasClass('on')) {

      moduleDemo.getYYYValue("demoBoxDisplay-stop", ui.position.top);
      moduleDemo.takeKeyUp("demoBoxDisplay-stop");
    }
  },

  addPips: (value) => {

  },

  clearChart: () => {
    moduleDemo.context.clearRect(0, 0, moduleDemo.canvas.width, moduleDemo.canvas.height);
  },

  renitializeInterface: () => {
    $('#demoBoxInfos-button-sell').removeClass('buttonModify').html('Vendre');
    $('#demoBoxInfos-button-buy').removeClass('buttonClose').html('Acheter');
    $('#demoBoxInfos-amount').show();
    $('#demoBoxInfos-change').show();
  },

  changeInterface: () => {

    if (!$('#demoBoxInfos-button-sell').hasClass('show')) {
      $('#demoBoxInfos-button-sell').addClass('show')
    } else if (!$('#demoBoxInfos-button-buy').hasClass('show')) {
      $('#demoBoxInfos-button-buy').addClass('show')
    }
    $('#demoBoxInfos-change').hide();
    $('#demoBoxInfos-amount').hide();
    $('#demoBoxInfos-button-sell').addClass('buttonModify').html('Modifier');
    $('#demoBoxInfos-button-buy').addClass('buttonClose').html('cloturer');
  },

  reduceNumber: (_numb, _count) => {

    let myCount = _count || 1000;

    _numb *= myCount;
    _numb = Math.floor(_numb);
    _numb /= myCount;

    let verifLengthNumber = _numb;
    if (verifLengthNumber.toString().length >= 10) {
      return _numb.toFixed(2);
    } else {
      return _numb.toFixed(4);
    }
  },

  removeBar: (_div) => {

    if (_div.indexOf('pending') == -1) {

      $('#' + _div).removeClass('on');
      let lastData = ($('#demoBoxInfos-change').hasClass("pending")) ? $('input[data-ref=demoBoxDisplay-pending]').val() : moduleDemo.reduceNumber(moduleDemo.dataIn[moduleDemo.dataIn.length - 1][7]);

      $('input[data-ref=' + _div + ']').val(lastData);
      $('input[data-ref=' + _div + ']').parent().parent().removeClass('on');

      moduleDemo.takeKeyUp(_div);
    } else {
      $('#demoBoxInfos-change').removeClass("pending");
      $('#demoBoxDisplay-pending').removeClass("show");
      $('#demoBoxInfos-pending').slideUp("fast");

      if (!$("#demoBoxDisplay-take").hasClass('on')) {

        $('input[data-ref=demoBoxDisplay-take]').val(moduleDemo.reduceNumber(moduleDemo.dataIn[moduleDemo.dataIn.length - 1][7]));
        moduleDemo.takeKeyUp("demoBoxDisplay-take");
      }
      if (!$("#demoBoxDisplay-stop").hasClass('on')) {

        $('input[data-ref=demoBoxDisplay-stop]').val(moduleDemo.reduceNumber(moduleDemo.dataIn[moduleDemo.dataIn.length - 1][7]));
        moduleDemo.takeKeyUp("demoBoxDisplay-stop");
      }
      moduleDemo.setTradeSize();
    }
  },

  numberMore: (_number, _direction) => {

    let _cacheNumber = _number;
    let numStr = _number.toString().replace(",", ".").split(".");
    let step = 1;

    myDistance = 0;

    if (numStr.length > 1) {

      myDistance = numStr[1].length;
      let myStr = "0.";

      for (var i = 0; i < myDistance - 1; i++) {

        myStr += "0";
      }
      myStr += "1";
      step = parseFloat(myStr);
    }
    _number = parseFloat(_number) + parseFloat(_direction) * parseFloat(step);

    let verifNumb = _number.toString();
    let verifNumbParse = verifNumb.split(".");

    if (verifNumbParse.length == 2) {
      if (verifNumbParse[1].length < myDistance) {

        _number = verifNumb + "0";
      }
      if (verifNumbParse[1].length > myDistance) {

        _number = verifNumbParse[0] + "." + verifNumbParse[1].substring(0, myDistance);
      }
    }
    if (_number == _cacheNumber && verifNumbParse.length == 2) {

      _number = _number * Math.pow(10, myDistance);
      _number += parseFloat(_direction);
      _number = _number / Math.pow(10, myDistance);
    }
    return _number.toString();
  },

  getYYYValue: (_div, _nb) => {

    let myVolume = moduleDemo.max - moduleDemo.min;

    _nb += 3;
    _nb -= parseFloat($("#demoBoxDisplay-chart").css('margin-top'));
    _nb = 240 - _nb;

    let myRatio = _nb / 240;
    let myValue = myRatio * myVolume + moduleDemo.min;

    $("#" + _div + "Where-label").html(moduleDemo.reduceNumber(myValue, 10000000));
    $('input[data-ref=' + _div + ']').val(moduleDemo.reduceNumber(myValue, 10000000));

    if (moduleDemo.tradeTake.type === 'off') {
      moduleDemo.setTradeSize();
    } else {
      if (_div === 'demoBoxDisplay-take') {
        moduleDemo.setTradeSize();
      }
    }
  },

  takeKeyUp: (_div) => {

    let myVolume = moduleDemo.max - moduleDemo.min;
    let myVal = $('input[data-ref=' + _div + ']').val();
    let myWhere = myVal - moduleDemo.min;

    $('input[data-ref=' + _div + ']').val(moduleDemo.numberVerifDot(myVal));
    myWhere = 240 - (myWhere / myVolume * 240);

    if (myWhere > 0 && myWhere < 240) {

      $('#' + _div).removeClass("toofar");
    } else {

      $('#' + _div).addClass("toofar");
    }
    $('#' + _div).css('top', myWhere + 60 - 3);
    $('#' + _div + "Where-label").html(myVal);

    if (_div.indexOf('pending') != -1) {
      if (!$("#demoBoxDisplay-stop").hasClass('on')) {

        $('#demoBoxDisplay-stop').css('top', myWhere + 60 - 3);
        $("#demoBoxDisplay-stopWhere-label").html(myVal);
        $('input[data-ref=demoBoxDisplay-stop]').val(myVal);
      }
      if (!$("#demoBoxDisplay-take").hasClass('on')) {

        $('#demoBoxDisplay-take').css('top', myWhere + 60 - 3);
        $("#demoBoxDisplay-takeWhere-label").html(myVal);
        $('input[data-ref=demoBoxDisplay-take]').val(myVal);
      }
    }
    moduleDemo.setTradeSize();
  },

  numberVerifDot: (number) => {

    let nbr = number;

    nbr = nbr.toString().replace(",", ".");
    return nbr;
  },

  displayStop: (_numb, _count) => {

    let myCount = _count || 1000;

    _numb *= myCount;
    _numb = Math.floor(_numb);
    _numb /= myCount;

    return _numb.toFixed(2);
  },

  setTradeSize: () => {
    moduleDemo.funPush("", moduleDemo.setTradeSizeReel);
  },

  setTradeSizeReel: () => {

    var myResult = 0;

    var myVolume = moduleDemo.max - moduleDemo.min;
    var myAmount = $('input[data-ref=demoBoxDisplay-amount]').val();
    var myTake = $('input[data-ref=demoBoxDisplay-take]').val();
    var myStop = $('input[data-ref=demoBoxDisplay-stop]').val();

    var myType = (Number(myTake) > Number(myStop)) ? "buy" : "sell";
    var myPending = parseFloat(($('#demoBoxInfos-change').hasClass("pending")) ? $('input[data-ref=demoBoxDisplay-pending]').val() : $("#demoBoxInfos-price-up").text());

    if ($('#demoBoxInfos-amount-type').hasClass("pourcentage")) {

      myAmount = Math.floor(myAmount * moduleDemo.balance / 100);
    }
    myResultStop = moduleDemo.displayStop(myAmount, 1000) + " " + moduleDemo.devise;

    let myPoint = 0;
    let myResultTake;
    let myResultSize;

    myPoint = myAmount * moduleDemo.lastPrice / Math.abs((myStop - myPending) * 10000);
    myResultTake = (myPoint * Math.abs((myTake - myPending) * 10000) / moduleDemo.lastPrice).toFixed(2) + " " + moduleDemo.devise;
    myResultSize = (myPoint / 10).toFixed(2) + " " + "lot";
    moduleDemo.type = myType;
    moduleDemo.lot = (myPoint / 10).toFixed(2);

    $("#demoBoxInfos-takeProfit-indicator").html(myResultTake);
    $("#demoBoxInfos-stopLoss-indicator").html(myResultStop);

    let MyNewVal = myVolume * 5 / 100;

    if (myTake < myPending && myStop < myPending) {
      if (moduleDemo.typeIn == 'take') {
        if ($("#demoBoxDisplay-stop").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-stop]').val(moduleDemo.reduceNumber(myPending + MyNewVal, 10000000));
          moduleDemo.takeKeyUp("demoBoxDisplay-stop");
        }
      } else if (moduleDemo.typeIn == 'stop') {
        if ($("#demoBoxDisplay-take").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-take]').val(moduleDemo.reduceNumber(myPending + MyNewVal, 10000000));
          moduleDemo.takeKeyUp("demoBoxDisplay-take");
        }
      }
    } else if (myTake > myPending && myStop > myPending) {
      if (moduleDemo.typeIn == 'take') {
        if ($("#demoBoxDisplay-stop").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-stop]').val(moduleDemo.reduceNumber(myPending - MyNewVal, 10000000));
          moduleDemo.takeKeyUp("demoBoxDisplay-stop");
        }
      } else if (moduleDemo.typeIn == 'stop') {
        if ($("#demoBoxDisplay-take").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-take]').val(moduleDemo.reduceNumber(myPending - MyNewVal, 10000000));
          moduleDemo.takeKeyUp("demoBoxDisplay-take");
        }
      }
    }
    $('#demoBoxInfos-button-sell').removeClass("show");
    $('#demoBoxInfos-button-buy').removeClass("show");
    if (!$("#demoBoxDisplay-take").hasClass('on') && !$("#demoBoxDisplay-stop").hasClass('on')) {

      $('#demoBoxInfos-button-sell').addClass("show");
      $('#demoBoxInfos-button-buy').addClass("show");
    } else {
      if (moduleDemo.tradeTake.type == 'on') {
        $('#demoBoxInfos-button-sell').addClass("show");
        $('#demoBoxInfos-button-buy').addClass("show");
      } else {
        $('#demoBoxInfos-button-' + myType).addClass("show");
      }
    }
    if (myAmount > moduleDemo.balance) {
      $('#demoBoxInfos-tradeSize').html("<font>not enough fund</font>");
      $("#demoBoxInfos-button-sell").removeClass('show');
      $("#demoBoxInfos-button-sell").css('cursor', '');
      $("#demoBoxInfos-button-buy").removeClass('show');
    } else if (moduleDemo.tradeTake.type === 'on') {} else {
      $('#demoBoxInfos-tradeSize').html("Trade Size : <font>" + myResultSize + "</font>");

    }
  },

  funPush: function (e, _function) {

    clearTimeout(moduleDemo.myTimer);
    moduleDemo.myTimer = setTimeout(function () {
      _function(e);
    }, 100);
  },
};

