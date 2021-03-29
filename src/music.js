// Import jQuery
var $ = require("jquery");

// Var
var blockCenter = 0;
var check = true;
var safeValue = 5;
var isFirst = true;
var contentBlock = 0;
var fade = 0;

// Audio files
import bowie from './assets/audio/david-bowie-helden.mp3'
import dakota from './assets/audio/dakota-sound.mp3'
import trabant from './assets/audio/trabant-sound-final.mp3'
import voice1 from './assets/audio/voice-over-1.mp3'
import voice2 from './assets/audio/voice-over-2.mp3'
import voice3 from './assets/audio/voice-1961.mp3'

// Audio settings
const AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var gainNode = audioCtx.createGain();
var pannerOptions = {pan: 0};
var panner = new StereoPannerNode(audioCtx, pannerOptions);

// Sound blocks 
// Simply import the audio and put them in the targetedBlocks array (make sure there is at least 2 free spaces between audio files)
var targetedBlocks = [];
var lastTargetedBlock = "";
targetedBlocks.trabant = trabant;
//targetedBlocks.key7 = dakota;
//targetedBlocks.key11 = bowie;
//targetedBlocks.key13 = voice2;

// Var
var audioSource;
var positionTry = 0;

export function updateVideo(windowWidth) {
    $('.js-video').each(function () {
        var posLeft = $(this).offset().left;
        var itemWidth = $(this).outerWidth();
        var $video = $(this).find('video');
        var isPlaying = $video.data('isPlaying') ?? false;
        if (posLeft < windowWidth && posLeft+itemWidth > 0) {
            // VIDEO IS IN SCREEN
            if (!isPlaying) {
                fadeSound($video, true);
                $video.data('isPlaying', true);
            }
        } else {
            // VIDEO IS OUT OF SCREEN
            if (isPlaying) {
                fadeSound($video, false);
                $video.data('isPlaying', false);
            }
        }
    });
}

function fadeSound($video, turnSoundOn) {
    var isFading = $video.data('isFading') ?? false;
    if (isFading) return;

    $video.data('virtualVolume', turnSoundOn ? 0 : 1);
    $video.data('isFading', true);

    var fadeAudio = setInterval(function () {
        
        var currentVolume = $video.data('virtualVolume');
        var newVolume = turnSoundOn ? Math.min(1, currentVolume + .05) : Math.max(0, currentVolume - .05);
        // Only fade if past the fade out point or not at zero already
        if ((newVolume > 0 && newVolume < 1)) {
            $video.prop('muted', false);
            $video.prop('volume', newVolume);
            $video.data('virtualVolume', newVolume);
        } else if (newVolume === 1) {
            clearInterval(fadeAudio);
            $video.data('isFading', false);
        } else {
            $video.prop('muted', true);
            clearInterval(fadeAudio);
            $video.data('isFading', false);
        }
    }, 125);
}

export function playMusic(pos, slideWidth, scrollDirection, slidePadding, mode){
    // - half the window size to get the center of the screen
    if (mode != 'floating'){
        if (fade >= 0 && fade < 100){
            fade++;
        }
        playAudioImage();
    } else {
        if (fade > 0 && fade <= 100){
            fade--;
            playAudioImage();
        }else {
            stopAudio();
            fade = 0;
        }
    }
    //playAudioImage()
}

function playAudioImage() {
    $('.js-sound').each(function () {
        var posLeft = $($('.js-sound')).offset().left;
        var itemWidth = $($('.js-sound')).outerWidth();
        var soundSource = $(this).find('img');
        if (posLeft < $(window).width() && posLeft+itemWidth > 0) {
            playAudio(posLeft, itemWidth, soundSource);
        } else {
            stopAudio();
        }
    });
}

function playAudio(posLeft, itemWidth, soundSource){
    // check if context is in suspended state (autoplay policy)
	// if (audioCtx.state === 'suspended') {
	// 	audioCtx.resume();
	// }

    // Calculate gain
    var percentagePosition = Math.round((100/($(window).width()+itemWidth))* (posLeft+itemWidth))/100;
    var gainValue = percentagePosition * 2;
    var panValue = gainValue - 1;
    if (percentagePosition > 0.5){
        gainValue = 2 - gainValue;
    }
    gainNode.gain.value = gainValue * (fade/100);
    panner.pan.value = panValue;

    // Set source
    if (lastTargetedBlock != soundSource[0].className){
        lastTargetedBlock = soundSource[0].className;
        setAudioSource(soundSource);
    }
    if(audioSource.paused){
        //console.log(audioSource.paused);
        audioSource.play().catch(function(error) { });
    }
}

// it currently starts over. We might want to change that?
function stopAudio(){
    if (audioSource != null){
        audioSource.pause();
        audioSource.currentTime = 0;
    }
}

// Create new audio based on the position we're in
function setAudioSource(soundSource){
    pannerOptions = {pan: 0};
    audioCtx = new AudioContext();
    panner = new StereoPannerNode(audioCtx, pannerOptions);
    gainNode = audioCtx.createGain();
    audioSource = new Audio(targetedBlocks[soundSource[0].className]);
    audioSource.loop = true;
    const trackSlide2 = audioCtx.createMediaElementSource(audioSource);
    trackSlide2.connect(gainNode).connect(panner).connect(audioCtx.destination);
}

