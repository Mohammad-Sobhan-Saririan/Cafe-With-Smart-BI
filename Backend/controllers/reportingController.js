import { dbPromise } from '../db/db.js';
import { generateValidSqlQuery, generateChartConfig, refineChartConfig } from '../services/reportingAgent.js';

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
    // Now accepts either a natural language query OR a direct SQL query
    const { nl_query, sql_query } = req.body;

    if (!nl_query && !sql_query) {
        return res.status(400).json({ message: 'A query is required.' });
    }

    try {
        let finalSqlQuery = sql_query;

        // If no direct SQL is provided, use the AI agent to generate it
        if (!finalSqlQuery) {
            const schema = await getDatabaseSchema();
            finalSqlQuery = await generateValidSqlQuery(schema, nl_query);
        }

        // Execute the final query to get the results
        const { db } = await dbPromise;
        const results = await db.all(finalSqlQuery);

        // Send back the results and the SQL that was used
        res.status(200).json({ results, sqlQuery: finalSqlQuery });

    } catch (error) {
        res.status(500).json({ message: error.message || "An error occurred." });
    }
};

export const saveReport = async (req, res) => {
    // chart_config and conversation_history are now optional
    const { name, nl_query, sql_query, viz_type, chart_config, conversation_history } = req.body;
    const adminId = req.user.id;

    if (!name || !sql_query) {
        return res.status(400).json({ message: 'Report name and SQL query are required.' });
    }

    try {
        const { db, nanoid } = await dbPromise;
        await db.run(
            `INSERT INTO reports (id, adminId, name, nl_query, sql_query, viz_type, chart_config, conversation_history) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nanoid(),
                adminId,
                name,
                nl_query || null,
                sql_query,
                viz_type || 'table',
                chart_config ? JSON.stringify(chart_config) : null,
                conversation_history ? JSON.stringify(conversation_history) : null
            ]
        );
        res.status(201).json({ message: 'Report saved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getSavedReports = async (req, res) => {
    try {
        const { db } = await dbPromise;
        const reports = await db.all('SELECT * FROM reports WHERE adminId = ? ORDER BY createdAt DESC', [req.user.id]);
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteReport = async (req, res) => {
    const { id } = req.params;
    try {
        const { db } = await dbPromise;
        await db.run('DELETE FROM reports WHERE id = ? AND adminId = ?', [id, req.user.id]);
        res.status(200).json({ message: 'Report deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getChartConfigForData = async (req, res) => {
    // Get the new chartPrompt from the request body
    const { data, userQuery, chartPrompt } = req.body;
    try {
        const chartConfig = await generateChartConfig(data, userQuery, chartPrompt);
        res.status(200).json({ chartConfig });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const refineChart = async (req, res) => {
    const { data, oldConfig, chatHistory, userRequest } = req.body;
    try {
        const newConfig = await refineChartConfig(data, oldConfig, chatHistory, userRequest);
        res.status(200).json({ newConfig });
    } catch (error) { res.status(500).json({ message: error.message }); }
};