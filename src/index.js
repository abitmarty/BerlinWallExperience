// Imports
require('normalize-css');
import { playMusic } from './music.js'
import './index.scss'
var $ = require("jquery");

// Vars
const slidePadding = 1; // The number of clones on each side
var containerWidth, slideWidth, windowWidth, startPosition, endPosition, scrollPosition, relScrollPosition;
var container = $('.js-container');
var slides = container.find('.js-slide');
var originalSlides = container.find('.js-slide:not(.clone)');
var slideItems = $('.js-slide-item');
var isAnimating = false;
var defaultScrollSpeed = .15;

var scrollDirection = 'right'; // Default direction
var scrollSpeed = defaultScrollSpeed;
; // Default speed
var mode = 'floating'; // Default mode

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
  playMusic(scrollPosition, slideWidth, scrollDirection);
  // if (pos % slideWidth === 0) {
  //   var blockNumber = pos / slideWidth + (scrollDirection === 'right' ? 1 : 0);
  //   console.log('We are entering block ' + blockNumber);
  // }

  var minStepSize = .5;
  var maxStepSize = 3;
  var stepSize = (scrollSpeed * (maxStepSize - minStepSize));

  // Set new scroll position
  if (scrollDirection === 'right') {
    scrollPosition -= stepSize;
  } else if (scrollDirection === 'left') {
    scrollPosition += stepSize;
  }

  // Calculate relative scroll position
  relScrollPosition = Math.ceil(-scrollPosition - (slideWidth * slidePadding));

  // Jump to end or start
  if ((originalSlides.length + slidePadding) * slideWidth < pos) {
    scrollPosition = startPosition;
  } else if (containerWidth - windowWidth - ((originalSlides.length + slidePadding) * slideWidth) > pos) {
    scrollPosition = endPosition;
  }
  
  // Update DOM
  if (scrollSpeed > 0) {
    requestAnimationFrame(function () {
      setTransform(container, 'translateX(' + scrollPosition + 'px)');
      updateParallax();
      updateAnimation();
    });
  } else {
    isAnimating = false;
  }
}

// Set CSS `tranform` property for an element
function setTransform(el, transform) {
  el.css({ 'transform': transform });
}

// Speed/direction button listeners
$('.js-control').on('click', function () {
  scrollDirection = $(this).data('direction');
  scrollSpeed = $(this).data('speed');
  startAnimation();
});

// Mode button listeners
$('.js-control-mode').on('click', function () {
  var newMode = $(this).data('mode');
  var target = $('body');
  target.removeClass('is-init-mode');
  if (newMode === 'floating') {
    target.removeClass('is-interactive-mode').addClass('is-floating-mode');
    scrollSpeed = defaultScrollSpeed;
  } else if (newMode === 'interactive') {
    target.removeClass('is-floating-mode').addClass('is-interactive-mode');
  }
  mode = newMode;
});

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

// Recalculate parallax positions
function updateParallax() {
  slideItems.each(function () {
    var item = $(this);
    var factor = item.data('factor');
    var centerX = windowWidth / 2;
    var translate = item.data('translate') ?? 0;
    var offsetLeft = item.offset().left;
    var realOffset = offsetLeft - translate;
    var relPosition = (realOffset - centerX) * (factor - 1);

    item.data('translate', relPosition);
    setTransform(item, 'translateX(' + relPosition + 'px)');
  });
}

// Initiate the animation
setupAnimation();
