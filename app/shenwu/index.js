const robot = require("robotjs");
const path = require('path');
const {
  ocrScan
} = require('./ocr');

const {
  mouseMoveAndClick,
  clickOffset,
  rightClickOffset,
  ImageData2D,
  sleep,
} = require('./robot')

function dvd (arr) {
  return arr.map(v => v/2)
}

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

  await clickOffset(
    110 + 200 * index,
    60,
  );
  await focus()
  await hold()
}

async function withTabs (callback) {
  await switchTab(0);
  await callback(0);
  await hold()

  await switchTab(1)
  await callback(1);  
  await hold()

  await switchTab(2);
  await callback(2);   
  await hold()
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
  t10: [420, 400],
  t11: [520, 400]
}
const taskPosition2 = {
  t1: () => mouseMoveAndClick(...[230, 290]),
  t2: () => mouseMoveAndClick(...[330, 290]),
  t3: () => mouseMoveAndClick(...[430, 290]),
  t4: () => mouseMoveAndClick(...[530, 290]),
  t5: () => mouseMoveAndClick(...[615, 300]),
  t6: () => mouseMoveAndClick(...[710, 290]),
  t7: () => mouseMoveAndClick(...[710, 290]),
  t8: () => mouseMoveAndClick(...[235, 400]),
  t9: () => mouseMoveAndClick(...[328, 400]),
  t11: () => mouseMoveAndClick(...[520, 400])
}

async function pk (times = 4) {
  async function openTask (tab) {
    await closeCalendar();
    await showCalendar();
  
    const taskP = tab === 0 ?  taskPosition.t4 : taskPosition.t5;
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

    await sleep(3.5 * 60 * 1000);
  }

  await withTabs(
    end
  )
}

async function treasureAuto10 () {
  focus();

  async function getTask () {
    await closeCalendar();
    await showCalendar();
  
    const taskP = taskPosition.t5
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
  }

  await withTabs(getTask)
  await sleep(5 * 60 * 1000)
  await withTabs(refreshTurns)
  await sleep(5 * 60 * 1000)
}

async function treasure70 (times = 10, single) {
  await focus();

  const exeFn = single ?  (fn) => fn() : withTabs

  const taskP = taskPosition.t10;

  async function getTask () {

    await closeCalendar();
    await showCalendar();
  
    await mouseMoveAndClick(...taskP);
    await closeCalendar();
  
  }
  async function getTask2 () {
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
    const continueGetTaskP = [450, 480];
    await mouseMoveAndClick(...continueGetTaskP);  
    await hold()
    const closeDialogP = [810, 431];
    await mouseMoveAndClick(...closeDialogP);
    await hold();

    await clickOffset(...dvd([1623,908]))
    await hold()

    await hold()
    await showCalendar();  
    await hold()

    await mouseMoveAndClick(...taskP);  
    await closeCalendar();
  }

  await withTabs(goMaster)

  let i = 1;
  while (i <= times) {
    console.log('treasure70 times: ', i, times);
    i++
    await exeFn(
      getTask
    )
    await sleep(10 * 1000);
    await exeFn(
      getTask2
    )

    await sleep(50 * 1000);

    if (i <= times) {
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
  await withTabs(async () => {
    await clickOffset(...dvd([1623,908]))
    await hold()
  })
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

const bottomEntries = {
  box: {
    open: () => clickOffset(680, 820),
    close: () => clickOffset(...dvd([1350, 417])),
  },
}
const leftEntries = {
  shop: {
    open: () => clickOffset(...dvd([33, 712])),
    close: () => clickOffset(...dvd([1677,433])),
    buy: () => clickOffset(...dvd([1112, 1331])),
  }
}

async function littleThings0 (times = 11) {
  async function openPanel () {
    await bottomEntries.box.open()
    await hold()  
    const entryP = [366, 300]
    await clickOffset(...entryP);
    await hold()
    const xiulianP = [610, 260]
    await clickOffset(...xiulianP);
    await hold()
  }  

  async function doThing () {
    const normalP = [635, 390]
    let i = 0;
    while (i < times) {
      i++
      await clickOffset(...normalP);
      await hold()
    }

    const p = [690, 290]
    await clickOffset(...p)
  }
  async function doThing2 () {
    const plus = dvd([1548, 523])
    await clickOffset(...plus)
    await hold()
    const button = dvd([1012,1162])
    await clickOffset(...button)
    await hold()

    const closeP = dvd([1256,586])
    await clickOffset(...closeP)
    await hold()
  }

  await withTabs(openPanel)

  await withTabs(doThing)
  await withTabs(doThing2)

  await withTabs(() => {
    return bottomEntries.box.close()
  })
}

const pkgPosition = {
  a1: dvd([900, 500]),
  a2: dvd([1000, 500]),
  a3: dvd([1100, 500]),
  a4: dvd([1200, 500]),
  e1: dvd([1100, 1170]),
  e2: dvd([1200, 1170]),
  e3: dvd([1300, 1170]),
}

async function goMaster () {
  const p = dvd([2011, 474])
  rightClickOffset(...p)
  await hold()
  await hold()
}

async function xiulian () {
  async function prepare () {
    await bottomEntries.box.open()
    await hold()

    const resetP = dvd([1291, 1256])
    await clickOffset(...resetP)
    await hold()

    const arr = [
      [pkgPosition.a1, pkgPosition.e1],
      [pkgPosition.a2, pkgPosition.e2],
      [pkgPosition.a3, pkgPosition.e3],
    ];

    for (const pair of arr) {
      console.log('pair: ', pair);
      const [from, to] = pair;
      await clickOffset(...from)
      await hold()
      robot.moveMouseSmooth(...to)
      await hold()
      clickOffset(...to)
      await hold()
    }

    await bottomEntries.box.close()
    await hold()
  }

  const targetTask = taskPosition2.t2;

  async function getTask () {
    await showCalendar()
    await targetTask()
    await hold()
    await closeCalendar()
    await sleep(20 * 1000)
    const getP = [920, 1005]
    await clickOffset(...dvd(getP))

    await hold()

    const closeP = dvd([1624, 912])
    await clickOffset(...closeP)
  }

  async function gotoBuy () {
    // 寄售中心
    await leftEntries.shop.open()
    await hold()
    await hold()
    await hold()

    // 1
    const buyP = dvd([1112, 1331])
    await clickOffset(...buyP)
    await hold()
    await leftEntries.shop.close()
    await hold()

    // 2
    await leftEntries.shop.open()
    await hold()
    await hold()
    await hold()

    await clickOffset(...buyP)
    await hold()
    await leftEntries.shop.close()
    await hold()
    // 3
    await leftEntries.shop.open()
    await hold()
    await hold()
    await hold()

    await clickOffset(...buyP)
    await hold()
    await leftEntries.shop.close()

    await showCalendar()
    await targetTask()
    await hold()
    await closeCalendar()

    await sleep(45 * 1000)
  }

  async function give () {
    const giveP1 = dvd([1038, 588])
    const giveP2 = dvd([1128, 588])
    const giveP3 = dvd([1235, 588])
    await clickOffset(...giveP1)
    await hold()
    await clickOffset(...giveP2)
    await hold()
    await clickOffset(...giveP3)
    await hold()

    const submitP = dvd([757,1303])
    await clickOffset(...submitP)
    await hold()
    const closeResP = dvd([1625,912])
    await clickOffset(...closeResP)
    await hold()
  }

  async function gotoVisitorAndFight () {
    await showCalendar()
    await hold()
    await targetTask()
    await hold()
    await closeCalendar()

    await sleep(45 * 1000)
    const closeResP = dvd([1625,912])
    await clickOffset(...closeResP)

    await showCalendar()
    await hold()
    await targetTask()
    await hold()
    await closeCalendar()

    await sleep(45 * 1000)
    await sleep(10 * 1000)
    await clickOffset(...closeResP)

    closeCalendar()
  }
  // await goMaster()
  // await prepare();
  // await goMaster();
  // await getTask()
  // await gotoBuy()
  await give()
  await gotoBuy()
  await give()
  await gotoBuy()
  await give()
  await gotoVisitorAndFight()
}

async function children () {
  await bottomEntries.box.close()
  await bottomEntries.box.open()
  await hold()

  await rightClickOffset(...pkgPosition.a4)
  await hold()
  // task
  const taskEntryP = dvd([895,1327])
  await clickOffset(...taskEntryP)
  await hold()
  // close
  await clickOffset(...dvd([1623,907]))
  await hold()

  await leftEntries.shop.open()
  await hold()

  await leftEntries.shop.buy()
  await hold()

  await leftEntries.shop.close()
  await hold()

  await clickOffset(...taskEntryP)
  await hold()

  // close response
  await clickOffset(...dvd([1509,435]))
  await hold()
}

/**
 * 1.pk
 * 2.treasure
 * 3.monster
 */

focus().then(() => {

  Promise.resolve()
  //  .then(() => littleThings0())
  //  .then(() => children())
  //  .then(() => pk())
  // .then(() => treasureAuto10())
  .then(() => xiulian())
})
