let intervalId = null;
let initTime = 0;
let time = 0;

self.addEventListener("message", (e) => {
  switch (e.data.method) {
    case "start":
      time = initTime = e.data.time;
      intervalId = setInterval(tick, 1000);
      break;
    case "pause":
      clearInterval(intervalId);
      break;
    case "resume":
      intervalId = setInterval(tick, 1000);
      break;
  }

  function tick() {
    if (--time == 0) {
      clearInterval(intervalId);
      self.postMessage({ time, initTime: initTime, timeup: true });
      return;
    }
    self.postMessage({ time, initTime, timeup: false });
  }
});
