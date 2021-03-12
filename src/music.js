var block = 0;
var check = true;
var safeValue = 10;
var isFirst = true;

export function playMusic(pos, slideWidth, scrollDirection){
    setCenterBlock(pos, slideWidth, scrollDirection);
}

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

    console.log(block);
}

function setBlockNumber(posTry, slideWidth, scrollDirection){
    var blockNumber = Math.round(Math.abs(posTry) / slideWidth + (scrollDirection === 'right' ? 1 : 0));
    block = blockNumber;
}