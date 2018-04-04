let moduleDemo = {
  canvasId: "demoBoxDisplay-chartCanvas",
  canvas: null,
  context: null,
  balance: 3000,
  dataIn: null,
  min: 0,
  max: 30000,
  buffer: 0,
  endY: 0,
  devise: "€",
  tickInterval: "hour",
  firstC: 'EUR',
  secondC: 'USD',


  init: () => {

    moduleDemo.canvas = document.getElementById(moduleDemo.canvasId);
    moduleDemo.context = moduleDemo.canvas.getContext("2d");

    $('#demoBoxInfos-balance-value').html(moduleDemo.balance + " " + moduleDemo.devise);

    /* $('.demoBoxDisplay-devise').click((data) => {
      moduleDemo.firstC = data.currentTarget.dataset.first;
      moduleDemo.secondC = data.currentTarget.dataset.second;

      moduleDemo.getData();
    }); */

    $('.demoBoxDisplay-nav').click((data) => {
      moduleDemo.tickInterval = data.currentTarget.dataset.value;
      moduleDemo.getData();
    });

  },

  getData: (data) => {
    moduleDemo.firstC = data.currentTarget.dataset.first;
    moduleDemo.secondC = data.currentTarget.dataset.second;

    $('.demoBoxDisplay-nav').removeClass('on');
    $('.demoBoxDisplay-nav[data-value=' + moduleDemo.tickInterval + ']').addClass('on');

    let myTickInterval = moduleDemo.tickInterval;

    let recoverdData = {
      currency: `${moduleDemo.firstC}/${moduleDemo.secondC}`,
      interval: myTickInterval
    };
    return recoverdData;
  },

  getMinMax: (_data) => {
    moduleDemo.dataIn = _data.candles;

    moduleDemo.max = 0;
    moduleDemo.min = 10000;

    for (let candle of _data.candles) {
      moduleDemo.max = Math.max(moduleDemo.max, candle[7]);
      moduleDemo.min = Math.min(moduleDemo.min, candle[8]);
    }
    moduleDemo.type = 1;
    moduleDemo.buffer = (moduleDemo.max - moduleDemo.min) * 20 / 100;

    moduleDemo.min = moduleDemo.min - moduleDemo.buffer;
    moduleDemo.max = moduleDemo.max + moduleDemo.buffer;
    moduleDemo.drawChart(moduleDemo.dataIn);
  },

  drawChart: (_data) => {

    let myTickInterval = moduleDemo.tickInterval;
    let ratio = 240 / (moduleDemo.max - moduleDemo.min);

    moduleDemo.canvas.width = 400;
    moduleDemo.canvas.height = 240;

    moduleDemo.context.beginPath();
    moduleDemo.endY = 240 - (_data[_data.length - 1][7] - moduleDemo.min) * ratio;

    moduleDemo.context.strokeStyle = "white"; // Green path
    moduleDemo.context.moveTo(0, 240 - (_data[0].high - moduleDemo.min) * ratio);

    for (let i = 0; i < _data.length; i++) {

      let iw = i;
      moduleDemo.context.lineTo(iw, 240 - (_data[i][7] - moduleDemo.min) * ratio);
    }

    moduleDemo.context.stroke();
    moduleDemo.drawGrid();

    $('#demoBox').removeClass("loading");

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

    $("#demoBoxInfos-price-down").html(lastData.low);
    $("#demoBoxInfos-price-up").html(lastData.high);


    /* switch (demoBox.firstC) {
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
    } */

    /* $('input[data-ref=demoBoxDisplay-take]').val(demoBox.reduceNumber(lastData.high, 10000000));
    demoBox.takeKeyUp('demoBoxDisplay-take');

    $('input[data-ref=demoBoxDisplay-stop]').val(demoBox.reduceNumber(lastData.high, 10000000));
    demoBox.takeKeyUp('demoBoxDisplay-stop'); */

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

    console.log("myVolume: " + myVolume);
    console.log("demoBox.min: " + moduleDemo.min);
    console.log("demoBox.max: " + moduleDemo.max);
    console.log("myStep: " + myStep);

    for (let i = 1; i < 5; i++) {
      let toShow = (moduleDemo.min + myStep * (5 - i));
      myHtml += "<div class='yyy' style='top:" + (240 / 5 * i) + "px'><div class='yyy-value'>" + moduleDemo.reduceNumber(toShow, 10000000) + "</div></div>";

    }
    $('#demoBoxDisplay-yyy').html(myHtml);
  },
};

$(document).ready(function () {

  moduleDemo.init();

});