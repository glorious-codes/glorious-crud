const express = require('express');
const GCrud = require('./');
const env = require('../environments/dev.json');

const app = express();
const gCrud = new GCrud(env.db.url, env.db.name, app);

const beersResource = gCrud.build('beers', {
  onPostSuccess: (req, res, result) => {
    res.status(201).send({
      message: 'Beer successfully saved!',
      id: result.body._id
    });
  }
});

app.listen(env.app.port, () => {
  console.log(`Running on port ${env.app.port}...`);
});
