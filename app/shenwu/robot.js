const robot = require("robotjs");
const Jimp = require('jimp');

async function mouseMoveAndClick (x, y) {
  robot.moveMouse(x, y);

  await sleep(10);  

  robot.mouseClick();
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
  
  save (path) {
    logCapture(
      {
        ...this.pic,
        image: this.imageData
      },
      path,
    );
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
            image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++);
            image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++);
            image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++);
            image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++);
        });
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
  ImageData2D,
  sleep,
})