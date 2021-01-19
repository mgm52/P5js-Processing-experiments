//Provides functions to generate emoji images using asset folders
var emojiGen = {
  aFolders: {}, //Asset folders of form "foldername":[assets]
  aSingles: {}, //Asset singles of form "singlename":asset

  //Differing eye indices that can be paired together (an already symmetric relation)
  eyeCombos: {
    0: [1],
    1: [2, 7, 0],
    2: [1],
    3: [4, 6],
    4: [3, 5, 6],
    5: [4],
    6: [3, 4],
    7: [1]
  },

  //Returns an emoji image
  getRandomEmoji: function(){
    //Choose eyes
    let eNum1 = floor(random(0, this.aFolders.eye.length));
    let eNum2 = eNum1;
    //1/4 chance of differing eyes
    if(random(0, 1) < 0.25){[eNum1, eNum2] = this.chooseDifferingEyes(eNum1);}

    //Choose head
    let hNum = 1;
    if(random(0, 1) < 0.12){hNum = 0;}
    else if(random(0, 1) < 0.12){hNum = 2;}

    //Choose glasses
    let glasseschosen = floor(random(0, 8));
    //Disallow glasses with big eyes
    if(max(this.aFolders.eye[eNum1].width, this.aFolders.eye[eNum2].width) > 70){glasseschosen = 0;}

    return this.getEmoji(
              hNum,
              eNum1,
              eNum2,
              floor(random(0, this.aFolders.mouth.length)),
              floor(random(-1, this.aFolders.brow.length)),
              30, 30,
              floor(random(0, 7)), //1/7 chance of choosing blush
              floor(random(0, 6)),
              floor(random(0, 10)),
              floor(random(0, 10)),
              glasseschosen,
              floor(random(0, 10))
    );
  },

  chooseDifferingEyes: function(e1){
    if(!(e1 in this.eyeCombos)) return [e1, e1];

    let potentialEyes = this.eyeCombos[e1];
    let e2 = potentialEyes[floor(random(0, potentialEyes.length))];
    return [e1, e2];
  },

  //Returns an emoji image with features chosen by parameters (positions random)
  //Certain "special cases" e.g. vomiting are provided seperate to set probability be controlled
  getEmoji: function(hNum, eNum1, eNum2, mNum, bNum, blushing, tears, snorting, handchin, glasses, vomiting){
    let img = createGraphics(width, height);
    //------------------------------------ DEFINING IMAGES:
    let h = this.aFolders.head[hNum];
    let e1 = this.aFolders.eye[eNum1];
    let e2 = this.aFolders.eye[eNum2];
    let m = this.aFolders.mouth[mNum];
    let b = this.aFolders.brow[bNum];

    //Special case: big and small star are half as likely to appear vs other eyes
    if(eNum1 == 10 && random(0, 1) < 0.5){e1 = this.aSingles.smallstar; e2 = this.aSingles.smallstar;}
    //Special case: if vomiting, give mouth smaller boundary
    if(vomiting==1){m=this.aSingles.vomit;}
    let mEffectiveWidth = (vomiting==1) ? 85 : m.width;
    let mEffectiveHeight = (vomiting==1) ? 50 : m.height;
    //Special case: if brow num < 0, create invisible eyebrows
    if(bNum < 0){b = createImage(int(random(e1.width * 2, h.width)), 1);}

    let eBaseWidth = max(e1.width, e2.width);
    let eBaseHeight = max(e1.height, e2.height);

    //------------------------------------ DRAWING IMAGES: (order: head, brow, blush, eyes, mouth, vomit, tears, snort, handchin, glasses)
    //Drawing head
    img.image(this.aFolders.head[hNum], 0, 0);

    //Drawing eyebrows
    //Calculating bounds for eyebrows
    let bIdealMinY = -sqrt((h.width/2) * (h.width/2) - (b.width/2) * (b.width/2)) + h.width/2 + 3;
    let bIdealMaxY =  sqrt((h.width/2) * (h.width/2) - (b.width/2) * (b.width/2)) + h.width/2 - 5;
    let bAbsoluteMaxY = h.height - mEffectiveHeight - eBaseHeight - b.height - 5;
    let bY = random(min(bIdealMinY, bAbsoluteMaxY), min(bIdealMaxY, bAbsoluteMaxY));
    img.image(b, h.width/2 - b.width/2, bY);

    //Calculating bounds for eyes
    let yEye = bY + b.height;
    if(blushing == 1 && bNum < 0){b.width -= this.aSingles.blush.width/2;} //prevent blushes from going off face
    let eFinalWidth = random(eBaseWidth * 2, max(b.width, eBaseWidth * 2));
    if(eFinalWidth - e1.width - e2.width > 65){eFinalWidth = random(50, 60) + e1.width + e2.width;}

    //If eyes are different height, adjust them
    let yE1Off = yEye;
    let yE2Off = yE1Off;
    if(e1.height < e2.height){
      yE1Off += (e2.height - e1.height)/1.5;}
    else if(e1.height > e2.height){
      yE2Off += (e1.height - e2.height)/1.5;}

    //Drawing blush
    if(blushing == 1){
      img.image(this.aSingles.blush, h.width/2 - eFinalWidth/2 - this.aSingles.blush.width/2 + e1.width/2 - 5, yE1Off + e1.height - this.aSingles.blush.height/2 + 5);
      img.image(this.aSingles.blush, h.width/2 + eFinalWidth/2 - e2.width/2  - this.aSingles.blush.width/2 + 5, yE2Off + e2.height - this.aSingles.blush.height/2 + 5);
    }

    //Drawing eyes
    img.image(e1, h.width/2 - eFinalWidth/2, yE1Off);
    //1/2 chance second eye is flipped
    let scaleChange = (random(0, 1) < 0.5) ? 1 : -1;
    img.scale(scaleChange, 1);
    //Draw second eye
    img.image(e2, scaleChange * (h.width/2 + eFinalWidth/2 - e2.width * (1 + scaleChange)/2), yE2Off);
    img.scale(scaleChange, 1);

    //Drawing mouth
    let yMouth = random(yEye + eBaseHeight, h.height - mEffectiveHeight - 5);
    img.image(m, h.width/2 - m.width/2, yMouth);

    //if(this.aSingles.vomit == 1){m = createImage(85, 50);} //Return mouth to vomit mouth size

    //Drawing tears
    if(tears == 1){
      //If eye isnt horizontal, move tears closer
      let closeness = 0;
      if(e1.height/e1.width > 0.5){closeness = 4;}

      //Draw first tear (left side)
      img.image(this.aSingles.tear, h.width/2 - eFinalWidth/2 - this.aSingles.tear.width + closeness, yE1Off + e1.height - 2 - closeness);

      //Draw reversed tear (right side)
      scale(-1, 1);
      img.image(this.aSingles.tear, -1 * (h.width/2 + eFinalWidth/2 + this.aSingles.tear.width - closeness), yE2Off + e2.height - 2 - closeness);
      scale(-1, 1);
    }

    //Drawing snort
    if(snorting == 1){
     img.image(this.aSingles.snort, h.width/2 - this.aSingles.snort.width/2, yEye + e1.height + (yMouth - yEye - e1.height) * random(0.05, 0.3));
    }

    //Drawing hand on chin
    if(handchin == 1){
      img.image(this.aSingles.hand, max(h.width/2 - mEffectiveWidth/4 - this.aSingles.hand.width/2, 14), min(yMouth + mEffectiveHeight*0.5, h.height - this.aSingles.hand.height/4) - this.aSingles.hand.height/10);
    }

    //Drawing glasses
    if(glasses == 1){
     img.image(this.aSingles.glasses, h.width/2 - this.aSingles.glasses.width/2, min(yE1Off, yE2Off) - (this.aSingles.glasses.height - eBaseHeight)/3);
    }

    return img;
  }
};

//Preload image assets
function preload(){
  //Load arrays of assets indexed by folder name
  //Folder sizes could be found automatically using backend code, not in p5js though.
  let fsizes = {"eye": 11, "brow": 8, "head": 3, "mouth": 15};
  let fnames = Object.keys(fsizes);
  for(let a=0; a<fnames.length; a++){
    emojiGen.aFolders[fnames[a]] = [];
    for(let i = 0;i<fsizes[fnames[a]];i++){
      append(emojiGen.aFolders[fnames[a]], loadImage(fnames[a] + "/" + fnames[a] + i + ".png"));
    }
  }

  //Load one-off ("single") assets indexed by asset name
  let snames = ["blush", "tear", "snort", "hand", "glasses", "smallstar", "vomit"];
  for(let a=0; a<snames.length; a++){
    emojiGen.aSingles[snames[a]] = loadImage("singles/" + snames[a] + ".png");
  }
}
