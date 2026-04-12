const displayEl = document.getElementById("display");
const startFiveButtonEl = document.getElementById("start-5-button");
const startTwentyFiveButtonEl = document.getElementById("start-25-button");
const pauseButtonEl = document.getElementById("pause-button");
const resumeButtonEl = document.getElementById("resume-button");
const notificationPermissionEl = document.getElementById("notification-permission");
const audioContext = new AudioContext();

let time = 0;
let intervalId = null;

notificationPermissionEl.textContent = Notification.permission == "granted" ? "enabled" : "disabled";

startFiveButtonEl.addEventListener("click", async function () {
  time = 5 * 60;
  display();
  await requestNotificationPermission();
  start();
});

startTwentyFiveButtonEl.addEventListener("click", async function () {
  time = 25 * 60;
  display();
  await requestNotificationPermission();
  start();
});

pauseButtonEl.addEventListener("click", function () {
  this.hidden = true;
  resumeButtonEl.hidden = false;
  clearInterval(intervalId);
});

resumeButtonEl.addEventListener("click", function () {
  this.hidden = true;
  pauseButtonEl.hidden = false;
  start();
});

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  notificationPermissionEl.textContent = permission == "granted" ? "enabled" : "disabled";
}

function start() {
  intervalId = setInterval(tick, 1000);
  startFiveButtonEl.hidden = true;
  startTwentyFiveButtonEl.hidden = true;
  pauseButtonEl.hidden = false;
  resumeButtonEl.hidden = true;
}

function tick() {
  --time;
  display();
  if (time == 0) window.dispatchEvent(new CustomEvent("timeup"));
}

function display() {
  const min = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  displayEl.textContent = `${min}:${sec}`;
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

window.addEventListener("timeup", function () {
  clearInterval(intervalId);

  startFiveButtonEl.hidden = false;
  startTwentyFiveButtonEl.hidden = false;
  pauseButtonEl.hidden = true;
  resumeButtonEl.hidden = true;

  beep(523, 0.0, 0.12);
  beep(659, 0.12, 0.12);
  beep(784, 0.24, 0.12);
  beep(1047, 0.36, 0.6);

  new Notification("Finish!");
});
