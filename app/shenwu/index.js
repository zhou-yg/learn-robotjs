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

async function checkTask () {

  const img = ImageData2D.capture(
    750,
    210,
    250,
    75
  );
  const rightTaskImg = resolveImg('rightTask.jpg')
  await img.save(rightTaskImg);

  await hold();

  const result = ocrScan(rightTaskImg)
  
  return result;
}

function resolveImg (file) {
  return path.join(__dirname, '../../imgs/', file);
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


async function closeCalendar () {
  const closeCalendarP = [880, 175];
  await mouseMoveAndClick(...closeCalendarP);
  await hold()
}

async function showCalendar () {
  const calendarP = [17, 170];
    
  robot.moveMouse(...calendarP.map(v => v - 1));
  await mouseMoveAndClick(...calendarP)
  await hold()
}

async function focus () {
  mouseMoveAndClick(980, 75);
  await hold()
}

/** xiu ye */
async function taskXY () {

  focus();
  await sleep(100);

  const firstTask = [230, 322];
  const taskTextBBox = [70, 20];

  async function clickFirstTask () {
    const clickArea = [firstTask[0], firstTask[1] - 30]
    await mouseMoveAndClick(...clickArea); 
    await mouseMoveAndClick(...clickArea); 
  }

  async function checkXYDone( ) {
      await closeCalendar();
      await showCalendar();
    
      const img = ImageData2D.capture(
        firstTask[0] - taskTextBBox[0] / 2,
        firstTask[1] - taskTextBBox[1] / 2,
        taskTextBBox[0],
        taskTextBBox[1] + 20,
      );
      const firstTaskImg = resolveImg('firstTask.jpg');
      await img.save(firstTaskImg);
    
      await hold();
      const result = ocrScan(firstTaskImg);
      console.log('result: ', result);

      return !result.some(v => /\/10/.test(v));
  }

  async function clickBuy () {
    const buyP = [560, 650];
    await mouseMoveAndClick(...buyP);
  }

  async function isComplete (taskInfo) {
    console.log('[isComplete] taskInfo: ', taskInfo);
    if (
      taskInfo.some(text => ['完成'].every(k => text.includes(k)))
    ) {
      await mouseMoveAndClick(...firstTask);
      await hold();

      return true
    } 
  }

  async function isBuy (taskInfo) {
    console.log('[isBuy] taskInfo: ', taskInfo);
    if (
      taskInfo.some(text => ['前往', '购买'].every(k => text.includes(k)))
    ) {
      await showCalendar();
      await clickFirstTask();
      await closeCalendar();
      await sleep(5 * 1000);
      await clickBuy();

      return true
    } 
  }

  const r = await checkXYDone();
  if (!r) {

    await closeCalendar();

    const fns = [
      isComplete, 
      isBuy
    ];

    for (const fn of fns) {
      const taskInfo = await checkTask();
      const r = await fn(taskInfo);
      if (r) {
        break;
      }
    }
    
  }
}

function task1 () {

}

function hold () {
  return sleep(1000);
}

async function checkTeamStatus () {
  const closeTeamP = [819, 190]

  await mouseMoveAndClick(...closeTeamP);
  await hold();
  await mouseMoveAndClick(...closeTeamP);
  await hold();

  const triggerTeamP = [760, 800];

  await mouseMoveAndClick(...triggerTeamP);
  await sleep(200);

  const teamEntryP = [735, 630];
  const entryBBox = [90, 30]
  // robot.moveMouse(...teamEntryP)
  const img = ImageData2D.capture(
    teamEntryP[0] - entryBBox[0] / 2,
    teamEntryP[1] - entryBBox[1] / 2,
    entryBBox[0],
    entryBBox[1],
  );

  const teamEntryImg = resolveImg('teamEntry.jpg');
  await img.save(teamEntryImg)
  await hold();
  const result = ocrScan(teamEntryImg);
  console.log('result: ', result);


  return result.some(t => /退出队伍/);
}

async function switchTab(index = 0) {
  robot.moveMouse(10, 60);
  await sleep(1000)
  robot.moveMouse(11, 61);
  await sleep(1000)
  robot.moveMouse(9, 59);

  await sleep(1000)

  await mouseMoveAndClick(
    110 + 200 * index,
    60,
  );
  await hold()
}

async function withTabs (callback) {
  await switchTab(0);
  await callback();
  await switchTab(1)
  await callback();  
  await switchTab(2);
  await callback();   
}

const taskPosition = {
  t1: [230, 290],
  t2: [330, 290],
  t3: [430, 290],
  t4: [530, 290],
  t5: [615, 300],
  t6: [710, 290],
  t7: [710, 290],
  t8: [235, 400],
  t9: [328, 400],
  t11: [520, 400]
}

async function pk (times = 4) {
  await focus();
  async function openTask () {
    await closeCalendar();
    await showCalendar();
  
    const taskP = taskPosition.t5;
    await mouseMoveAndClick(...taskP);
    await hold();
    await hold();
  }
  async function end () {
    const closePkP = [880, 205];
    await mouseMoveAndClick(...closePkP);
    await hold();
    await closeCalendar();
  }
  async function startPk () {
    const opponentP = [710, 590]
    await mouseMoveAndClick(...opponentP);
    await hold();
    const sureP = [430, 470];
    await mouseMoveAndClick(...sureP);
    await sleep(5 * 1000);
    await refreshTurns();
  }
  await withTabs(
    openTask
  )
 

  let i = 1;
  while (i <= times) {
    i++
    console.log('pk times: ', i, times);

    await withTabs(
      startPk
    )

    await sleep(5 * 60 * 1000);
  }

  await withTabs(
    end
  )
}
pk();

async function treasureAuto10 () {
  focus();

  async function getTask () {
    await closeCalendar();
    await showCalendar();
  
    const taskP = taskPosition.t6
    await mouseMoveAndClick(...taskP);
    await closeCalendar();
  
    await sleep(20 * 1000);
  
    const getTaskP = [450, 530];
    await mouseMoveAndClick(...getTaskP);

    await sleep(2 * 1000)
  
    const xiangP = [906, 730];
    await mouseMoveAndClick(...xiangP);

    await showCalendar();
    await mouseMoveAndClick(...taskP);
    await sleep(20 * 1000);
  }

  await withTabs(getTask)
  await sleep(7 * 60 * 1000)
  await withTabs(refreshTurns)
  await sleep(8 * 60 * 1000)
}

async function treasure70 (times = 10, multi) {
  await focus();

  const exeFn = multi ? withTabs : (fn) => fn()

  async function getTask () {

    await closeCalendar();
    await showCalendar();
  
    const taskP = taskPosition.t9;
    await mouseMoveAndClick(...taskP);
    await closeCalendar();
  
    await sleep(15 * 1000);
  
    const getTaskP = [450, 530];
    await mouseMoveAndClick(...getTaskP);
  
    await sleep(2 * 1000)
  
    const xiangP = [906, 730];
    await mouseMoveAndClick(...xiangP);
  
    await hold();
    const closeDialogP = [810, 433];
    await mouseMoveAndClick(...closeDialogP);

    await showCalendar();
    await mouseMoveAndClick(...taskP);
    await hold()
    await closeCalendar();
  }

  async function continueTask () {
    const continueGetTaskP = [450, 475];
    await mouseMoveAndClick(...continueGetTaskP);  
    await hold()
    const closeDialogP = [810, 431];
    await mouseMoveAndClick(...closeDialogP);
    await hold();

    await hold()
    await showCalendar();  
    await hold()
    await mouseMoveAndClick(...taskP);  
    await closeCalendar();
  }

  await exeFn(
    getTask
  )

  let i = 1;
  while (i <= times) {
    console.log('treasure70 times: ', i, times);
    i++
    await sleep(100 * 1000);
    
    await exeFn(
      continueTask
    )

    if (i === 5) {
      await exeFn(
        refreshTurns
      )
    }
  }
}


function refreshMultiTurns () {
  let i = 0;

  const st = Date.now();

  async function fn () {
    await refreshTurns();   
    await hold()

    await switchTab((i++)%3);

    if ((Date.now() - st) < 15 * 60 * 1000) {
      setTimeout(fn, 2 * 60 * 1000);
    }
  }

  fn();
}

const teamPosition = {
  team: [754, 798],
  teamMatchTab: [830, 360],
}
const matchPosition = {
  button: [],
  monster: [],
}

async function monster () {
  focus();

  await mouseMoveAndClick(...teamPosition.team)
  await hold();

  await mouseMoveAndClick(...teamPosition.teamMatchTab);
  await hold();

  await mouseMoveAndClick(...matchPosition.monster)
  await hold();
  await mouseMoveAndClick(...matchPosition.button)
}

async function closeGame () {
  robot.moveMouse(15, 40);
  await sleep(1000)
  robot.moveMouse(14, 41);
  await sleep(1000)
  robot.moveMouse(16, 40);

  await sleep(1000)

  await mouseMoveAndClick(
    110 + 200 * index,
    60,
  );
}

/**
 * 1.pk
 * 2.treasure
 * 3.monster
 */

focus().then(() => {

  Promise.resolve()
  // .then(() => pk(3))
  // .then(() => treasure70())
  // .then(() => treasure70())
  // .then(() => treasure70())
  // .then(() => treasure70())
  // .then(() => switchTab(1))
  // .then(() => pk(2))
  // .then(() => treasure70())
  // .then(() => treasure70())
  // .then(() => treasure70())
  // .then(() => treasure70(4))
  // .then(() => switchTab(2))
  // .then(() => treasure70())
  // .then(() => treasure70(2))
  // .then(() => closeGame())
})


// switchTab(1)
//   .then(() => treasureAuto10())
//   .then(() => pk())
//   .then(() => monster())
//   .then(() => switchTab(1))
//   .then(() => treasureAuto10())
//   .then(() => pk())
//   .then(() => monster())
//   .then(() => switchTab(2))
//   .then(() => treasureAuto10())
//   .then(() => pk())
//   .then(() => monster())
