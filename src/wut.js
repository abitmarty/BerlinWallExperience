var block = 0;
var check = true;
var safeValue = 10;

export function playMusic(pos, slideWidth, scrollDirection){
    // Get count of wall images
    var container_div = document.getElementsByClassName('slides-container');
    var requiredContainer = container_div[0];
    var count = requiredContainer.getElementsByClassName('js-slide').length;
    var adjustedCount = count - 6; 
    var position = Math.round((Math.abs(pos))) % slideWidth;

    //console.log(pos);

    // Sometimes position skips 0
    // For that reason === 0 won't do
    // This function checks for the check == 0 value
    if (position < safeValue && check) {
        var blockNumber = Math.round(Math.abs(pos) / slideWidth + (scrollDirection === 'right' ? 1 : 0));
        console.log('We are entering block ' + blockNumber);

        if(scrollDirection === 'right'){
            block ++;
        }else{
            block --;
        }
        check = false;
        //console.log('We are entering a newblock ' + block);
    }

    // Adition to the function above
    // Setting check
    if (position > safeValue) {
        check = true;
    }

    // Check if amount of blocks is reached
    if (block > adjustedCount) {
        block = 1;
    }

    // Check if minimum is reached
    if (block <= 0 ){
        block = adjustedCount;
    }

    // If something were to go wrong and a block count is overlooked. This will reset the block on the next round

    //console.log("Were in: " + block);
}