# bookshelf-express-mw

[![NPM](https://nodei.co/npm/bookshelf-express-mw.png?compact=true)](https://nodei.co/npm/bookshelf-express-mw/)

A bookshelf middleware for express framework designed to work with ```routemap-express-mw```.

## Pagination

When querying large amounts of data, we might want to implement pagination in our response. We will showcase pagination with an example solution using routemap for relational databases.

### Installation

```
npm install logging-express-mw --save
npm install bookshelf-express-mw --save
npm install routemap-express-mw --save
```

### Bookshelf Configuration

Bookshelf needs a *configuration* object with following properties:
* client - database type, can be one of:
	* pg (Postgres)
	* mssql (MSSQL)
	* mysql/mysql2 (MySQL)
	* ariasql (MariaDB)
	* sqlite3 (SQLite3)
	* oracle/strong-oracle (Oracle)
* connection - database connection string with the following fields
  * host
  * user
  * password
  * database
* pool - can provide min and max pool size
  * min
  * max

For example our configuration object can be:

```
const config = {
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
  },
  pool: { min: 0, max: 7 }
}
```

### Express integration
In your server code, such as **app.js** add the following code:

```
const app = require('express')();
const logger = require('logging-express-mw');
const bookshelf = require('bookshelf-express-mw');
const routeMap = require('routemap-express-mw');

const config = {
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
  },
  pool: { min: 0, max: 7 }
}

// mw to add bookshelf to express
app.use(bookshelf.middleware(config));

// mw to add logging to express
app.use(logger.middleware());
// mw to write elegant apis
app.use(routeMap());
```
### Models

We have a *user* table in our relational database and made a corresponding bookshelf model.

```
// user.js in models folder
const bookshelf = require('bookshelf-express-mw');

module.exports = () => {
  bookshelf.bookshelf().Model.extend({
    tableName: 'user',
    hasTimestamps: true,
  });
};
```

### Controllers

We are going to make a user controller ***user.js***. Please refer to ```routemap-express-mw``` for more information on [***routemap***] (https://github.com/admurali/routemap-express-mw/)

```
const User = require('../models/user');
const _ = require('lodash');

const USERS_KEY = 'USERS';

function getUser(req, res) {
  req.routeMap.push(serializeUsers);
  req.routeMap.push(fetchUsers);
  req.routeMap.makeResponse(res);
}

module.exports = {
  getUser,
};
```

### Pagination Example

We can make a ***fetchUsers*** implementation as shown below:

```
function fetchUsers(req) {
  return new Promise((resolve, reject) => {
    User.query((qb) => {
      qb.where({
        is_deleted: 0,
      });
    }).fetchPage(
      _.extend({
        columns: [
          'id',
          'name',
          'is_deleted',
        ],
      }, req.routeMap.pageObject),
    ).then((users) => {
      req.routeMap.setPageResponseObject(
        users.pagination,
      );
      req.routeMap.addOrUpdateObject(
        USERS_KEY,
        users.toJSON(),
      );
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}
```

We used the following routemap properties:
* pageObject - for GET requests query by either
  * limit and offset

     --OR--

  * page and pageSize
* setPageResponseObject - sets the bookshelf object using pagination

We can then make a ***serializeUsers*** function as shown below:

```
function serializeUsers(req) {
  return new Promise((resolve, reject) => {
    try {
      const users = req.routeMap.getObject(
        USERS_KEY,
      );
      resolve(users.map(
        (user) => {
          const result = _.pick(user, [
            'id',
            'name',
          ]);
          return result;
        }));
    } catch (error) {
      reject(error);
    }
  });
}
```
