const fs = require('fs'),
  express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  resources = require('./resources'),
  port = 9000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
resources.registerAll(app);

app.get('/status', (req, res) => {
  res.send({status: 'ok'});
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
  console.log('Press Ctrl+C to stop');
});
