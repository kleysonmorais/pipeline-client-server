const express = require("express");
const cors = require("cors");

const server = express();
server.use(cors());
const port = 4200;

// create helper middleware so we can reuse server-sent events
const useServerSentEventsMiddleware = (req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  // only if you want anyone to access this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();

  const sendEventStreamData = (data) => {
    const sseFormattedResponse = `data: ${JSON.stringify(data)}\n\n`;
    res.write(sseFormattedResponse);
  };

  // we are attaching sendEventStreamData to res, so we can use it later
  Object.assign(res, {
    sendEventStreamData,
  });

  next();
};

async function startProccess(res, step, ml = 1000) {
  return new Promise((resolver) => {
    setTimeout(() => {
      const logger = `${new Date().toString()} - RUN STEP ${step}`;
      console.log(logger);
      const data = {
        logger,
        step,
      };
      res.sendEventStreamData(data);
      resolver(data);
    }, ml);
  });
}

const streamRandomNumbers = async (req, res) => {

  await startProccess(res, 1, 2000);
  await startProccess(res, 2, 1500);
  await startProccess(res, 3, 3000);
  await startProccess(res, 4, 500);
  await startProccess(res, 5, 4000);
  await startProccess(res, 6);
  await startProccess(res, -1);

  // close
  res.on("close", () => {
    res.end();
  });
};

server.get(
  "/stream-random-numbers",
  useServerSentEventsMiddleware,
  streamRandomNumbers
);

server.listen(port, () =>
  console.log(`Example app listening at 
    http://localhost:${port}`)
);
