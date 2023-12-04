let robot = require("robotjs");
let Jimp = require('jimp');

const width = 1000;
const height = 800;

function screenCaptureToFile2(robotScreenPic, path) {
  return new Promise((resolve, reject) => {
      try {
          const image = new Jimp(robotScreenPic.width, robotScreenPic.height);
          let pos = 0;
          image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
              image.bitmap.data[idx + 2] = robotScreenPic.image[pos++];
              image.bitmap.data[idx + 1] = robotScreenPic.image[pos++];
              image.bitmap.data[idx + 0] = robotScreenPic.image[pos++];
              image.bitmap.data[idx + 3] = robotScreenPic.image[pos++];
            //   image.bitmap.data[idx + 2] = robotScreenPic.image[pos++];
            //   image.bitmap.data[idx + 1] = robotScreenPic.image[pos++];
            //   image.bitmap.data[idx + 0] = robotScreenPic.image[pos++];
            //   image.bitmap.data[idx + 3] = robotScreenPic.image[pos++];
          });
          image.write(path, resolve);
      } catch (e) {
          console.error(e);
          reject(e);
      }
  });
}

var pic = robot.screen.capture(0, 0, width, height);
console.log('pic: ', pic.image[0], pic.image[1], pic.image[2], pic.image[3]);
// console.log('pic: ', pic.image instanceof Buffer);
screenCaptureToFile2(pic, './imgs/ac.jpg');