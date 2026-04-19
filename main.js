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

document.addEventListener("DOMContentLoaded", () => {
  renderNotificationPermission();
});

worker.addEventListener("message", (e) => {
  displayTime(e.data.time);
  if (e.data.timeup) timeup(e.data.initTime);
});

startFiveButtonEl.addEventListener("click", async function () {
  await start(FIVE_MIN);
  displayTime(FIVE_MIN);
});

startTwentyFiveButtonEl.addEventListener("click", async function () {
  await start(TWENTY_FIVE_MIN);
  displayTime(TWENTY_FIVE_MIN);
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

function renderNotificationPermission() {
  if (Notification.permission == "granted") {
    notificationPermissionEl.textContent = "enabled";
    notificationPermissionEl.style.color = "green";
  } else {
    notificationPermissionEl.textContent = "disabled";
    notificationPermissionEl.style.color = "darkred";
  }
}

async function start(time) {
  await Notification.requestPermission();
  renderNotificationPermission();

  startFiveButtonEl.hidden = true;
  startTwentyFiveButtonEl.hidden = true;
  pauseButtonEl.hidden = false;
  resumeButtonEl.hidden = true;

  worker.postMessage({ method: "start", time: time });
}

function timeup(initTime) {
  startFiveButtonEl.hidden = startTwentyFiveButtonEl.hidden = false;
  startFiveButtonEl.disabled = initTime == FIVE_MIN;
  startTwentyFiveButtonEl.disabled = initTime == TWENTY_FIVE_MIN;
  pauseButtonEl.hidden = true;
  resumeButtonEl.hidden = true;

  displayEl.textContent = "Keep it up!";

  beep(523, 0.0, 0.11);
  beep(659, 0.11, 0.11);
  beep(784, 0.22, 0.11);
  beep(1047, 0.33, 0.6);

  new Notification("Finish!");
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

function displayTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  const format = (number) => number.toString().padStart(2, "0");
  displayEl.textContent = `${format(min)}:${format(sec)}`;
}
