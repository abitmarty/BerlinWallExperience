var blockCenter = 0;
var check = true;
var safeValue = 5;
var isFirst = true;
var contentBlock = 0;
import block2Audio from './assets/audio/rock.mp3';
import block5Audio from './assets/audio/ww2.mp3';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Sound blocks 
var targetedBlocks = [];
targetedBlocks.key2 = block2Audio;
targetedBlocks.key12 = block5Audio;

//console.log(targetedBlocks[0].value);

// if (targetedBlocks.hasOwnProperty("key5")){
//     console.log("yesirski");
// } else {
//     console.log("nononon");

// }


// load sound block 2
//var targetedContentBlock = 2;
var audioSlide2 = new Audio(block2Audio);
//audioSlide2 = new Audio(block5Audio);

audioSlide2.loop = true;
const trackSlide2 = audioCtx.createMediaElementSource(audioSlide2);
var positionTry = 0;


// load sound block 5
// var audioSlide5 = new Audio(block2Audio);
// audioSlide5.loop = true;
//const trackSlide5 = audioCtx.createMediaElementSource(audioSlide2);

// volume
const gainNode = audioCtx.createGain();
trackSlide2.connect(gainNode).connect(audioCtx.destination);



export function playMusic(pos, slideWidth, scrollDirection, slidePadding){
    // - half the window size to get the center of the screen
    var posTry = pos - ($(window).width()/2);
    positionTry = (Math.round((Math.abs(posTry))) % slideWidth);
    setCenterBlock(pos, slideWidth, scrollDirection, posTry, positionTry);
    setBlockContent(slidePadding);
    playAudio(slideWidth);
}

function playAudio(slideWidth){
    // check if context is in suspended state (autoplay policy)
	if (audioCtx.state === 'suspended') {
		audioCtx.resume();
	}

    // Calculate value 0 to 1
    //var panning = Math.round((100/slideWidth) * positionTry) / 100;

    // Calculate gain
    var gainBuildUp = (Math.round((100/slideWidth) * positionTry) / 100);
    var gainBuildDown = 1-gainBuildUp;

    var targetedContentBlock;
    if (targetedBlocks.hasOwnProperty("key" + contentBlock)){
        targetedContentBlock = contentBlock;
        //console.log("were in sound block");
    } else if (targetedBlocks.hasOwnProperty("key" + (contentBlock + 1))){
        targetedContentBlock = contentBlock + 1;
        //console.log("were before sound block");
    } else if (targetedBlocks.hasOwnProperty("key" + (contentBlock - 1))){
        targetedContentBlock = contentBlock - 1;
        //console.log("were after sound block");
    }else {
        targetedContentBlock = 1000;
    }

    // The block before the targeted block
    if(contentBlock == (targetedContentBlock - 1)){
        gainNode.gain.value = gainBuildUp;
        if(audioSlide2.paused){
            // Play audio after interaction with DOM
            audioSlide2.play().catch(function(error) { });
        }
    } else if(contentBlock == targetedContentBlock){
        if(audioSlide2.paused){
            audioSlide2.play().catch(function(error) { });
        }
    } else if(contentBlock == (targetedContentBlock + 1)){
        gainNode.gain.value = gainBuildDown;
        if(audioSlide2.paused){
            audioSlide2.play().catch(function(error) { });
        }
    } else {
        // Reset to start of audio (we dont have to do this. This might not even be ludic -- remove line 112)
        audioSlide2.pause();
        audioSlide2.currentTime = 0;
    }
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