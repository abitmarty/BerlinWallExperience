/*
Made by Greg, with love and sacrifices to the elder gods
*/

const { fixed } = require("normalize-css/normalize");

/*
  use:
    const wc = new Webcam({
      video: video_elem,
      canvas:canvas_elem,
      width, height,
      min_diff: *for threshold,
      diff_to_count: *when averaging pixels to determine whether or not an action was performed,
      displayDifference: (bool) whether or not to display the difference
    })
    ------------
    inside animation loop:
      wc.frame();
      movement_in_quadrant = wc.movementAt(x,y,width,height);
      if(movement_in_quadrant) {
        do_something()
      }
*/

class Webcam {
  constructor ({video, canvas, width, height, min_diff, diff_to_count, displayDifference}) {
    this.video = video;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.min_diff = min_diff
    this.stream = false;
    this.displayDifference = displayDifference;
    this.diff_to_count = diff_to_count
    this.frames = {
      current:false,
      last:false
    }

    this.difference = false;

    this.animationFrame = false;
    this.frame = this.frame.bind(this);
    this.init = this.init.bind(this);
  }

  init () {
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.video.hidden = true;
    if(!navigator.mediaDevices.getUserMedia) {
      console.log("no webcam?");
      return false;
    }
    this.requestVideo().then((success)=>{
      console.log(success? "success" : "failed")
    });
  }

  async requestVideo () {
    try {
      this.stream =await navigator.mediaDevices.getUserMedia({ video: true })
    } catch {
      console.log("no webcam data unavailable...");
      return false;
    }
    this.video.srcObject = this.stream;
    return true;
  }

  frame () {
    this.ctx.beginPath();
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
    this.ctx.save();
    this.ctx.scale(-1,1);
    this.ctx.drawImage(this.video,- this.width,0);
    this.ctx.restore();

    this.frames.current = this.ctx.getImageData(0,0,this.width,this.height);
    this.frames.last = this.frames.last ? this.frames.last : this.frames.current;
    let blended = this.getBlendedData();

    if(this.displayDifference){
      this.ctx.putImageData(blended,0,0);
    }

    this.frames.last = this.frames.current;
  }

  threshold (value) {
    return value > this.min_diff? 255 : 0
  }

  getBlendedData() {
    let data1 = this.frames.current.data;
    let data2 = this.frames.last.data;
    let blend = this.ctx.createImageData(this.width,this.height);
    this.difference = [];
    let target = blend.data;
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
        var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
        var diff = this.threshold(Math.abs(average1 - average2));
        target[4*i] = diff;
        target[4*i+1] = diff;
        target[4*i+2] = diff;
        target[4*i+3] = 255;
        this.difference.push(diff);
        ++i;
    }
    return blend
  }

  sectionDifference(x,y,width,height) {
    if(!this.difference){return false}
    let sum = 0;
    for(let i=0; i<width*height; i++){
      let X = (i % width) + x;
      let Y = Math.floor(i / height) + y;
      let index = X + Y*this.width;
      sum += this.difference[index]
    }
    return sum/(width*height);
  }

  movementAt(x,y,width,height){
    return this.sectionDifference(x,y,width,height) > this.diff_to_count;
  }
}

//used to calculate speed at an easing (non-linear) pace
function easing (x){
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// this is the controls. Sits between webcam and berlin wall
class WebcamControl {
  constructor({min_dial_value,max_dial_value,plusQuadrant, minusQuadrant}){
    this.min_dial_value = min_dial_value; //should really be max_dial_value * -1
    this.max_dial_value = max_dial_value;
    this.dial_value = 0;
    this.plusQuadrant = plusQuadrant; //[x,y,width,height] area to look at to increase speed
    this.minusQuadrant = minusQuadrant; //[x,y,width,height] area to look at to decrease speed
  }

  turnDial(delta) { // linearly "turn the dial"
    let new_val = this.dial_value + delta;
    if(new_val < this.min_dial_value){
      return this.min_dial_value;
    }
    if(new_val > this.max_dial_value){
      return this.max_dial_value;
    }
    return new_val
  }

  //right or left?
  get direction() {
    return this.dial_value < 0? "left" : "right";
  }

  //vrooommmmm
  get speed() {
    return this.dial_value > 0? easing(this.dial_value) : easing(- this.dial_value)
  }
}

//creates html elements needed for webcam
function initialiseElements(show) {
  let elems = {
    video:document.createElement("video"),
    canvas:document.createElement("canvas"),
    wrapper:document.createElement("div"),
    debug:document.createElement("div")
  };
  elems.video.autoplay = true;
  elems.video.playsInline = true;
  elems.video.width = elems.canvas.width = 500;
  elems.video.width = elems.canvas.height = 500;
  document.body.appendChild(elems.wrapper);
  elems.wrapper.appendChild(elems.video);
  elems.wrapper.appendChild(elems.canvas);
  elems.wrapper.appendChild(elems.debug);
  elems.wrapper.hidden = !show;
  Object.assign(elems.wrapper.style,{
    position:"fixed",
    top:"2vh",
    left:"30vw",
    opacity:"0.2"
  });
  return elems
}

module.exports = {
  webcam:Webcam,
  control: WebcamControl,
  initialiseElements:initialiseElements
}