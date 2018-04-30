const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const GCrud = require('./');
const envProd = require('../environments/prod.json');
const envDev = require('../environments/dev.json');
const env = process.env.NODE_ENV == 'production' ? envProd : envDev;

const app = express();
const gCrud = new GCrud(env.db.url, env.db.name, app);

app.use(cors());
app.use(bodyParser.json());

const usersResource = gCrud.build('users');

const beersResource = gCrud.build('beers', {
  onPostSuccess: (req, res, result) => {
    res.send({
      message: 'Beer successfully saved!',
      user: result
    });
  }
});

app.listen(env.app.port, () => {
  console.log(`Running on port ${env.app.port}...`);
});
