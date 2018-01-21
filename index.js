var isKnexLoaded = false;
var isBookshelfLoaded = false;

function knexFactory (config, callback) {
  var _knex;
  if (!isKnexLoaded) {
    _knex = require('knex')({
        client: config.client,
        connection: config.connection,,
        pool: {
          min: (config.pool && config.pool.min) || 0,
          max: (config.pool && config.pool.max) || 50
        },
        useNullAsDefault: true
    });
    isKnexLoaded = true;
  }
  callback(_knex);
}


function bookshelfFactory (config) {
  if (!isBookshelfLoaded) {
    knexFactory(config, function(knex) {
      _bookshelf = require('bookshelf')(knex)
        .plugin('pagination')
        .plugin('visibility');
    });
    isBookshelfLoaded = true;
  }
  return _bookshelf;
}

module.exports = {
  middleware: function(config) {
    return function (req, res, next) {
      req.bookshelf = bookshelfFactory(config);
      // support logging-express-mw if used
      if (req.logger) {
        req.logger.info('Obtained knex connection');
      } else {
        console.log('Obtained knex connection');
      }
      next();
    };
  },
  bookshelf: function(config) {
    return bookshelfFactory(config);
  }
};
