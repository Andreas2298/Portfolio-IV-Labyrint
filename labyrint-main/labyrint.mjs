import ANSI from "./utils/ANSI.mjs";
import KeyBoardManager from "./utils/KeyBoardManager.mjs";
import { readMapFile, readRecordFile } from "./utils/fileHelpers.mjs";
import * as CONST from "./constants.mjs";

const levels = loadLevelListings();

function loadLevelListings(source = CONST.LEVEL_LISTING_FILE) {
  let data = readRecordFile(source);
  let levels = {};
  for (const item of data) {
    let keyValue = item.split(":");
    if (keyValue.length >= 2) {
      let key = keyValue[0];
      let value = keyValue[1];
      levels[key] = value;
    }
  }
  return levels;
}

let levelNumber = 2;
let loadedLevels = [];
loadedLevels.push(readMapFile(levels["start"]));
loadedLevels.push(readMapFile(levels["aSharpPlace"]));
loadedLevels.push(readMapFile(levels["map3"]));
let level = loadedLevels[levelNumber];

let pallet = {
  "█": ANSI.COLOR.LIGHT_GRAY,
  H: ANSI.COLOR.RED,
  $: ANSI.COLOR.YELLOW,
  B: ANSI.COLOR.GREEN,
};

let isDirty = true;
let playerPos = {
  row: null,
  col: null,
};

const EMPTY = " ";
const HERO = "H";
const LOOT = "$";
const TELE = "T";
const ENEMY = "X";
const POISON = "P";
const HEALTH = "+";

let smallRoom = false;

let direction = -1;

let items = [];

const THINGS = [LOOT, EMPTY, TELE, ENEMY, POISON, HEALTH];

let eventText = "";

const HP_MAX = 10;
const playerStats = {
  hp: 8,
  chash: 0,
};

class Labyrinth {
  update() {
    if (playerPos.row == null) {
      for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
          if (level[row][col] == HERO) {
            playerPos.row = row;
            playerPos.col = col;
            break;
          }
        }
        if (playerPos.row != undefined) {
          break;
        }
      }
    }

    let drow = 0;
    let dcol = 0;

    if (KeyBoardManager.isUpPressed()) {
      drow = -1;
    } else if (KeyBoardManager.isDownPressed()) {
      drow = 1;
    }

    if (KeyBoardManager.isLeftPressed()) {
      dcol = -1;
    } else if (KeyBoardManager.isRightPressed()) {
      dcol = 1;
    }

    let tRow = playerPos.row + 1 * drow;
    let tcol = playerPos.col + 1 * dcol;

    if (levelNumber == 0 && tcol >= level[tRow].length) {
      levelNumber += 1;
      level = loadedLevels[levelNumber];
      playerPos.col = 0;
      isDirty = true;
    } else if (levelNumber == 1 && tcol < 0) {
      levelNumber -= 1;
      level = loadedLevels[levelNumber];
      playerPos.col = level[tRow].length - 1;
      isDirty = true;
    } else if (levelNumber == 1 && tRow >= 16) {
      levelNumber += 1;
      level = loadedLevels[levelNumber];
      playerPos.row = 0;
      isDirty = true;
    } else if (levelNumber == 2 && tRow < 0) {
      levelNumber -= 1;
      level = loadedLevels[levelNumber];
      playerPos.row = 15;
      isDirty = true;
    } else if (THINGS.includes(level[tRow][tcol])) {
      let currentItem = level[tRow][tcol];
      if (currentItem == LOOT) {
        let loot = Math.round(Math.random() * 7) + 3;
        playerStats.chash += loot;
        eventText = `Player gained ${loot}$`;
      } else if (currentItem == POISON) {
        eventText = `You got poisoned`;
        playerStats.hp -= 3;
      } else if (currentItem == HEALTH) {
        eventText = `You gained health`;
        playerStats.hp = HP_MAX;
      } else if (currentItem == ENEMY) {
        eventText = `You got hurt`;
        playerStats.hp -= 1;
      } else if (currentItem == TELE) {
        if (smallRoom == false) {
          eventText = `Teleporting in to small room`;
          tcol = 17;
          tRow = 13;
          smallRoom = true;
        } else if (smallRoom == true) {
          eventText = `Teleporting back`;
          tcol = 3;
          tRow = 10;
          smallRoom = false;
        }
      }

      level[playerPos.row][playerPos.col] = EMPTY;
      level[tRow][tcol] = HERO;

      playerPos.row = tRow;
      playerPos.col = tcol;

      isDirty = true;
    } else {
      direction *= -1;
    }
  }

  draw() {
    if (isDirty == false) {
      return;
    }
    isDirty = false;

    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);

    let rendring = "";

    rendring += renderHud();

    for (let row = 0; row < level.length; row++) {
      let rowRendering = "";
      for (let col = 0; col < level[row].length; col++) {
        let symbol = level[row][col];
        if (pallet[symbol] != undefined) {
          rowRendering += pallet[symbol] + symbol + ANSI.COLOR_RESET;
        } else {
          rowRendering += symbol;
        }
      }
      rowRendering += "\n";
      rendring += rowRendering;
    }

    console.log(rendring);
    if (eventText != "") {
      console.log(eventText);
      eventText = "";
    }
  }
}

function renderHud() {
  let hpBar = `Life:[${
    ANSI.COLOR.RED + pad(playerStats.hp, "♥︎") + ANSI.COLOR_RESET
  }${
    ANSI.COLOR.LIGHT_GRAY +
    pad(HP_MAX - playerStats.hp, "♥︎") +
    ANSI.COLOR_RESET
  }]`;
  let cash = `$:${playerStats.chash}`;
  return `${hpBar} ${cash}\n`;
}

function pad(len, text) {
  let output = "";
  for (let i = 0; i < len; i++) {
    output += text;
  }
  return output;
}

export default Labyrinth;
