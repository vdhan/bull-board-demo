let express = require('express');
let bull = require('bull');
let redis = require('redis');
let {ExpressAdapter, createBullBoard, BullAdapter} = require('@bull-board/express');

const PATH = '/admin/queues';
const URL = 'redis://127.0.0.1:6379/0';
const PORT = 3000;

let serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(PATH);

let client = redis.createClient({url: URL});
client.connect().then(async () => {
  let items = [];
  let keys = await client.keys('*');
  for (let el of keys) {
    let item = el.split(':');
    if (!items.includes(item[1])) {
      items.push(item[1]);
    }
  }

  let queues = [];
  for (let el of items) {
    let item = new bull(el);
    queues.push(new BullAdapter(item));
  }

  createBullBoard({
    queues: queues,
    serverAdapter: serverAdapter
  });
});

let app = express();
app.use(PATH, serverAdapter.getRouter());
app.listen(PORT, () => {
  console.log(`For UI, open http://127.0.0.1:${PORT}${PATH}`);
});
