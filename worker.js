let intervalId = null;
let time = 0;

self.addEventListener("message", (e) => {
  switch (e.data.method) {
    case "start":
      time = e.data.time;
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
      self.postMessage({ time: time, timeup: true });
      return;
    }
    self.postMessage({ time: time, timeup: false });
  }
});
