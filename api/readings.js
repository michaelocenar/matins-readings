const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

// Setup OpenAI API
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Mock readings data
const readings = [
    { id: 1, latin: 'Lectio 3: Gloria in excelsis Deo', officialTranslation: 'Glory to God in the highest' },
    { id: 2, latin: 'Pater noster', officialTranslation: 'Our Father' }
];

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        const translatedReadings = await Promise.all(readings.map(async (reading) => {
            const chatgptTranslation = await translateText(reading.latin);
            return { ...reading, chatgptTranslation };
        }));

        res.status(200).json(translatedReadings);
    } else {
        res.status(405).send('Method Not Allowed');
    }
};

// Function to translate text using ChatGPT
async function translateText(text) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Translate the following Latin text to English: "${text}"`,
        max_tokens: 1000
    });
    return response.data.choices[0].text.trim();
}
