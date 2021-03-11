require('normalize-css');
<<<<<<< Updated upstream
import './index.scss'
=======
import './index.scss'
var $ = require("jquery");

var container = document.querySelector('.js-container')
var slide = document.querySelector('.js-slide')
var containerWidth, slideWidth;
var direction = 'right';
var scrollPosition = 0;
var scrollSpeed = 1;

function setupAnimation() {
  containerWidth = container.getBoundingClientRect().width
  slideWidth = slide.getBoundingClientRect().width
  startAnimation()
}

// Start the animation, if it is not running already
function startAnimation() {
  updateAnimation();
}

function updateAnimation() {

  // MARTY:
  var pos = Math.abs(scrollPosition);
  var width = Math.ceil(slideWidth)
  if (pos % width === 0) {
    var blockNumber = pos / width + (direction === 'right' ? 1 : 0);
    console.log('We are entering block ' + blockNumber);
  }
    
  if (direction === 'right') {
    scrollPosition -= 1;
  } else if (direction === 'left') {
    scrollPosition += 1;
  }

  var minSpeed = 80;
  var maxSpeed = 10;
  var timeOutSpeed = ((1 - scrollSpeed) * (minSpeed - maxSpeed)) + maxSpeed;
  
  setTimeout(function () {
    setTransform(container, 'translateX(' + scrollPosition + 'px)');
    updateAnimation();
  }, timeOutSpeed);
}

// Set CSS `tranform` property for an element
function setTransform(el, transform) {
  el.style.transform = transform
  el.style.WebkitTransform = transform
}

$('.js-control').click(function () {
  direction = $(this).data('direction');
  scrollSpeed = $(this).data('speed');
});

// Initial setup
setupAnimation()
>>>>>>> Stashed changes
