// Import jQuery
var $ = require("jquery");

// Audio files
import bowie from './assets/audio/david-bowie-helden.mp3'
import bowieNew from './assets/audio/david-bowie-helden-new.mp3'
import dakota from './assets/audio/dakota-sound.mp3'
import dakotaNew from './assets/audio/dakota-sound-new.mp3'
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
// In html add js-sound to the parent div
// Class name of child image == imported audio file name
// Place them in the array below (trabelant as example)
var targetedBlocks = [];
var lastTargetedBlock = "";
targetedBlocks.trabant = trabant;
targetedBlocks.dakota = dakotaNew;
targetedBlocks.bowie = bowieNew;
targetedBlocks.voice2 = voice2;

var audioSrcList = [];


// Var
var audioSource;
var fade = 0;

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
    // Ez fade on mode change
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
}

function playAudioImage() {
    $('.js-sound').each(function () {
        var posLeft = $(this).offset().left;
        var itemWidth = $(this).outerWidth();
        var soundSource = $(this).find('img');
        if (posLeft < $(window).width() && posLeft+itemWidth > 0) {
            playAudio(posLeft, itemWidth, soundSource);
        } else {
            // If no sound playing
            // if(audioSource != null){
            //     if(gainNode.gain.value == 0 && !audioSource.paused){
            //         stopAudio();
            //     }
            // }
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

    // Set source
    if (!(soundSource[0].className in audioSrcList)){
        console.log("add to");
        lastTargetedBlock = soundSource[0].className;
        setAudioSource(soundSource);
        console.log(audioSrcList[soundSource[0].className][0]);
    }
    // Play sounds
    if(audioSrcList[soundSource[0].className][0] != null && audioSrcList[soundSource[0].className][0].paused){
        console.log("Play: " + soundSource[0].className);
        audioSrcList[soundSource[0].className][0].play().catch(function(error) { });
    }
    // Set volume and panning
    if (soundSource[0].className in audioSrcList){
        audioSrcList[soundSource[0].className][2].gain.value = gainValue * (fade/100);
        audioSrcList[soundSource[0].className][1].pan.value = panValue;
    }
}

// Go through all audio sources and pause them and reset to 0
function stopAudio(){
    for (var key in audioSrcList) {
        if (audioSrcList.hasOwnProperty(key)) {
            audioSrcList[key][0].pause();
            audioSrcList[key][0].currentTime = 0;
        }
    }
}

// Create new audio based on the image we're looking at.
function setAudioSource(soundSource){
    pannerOptions = {pan: 0};
    audioCtx = new AudioContext();
    panner = new StereoPannerNode(audioCtx, pannerOptions);
    gainNode = audioCtx.createGain();
    audioSource = new Audio(targetedBlocks[soundSource[0].className]);
    audioSource.loop = true;
    const trackSlide2 = audioCtx.createMediaElementSource(audioSource);
    trackSlide2.connect(gainNode).connect(panner).connect(audioCtx.destination);
    audioSrcList[soundSource[0].className] = [audioSource, panner, gainNode];
}

