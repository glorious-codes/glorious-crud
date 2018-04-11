# NEM API Rise

Simple API implemented with NodeJS, Express and MongoDB.

[![codecov](https://codecov.io/gh/rafaelcamargo/nem-api-rise/branch/master/graph/badge.svg)](https://codecov.io/gh/rafaelcamargo/nem-api-rise) [![CircleCI](https://circleci.com/gh/rafaelcamargo/nem-api-rise.svg?style=svg)](https://circleci.com/gh/rafaelcamargo/nem-api-rise)

## Contributing

1. Install [Node](https://nodejs.org/en/). Download the "Recommend for Most Users" version.

2. Clone the repo:
``` bash
git clone git@github.com:rafaelcamargo/nem-api-rise.git
```

3. Go to the project directory
``` bash
cd nem-api-rise
```

4. Install the project dependencies
``` bash
npm install
```

6. run:
``` bash
node src/index.js
```

The api will be running on `http://localhost:9000`.

## Database

1. Install MongoDB following its website [instructions](https://docs.mongodb.com/manual/administration/install-community/)

2. Create a database called `nem-api-rise`

3. Create a collection called `users`

4. Start mongo on the default port(27017) : `mongod`

## Resources

The API has an implemented resource called `users`.

**Note:** Although the resource is called users, no authentication is still provided.

| Method | URI | Body | Response |
|--------|-----|------|----------|
| GET | /users | - | Array |
| GET | /users/:id | - | Object |
| POST | /users | { "name": "Rafael" } | Object |
| PUT | /users/:id | { "name": "Rafael" } | Object |
| DELETE | /users/:id | - | Object |

You can see those endpoints in action through the url:
https://api-nemrise.wedeploy.io/

To add some new resource to the API:

1. Create a directory in `src/resources` (e.g. messages)

2. Build the default endpoints (GET/POST/PUT/DELETE) to the new resource as follows:

``` javascript
const resourceBuilder = require('../builder/builder');
const RESOURCE = 'messages';

const _public = {};

_public.buildEndpoints = app => {
  /* The following line will generate the following endpoints:
  ** GET    /messages
  ** GET    /messages/:id
  ** POST   /messages
  ** PUT    /messages/:id
  ** DELETE /messages/:id
  */
  const resource = resourceBuilder.build(app, RESOURCE);
  /* From here, you can add any other custom endpoint you need.
  ** resource.get('/messages/sent', (req, res) => {
  **   ...
  ** });
  */
};

module.exports = _public;
```

3. Write the appropriate unit tests for that.

4. Done!

## Deployment

The services I recommend to get your ideas out of your head are:

1. [WeDeploy](https://wedeploy.com/) (API)
  - 1 GB Transfer, 1 GB Memory, 1 CPU, 512 MB Storage for **$0/mo**
2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Database)
  - 512 MB Storage, 3 node replica set for **$0/mo**

## Tips

1. [Postman](https://www.getpostman.com/) is an awesome tool that makes API development a breeze.

2. [MongoDB Compass](https://www.mongodb.com/products/compass) is the prettiest MongoDB UI client I have ever seen.
