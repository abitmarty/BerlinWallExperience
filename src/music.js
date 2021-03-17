// Var
var blockCenter = 0;
var check = true;
var safeValue = 5;
var isFirst = true;
var contentBlock = 0;
var fade = 0;

// Audio files
import rockstarAudio from './assets/audio/rock.mp3';
import ww2Audio from './assets/audio/ww2.mp3';
import riseAndFallOfBerlinWall from './assets/audio/rise_and_fall_of_the_german_wall.mp3';
import abcNews from './assets/audio/abc_news_liberation.mp3';

// Audio settings
const AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var gainNode = audioCtx.createGain();
var pannerOptions = {pan: 0};
var panner = new StereoPannerNode(audioCtx, pannerOptions);

// Sound blocks 
// Simply import the audio and put them in the targetedBlocks array (make sure there is at least 2 free spaces between audio files)
var targetedBlocks = [];
var lastTargetedBlock = 1000;
targetedBlocks.key2 = abcNews;
targetedBlocks.key5 = riseAndFallOfBerlinWall;
targetedBlocks.key8 = ww2Audio;
targetedBlocks.key11 = rockstarAudio;

// Var
var audioSource;
var positionTry = 0;

export function playMusic(pos, slideWidth, scrollDirection, slidePadding, mode){
    // - half the window size to get the center of the screen
    var posTry = pos - ($(window).width()/2);
    positionTry = (Math.round((Math.abs(posTry))) % slideWidth);
    setCenterBlock(pos, slideWidth, scrollDirection, posTry, positionTry);
    setBlockContent(slidePadding);
    if (mode != 'floating'){
        if (fade >= 0 && fade < 100){
            fade++;
        }
        playAudio(slideWidth);
    } else {
        if (fade > 0 && fade <= 100){
            fade--;
            playAudio(slideWidth);
        }else {
            stopAudio();
            fade = 0;
        }
    }
}

function playAudio(slideWidth){
    // check if context is in suspended state (autoplay policy)
	// if (audioCtx.state === 'suspended') {
	// 	audioCtx.resume();
	// }

    // Calculate gain
    var gainBuildUp = (Math.round((100/slideWidth) * positionTry) / 100);
    var gainBuildDown = 1-gainBuildUp;

    var targetedContentBlock;
    if (targetedBlocks.hasOwnProperty("key" + contentBlock)){
        targetedContentBlock = contentBlock;
        setAudioSource(targetedContentBlock);
    } else if (targetedBlocks.hasOwnProperty("key" + (contentBlock + 1))){
        targetedContentBlock = contentBlock + 1;
        setAudioSource(targetedContentBlock);
    } else if (targetedBlocks.hasOwnProperty("key" + (contentBlock - 1))){
        targetedContentBlock = contentBlock - 1;
        setAudioSource(targetedContentBlock);
    }else {
        // Unreal value
        targetedContentBlock = 1000;
    }

    // The block before the targeted block
    if(contentBlock == (targetedContentBlock - 1)){
        gainNode.gain.value = gainBuildUp * (fade/100);
        panner.pan.value = gainBuildDown;
        if(audioSource.paused){
            // Play audio after interaction with DOM
            audioSource.play().catch(function(error) { });
        }
    } else if(contentBlock == targetedContentBlock){
        gainNode.gain.value = 1 * (fade/100);
        panner.pan.value = 0;
        if(audioSource.paused){
            audioSource.play().catch(function(error) { });
        }
    } else if(contentBlock == (targetedContentBlock + 1)){
        gainNode.gain.value = gainBuildDown * (fade/100);
        panner.pan.value = 0 - gainBuildUp;
        if(audioSource.paused){
            audioSource.play().catch(function(error) { });
        }
    } else {
        // Reset to start of audio
        stopAudio();
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
function setAudioSource(targetedContentBlock){
    if (lastTargetedBlock != targetedContentBlock){
        pannerOptions = {pan: 0};
        audioCtx = new AudioContext();
        panner = new StereoPannerNode(audioCtx, pannerOptions);
        gainNode = audioCtx.createGain();
        audioSource = new Audio(targetedBlocks["key" + targetedContentBlock]);
        audioSource.loop = true;
        const trackSlide2 = audioCtx.createMediaElementSource(audioSource);
        trackSlide2.connect(gainNode).connect(panner).connect(audioCtx.destination);
    }
    lastTargetedBlock = targetedContentBlock;
}

// Get the content value of the center of the screen
function setBlockContent(slidePadding){
    // Count the amount of images
    var container_div = document.getElementsByClassName('js-container');
    var requiredContainer = container_div[0];
    var count = requiredContainer.getElementsByClassName('js-slide').length;
    var adjustedCount = count - (slidePadding * 2);

    // Calculate what the content block is
    if(blockCenter >= 2 && blockCenter <= (adjustedCount + slidePadding)){
        contentBlock = blockCenter - 1;
    }else if (blockCenter == 1){
        contentBlock = adjustedCount;
    } else{
        contentBlock = 1;
    }
}

// Get the block value of the center of the screen
function setCenterBlock(pos, slideWidth, scrollDirection, posTry){
    // On first time
    if (isFirst){
        isFirst = false;
        setBlockNumber(posTry, slideWidth, scrollDirection);
    }

    // Sometimes position skips 0 so we check for a few low values
    if (positionTry < safeValue) {
        check = false;
        setBlockNumber(posTry, slideWidth, scrollDirection);
    }

    // Due to the never 0 issue  we check the left over values
    if(positionTry <= safeValue && !check && scrollDirection === 'left'){
        positionTry = slideWidth;
    }

    // Adition to the function above
    // Setting check
    if (positionTry > safeValue) {
        check = true;
    }
}

function setBlockNumber(posTry, slideWidth, scrollDirection){
    var blockNumber = Math.round(Math.abs(posTry) / slideWidth + (scrollDirection === 'right' ? 1 : 0));
    blockCenter = blockNumber;
}