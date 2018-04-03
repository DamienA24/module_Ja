let moduleDemo = {
  canvasId: "demoBoxDisplay-chartCanvas",
  canvas: null,
  context: null,
  balance: 3000,
  dataIn: null,
  min: 0,
  max: 30000,
  buffer: 0,
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

    moduleDemo.max = 0;
    moduleDemo.min = 10000;

    for (let candle of _data.candles) {
      moduleDemo.max = Math.max(moduleDemo.max, candle[7]);
      moduleDemo.min = Math.min(moduleDemo.min, candle[7]);
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
  }
};

$(document).ready(function () {

  moduleDemo.init();

});