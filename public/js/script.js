/*-- Menu Toggle Script --*/
$(document).ready(function() {
  $('.drawer').drawer();
});
// Appstore slider
$('.owl-carousel-app-store').owlCarousel({
  loop: true,
  nav: true,
  items: 1,
  autoplay: true,
  autoplayHoverPause: true,
  itemsDesktop: [1199, 1],
  smartSpeed: 2000,
  navText: ['', '<i class="fa fa-caret-right" aria-hidden="true"></i>']
})
// Tour slider
$('#tour').owlCarousel({
  loop: true,
  nav: false,
  items: 1,
  smartSpeed: 2000,
  mouseDrag: false,
  touchDrag: false,
  pullDrag: false,
  dotsContainer: '#carousel-custom-dots'
});
// Script for immitation dots 
$('.owl-dot').click(function() {
  $('#tour').trigger('to.owl.carousel', [$(this).index(), 2000]);
  $('.owl-dot').toggleClass('ative');
});
$('.item').matchHeight(false);
$('.functionality-block').matchHeight(false);
// Member help
$(".video-button").click(function() {
  var $this = $(this);
  var $iframe = $("<iframe>").attr("src", $this.data("link")).css({ "width": 250, "height": 150 });
  $("#video-view").html('').append($iframe);
  $iframe.wrap("<div class='class-video'>");
});
$('.find-answer').matchHeight(false);
// My apps
$('.my-app').matchHeight(false);
// Private appstore & Public appstore
$('.item').matchHeight(false);
$('.app-block-height').matchHeight(false);
// Public tarif page
$('.public-tarif-license-block').matchHeight(false);
$(document).ready(function() {
  var $window = $(window);
  function checkWidth() {
      var windowsize = $(window).width();
      if (windowsize > 767) {
          $('#social-dropdown').removeClass("dropdown-menu");
      }
      else {
          $('#social-dropdown').addClass("dropdown-menu");
      }
  }
  checkWidth();
  $(window).resize(checkWidth);
});
