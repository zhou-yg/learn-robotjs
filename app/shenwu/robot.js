const robot = require("robotjs");
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../../logs/', new Date().toString())
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

async function log (x, y) {
  const screen = robot.getScreenSize();
  const img = ImageData2D.capture(0, 0, screen.width, screen.height);
  const d = new Date();
  const name = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`
  const logFile = path.join(logDir, `${name}.jpg`);
  await img.log(logFile, x * 2, y * 2)
}

async function mouseMoveAndClick (x, y) {
  if (Array.isArray(x)) {
    y = x[1]
    x = x[0]
  }
  y = y + 20

  robot.moveMouseSmooth(x, y);
  robot.moveMouseSmooth(x - 1 , y + 1);
  robot.moveMouseSmooth(x, y);

  await sleep(10);  

  try {
    // await log(x, y);
  } catch (e) {
    console.error('log error', e);
  }
  robot.mouseClick();
}
async function clickOffset (x, y) {
  if (Array.isArray(x)) {
    y = x[1]
    x = x[0]
  }

  robot.moveMouseSmooth(x, y);
  robot.moveMouseSmooth(x - 2 , y + 2);
  robot.moveMouseSmooth(x, y);

  await sleep(10);  

  try {
    // await log(x, y);
  } catch (e) {
    console.error('log error', e);
  }
  robot.mouseClick();
}
async function rightClickOffset (x, y) {

  robot.moveMouseSmooth(x, y);
  robot.moveMouseSmooth(x - 1 , y + 1);
  robot.moveMouseSmooth(x, y);

  await sleep(10);  

  try {
    // await log(x, y);
  } catch (e) {
    console.error('log error', e);
  }
  robot.mouseClick('right');
}

/**
 * @param {Buffer} b1 
 * @param {Buffer} b2 
 */
function mapBGR2RGB (b1, b2) {
  for (let i = 0; i < b1.length; i += 4) {
    b2[i + 0] = b1[i + 2]
    b2[i + 1] = b1[i + 1]
    b2[i + 2] = b1[i + 0]
    b2[i + 3] = b1[i + 3]
  }
  return b2
}


function colorDistance(c1, c2) {
  const [r1, g1, b1] = c1;
  const [r2, g2, b2] = c2;

  // 计算颜色与蓝色之间的欧氏距离
  const distance = Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
  return distance;
}

class ImageData2D {
  /**
   * @param {*} x 
   * @param {*} y 
   * @param {*} w 
   * @param {*} h 
   * @returns ImageData2D
   */
  static capture (x, y, w, h) {
    return new ImageData2D(robot.screen.capture(x,y,w,h))
  }
  constructor (pic) {
    /**
     * @property {robot.Bitmap} pic
    */
    this.pic = pic;
    this.width = pic.width;
    this.height = pic.height;
    this.imageData = Buffer.alloc(pic.image.length);
    mapBGR2RGB(pic.image, this.imageData)
  }
  
  save (path, markup) {
    return logCapture(
      {
        ...this.pic,
        image: this.imageData,
        markup,
      },
      path,
    );
  }
  log (path, x, y) {
    return this.save(path, [
      { x, y, w: 20, h: 20 },
      { x: x + 2, y: y + 2, w: 18, h: 18, color: [255, 0, 0, 255] },
    ])
  }
  /**
   * [0,1,2,3,4,5], 3x2
   * [
   *  0,1,2
   *  3,4,5
   * ]
   * @param {number} x 
   * @param {number} y 
   */
  colorAt (x, y) { // 1,1 -> 4
    const first = x + y * this.width;
    return this.imageData[
      first,
      first + 1,
      first + 2,
      first + 3
    ]
  }

  mark (x, y) {
    const w = 10;
    const h = 10;
    
    const sx = Math.max(0, x - w / 2);
    const sy = Math.max(0, y - h / 2);
    const ex = x + w / 2;
    const ey = y + h / 2;

    for(let i = sx; i < ex; i++) {
      for (let j = sy; j < ey; j++) {
        const first = i + j * this.width;
        console.log('first: ', first);
        this.imageData[first] = 255;
        this.imageData[first + 1] = 255;
        this.imageData[first + 2] = 255;
        this.imageData[first + 3] = 255;
      }
    }
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} w 
   * @param {number} h 
   * @param {[number, number, number, number?]} color 
   */
  getColorAtRange (x,y,w,h, color) {
    const threshold = 50;

    let colorDots = [];
    for(let i = x; i < x + w; i++) {
      for (let j = y; j < y + h; j++) {
        const d = colorDistance(color, this.colorAt(i, j))
        if (d < threshold) {
          colorDots.push([i, j]);
        }
      }
    }
    return colorDots;
  }
}

function getGameWindow () {
  const width = 1000;
  const height = 800;
  const pic = robot.screen.capture(0, 0, width, height);

  const imd = new ImageData2D(pic);

  return imd;
}


function logCapture (robotScreenPic, path) {
  return new Promise((resolve, reject) => {
    try {
        const image = new Jimp(robotScreenPic.width, robotScreenPic.height);
        let pos = 0;
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            image.bitmap.data[idx + 0] = robotScreenPic.image[pos++]
            image.bitmap.data[idx + 1] = robotScreenPic.image[pos++]
            image.bitmap.data[idx + 2] = robotScreenPic.image[pos++]
            image.bitmap.data[idx + 3] = robotScreenPic.image[pos++]
        });
        if (robotScreenPic.markup) {
          robotScreenPic.markup.forEach(m => {            
            const { x, y, w, h, color = [0, 0, 0, 255] } = m
            console.log('m: ', m);
            image.scan(x, y, w, h, (x, y, idx) => {
              image.bitmap.data[idx + 0] = color[0];
              image.bitmap.data[idx + 1] = color[1];
              image.bitmap.data[idx + 2] = color[2];
              image.bitmap.data[idx + 3] = color[3];
            });
          })
        }
        
        image.write(path, resolve);
    } catch (e) {
        console.error(e);
        reject(e);
    }
  });
}

function sleep (t) {
  return new Promise(resolve => setTimeout(resolve, t))
}

Object.assign(exports, {
  mouseMoveAndClick,
  clickOffset,
  rightClickOffset,
  ImageData2D,
  sleep,
})