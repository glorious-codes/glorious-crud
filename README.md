# Mongo API test

Simple API implementing some users CRUD with MongoDB

## Contributing

1. Install [Node](https://nodejs.org/en/). Download the "Recommend for Most Users" version.

2. Clone the repo:
``` bash
git clone git@github.com:rafaelcamargo/mongo-api-test.git
```

3. Go to the project directory
``` bash
cd mongo-api-test
```

4. Install the project dependencies
``` bash
npm install
```

6. run:
``` bash
npm run start
```

The api will be running on `http://localhost:9000`.

## Database

1. Install MongoDB following its website [instructions](https://docs.mongodb.com/manual/administration/install-community/)

2. Create a database called `mongo-api-test`

3. Create a collection called `users`

4. Start mongo on the default port(27017) : `mongod`

## CRUD

| Method | Url | Body | Response |
|--------|-----|------|----------|
| GET | http://localhost:9000/users | - | Array |
| GET | http://localhost:9000/users/:id | - | Object |
| POST | http://localhost:9000/users | { "name": "Rafael" } | Object |
| PUT | http://localhost:9000/users/:id | { "name": "Rafael" } | Object |
| DELETE | http://localhost:9000/users/:id | - | Object |
