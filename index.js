const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.divinumofficium.com/cgi-bin/horas/officium.pl';

async function scrapeThirdReadings() {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        
        let thirdReadings = [];

        // Assuming the third reading can be identified with a specific CSS selector or text pattern
        $('b:contains("Third Reading")').each((index, element) => {
            let reading = $(element).next('p').text(); // Adjust the selector based on the actual structure
            thirdReadings.push(reading.trim());
        });

        // Save the readings to a file
        fs.writeFileSync('third_readings.json', JSON.stringify(thirdReadings, null, 2));
        console.log('Third readings have been saved to third_readings.json');
    } catch (error) {
        console.error('Error while scraping:', error);
    }
}

scrapeThirdReadings();
