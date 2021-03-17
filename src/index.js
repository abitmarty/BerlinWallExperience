// Imports
require('normalize-css');
import './index.scss'
var $ = require("jquery");

// -----webcam------
const WebCam = require("./webcam");

// Vars
const slidePadding = 3; // The number of clones on each side
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

  //------handle webcam every loop------
  handleWebCam();

  if (isResizing) return;

  // MARTY:
  var pos = Math.abs(scrollPosition);
  if (pos % slideWidth === 0) {
    var blockNumber = pos / slideWidth + (scrollDirection === 'right' ? 1 : 0);
    console.log('We are entering block ' + blockNumber);
  }

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
// use this if background is static
const wc_conf_static = {
  size:100,
  min_diff:30,
  diff_to_count:3,
  delta:30,
  delta_x:10
}

// use this if background is dynamic
const wc_conf = {
    size:100,
    min_diff:7,
    diff_to_count:1,
    delta:20,
    delta_x:30
  }


const showWebCamDebugInfo = true; //set this to true for debugging purposes

const webcamElements = WebCam.initialiseElements(showWebCamDebugInfo,100,100);//initialise the video & canvas size, tho this probs doesn't do much
window.wc = new WebCam.webcam({
  video:webcamElements.video,
  canvas: webcamElements.canvas,
  width:wc_conf.size,
  height:wc_conf.size,
  min_diff:wc_conf.min_diff,
  diff_to_count:wc_conf.diff_to_count,
  displayDifference:true
});

const wcControl = new WebCam.control({
  min_dial_value:-1,
  max_dial_value:1,
  plusQuadrant:[60,0,40,40],
  minusQuadrant:[0,0,40,40]
})

// this is called every animation frame
let delta_x = wc_conf.delta_x; // constant, to be determined, how far the dial turns
let delta = wc_conf.delta;
let dtc = wc_conf.diff_to_count;
function handleWebCam() { 
  wc.frame();
  let {averagex, average} = wc.averageX(1,1);
  let mov = average*delta > dtc;
  if(mov) {
    wcControl.dial_value = wcControl.forceDial(averagex*delta_x);
    scrollSpeed = wcControl.speed;
    scrollDirection = wcControl.direction;
    updateMovementSlider();
  }
  if(showWebCamDebugInfo) {
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
  if(wc.useBackground){
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

window.addEventListener("keyup",(e)=>{
  if (e.code == "Space") {
    toggleStaticBackground();
  }
},false)

wc.init(); // initialise webcam (ask for camera permission etc)
//---------------------------------------

// Initiate the animation
setupAnimation();