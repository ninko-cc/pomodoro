const TWENTY_FIVE_MIN = 25 * 60;
const FIVE_MIN = 5 * 60;

const displayEl = document.getElementById("display");
const startFiveButtonEl = document.getElementById("start-5-button");
const startTwentyFiveButtonEl = document.getElementById("start-25-button");
const pauseButtonEl = document.getElementById("pause-button");
const resumeButtonEl = document.getElementById("resume-button");
const notificationPermissionEl = document.getElementById("notification-permission");

const audioContext = new AudioContext();
const worker = new Worker("worker.js");

notificationPermissionEl.textContent = Notification.permission == "granted" ? "enabled" : "disabled";

worker.addEventListener("message", (e) => {
  display(e.data.time);
  if (e.data.timeup) timeup(e.data.initTime);
});

startFiveButtonEl.addEventListener("click", async function () {
  await start(FIVE_MIN);
  display(FIVE_MIN);
});

startTwentyFiveButtonEl.addEventListener("click", async function () {
  await start(TWENTY_FIVE_MIN);
  display(TWENTY_FIVE_MIN);
});

pauseButtonEl.addEventListener("click", function () {
  this.hidden = true;
  resumeButtonEl.hidden = false;
  worker.postMessage({ method: "pause" });
});

resumeButtonEl.addEventListener("click", function () {
  this.hidden = true;
  pauseButtonEl.hidden = false;
  worker.postMessage({ method: "resume" });
});

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  notificationPermissionEl.textContent = permission == "granted" ? "enabled" : "disabled";
  style();
}

async function start(time) {
  await requestNotificationPermission();
  startFiveButtonEl.hidden = true;
  startTwentyFiveButtonEl.hidden = true;
  pauseButtonEl.hidden = false;
  resumeButtonEl.hidden = true;
  worker.postMessage({ method: "start", time: time });
}

function beep(freq, start, duration) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const volume = 0.2; // from 0 to 1.0

  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.connect(gain);

  gain.gain.setValueAtTime(volume, audioContext.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + start + duration);
  gain.connect(audioContext.destination);

  osc.start(audioContext.currentTime + start);
  osc.stop(audioContext.currentTime + start + duration);
}

function display(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  const format = (number) => number.toString().padStart(2, "0");
  displayEl.textContent = `${format(min)}:${format(sec)}`;
}

function style() {
  notificationPermissionEl.textContent == "enabled"
    ? (notificationPermissionEl.style.color = "green")
    : (notificationPermissionEl.style.color = "darkred");
}

function timeup(initTime) {
  startFiveButtonEl.hidden = initTime == FIVE_MIN;
  startTwentyFiveButtonEl.hidden = initTime == TWENTY_FIVE_MIN;
  pauseButtonEl.hidden = true;
  resumeButtonEl.hidden = true;

  displayEl.textContent = "Keep it up!";

  beep(523, 0.0, 0.11);
  beep(659, 0.11, 0.11);
  beep(784, 0.22, 0.11);
  beep(1047, 0.33, 0.6);

  new Notification("Finish!");
}

document.addEventListener("DOMContentLoaded", () => {
  style();
});
