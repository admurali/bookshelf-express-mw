var isKnexLoaded = false;
var isBookshelfLoaded = false;

function knexFactory (callback) {
  var _knex;
  if (!isKnexLoaded) {
    _knex = require('knex')({
        client: process.env.RDS_CLIENT,
        connection: {
            host     : process.env.RDS_HOSTNAME,
            user     : process.env.RDS_USERNAME,
            password : process.env.RDS_PASSWORD,
            port     : process.env.RDS_PORT,
            database : process.env.RDS_DATABASE
        },
        pool: {
          min: process.env.RDS_POOL_MIN || 0,
          max: process.env.RDS_POOL_MAX || 50
        },
        useNullAsDefault: true
    });
    isKnexLoaded = true;
  }
  callback(_knex);
}


function bookshelfFactory () {
  if (!isBookshelfLoaded) {
    knexFactory(function(knex) {
      _bookshelf = require('bookshelf')(knex)
        .plugin('pagination')
        .plugin('visibility');
    });
    isBookshelfLoaded = true;
  }
  return _bookshelf;
}

module.exports = {
  middleware: function() {
    return function (req, res, next) {
      req.bookshelf = bookshelfFactory();
      // support logging-express-mw if used
      if (req.logger) {
        req.logger.info('Obtained knex connection');
      } else {
        console.log('Obtained knex connection');
      }
      next();
    };
  },
  bookshelf: function() {
    return bookshelfFactory();
  }
};
