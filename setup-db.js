const pool = require('./config/db.js');

async function setup() {
    try {
        console.log('⏳ Creating Contact table on Aiven MySQL...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS Contact (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phoneNumber VARCHAR(20),
                email VARCHAR(255),
                linkedId INT NULL,
                linkPrecedence ENUM('primary', 'secondary') NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deletedAt TIMESTAMP NULL
            );
        `;

        await pool.query(createTableQuery);
        console.log('✅ Table "Contact" created successfully!');

        // Show tables to verify
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Current Tables:', rows);

    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await pool.end();
    }
}

setup();
