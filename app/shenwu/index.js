const robot = require("robotjs");
const path = require('path');
const {
  ocrScan
} = require('./ocr');

const {
  mouseMoveAndClick,
  ImageData2D,
  sleep,
} = require('./robot')

async function openMap () {
  
  robot.keyTap('tab');
}

function closeMap () {
  const closeP = { x: 0, y: 0 }
  mouseMoveAndClick(closeP.x, closeP.y)
}

function openCaptainMap () {
  robot.keyTap('tab');

  const p = { x: 0, y: 0 }

  mouseMoveAndClick(p.x, p.y)
}

function backMaster () {
  openMap();
  const backPosition = { x: 0, y: 0 }

  mouseMoveAndClick(backPosition.x, backPosition.y)
}

function checkTask () {
  console.log(robot.getScreenSize())

  const img = ImageData2D.capture(
    750,
    200,
    250,
    100
  );
    
  img.save('imgs/task.jpg')
}

async function refreshTurns () {
  const turnsJPG = path.join(__dirname, '../../imgs/turns.jpg');

  // const img = ImageData2D.capture(
  //   0,
  //   758,
  //   200,
  //   20
  // );
    
  // await img.save(turnsJPG);

  // await sleep(30)
  // const result = ocrScan(turnsJPG);
  // console.log('result: ', result);

  // need move
  await mouseMoveAndClick(155, 770);
  await mouseMoveAndClick(154, 769);
}

function moveToMaster () {

}

/** xiu ye */
function task0 () {

}

function task1 () {

}


async function switchTab(index = 0) {
  robot.moveMouse(10, 60);
  robot.moveMouse(9, 59);

  await sleep(30)

  await mouseMoveAndClick(
    110 + 200 * index,
    60,
  );
}


function refreshMultiTurns () {
  let i = 0;

  const st = Date.now();

  async function fn () {
    await refreshTurns();   
    await sleep(100)

    await switchTab((i++)%3);

    if (Date.now() - st > 15 * 60 * 1000) {
      setTimeout(fn, 2 * 60 * 1000);
    }
  }

  fn();
}

// checkTask();
// refreshTurns().then(() => {
//   // openMap();
// });

// refreshMultiTurns();