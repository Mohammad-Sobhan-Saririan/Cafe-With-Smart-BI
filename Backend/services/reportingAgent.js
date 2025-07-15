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
- The Headers must translate to Persian.
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


export const generateChartConfig = async (data, userQuery, chartPrompt) => {
    const dataSample = JSON.stringify(data.slice(0, 5));

    let prompt = `
      Based on the user's original question ("${userQuery}") and this JSON data sample, suggest the best way to visualize it using Recharts.
      Data sample: ${dataSample}
    `;

    if (chartPrompt) {
        prompt += `\nThe user has specifically described the chart they want: "${chartPrompt}". Prioritize this description.`;
    }

    // --- THIS IS THE UPDATED INSTRUCTION FOR THE AI ---
    prompt += `
      Respond with ONLY a valid JSON object with the following structure. Do not add any explanation or markdown.
      {
        "chartType": "bar" | "line" | "pie",
        "xAxisKey": "the_key_for_the_category_axis_from_the_data",
        "dataKeys": ["key_for_the_first_numerical_value", "key_for_the_second_numerical_value"],
        "colors": ["#8884d8", "#82ca9d"]
      }
      IMPORTANT: For pie charts, the "xAxisKey" should be the column with the text labels/names, and the "dataKeys" array should contain a SINGLE string which is the name of the column with the numerical values.
    `;

    // The rest of the function (calling OpenRouter API) remains the same.
    // We'll use a mock response here for demonstration.
    let aiResponse = '';
    try {
        aiResponse = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: "user", content: prompt }
            ],
        });

    } catch (error) {
        console.error("Error generating chart config:", error);
        throw new Error("Failed to generate chart configuration.");
    }


    // const chartConfig = JSON.parse(aiResponse.data.choices[0].message.content);
    // return chartConfig;

    if (!aiResponse || !aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message || !aiResponse.choices[0].message.content) {
        throw new Error("AI response is invalid or incomplete.");
    }
    const chartConfig = JSON.parse(aiResponse.choices[0].message.content);
    // console.log("Generated chart config:", chartConfig);
    return chartConfig;
};
// --- NEW FUNCTION: To refine a chart based on conversation ---
export const refineChartConfig = async (data, oldConfig, chatHistory, userRequest) => {
    const prompt = `
          A user wants to change a Recharts chart.
          Original data: ${JSON.stringify(data.slice(0, 3))}
          Current chart config: ${JSON.stringify(oldConfig)}
          Conversation history: ${JSON.stringify(chatHistory)}
          User's new request: "${userRequest}"
  
          Your task is to return a new, updated JSON configuration object based on the user's request. Only return the JSON object.
      `;
    // ... (This would also call the OpenRouter API) ...

    // MOCK RESPONSE FOR DEMONSTRATION:
    const aiResponse = { ...oldConfig, colors: ['#22c55e', '#3b82f6'] }; // e.g., AI changed the colors
    //   console.log("AI refined chart config:", aiResponse);
    return aiResponse;
};