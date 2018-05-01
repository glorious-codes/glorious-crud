# Glorious Crud

A bare minimum and extensible crud generator.

[![codecov](https://codecov.io/gh/rafaelcamargo/glorious-crud/branch/master/graph/badge.svg)](https://codecov.io/gh/rafaelcamargo/glorious-crud)
[![CircleCI](https://circleci.com/gh/rafaelcamargo/glorious-crud/tree/master.svg?style=svg)](https://circleci.com/gh/rafaelcamargo/glorious-crud/tree/master)

## Installation

```
npm i -S gcrud
```

## Usage

### Basic

The purpose of this lib is removing all the effort involved in crating a default crud as well as keeping everything under your control through its options.

``` javascript
const express = require('express');
const GCrud = require('./');

const app = express();
const gCrud = new GCrud('databaseUrl', 'databaseName', app);

// The line below will make the following endpoints available:
// GET    /beers
// GET    /beers/:id
// POST   /beers
// PUT    /beers/:id
// DELETE /beers/:id
const beersResource = gCrud.build('beers');

// From here, you can add any other custom endpoint you need.
beersResource.get('/beers/:id/awards', (req, res) => {
  // Your specific needs go here.
});

app.listen(9000, () => {
  console.log(`Running on port 9000...`);
});

```

### Options

Using options, you can override any method by doing as follows:

``` javascript
const options = {
  get: (req, res) => {
    // This implementation will override get method.
    // The same can be done for any other method:
    // post, put, delete.
  }
}

const beersResource = gCrud.build('beers', options);
```

You can also set listeners to be called on success or on error of some method:
``` javascript
const options = {
  // Executes after every successful get request
  onGetSuccess: (req, res, response) => {
    // response is an object containing "status" (200) and "body".
  },
  // Executes after every failed get request
  onGetError: (req, res, err) => {
    // err is an object containing "status" (4xx or 5xx) and "body".
  },
  // Executes after every successful post request
  onPostSuccess: (req, res, response) => {
    // response is an object containing "status" (201) and "body".
  },
  // Executes after every failed post request
  onPostError: (req, res) => {
    // err is an object containing "status" (4xx or 5xx) and "body".
  },
  // Executes after every successful put request
  onPutSuccess: (req, res, response) => {
    // response is an object containing "status" (204).
  },
  // Executes after every failed put request
  onPutError: (req, res) => {
    // err is an object containing "status" (4xx or 5xx) and "body".
  },
  // Executes after every successful delete request
  onDeleteSuccess: (req, res, response) => {
    // response is an object containing "status" (204).
  }
  // Executes after every failed delete request
  onDeleteError: (req, res) => {
    // err is an object containing "status" (4xx or 5xx) and "body".
  }
}

const beersResource = gCrud.build('beers', options);
```

## Contributing

1. Install [Node](https://nodejs.org/en/). Download the "Recommend for Most Users" version.

2. Clone the repo:
``` bash
git clone git@github.com:rafaelcamargo/glorious-crud.git
```

3. Go to the project directory
``` bash
cd glorious-crud
```

4. Install the project dependencies
``` bash
npm install
```

6. run:
``` bash
node src/app.js
```

The api will be running on `http://localhost:9000`.

## Database

1. Install MongoDB following its website [instructions](https://docs.mongodb.com/manual/administration/install-community/)

2. Create a database called `grud`

3. Create a collection called `beers`

4. Start mongo on the default port(27017) : `mongod`

## Tools

1. [Postman](https://www.getpostman.com/) is an awesome tool that makes API development a breeze.

2. [MongoDB Compass](https://www.mongodb.com/products/compass) is the prettiest MongoDB UI client I have ever seen.

## Deployment Services

The services I recommend to get your ideas out of your head are:

1. [WeDeploy](https://wedeploy.com/) (API)
  - 1 GB Transfer, 1 GB Memory, 1 CPU, 512 MB Storage for **$0/mo**
2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Database)
  - 512 MB Storage, 3 node replica set for **$0/mo**
