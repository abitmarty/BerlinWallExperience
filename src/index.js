// Imports
require('normalize-css');
import './index.scss'
var $ = require("jquery");

// Vars
const slidePadding = 3; // The number of clones on each side
var containerWidth, slideWidth, windowWidth, startPosition, endPosition, scrollPosition;
var container = $('.js-container');
var slides = container.find('.js-slide');
var originalSlides = container.find('.js-slide:not(.clone)');
var isAnimating = false;
var scrollDirection = 'right'; // Default direction
var scrollSpeed = 1; // Default speed

// Resize helpers
var resizeEvent;
var isResizing = false;

// Initial setup
function setupAnimation() {
  updateSizes();
  scrollPosition = startPosition;
  startAnimation();
}

// (Re)calculate sizes
function updateSizes(setPosition = false) {
  // Save for later
  var oldScrollPosition = scrollPosition;
  var oldContainerWidth = containerWidth;

  // Calculate new positions
  containerWidth = Math.ceil(container.outerWidth());
  slideWidth = Math.ceil(slides.first().outerWidth());
  windowWidth = Math.ceil(window.innerWidth);
  startPosition = slideWidth * -slidePadding;
  endPosition = -(containerWidth - slideWidth * slidePadding - windowWidth);

  // Update current scroll position
  scrollPosition = (containerWidth / oldContainerWidth) * oldScrollPosition;
  if (setPosition) setTransform(container, 'translateX(' + scrollPosition + 'px)');
}

// Start the animation, if it is not running already
function startAnimation() {
  if (!isAnimating) {
    isAnimating = true;
    updateAnimation();
  }
}

// Update animation
function updateAnimation() {

  if (isResizing) return;

  // MARTY:
  var pos = Math.abs(scrollPosition);
  if (pos % slideWidth === 0) {
    var blockNumber = pos / slideWidth + (scrollDirection === 'right' ? 1 : 0);
    console.log('We are entering block ' + blockNumber);
  }

  // Set new scroll position
  if (scrollDirection === 'right') {
    scrollPosition -= 1;
  } else if (scrollDirection === 'left') {
    scrollPosition += 1;
  }

  // Jump to end or start
  if ((originalSlides.length + slidePadding) * slideWidth < pos) {
    scrollPosition = startPosition;
  } else if (containerWidth - windowWidth - ((originalSlides.length + slidePadding) * slideWidth) > pos) {
    scrollPosition = endPosition;
  }

  // Set settimeout interval
  var minSpeed = 80;
  var maxSpeed = 0;
  var timeOutSpeed = ((1 - scrollSpeed) * (minSpeed - maxSpeed)) + maxSpeed;
  
  // Update DOM
  if (scrollSpeed > 0) {
    setTimeout(function () {
      setTransform(container, 'translateX(' + scrollPosition + 'px)');
      updateAnimation();
    }, timeOutSpeed);
  } else {
    isAnimating = false;
  }
}

// Set CSS `tranform` property for an element
function setTransform(el, transform) {
  el.css({ 'transform': transform });
}

// Button listeners
$('.js-control').on('click', function () {
  scrollDirection = $(this).data('direction');
  scrollSpeed = $(this).data('speed');
  startAnimation();
});

// Initial setup
setupAnimation()

// Recalculate variables on window resize
// The function temporarily stops the animation until resize is finished
$(window).on('resize', function () {
  isResizing = true;
  isAnimating = false;
  updateSizes(true);
  
  if (resizeEvent) clearTimeout(resizeEvent);
  
  resizeEvent = setTimeout(function () {
    isResizing = false;
    startAnimation();
  }, 500);
});

