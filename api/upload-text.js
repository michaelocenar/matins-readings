const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        const chatgptTranslation = await translateText(text);
        const response = {
            latin: text,
            officialTranslation: 'Custom text, no official translation',
            chatgptTranslation
        };
        res.status(200).json(response);
    } else {
        res.status(405).send('Method Not Allowed');
    }
};

async function translateText(text) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Translate the following Latin text to English: "${text}"`,
        max_tokens: 1000
    });
    return response.data.choices[0].text.trim();
}
