var demoBox = {
  canvasId: "demoBoxDisplay-chartCanvas",
  queryHisto: "https://api.jarvis-edge.io/currency/histo/",
  queryCurrency: "https://api.jarvis-edge.io/currency/",
  marketName: "USDT-BTC",
  tickInterval: "hour",
  timestamp: 0,
  max: 0,
  min: 30000,
  buffer: 0,
  canvas: null,
  context: null,
  dataIn: null,
  lastDataCurrency: null,
  balance: 3000,
  devise: "€",
  myTimer: null,
  endY: 0,
  typeIn: 'take',
  currency: [],
  firstC: 'BTC',
  secondC: 'USD',
  type: 0, // 0: no zoom, 1: zoom on for value between 10 <-> 0
  pairNb: 0,
  pairs: {
    "btcUsd": 16402.0,
    "eurUsd": 1.2050,
    "gpbCad": 1.6829,
    "ethUsd": 972,
    "eurCad": 1.4933959
  },

  init: () => {

    demoBox.canvas = document.getElementById(demoBox.canvasId);
    demoBox.context = demoBox.canvas.getContext("2d");

    demoBox.setPair(0);

    $('.demoBoxDisplay-devise').each(function($index) {

      var myThis = $(this);
      myThis.click(function() {

        demoBox.setPair($index);

      });

    });

    $('#demoBoxInfos-balance-value').html(demoBox.balance + " " + demoBox.devise);

    demoBox.initBarAndInput("demoBoxDisplay-take", {
      axis: 'y',
      containment: '#demoBoxDisplay-chart',
      start: demoBox.takeProfitStartDrag,
      drag: demoBox.takeProfitDrag,
      stop: demoBox.takeProfitStopDrag
    });

    demoBox.initBarAndInput("demoBoxDisplay-stop", {
      axis: 'y',
      containment: '#demoBoxDisplay-chart',
      start: demoBox.stopLossStartDrag,
      drag: demoBox.stopLossDrag,
      stop: demoBox.stopLossStopDrag
    });

    demoBox.initBarAndInput("demoBoxDisplay-pending", {
      axis: 'y',
      containment: '#demoBoxDisplay-chart',
      start: demoBox.pendingStartDrag,
      drag: demoBox.pendingDrag,
      stop: demoBox.pendingStopDrag
    });

    $(".numberBox-up[data-ref=demoBoxDisplay-amount]").click(function() {

      var myVal = $("input[data-ref=demoBoxDisplay-amount]").val();

      $("input[data-ref=demoBoxDisplay-amount]").val(demoBox.numberMore(myVal, 1));

      demoBox.setTradeSize();

    });

    $(".numberBox-down[data-ref=demoBoxDisplay-amount]").click(function() {

      var myVal = $("input[data-ref=demoBoxDisplay-amount]").val();

      $("input[data-ref=demoBoxDisplay-amount]").val(demoBox.numberMore(myVal, -1));

      demoBox.setTradeSize();

    });

    $('input[data-ref=demoBoxDisplay-amount]').keyup(function() {

      let myVal = $("input[data-ref=demoBoxDisplay-amount]").val();

      $("input[data-ref=demoBoxDisplay-amount]").val(demoBox.numberVerifDot(myVal));

      demoBox.setTradeSize();

    });

    $("#demoBoxInfos-amount-type-up").click(function() {

      $("#demoBoxInfos-amount-type").toggleClass("pourcentage");

      myAmount = $('input[data-ref=demoBoxDisplay-amount]').val();

      $('input[data-ref=demoBoxDisplay-amount]').val(Math.floor(demoBox.balance * myAmount / 100));

      demoBox.setTradeSize();

    });

    $("#demoBoxInfos-amount-type-down").click(function() {

      $("#demoBoxInfos-amount-type").toggleClass("pourcentage");

      if ($('#demoBoxInfos-amount-type').hasClass('pourcentage') && parseFloat($('input[data-ref=demoBoxDisplay-amount]').val()) > 20) {

        myAmount = $('input[data-ref=demoBoxDisplay-amount]').val();

        $('input[data-ref=demoBoxDisplay-amount]').val(Math.floor(100 / (demoBox.balance / myAmount)));

      }

      demoBox.setTradeSize();

    });

    $("#demoBoxInfos-stopLoss-close").click(function() {

      demoBox.removeBar('demoBoxDisplay-stop');

    });


    $("#demoBoxInfos-takeProfit-close").click(function() {

      demoBox.removeBar('demoBoxDisplay-take');

    });

    /*demoBox.getData();*/

    //demoBox.timestamp = demoBox.setDate(new Date.getTime()-(1000*60*60*24*7));

    $('#demoBoxInfos-change-buttonBox').click(function() {

      $('#demoBoxInfos-change').toggleClass("pending");
      $('#demoBoxDisplay-pending').toggleClass("show");
      $('#demoBoxInfos-pending').slideToggle("fast");

      if ($('#demoBoxDisplay-pending').hasClass('show')) {

        var myVal = demoBox.dataIn[demoBox.dataIn.length - 1].high;

        $("input[data-ref=demoBoxDisplay-pending]").val(demoBox.reduceNumber(myVal, 10000000));

        demoBox.takeKeyUp("demoBoxDisplay-pending");

      } else {

        if (!$("#demoBoxDisplay-take").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-take]').val(demoBox.reduceNumber(demoBox.dataIn[demoBox.dataIn.length - 1].high, 10000000));
          demoBox.takeKeyUp("demoBoxDisplay-take");

        }

        if (!$("#demoBoxDisplay-stop").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-stop]').val(demoBox.reduceNumber(demoBox.dataIn[demoBox.dataIn.length - 1].high, 10000000));
          demoBox.takeKeyUp("demoBoxDisplay-stop");

        }

      }

      demoBox.setTradeSize();

    });

    $('.demoBoxDisplay-nav').each(function() {

      var myThis = $(this);

      myThis.click(function() {

        var myValue = myThis.attr("data-value");
        demoBox.tickInterval = myValue;
        demoBox.getData($('.demoBoxDisplay-devise.on').attr("data-type"));

      });

    });

  },

  setPair: (_nb) => {

    demoBox.pairNb = _nb;

    var myObj = $('.demoBoxDisplay-devise').eq(_nb);

    $('.demoBoxDisplay-devise').removeClass("on");

    myObj.addClass("on");

    demoBox.firstC = myObj.attr("data-first");
    demoBox.secondC = myObj.attr("data-second");


    demoBox.getData(myObj.attr("data-type"));

  },

  getCurrency: () => {

    $.post(demoBox.queryCurrency, {})
      .done(function(data) {

        var result = JSON.parse(data);

        demoBox.currency = result.result;

        var myHtml = "";

        for (var i = 0; i < demoBox.currency.length; i++) {

          if (demoBox.currency[i]['type'] == "fiat") {

            myHtml += "<div data-ref='" + i + "'><font>Fiat</font> " + demoBox.currency[i]['currency'] + "</div>";

          } else {

            myHtml += "<div data-ref='" + i + "'><font>Crypto</font> " + demoBox.currency[i]['name'] + "</div>";

          }

        }

        $('#demoBoxInfos-pair-auto').html(myHtml);

        $('#demoBoxInfos-pair-auto div').each(function() {

          var myThis = $(this);
          myThis.click(function(event) {

            event.stopPropagation();
            demoBox.setComCurrency(myThis.attr('data-ref'));

          });

        });

      });

  },

  openComCurrency: (_type) => {

    $(window).click(function() {

      if ($('#demoBoxInfos-pair-auto').hasClass("show")) {

        demoBox.closeComCurrency();

      }

    });

    $('#demoBoxInfos-pair-auto div').removeClass("show");
    $('#demoBoxInfos-pair-auto').attr('data-ref', _type).removeClass("show");

    var myVal = $('#demoBoxInfos-pair-' + _type + " input").val();

    for (var i = 0; i < demoBox.currency.length; i++) {

      if (demoBox.currency[i]['name'].toLowerCase().indexOf(myVal.toLowerCase()) >= 0) {

        $('#demoBoxInfos-pair-auto div').eq(i).addClass("show");

      }

    }

    if ($('#demoBoxInfos-pair-auto div').length != 0) {

      $('#demoBoxInfos-pair-auto').addClass("show");

    }

  },

  setComCurrency: (_i) => {

    var myType = $('#demoBoxInfos-pair-auto').attr('data-ref');

    if (myType == "first") demoBox.firstC = demoBox.currency[_i]['currency'];
    if (myType == "second") demoBox.secondC = demoBox.currency[_i]['currency'];

    demoBox.getData($('.demoBoxDisplay-devise.on').attr("data-type"));

    demoBox.closeComCurrency();

  },

  closeComCurrency: () => {

    $('#demoBoxInfos-pair-auto div').removeClass("show");
    $('#demoBoxInfos-pair-auto').removeClass("show");
    $('#demoBoxInfos-pair-first input').val(demoBox.firstC);
    $('#demoBoxInfos-pair-second input').val(demoBox.secondC);

  },

  initBarAndInput: (_div, _data) => {

    $("#" + _div).draggable(_data);

    $('#' + _div + "Where-close").click(function() {

      demoBox.removeBar(_div);

    });

    $('input[data-ref=' + _div + ']').keyup(function() {

      if (_div.indexOf('take') != -1) demoBox.typeIn = 'take';
      if (_div.indexOf('stop') != -1) demoBox.typeIn = 'stop';

      demoBox.takeKeyUp(_div);

    });

    $(".numberBox-up[data-ref=" + _div + "]").click(function() {

      if (_div.indexOf('take') != -1) demoBox.typeIn = 'take';
      if (_div.indexOf('stop') != -1) demoBox.typeIn = 'stop';

      var myVal = $("input[data-ref=" + _div + "]").val();

      $("input[data-ref=" + _div + "]").val(demoBox.numberMore(myVal, 1));

      demoBox.takeKeyUp(_div);

    });

    $(".numberBox-down[data-ref=" + _div + "]").click(function() {

      if (_div.indexOf('take') != -1) demoBox.typeIn = 'take';
      if (_div.indexOf('stop') != -1) demoBox.typeIn = 'stop';

      var myVal = $("input[data-ref=" + _div + "]").val();

      $("input[data-ref=" + _div + "]").val(demoBox.numberMore(myVal, -1));

      demoBox.takeKeyUp(_div);

    });

  },

  getData: (_type) => {

    $('#demoBox').addClass("loading");
    demoBox.clearChart();

    $('.demoBoxDisplay-nav').removeClass('on');
    $('.demoBoxDisplay-nav[data-value=' + demoBox.tickInterval + ']').addClass('on');

    var myTickInterval = demoBox.tickInterval;

    $.post(demoBox.queryHisto, {
        first: demoBox.firstC,
        second: demoBox.secondC,
        type: myTickInterval,
        count: 351
      })
      .done(function(data) {

        data = JSON.parse(data);

        demoBox.dataIn = data.result;

        demoBox.getMinMax(demoBox.dataIn);

        demoBox.removeBar('demoBoxDisplay-stop');
        demoBox.removeBar('demoBoxDisplay-take');
        demoBox.removeBar('demoBoxDisplay-pending');

        demoBox.drawChart(demoBox.dataIn);

      });

  },

  getCurrencyData: (firstCurr, secondCurrr) => {
    let currencyOne = firstCurr;
    let currencyTwo = secondCurrr

    var myTickInterval = demoBox.tickInterval;

    $.post(demoBox.queryHisto, {
        first: currencyOne,
        second: currencyTwo,
        type: myTickInterval,
        count: 351
      })
      .done(function(data) {

        data = JSON.parse(data);

        demoBox.lastDataCurrency = data.result[data.result.length - 1].high;
      })
  },

  getMinMax: (_data) => {

    demoBox.max = 0;
    demoBox.min = 10000;

    for (var i = 0; i < _data.length; i++) {

      demoBox.max = Math.max(demoBox.max, _data[i].high);
      demoBox.min = Math.min(demoBox.min, _data[i].high);

      //console.log(i+"-> "+_data[i].H+" / "+demoBox.min+" / "+demoBox.max);

    }

    if (demoBox.max < 10) {

      demoBox.type = 1;

      demoBox.buffer = (demoBox.max - demoBox.min) * 20 / 100;

      demoBox.min = demoBox.min - demoBox.buffer;
      demoBox.max = demoBox.max + demoBox.buffer;

    } else {

      demoBox.buffer = Math.floor((demoBox.max - demoBox.min) * 20 / 100);

      demoBox.min = Math.floor(demoBox.min - demoBox.buffer);
      demoBox.max = Math.ceil(demoBox.max + demoBox.buffer);

    }

    //console.log(demoBox.min+" et "+demoBox.max);

    //console.log("getMinMax => "+demoBox.min+" < "+demoBox.max+" ("+demoBox.buffer+")");

  },

  drawChart: (_data) => {

    var myTickInterval = demoBox.tickInterval;
    var ratio = 240 / (demoBox.max - demoBox.min);

    demoBox.canvas.width = 400;
    demoBox.canvas.height = 240;

    demoBox.context.beginPath();

    if (demoBox.type == 1) {

      demoBox.endY = 240 - (_data[_data.length - 1].high - demoBox.min) * ratio;

      demoBox.context.strokeStyle = "white"; // Green path
      demoBox.context.moveTo(0, 240 - (_data[0].high - demoBox.min) * ratio);

      for (var i = 0; i < _data.length; i++) {

        var iw = i;
        demoBox.context.lineTo(iw, 240 - (_data[i].high - demoBox.min) * ratio);

      }

    } else {

      demoBox.endY = 240 - Math.floor((parseFloat(_data[_data.length - 1].high) - demoBox.min) * ratio);

      demoBox.context.strokeStyle = "white"; // Green path
      demoBox.context.moveTo(0, 240 - Math.floor((parseFloat(_data[0].high) - demoBox.min) * ratio));

      for (var i = 0; i < _data.length; i++) {

        var iw = i;
        demoBox.context.lineTo(iw, 240 - Math.floor((parseFloat(_data[i].high) - demoBox.min) * ratio));
        //console.log(i+" -> "+(Math.floor((parseFloat(_data[i].H)-demoBox.min)*ratio)));

      }

    }

    demoBox.context.stroke();

    demoBox.drawGrid();

    $('#demoBox').removeClass("loading");

    //console.log("----------------------------------------------------------------");

  },

  drawGrid: () => {

    demoBox.drawGridXXX();
    demoBox.drawGridYYY();

    $('#demoBoxDisplay-take').css('top', 80);
    $('#demoBoxDisplay-stop').css('top', 160);
    $('#demoBoxDisplay-pending').css('top', 120);

    demoBox.getYYYValue("demoBoxDisplay-take", 77);
    demoBox.getYYYValue("demoBoxDisplay-stop", 157);
    demoBox.getYYYValue("demoBoxDisplay-pending", 117);

    var lastData = demoBox.dataIn[demoBox.dataIn.length - 1];

    $("#demoBoxInfos-price-down").html(lastData.low);
    $("#demoBoxInfos-price-up").html(lastData.high);


    switch (demoBox.firstC) {
      case "BTC":
        $("#demoBoxInfos-spread-value").html("10");
        $('input[data-ref=demoBoxDisplay-take]').attr("maxLength", "8");
        $('input[data-ref=demoBoxDisplay-stop]').attr("maxLength", "8");
        break;
      case "EUR":
        $("#demoBoxInfos-spread-value").html("0.0001");
        $('input[data-ref=demoBoxDisplay-take]').attr("maxLength", "6");
        $('input[data-ref=demoBoxDisplay-stop]').attr("maxLength", "6");
        break;
      case "GBP":
        $("#demoBoxInfos-spread-value").html("0.0002");
        $('input[data-ref=demoBoxDisplay-take]').attr("maxLength", "6");
        $('input[data-ref=demoBoxDisplay-stop]').attr("maxLength", "6");
        break;
      case "ETH":
        $("#demoBoxInfos-spread-value").html("5");
        $('input[data-ref=demoBoxDisplay-take]').attr("maxLength", "7");
        $('input[data-ref=demoBoxDisplay-stop]').attr("maxLength", "7");
        break;
    }

    //console.log(lastData);

    //$('#demoBoxDisplay-take').css('top',demoBox.endY+25);
    //$('#demoBoxDisplay-stop').css('top',demoBox.endY+25);

    $('input[data-ref=demoBoxDisplay-take]').val(demoBox.reduceNumber(lastData.high, 10000000));
    demoBox.takeKeyUp('demoBoxDisplay-take');

    $('input[data-ref=demoBoxDisplay-stop]').val(demoBox.reduceNumber(lastData.high, 10000000));
    demoBox.takeKeyUp('demoBoxDisplay-stop');

    $(window, document).trigger('resize');

    //console.log(demoBox.dataIn[demoBox.dataIn.length-1]);

  },

  drawGridXXX: () => {

    var myTickInterval = demoBox.tickInterval;
    var myHtml = "";

    //console.log(demoBox.dataIn);

    var myStep = Math.floor(demoBox.dataIn.length / 8);

    for (var i = 1; i < 8; i++) {

      if (demoBox.dataIn[i * myStep]) {

        var myDate = moment(demoBox.dataIn[i * myStep].time * 1000);

      } else {

        if (myTickInterval == "week") {

          var myDate = moment(demoBox.dataIn[(i - 1) * myStep].time * 1000);
          myDate.add(1, 'day');

        } else {

          var myDate = moment(demoBox.dataIn[(i - 1) * myStep].time * 1000);
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

    var myHtml = "";

    var myVolume = demoBox.max - demoBox.min;

    var myStep = myVolume / 5;

    console.log("myVolume: " + myVolume);
    console.log("demoBox.min: " + demoBox.min);
    console.log("demoBox.max: " + demoBox.max);
    console.log("myStep: " + myStep);

    for (var i = 1; i < 5; i++) {

      var toShow = (demoBox.min + myStep * (5 - i));
      myHtml += "<div class='yyy' style='top:" + (240 / 5 * i) + "px'><div class='yyy-value'>" + demoBox.reduceNumber(toShow, 10000000) + "</div></div>";

    }

    $('#demoBoxDisplay-yyy').html(myHtml);

  },

  takeProfitStartDrag: (e, ui) => {

    demoBox.typeIn = 'take';

    //$('#demoBoxDisplay-take').removeClass("transition_0_1");

    $('#demoBoxDisplay-take').addClass("on");
    $('#demoBoxInfos-takeProfit').addClass("on");
    demoBox.getYYYValue("demoBoxDisplay-take", ui.position.top);

  },

  takeProfitStopDrag: (e, ui) => {

    demoBox.getYYYValue("demoBoxDisplay-take", ui.position.top);

    //$('#demoBoxDisplay-take').addClass("transition_0_1");

  },

  takeProfitDrag: (e, ui) => {

    demoBox.getYYYValue("demoBoxDisplay-take", ui.position.top);

  },

  stopLossStartDrag: (e, ui) => {

    demoBox.typeIn = 'stop';

    //$('#demoBoxDisplay-take').removeClass("transition_0_1");

    $('#demoBoxDisplay-stop').addClass("on");
    $('#demoBoxInfos-stopLoss').addClass("on");
    demoBox.getYYYValue("demoBoxDisplay-stop", ui.position.top);

  },

  stopLossStopDrag: (e, ui) => {

    demoBox.getYYYValue("demoBoxDisplay-stop", ui.position.top);

    //$('#demoBoxDisplay-stop').addClass("transition_0_1");

  },

  stopLossDrag: (e, ui) => {

    demoBox.getYYYValue("demoBoxDisplay-stop", ui.position.top);

  },

  pendingStartDrag: (e, ui) => {

    //$('#demoBoxDisplay-pending').removeClass("transition_0_1");

    demoBox.getYYYValue("demoBoxDisplay-pending", ui.position.top);

  },

  pendingStopDrag: (e, ui) => {

    demoBox.getYYYValue("demoBoxDisplay-pending", ui.position.top);

    //$('#demoBoxDisplay-pending').addClass("transition_0_1");

  },

  pendingDrag: (e, ui) => {

    demoBox.getYYYValue("demoBoxDisplay-pending", ui.position.top);
    if (!$("#demoBoxDisplay-take").hasClass('on')) {

      demoBox.getYYYValue("demoBoxDisplay-take", ui.position.top);
      demoBox.takeKeyUp("demoBoxDisplay-take");

    }

    if (!$("#demoBoxDisplay-stop").hasClass('on')) {

      demoBox.getYYYValue("demoBoxDisplay-stop", ui.position.top);
      demoBox.takeKeyUp("demoBoxDisplay-stop");

    }

  },

  removeBar: (_div) => {

    if (_div.indexOf('pending') == -1) {

      $('#' + _div).removeClass('on');

      var lastData = ($('#demoBoxInfos-change').hasClass("pending")) ? $('input[data-ref=demoBoxDisplay-pending]').val() : demoBox.reduceNumber(demoBox.dataIn[demoBox.dataIn.length - 1].high);

      $('input[data-ref=' + _div + ']').val(lastData);

      $('input[data-ref=' + _div + ']').parent().parent().removeClass('on');

      demoBox.takeKeyUp(_div);

    } else {

      $('#demoBoxInfos-change').removeClass("pending");
      $('#demoBoxDisplay-pending').removeClass("show");
      $('#demoBoxInfos-pending').slideUp("fast");

      if (!$("#demoBoxDisplay-take").hasClass('on')) {

        $('input[data-ref=demoBoxDisplay-take]').val(demoBox.reduceNumber(demoBox.dataIn[demoBox.dataIn.length - 1].high));
        demoBox.takeKeyUp("demoBoxDisplay-take");

      }

      if (!$("#demoBoxDisplay-stop").hasClass('on')) {

        $('input[data-ref=demoBoxDisplay-stop]').val(demoBox.reduceNumber(demoBox.dataIn[demoBox.dataIn.length - 1].high));
        demoBox.takeKeyUp("demoBoxDisplay-stop");

      }

      demoBox.setTradeSize();

    }

  },

  getYYYValue: (_div, _nb) => {

    var myVolume = demoBox.max - demoBox.min;

    _nb += 3;

    _nb -= parseFloat($("#demoBoxDisplay-chart").css('margin-top'));

    _nb = 240 - _nb;

    var myRatio = _nb / 240;
    var myValue = myRatio * myVolume + demoBox.min;

    $("#" + _div + "Where-label").html(demoBox.reduceNumber(myValue, 10000000));

    $('input[data-ref=' + _div + ']').val(demoBox.reduceNumber(myValue, 10000000));

    demoBox.setTradeSize();

  },

  takeKeyUp: (_div) => {

    var myVolume = demoBox.max - demoBox.min;

    var myVal = $('input[data-ref=' + _div + ']').val();

    var myWhere = myVal - demoBox.min;

    $('input[data-ref=' + _div + ']').val(demoBox.numberVerifDot(myVal));

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

    demoBox.setTradeSize();

  },

  openModal: () => {
    $(".modalEmail").css("display", "block");
  },

  closeModal: () => {
    $("#closeModal").css("display", "none");

  },

  numberMore: (_number, _direction) => {

    var _cacheNumber = _number;

    var numStr = _number.toString().replace(",", ".").split(".");
    var step = 1;

    myDistance = 0;

    if (numStr.length > 1) {

      myDistance = numStr[1].length;
      var myStr = "0.";

      for (var i = 0; i < myDistance - 1; i++) {

        myStr += "0";

      }

      myStr += "1";

      step = parseFloat(myStr);

    }

    _number = parseFloat(_number) + parseFloat(_direction) * parseFloat(step);


    var verifNumb = _number.toString();
    var verifNumbParse = verifNumb.split(".");

    if (verifNumbParse.length == 2) {

      if (verifNumbParse[1].length < myDistance) {

        _number = verifNumb + "0";

      }

      if (verifNumbParse[1].length > myDistance) {

        _number = verifNumbParse[0] + "." + verifNumbParse[1].substring(0, myDistance);

      }

    }

    if (_number == _cacheNumber && verifNumbParse.length == 2) {

      console.log(verifNumbParse[1][myDistance - 1]);

      _number = _number * Math.pow(10, myDistance);

      _number += parseFloat(_direction);

      _number = _number / Math.pow(10, myDistance);

      //verifNumbParse[1][myDistance-1] = (parseFloat(verifNumbParse[1][myDistance-1])+parseFloat(_direction)).toString();

      //  _number = verifNumbParse[0]+"."+verifNumbParse[1];

    }

    return _number.toString();

  },

  numberVerifDot: (number) => {
    let nbr = number;

    nbr = nbr.toString().replace(",", ".");
    return nbr;
  },


  displayStop: (_numb, _count) => {
    var myCount = _count || 1000;

    _numb *= myCount;

    _numb = Math.floor(_numb);

    _numb /= myCount;

    return _numb.toFixed(2);
  },

  reduceNumber: (_numb, _count) => {

    var myCount = _count || 1000;

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

  displayModal: () => {
    $("#emailModal").css("display", "block");
  },

  setTradeSize: () => {
    demoBox.funPush("", demoBox.setTradeSizeReel);
  },

  setTradeSizeReel: () => {

    var myResult = 0;

    var myPair = demoBox.pairNb;

    var myVolume = demoBox.max - demoBox.min;
    var myAmount = $('input[data-ref=demoBoxDisplay-amount]').val();
    var myTake = $('input[data-ref=demoBoxDisplay-take]').val();
    var myStop = $('input[data-ref=demoBoxDisplay-stop]').val();

    var myType = (Number(myTake) > Number(myStop)) ? "buy" : "sell";

    var myPending = parseFloat(($('#demoBoxInfos-change').hasClass("pending")) ? $('input[data-ref=demoBoxDisplay-pending]').val() : demoBox.dataIn[demoBox.dataIn.length - 1].high);
    //var myPending = parseFloat(($('#demoBoxInfos-change').hasClass("pending")) ? $('input[data-ref=demoBoxDisplay-pending]').val() : ((myType=="buy") ? demoBox.dataIn[demoBox.dataIn.length-1].H : demoBox.dataIn[demoBox.dataIn.length-1].L ));

    //alert(myPending);

    if ($('#demoBoxInfos-amount-type').hasClass("pourcentage")) {

      myAmount = Math.floor(myAmount * demoBox.balance / 100);

    }

    //console.log("-----------------------------------");

    // console.log("Balance : "+demoBox.balance);
    // console.log("Amount : "+myAmount);
    // console.log("Position : "+myPending);
    // console.log("Take profit : "+myTake);
    // console.log("Stop loss : "+myStop);
    // console.log("Volume : "+myVolume)
    console.log(demoBox.dataIn[demoBox.dataIn.length - 1]);

    myResultStop = demoBox.displayStop(myAmount, 1000) + " " + demoBox.devise;

    var myPoint = 0;
    let myResultTake;
    let myResultSize;

    if (demoBox.pairNb == 0) { // BTC-USD
      demoBox.getCurrencyData("EUR", "USD");

      myPoint = myAmount * demoBox.lastDataCurrency / Math.abs((myStop - myPending));
      myResultTake = (myPoint * Math.abs(myTake - myPending) / demoBox.lastDataCurrency).toFixed(2) + " " + demoBox.devise;
      myResultSize = myPoint.toFixed(2) + " " + "BTC";

    } else if (demoBox.pairNb == 1) { // EUR-USD
      demoBox.getCurrencyData("EUR", "USD");

      myPoint = myAmount * demoBox.lastDataCurrency / Math.abs((myStop - myPending) * 10000);
      myResultTake = (myPoint * Math.abs(myTake - myPending) * 10000 / demoBox.lastDataCurrency).toFixed(2) + " " + demoBox.devise;
      myResultSize = (myPoint / 10).toFixed(2);

    } else if (demoBox.pairNb == 2) { // GPB-CAD
      demoBox.getCurrencyData("EUR", "CAD");

      myPoint = myAmount * demoBox.lastDataCurrency / Math.abs((myStop - myPending) * 10000);
      myResultTake = (myPoint * Math.abs(myTake - myPending) * 10000 / demoBox.lastDataCurrency).toFixed(2) + " " + demoBox.devise;
      myResultSize = (myPoint / 10).toFixed(2);

    } else if (demoBox.pairNb == 3) { // ETH-EUR
      demoBox.getCurrencyData("EUR", "USD");

      myPoint = myAmount * demoBox.lastDataCurrency / Math.abs((myStop - myPending));
      myResultTake = (myPoint * Math.abs(myTake - myPending) / demoBox.lastDataCurrency).toFixed(2) + " " + demoBox.devise;
      myResultSize = myPoint.toFixed(2) + " " + "ETH";

    }

    console.log("mon point : " + myPoint);

    // myResultSize = (myPoint / 10).toFixed(2);
    // myResultTake = demoBox.reduceNumber((myPoint*(Math.abs(myTake.slice(2)-String(myPending).slice(2, 6)))),1000)+" "+demoBox.devise;

    console.log("myResultSize : " + myResultSize);
    // console.log("myResultTake : "+myResultTake);


    $("#demoBoxInfos-takeProfit-indicator").html(myResultTake);

    $("#demoBoxInfos-stopLoss-indicator").html(myResultStop);
    console.log(myResultStop)

    var MyNewVal = myVolume * 5 / 100;

    // console.log("myVolume : "+myVolume);
    // console.log("MyNewVal : "+MyNewVal);

    if (myTake < myPending && myStop < myPending) {

      if (demoBox.typeIn == 'take') {

        if ($("#demoBoxDisplay-stop").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-stop]').val(demoBox.reduceNumber(myPending + MyNewVal, 10000000));

          demoBox.takeKeyUp("demoBoxDisplay-stop");

        }

      } else if (demoBox.typeIn == 'stop') {

        if ($("#demoBoxDisplay-take").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-take]').val(demoBox.reduceNumber(myPending + MyNewVal, 10000000));

          demoBox.takeKeyUp("demoBoxDisplay-take");

        }

      }

    } else if (myTake > myPending && myStop > myPending) {

      if (demoBox.typeIn == 'take') {

        if ($("#demoBoxDisplay-stop").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-stop]').val(demoBox.reduceNumber(myPending - MyNewVal, 10000000));

          demoBox.takeKeyUp("demoBoxDisplay-stop");

        }

      } else if (demoBox.typeIn == 'stop') {

        if ($("#demoBoxDisplay-take").hasClass('on')) {

          $('input[data-ref=demoBoxDisplay-take]').val(demoBox.reduceNumber(myPending - MyNewVal, 10000000));

          demoBox.takeKeyUp("demoBoxDisplay-take");

        }

      }

    }

    $('#demoBoxInfos-button-sell').click(function() {
      demoBox.displayModal();
    });

    $('#demoBoxInfos-button-buy').click(function() {
      demoBox.displayModal();
    });

    $('#closeModal').click(function() {
      $("#emailModal").css("display", "none");
    });

    $('#demoBoxInfos-button-sell').removeClass("show");
    $('#demoBoxInfos-button-buy').removeClass("show");

    if (!$("#demoBoxDisplay-take").hasClass('on') && !$("#demoBoxDisplay-stop").hasClass('on')) {

      $('#demoBoxInfos-button-sell').addClass("show");
      $('#demoBoxInfos-button-buy').addClass("show");

    } else {

      $('#demoBoxInfos-button-' + myType).addClass("show");

    }

    if (myAmount > demoBox.balance) {

      $('#demoBoxInfos-tradeSize').html("<font>not enough fund</font>");
      $("#demoBoxInfos-button-sell").removeClass('show');
      $("#demoBoxInfos-button-sell").css('cursor', '');

      $("#demoBoxInfos-button-buy").removeClass('show');

    } else {

      $('#demoBoxInfos-tradeSize').html("Trade Size : <font>" + myResultSize + "</font>");

    }

    //console.log("Result : "+myResult);

  },

  clearChart: () => {

    demoBox.context.clearRect(0, 0, demoBox.canvas.width, demoBox.canvas.height);

  },

  setDate: (_date) => {

    _data = new Date(_date);

    return _date.getFullYear() + "-" + _date.getMonth() + "-" + _date.getDate() + "T" + _date.getHours() + ":" + _date.getMinutes() + ":" + _date.getSeconds();

  },

  funPush: function(e, _function) {

    clearTimeout(demoBox.myTimer);
    demoBox.myTimer = setTimeout(function() {

      _function(e);

    }, 100);

  },

};

$(document).ready(function() {

  demoBox.init();

});

/* drawChart : (_data) => {

  let myTickInterval = moduleDemo.tickInterval;
  let ratio = 240 / (moduleDemo.max - moduleDemo.min);

  moduleDemo.canvas.width = 400;
  moduleDemo.canvas.height = 240;

  moduleDemo.context.beginPath();

  if (moduleDemo.type == 1) {

    moduleDemo.endY = 240 - (_data[_data.length - 1].high - moduleDemo.min) * ratio;

    moduleDemo.context.strokeStyle = "white"; // Green path
    moduleDemo.context.moveTo(0, 240 - (_data[0].high - moduleDemo.min) * ratio);

    for (let i = 0; i < _data.length; i++) {

      let iw = i;
      moduleDemo.context.lineTo(iw, 240 - (_data[i].high - moduleDemo.min) * ratio);

    }

  } else {

    moduleDemo.endY = 240 - Math.floor((parseFloat(_data[_data.length - 1].high) - moduleDemo.min) * ratio);

    moduleDemo.context.strokeStyle = "white"; // Green path
    moduleDemo.context.moveTo(0, 240 - Math.floor((parseFloat(_data[0].high) - moduleDemo.min) * ratio));

    for (var i = 0; i < _data.length; i++) {

      var iw = i;
      moduleDemo.context.lineTo(iw, 240 - Math.floor((parseFloat(_data[i].high) - moduleDemo.min) * ratio));
      //console.log(i+" -> "+(Math.floor((parseFloat(_data[i].H)-demoBox.min)*ratio)));

    }

  }

  moduleDemo.context.stroke();

  moduleDemo.drawGrid();

  $('#demoBox').removeClass("loading");

  //console.log("----------------------------------------------------------------");

} */

/* getMinMax: (_data) => {
  moduleDemo.dataIn = _data.candles;

  moduleDemo.max = 0;
  moduleDemo.min = 10000;

  for (let candle of _data.candles) {
    moduleDemo.max = Math.max(moduleDemo.max, candle[7]);
    moduleDemo.min = Math.min(moduleDemo.min, candle[8]);
  }
    if (moduleDemo.max < 10) {
    moduleDemo.type = 1;
    moduleDemo.buffer = (moduleDemo.max - moduleDemo.min) * 20 / 100;

    moduleDemo.min = moduleDemo.min - moduleDemo.buffer;
    moduleDemo.max = moduleDemo.max + moduleDemo.buffer;

  } else {
    moduleDemo.buffer = Math.floor((moduleDemo.max - moduleDemo.min) * 20 / 100);

    moduleDemo.min = Math.floor(moduleDemo.min - moduleDemo.buffer);
    moduleDemo.max = Math.ceil(moduleDemo.max + moduleDemo.buffer);
  }

  moduleDemo.drawChart(moduleDemo.dataIn);
} */