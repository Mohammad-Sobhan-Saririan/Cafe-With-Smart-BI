import OpenAI from 'openai';
import dotenv from 'dotenv';
import { dbPromise } from '../db/db.js';

dotenv.config();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Or your actual site
        "X-Title": process.env.YOUR_SITE_NAME || "Rasa Cafe",
    },
});

const AI_MODEL = "openai/o4-mini";
const MAX_RETRIES = 2;

/**
 * Main function to generate and validate an SQL query.
 * It uses a feedback loop to ask the AI to correct itself on error.
 * @param {string} schema - The database schema description.
 * @param {string} userQuery - The user's natural language question.
 * @returns {Promise<string>} - A validated, ready-to-run SQL query.
 */
export const generateValidSqlQuery = async (schema, userQuery) => {
    let lastError = null;
    let lastQuery = null;

    // console.log(`[INFO] Starting SQL query generation for user query: "${userQuery}"`);
    // console.log(`[INFO] Database schema provided:\n${schema}`);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        // console.log(`[INFO] Attempt ${attempt + 1} to generate SQL query.`);
        try {
            const prompt = createPrompt(schema, userQuery, lastQuery, lastError);
            // console.log(`[DEBUG] Generated prompt for AI:\n${prompt}`);

            const completion = await openai.chat.completions.create({
                model: AI_MODEL,
                messages: [
                    { role: "user", content: prompt }
                ],
            });

            const aiText = completion.choices[0].message.content;
            // console.log(`[DEBUG] AI response:\n${aiText}`);

            const sqlQuery = extractSqlFromString(aiText);
            lastQuery = sqlQuery;

            if (!sqlQuery) {
                throw new Error("AI did not return a valid SQL query.");
            }

            // console.log(`[INFO] Validating SQL query:\n${sqlQuery}`);
            const { db } = await dbPromise;
            await db.all(`${sqlQuery} LIMIT 1`);

            // console.log(`[SUCCESS] AI generated valid SQL on attempt ${attempt + 1}: ${sqlQuery}`);
            return sqlQuery;

        } catch (error) {
            console.error(`[ERROR] Attempt ${attempt + 1} failed. Error: ${error.message}`);
            lastError = error.message;
            if (attempt === MAX_RETRIES - 1) {
                console.error(`[ERROR] AI failed to generate a valid SQL query after ${MAX_RETRIES} attempts.`);
                throw new Error("AI failed to generate a valid SQL query after multiple attempts.");
            }
        }
    }

    throw new Error("Failed to generate SQL query.");
};

const createPrompt = (schema, userQuery, lastQuery, lastError) => {
    let prompt = `
You are an expert SQL analyst for an application called "${process.env.YOUR_SITE_NAME}".
Your task is to convert a user's question into a valid SQLite query.

The database schema is as follows:
---
${schema}
---

RULES:
- Only respond with the raw SQL query. Do not include any explanations or formatting.
- Use proper SQLite syntax. Assume today's date is ${new Date().toISOString().split('T')[0]}.

User's question: "${userQuery}"
  `.trim();

    if (lastQuery && lastError) {
        prompt += `

---
The previous query you generated failed.
Previous Query: \`${lastQuery}\`
Error Message: "${lastError}"
Please correct the SQL query.
`;
    }

    // console.log(`[DEBUG] Created prompt:\n${prompt}`);
    return prompt;
};

const extractSqlFromString = (text) => {
    const match = text.match(/```sql\n([\s\S]*?)\n```/);
    const extractedSql = match ? match[1].trim() : text.trim();
    // console.log(`[DEBUG] Extracted SQL query:\n${extractedSql}`);
    return extractedSql;
};
