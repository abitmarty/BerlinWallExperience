var blockCenter = 0;
var check = true;
var safeValue = 10;
var isFirst = true;
var contentBlock = 0;

import audioFile from './assets/audio/ww2.mp3';

export function playMusic(pos, slideWidth, scrollDirection, slidePadding){
    setCenterBlock(pos, slideWidth, scrollDirection);
    setBlockContent(slidePadding);
    //playAudio();
}

function playAudio(){
    var audioSlide2 = new Audio(audioFile);
    //let click_sound = require('./assets/audio/ww2.mp3');
    audioSlide2.play();
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
function setCenterBlock(pos, slideWidth, scrollDirection){
    //var position = (Math.round((Math.abs(pos))) % slideWidth);

    // - half the window size to get the center of the screen
    var posTry = pos - ($(window).width()/2);
    var positionTry = (Math.round((Math.abs(posTry))) % slideWidth);

    // On first time
    if (isFirst){
        isFirst = false;
        setBlockNumber(posTry, slideWidth, scrollDirection);
    }

    // Sometimes position skips 0 so we check for a few low values
    if (positionTry < safeValue && check) {
        setBlockNumber(posTry, slideWidth, scrollDirection);
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