const
  ENV = require('./environment'),
  fs = require('fs'),
  express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  resources = require('./resources'),
  port = process.env.NODE_ENV == 'production' ? 80 : 9000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
resources.registerAll(app);

app.get('/', (req, res) => {
  res.send({
    users: `${ENV.APP.BASE_URL}/users{/id}`,
    status: `${ENV.APP.BASE_URL}/status`
  });
});

app.get('/status', (req, res) => {
  res.send({status: 'ok'});
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
  console.log('Press Ctrl+C to stop');
});
