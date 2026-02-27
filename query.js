const pool = require('./config/db.js');

const sql = process.argv[2];

if (!sql) {
    console.log('❌ Please provide a SQL query in quotes.');
    console.log('Example: node query.js "SELECT * FROM Contact"');
    process.exit(1);
}

async function run() {
    try {
        const [rows] = await pool.query(sql);
        console.log('🔍 Result:');
        console.table(rows);
    } catch (err) {
        console.error('❌ SQL Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();
