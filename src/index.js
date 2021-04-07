// Imports
require('normalize-css');
var $ = require("jquery");
import { updateMusic, updateVideo } from './music.js'
import './index.scss'

// Import videos
import video2 from './assets/video/berlin-wall-1974-loop.mp4';
import video3 from './assets/video/berlin-wall-animations.mp4';
import video4 from './assets/video/fall-of-the-wall-loop.mp4';
import video5 from './assets/video/ich-bin-ein-berliner.mp4';

// -----webcam------
const WebCam = require("./webcam");

// Vars
const slidePadding = 1; // The number of clones on each side
var containerWidth, slideWidth, windowWidth, startPosition, endPosition, scrollPosition, relScrollPosition, zeroPosition;
var container = $('.js-container');
var slides = container.find('.js-slide');
var originalSlides = container.find('.js-slide:not(.clone)');
var slideItems = $('.js-slide-item');
var isAnimating = false;
var defaultScrollSpeed = .15;

var scrollDirection = 'right'; // Default direction
var scrollSpeed = defaultScrollSpeed;
var mode = 'floating'; // Default mode

var isDebug = location.hash === '#debug';
var hideSlider = location.hash === '#hideSlider';
var isDemo = location.hash === '#demo';

// Resize helpers
var resizeEvent;
var isResizing = false;

// Initial setup
function setupAnimation() {
  // Make clones
  var firstSlide = slides.first().clone(true).addClass('clone');
  var lastSlide = slides.last().clone(true).addClass('clone');
  container.prepend(lastSlide);
  container.append(firstSlide);
  slides = container.find('.js-slide'); //refetch slides

  if (isDemo) {
    isDebug = false;
    hideSlider = true;
    mode = 'interactive';
  }

  if (!isDebug) {
    $('.js-controls').hide();
    showWebCamDebugInfo = false;
    webcamElements.wrapper.hidden = true;
  }

  if (hideSlider) {
    $('.js-slider-indicator').hide();
  }

  // Calculate sizes and positions
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

  // Calculate new position
  containerWidth = Math.ceil(container.outerWidth());
  slideWidth = Math.ceil(slides.first().outerWidth());
  windowWidth = Math.ceil(window.innerWidth);
  startPosition = -Math.floor(Math.random() * (containerWidth - slideWidth * slidePadding));
  zeroPosition = -slideWidth * slidePadding;
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
var cachedSpeed = scrollSpeed;
function updateAnimation() {

  if (isResizing) return;

  if (scrollSpeed !== cachedSpeed) {
    $('body').removeClass('is-moving');
    if (scrollSpeed > 0) {
      $('body').addClass('is-moving');
    }
    cachedSpeed = scrollSpeed;
  }

  // Handle webcam every move
  if (mode === 'interactive' && !isDebug) {
    handleWebCam();
  }

  // Calculate movement
  var pos = Math.abs(scrollPosition);
  var minStepSize = .5;
  var maxStepSize = 6;
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
    scrollPosition = zeroPosition;
  } else if (containerWidth - windowWidth - ((originalSlides.length + slidePadding) * slideWidth) > pos) {
    scrollPosition = endPosition;
  }

  // Update sound
  updateMusic(scrollPosition, slideWidth, scrollDirection, slidePadding, mode);
  updateVideo(windowWidth, mode);

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
  scrollDirection = $(this).data('direction') ?? scrollDirection;
  scrollSpeed = $(this).data('speed') ?? scrollSpeed;
  updateMovementSlider();
  startAnimation();
});

// Mode button listeners
$('.js-control-mode').on('click', function () {
  var newMode = $(this).data('mode');
  updateMode(newMode);
});


// Control the mode via space bar
$(document).on('keyup', function (e) {
  if (!isDemo && !isDebug && e.keyCode === 32) {
    updateMode((mode === 'floating' ? 'interactive' : 'floating'));
  }
});

// Update movement slider
function updateMovementSlider() {
  var maxWidth = 150;
  var circle = $('.js-circle');
  var translateX = scrollSpeed * maxWidth * (scrollDirection === 'left' ? -1 : 1);
  setTransform(circle, 'translateX(' + translateX + 'px)');
}

// Mode button listeners
function updateMode(newMode) {

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
}

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
    var factor = item.data('factor') ?? 1;

    if (factor === 1) { return; }

    var centerX = windowWidth / 2;
    var translate = item.data('translate') ?? 0;
    var offsetLeft = item.offset().left;
    var realOffset = offsetLeft - translate;
    var relPosition = (realOffset - centerX) * (factor - 1);

    var flipCss = '';
    var flip = $(this).data('flip');
    if (flip && flip === scrollDirection) {
      flipCss = 'scaleX(-1)';
    }

    item.data('translate', relPosition);
    setTransform(item, 'translateX(' + relPosition + 'px)' + flipCss);
  });
}
// -------------WEBCAM CONTROL-----------
// use this if background is static
const wc_conf_static = {
  size: 100,
  min_diff: 30,
  diff_to_count: 3,
  delta: 30,
  delta_x: 10
}

// use this if background is dynamic
const wc_conf = {
  size: 100,
  min_diff: 7,
  diff_to_count: 1,
  delta: 20,
  delta_x: 30
}


var showWebCamDebugInfo = true; //set this to true for debugging purposes

var webcamElements = WebCam.initialiseElements(showWebCamDebugInfo, 100, 100);//initialise the video & canvas size, tho this probs doesn't do much
window.wc = new WebCam.webcam({
  video: webcamElements.video,
  canvas: webcamElements.canvas,
  width: wc_conf.size,
  height: wc_conf.size,
  min_diff: wc_conf.min_diff,
  diff_to_count: wc_conf.diff_to_count,
  displayDifference: true
});

const wcControl = new WebCam.control({
  min_dial_value: -1,
  max_dial_value: 1,
  plusQuadrant: [60, 0, 40, 40],
  minusQuadrant: [0, 0, 40, 40]
})

// this is called every animation frame
let delta_x = wc_conf.delta_x; // constant, to be determined, how far the dial turns
let delta = wc_conf.delta;
let dtc = wc_conf.diff_to_count;
function handleWebCam() {
  wc.frame();
  let { averagex, average } = wc.averageX(1, 1);
  let mov = average * delta > dtc;
  if (mov) {
    wcControl.dial_value = wcControl.forceDial(averagex * delta_x);
    scrollSpeed = wcControl.speed;
    scrollDirection = wcControl.direction;
    updateMovementSlider();
  }
  if (showWebCamDebugInfo) {
    webcamElements.debug.innerText = `
      dial_value: ${wcControl.dial_value},
      speed: ${scrollSpeed},
      direction: ${scrollDirection}
      sumx: ${averagex}
      sum: ${average * delta}
      static: ${wc.useBackground}
      delta: ${delta}
      delta_x: ${delta_x}
      diff_to_count: ${dtc}
    `
  }
}

function toggleStaticBackground() {
  wc.useBackground = !wc.useBackground;
  if (wc.useBackground) {
    wc.min_diff = wc_conf_static.min_diff;
    wc.diff_to_count = wc_conf_static.diff_to_count;
    delta = wc_conf_static.delta;
    delta_x = wc_conf_static.delta_x;
    dtc = wc_conf_static.diff_to_count;
    wc.setBackground();
    return true;
  }

  wc.min_diff = wc_conf.min_diff;
  wc.diff_to_count = wc_conf.diff_to_count;
  delta = wc_conf.delta;
  delta_x = wc_conf.delta_x;
  dtc = wc_conf.diff_to_count;
  return false;
}

window.addEventListener("keyup", (e) => {
  if (isDemo) return;

  if (e.code == "Tab") {
    toggleStaticBackground();
  } else if (e.code == "KeyD") {
    showWebCamDebugInfo = !showWebCamDebugInfo;
    webcamElements.wrapper.hidden = !showWebCamDebugInfo;
  }
}, false)

wc.init(); // initialise webcam (ask for camera permission etc)
//---------------------------------------

$(document).on('click', '.js-button-start', function () {

  navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

  navigator.getMedia({ video: true }, function () {
    // Initiate the animation
    setupAnimation();

    // Remove loading screen
    $('body').addClass('is-ready');
  }, function () {
    alert('Please give access to your webcam');
    return false;
  });

});
