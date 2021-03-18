// Imports
require('normalize-css');
var $ = require("jquery");
import { playMusic } from './music.js'
import './index.scss'

// Import videos
import video1 from './assets/video/placeholder-video.mp4';

// -----webcam------
const WebCam = require("./webcam");

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
var mode = 'floating'; // Default mode

// Resize helpers
var resizeEvent;
var isResizing = false;

// Initial setup
function setupAnimation() {
  updateSizes();
  scrollPosition = startPosition;
  updateMovementSlider();
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
  startPosition = -Math.floor(Math.random() * containerWidth);
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

  // Handle webcam every move
  if (mode === 'interactive') {
    handleWebCam();
  }

  // Music
  var pos = Math.abs(scrollPosition);
  playMusic(scrollPosition, slideWidth, scrollDirection, slidePadding, mode);

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
  updateMovementSlider();
  startAnimation();
});

function updateMovementSlider() {
  var maxWidth = 150;
  var circle = $('.js-circle');
  var translateX = scrollSpeed * maxWidth * (scrollDirection === 'left' ? -1 : 1);
  setTransform(circle, 'translateX(' + translateX + 'px)');
}

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
  updateMovementSlider();
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

// -------------WEBCAM CONTROL-----------
const showWebCamDebugInfo = false; //set this to true for debugging purposes

const webcamElements = WebCam.initialiseElements(showWebCamDebugInfo,100,100);//initialise the video & canvas size, tho this probs doesn't do much
const wc = new WebCam.webcam({
  video:webcamElements.video,
  canvas: webcamElements.canvas,
  width:100,
  height:100,
  min_diff:10,
  diff_to_count:5,
  displayDifference:false
});

const wcControl = new WebCam.control({
  min_dial_value:-1,
  max_dial_value:1,
  plusQuadrant:[60,0,40,40],
  minusQuadrant:[0,0,40,40]
})

// this is called every animation frame
function handleWebCam() { 
  let delta = 4; // constant, to be determined, how far the dial turns
  wc.frame();
  let a_x = wc.averageX();
  let mov = wc.movementAt(0,0,100,100)
  if(mov) {
    wcControl.dial_value = wcControl.forceDial(a_x*delta);//wcControl.turnDial(mov * delta);
    scrollSpeed = wcControl.speed;
    scrollDirection = wcControl.direction;
    updateMovementSlider()
  }
  if(showWebCamDebugInfo) {
    webcamElements.debug.innerText = `
      dial_value: ${wcControl.dial_value},
      speed: ${scrollSpeed},
      direction: ${scrollDirection}
      sumx: ${a_x}
    `
  }
}


wc.init(); // initialise webcam (ask for camera permission etc)
//---------------------------------------


$(window).on('load', function () {
  // Initiate the animation
  setupAnimation();

  // Remove loading screen
  $('body').addClass('is-ready');
});
