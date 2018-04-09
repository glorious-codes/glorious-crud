const $ = require('./providers/base');
const resources = require('./resources');
const _public = {};

_public.init = () => {
  const port = getPort();
  $.app.use($.cors());
  $.app.use($.bodyParser.json());
  resources.registerAll($.app);
  $.app.listen(port, () => {
    console.log(`Running on port ${port}...`);
  });
};

function getPort(){
  return process.env.NODE_ENV == 'production' ? 80 : 9000;
}

module.exports = _public;
