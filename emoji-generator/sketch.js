let genbutton;
let savebutton;
let motioncheckbox;

let currentEmoji;
let motionBool = true;

let xSpeed, ySpeed, xLen, yLen;

function setup(){
  let cnv = createCanvas(220, 260);
  cnv.position((windowWidth - width) / 2, windowHeight/2 - height);

  genbutton = createButton('Generate emoji');
  genbutton.position(50 + cnv.x, height + cnv.y);
  genbutton.mousePressed(generateEmoji);

  savebutton = createButton('Save emoji');
  savebutton.position(genbutton.x + (genbutton.width - savebutton.width)/2, genbutton.y + genbutton.height + 5);
  savebutton.mousePressed(saveEmoji);

  motioncheckbox = createCheckbox('Motion', true);
  motioncheckbox.position(savebutton.x, savebutton.y + savebutton.height + 5);
  motioncheckbox.changed(changedMotionBool);

  generateEmoji();
}

function generateEmoji(){
  currentEmoji = emojiGen.getRandomEmoji();

  //Randomise motion
  xSpeed = pow(random(0, 0.7), 5);
  ySpeed = pow(random(0, 0.7), 5);
  xLen = random(0, 3);
  yLen = random(0, 3);
}

function changedMotionBool(){
  motionBool = this.checked();
}

function saveEmoji(){
  let name = prompt("Please enter a file name:", "my_emoji");
  if(!(name == null || name == "")){emojiGen.currentEmoji.save(name + ".png");}
}

function draw(){
  clear();
  let xPos = motionBool ? 30 + xLen*sin(millis()*xSpeed) : 30;
  let yPos = motionBool ? 45 + yLen*cos(millis()*ySpeed) : 45;
  image(currentEmoji, xPos, yPos);
}
