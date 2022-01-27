const { Pool } = require('pg')
const creds = require("../creds.json")

const pool = new Pool({
    host: '3380db.cs.uh.edu',
    user: creds.username,
    password: creds.password,
    database: 'COSC3380',
    port: 5432
})


pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

module.exports = pool

//Exporting "promise()" allows you to work on data without callback functions
//  but instead through ".then()" and ".catch()" statements for cleaner code;
//  "promise()" returns an object
// module.exports = pool.promise()
