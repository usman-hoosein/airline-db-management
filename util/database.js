const { Pool } = require('pg')
const creds = require("../creds.json")

const pool = new Pool({
    host: creds.host,
    user: creds.username,
    password: creds.password,
    database: creds.database,
    port: 5432
})


pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

module.exports = pool
