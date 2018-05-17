let moduleDemo = {
  canvasId: "demoBoxDisplay-chartCanvas",
  canvas: null,
  context: null,
  balance: 3000,
  dataIn: null,
  myTimer: null,
  lastPrice: 0,
  min: 0,
  max: 30000,
  buffer: 0,
  endY: 0,
  endLine: 0,
  lot: null,
  type: null,
  _divDevise: null,
  typeIn: 'take',
  devise: "€",
  tickInterval: "h1",
  firstC: 'EUR',
  secondC: 'USD',
  tradeTake: {
    type: 'off',
    endY: 0,
    firstCurrency: '',
    secondCurrency: '',
    intervalTrade: '',
    lastPrice: 0,
    posSL: 0,
    posTP: 0,
    valSL: 0,
    valTP: 0
  },

  init: () => {


    $('#demoBoxInfos-balance-value').html(moduleDemo.balance + " " + moduleDemo.devise);
    $('#demoBoxDisplay-tradeTake').hide();

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

    /*     $('#demoBox').addClass("loading");
     */
    /*     moduleDemo.clearChart();
     */
    let myTickInterval = moduleDemo.tickInterval;

    $('.demoBoxDisplay-nav').removeClass('on');
    $('.demoBoxDisplay-nav[data-value=' + moduleDemo.tickInterval + ']').addClass('on');

    let recoverdData = {
      currency: `${moduleDemo.firstC}/${moduleDemo.secondC}`,
      interval: myTickInterval
    };
    return recoverdData;
  },

  getMinMax: (_data) => {
    moduleDemo.dataIn = _data.candles;
    moduleDemo.lastPrice = _data.candles[_data.candles.length - 1][7];

    moduleDemo.max = 0;
    moduleDemo.min = 10000;

    for (let candle of _data.candles) {
      moduleDemo.max = Math.max(moduleDemo.max, candle[7]);
      moduleDemo.min = Math.min(moduleDemo.min, candle[7]);
    }
    moduleDemo.type = 1;
    moduleDemo.buffer = (moduleDemo.max - moduleDemo.min) * 20 / 100;

    moduleDemo.min = moduleDemo.min - moduleDemo.buffer;
    moduleDemo.max = moduleDemo.max + moduleDemo.buffer;
    moduleDemo.drawChart(moduleDemo.dataIn);
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
    return trade;
  },

  closeTrade: () => {
    let closeTrade = {};
    closeTrade.amount = moduleDemo.lot;
    closeTrade.close = 'on';

    return closeTrade;
  },

  /* drawChart: (_data) => {

    let myTickInterval = moduleDemo.tickInterval;
    let ratio = 240 / (moduleDemo.max - moduleDemo.min);
    moduleDemo.endLine = _data[350][7] - moduleDemo.min

    moduleDemo.canvas.width = 400;
    moduleDemo.canvas.height = 240;

    moduleDemo.context.beginPath();
    moduleDemo.endY = 240 - (_data[_data.length - 1][7] - moduleDemo.min) * ratio;

    moduleDemo.context.strokeStyle = "white"; // Green path
    moduleDemo.context.moveTo(0, 240 - (_data[0][7] - moduleDemo.min) * ratio);

    for (let i = 0; i < _data.length; i++) {
      let iw = i;
      moduleDemo.context.lineTo(iw, 240 - (_data[i][7] - moduleDemo.min) * ratio);
    }

    moduleDemo.context.stroke();
    moduleDemo.drawGrid();
    $('#demoBox').removeClass("loading");

    if (moduleDemo.tradeTake.type == 'on') {
      moduleDemo.drawTradeTake(moduleDemo.tradeTake);
      $("input[data-ref=demoBoxDisplay-stop]").val(moduleDemo.tradeTake.valSL);
      $("input[data-ref=demoBoxDisplay-take]").val(moduleDemo.tradeTake.valTP);
      $('#demoBoxDisplay-take').css('top', moduleDemo.tradeTake.posTP.top - 3);
      $('#demoBoxDisplay-stop').css('top', moduleDemo.tradeTake.posSL.top - 3);
      $("#demoBoxDisplay-stopWhere-label").html(moduleDemo.tradeTake.valSL);
      $("#demoBoxDisplay-takeWhere-label").html(moduleDemo.tradeTake.valTP);
    }
  },

  drawGrid: () => {

    moduleDemo.drawGridXXX();
    moduleDemo.drawGridYYY();

    $('#demoBoxDisplay-take').css('top', 80);
    $('#demoBoxDisplay-stop').css('top', 160);
    $('#demoBoxDisplay-pending').css('top', 120);

    moduleDemo.getYYYValue("demoBoxDisplay-take", 77);
    moduleDemo.getYYYValue("demoBoxDisplay-stop", 157);
    moduleDemo.getYYYValue("demoBoxDisplay-pending", 117);

    let lastData = moduleDemo.dataIn[moduleDemo.dataIn.length - 1];

    $("#demoBoxInfos-price-down").html(lastData[2]);
    $("#demoBoxInfos-price-up").html(lastData[7]);

    $('input[data-ref=demoBoxDisplay-take]').val(moduleDemo.reduceNumber(lastData[7], 10000000));
    moduleDemo.takeKeyUp('demoBoxDisplay-take');

    $('input[data-ref=demoBoxDisplay-stop]').val(moduleDemo.reduceNumber(lastData[7], 10000000));
    moduleDemo.takeKeyUp('demoBoxDisplay-stop');

    $(window, document).trigger('resize');

  },

  drawGridXXX: () => {

    let myTickInterval = moduleDemo.tickInterval;
    let myHtml = "";

    let myStep = Math.floor(moduleDemo.dataIn.length / 8);

    for (let i = 1; i < 8; i++) {
      if (moduleDemo.dataIn[i * myStep]) {

        var myDate = moment(moduleDemo.dataIn[i * myStep][0] * 1000);
      } else {
        if (myTickInterval == "week") {

          var myDate = moment(moduleDemo.dataIn[(i - 1) * myStep][0] * 1000);
          myDate.add(1, 'day');
        } else {

          var myDate = moment(moduleDemo.dataIn[(i - 1) * myStep][0] * 1000);
          myDate.add(1, 'day');
        }
      }
      if (myTickInterval == "week") {
        myHtml += "<div class='xxx' style='left:" + (50 * i) + "px'><div class='xxx-value'>" + myDate.format("MMM Do") + "</div></div>";
      } else if (myTickInterval == "month") {
        myHtml += "<div class='xxx' style='left:" + (50 * i) + "px'><div class='xxx-value'>" + myDate.format("MMM Do") + "</div></div>";
      } else {
        myHtml += "<div class='xxx' style='left:" + (50 * i) + "px'><div class='xxx-value'>" + myDate.format("HH:mm") + "</div></div>";
      }
    }
    $('#demoBoxDisplay-xxx').html(myHtml);
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

  drawTradeTake: (data) => {
    moduleDemo.context.beginPath();
    moduleDemo.context.setLineDash([5, 10]);
    moduleDemo.context.moveTo(0, data.endY);
    moduleDemo.context.lineTo(400, data.endY);
    moduleDemo.context.lineWidth = 2;
    moduleDemo.context.strokeStyle = 'blue';
    moduleDemo.context.stroke();

    moduleDemo.context.setLineDash([]);
    moduleDemo.context.font = '16px Arial';
    moduleDemo.context.strokeText(data.lastPrice, 10, data.endY - 3);
    moduleDemo.context.closePath();

  },

  drawUpdatePrice: (price) => {

    let myTickInterval = moduleDemo.tickInterval;
    let ratio = 240 / (moduleDemo.max - moduleDemo.min);

    moduleDemo.context.beginPath();

    moduleDemo.context.moveTo(351, 240 - moduleDemo.endLine * ratio);
    console.log(`valueY =  ${240 - (price.rate - moduleDemo.min)*ratio}`);
    moduleDemo.context.strokeStyle = "red"; // Green path

    moduleDemo.context.lineTo(352, 240 - moduleDemo.endLine * ratio);
    moduleDemo.context.stroke();
  }, */

  initChart: (dataTest, time) => {
    moduleDemo.canvas = echarts.init(document.getElementById(moduleDemo.canvasId));
    let options = {
      xAxis: {
        data: time,
        axisLine: {
          lineStyle: {
            color: '#8392A5'
          }
        },
        axisTick: {
          interval: 10
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '5%',
        bottom: '10%'
      },
      yAxis: {
        scale: true,
        axisLine: {
          lineStyle: {
            color: '#8392A5'
          }
        }
      },
      series: [{
        type: 'k',
        data: dataTest,
        itemStyle: {
          normal: {
            color: '#FD1050',
            color0: '#0CF49B',
            borderColor: '#FD1050',
            borderColor0: '#0CF49B'
          }
        }
      }]
    };
    moduleDemo.canvas.setOption(options);
  },

  drawChart: (_data) => {
    moduleDemo.dataIn = _data.candles;
    moduleDemo.lastPrice = _data.candles[350][2];
    let candlesArray = _data.candles.slice(300);

    moduleDemo.max = 0;
    moduleDemo.min = 10000;

    for (let candle of candlesArray) {
      moduleDemo.max = Math.max(moduleDemo.max, candle[7]);
      moduleDemo.min = Math.min(moduleDemo.min, candle[8]);
    }
    moduleDemo.type = 1;
    moduleDemo.buffer = (moduleDemo.max - moduleDemo.min) * 10 / 100;

    moduleDemo.min = moduleDemo.min - moduleDemo.buffer;
    moduleDemo.max = moduleDemo.max + moduleDemo.buffer;

    $('input[data-ref=demoBoxDisplay-take]').val(moduleDemo.lastPrice);
    moduleDemo.takeKeyUp('demoBoxDisplay-take');

    $('input[data-ref=demoBoxDisplay-stop]').val(moduleDemo.lastPrice);
    moduleDemo.takeKeyUp('demoBoxDisplay-stop');

    $("#demoBoxInfos-price-down").html(_data.candles[350][1]);
    $("#demoBoxInfos-price-up").html(_data.candles[350][2]);

    $('#demoBoxDisplay-take').css('top', 80);
    $('#demoBoxDisplay-stop').css('top', 160);
    $('#demoBoxDisplay-pending').css('top', 120);

    moduleDemo.getYYYValue("demoBoxDisplay-take", 77);
    moduleDemo.getYYYValue("demoBoxDisplay-stop", 157);
    moduleDemo.getYYYValue("demoBoxDisplay-pending", 117);

    let dates = candlesArray.map(function (item) {
      let d = new Date(item[0] * 1000);
      return d.getHours();
    });

    let data = candlesArray.map(function (item) {
      return [+item[1], +item[2], +item[3], +item[4]];
    });

    moduleDemo.initChart(data, dates);
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
    var myPending = parseFloat(($('#demoBoxInfos-change').hasClass("pending")) ? $('input[data-ref=demoBoxDisplay-pending]').val() : moduleDemo.dataIn[moduleDemo.dataIn.length - 1][7]);


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
    } else {
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

/* $(document).ready(function () {
  moduleDemo.init();
});  */