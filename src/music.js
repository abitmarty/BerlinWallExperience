$(window).on('load', function(){
    window.addEventListener("scroll", function() {
        var elementTarget = document.getElementById("slide-2");
        console.log("X position: " + window.scrollX);
        console.log("Ofsett: " + elementTarget.offsetLeft);
        console.log("Width: " + elementTarget.offsetWidth);
        if (window.scrollX > (elementTarget.offsetLeft)) {
            alert("You've scrolled past the second div");
        }
      });
});