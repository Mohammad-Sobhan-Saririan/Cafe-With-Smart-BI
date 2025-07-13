import { dbPromise } from '../db/db.js';
import { generateValidSqlQuery } from '../services/reportingAgent.js';

// Helper function to get the schema of all relevant tables
const getDatabaseSchema = async () => {
    const { db } = await dbPromise;
    const tables = ['users', 'orders', 'products'];
    let schema = '';
    for (const table of tables) {
        const columns = await db.all(`PRAGMA table_info(${table})`);
        const rows = await db.all(`SELECT * FROM ${table} LIMIT 3`);
        schema += `TABLE: ${table}\nCOLUMNS: ${columns.map(c => `${c.name} ${c.type}`).join(', ')}\nROWS: ${JSON.stringify(rows, null, 2)}\n\n`;
    }
    return schema;
};

export const runReportQuery = async (req, res) => {
    const { query: userQuery } = req.body;
    if (!userQuery) {
        return res.status(400).json({ message: 'Report query is required.' });
    }

    try {
        // 1. Get the current database schema
        const schema = await getDatabaseSchema();

        // 2. Use the AI agent to generate a valid SQL query
        const sqlQuery = await generateValidSqlQuery(schema, userQuery);

        // 3. Execute the validated query to get the full result
        const { db } = await dbPromise;
        const results = await db.all(sqlQuery);

        // 4. Send the final data to the frontend
        res.status(200).json({ results });

    } catch (error) {
        res.status(500).json({ message: error.message || "An error occurred while generating the report." });
    }
};