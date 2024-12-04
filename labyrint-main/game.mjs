import Labyrinth from "./labyrint.mjs";
import SplashScreen from "./splashScreen.mjs";
import ANSI from "./utils/ANSI.mjs";

const REFRESH_RATE = 100;
console.log(ANSI.RESET, ANSI.CLEAR_SCREEN, ANSI.HIDE_CURSOR);

let isBlocked = false;
let state = null;

function startGame() {
  state = new Labyrinth();
}

function init() {
  state = new SplashScreen();
  setTimeout(startGame, 2000);

  setInterval(update, REFRESH_RATE);
}

function update() {
  if (isBlocked) {
    return;
  }
  isBlocked = true;

  state.update();
  state.draw();

  isBlocked = false;
}

init();
