# bookshelf-express-mw

A bookshelf middleware logger for express.

## Motivation

## Usage

Install `bookshelf-express-mw`.

```
npm install bookshelf-express-mw --save
```

Pass following environment variables:

```
client   : process.env.RDS_CLIENT, ['mysql', 'pg' ...]
host     : process.env.RDS_HOSTNAME,
user     : process.env.RDS_USERNAME,
password : process.env.RDS_PASSWORD,
port     : process.env.RDS_PORT,
database : process.env.RDS_DATABASE
```

#### Contributors: [Adithya Murali], [Sriram Rathinavelu]
