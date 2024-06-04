const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Function to get the URL for a specific date
function getUrlForDate(year, month, day) {
    return `https://www.divinumofficium.com/cgi-bin/horas/officium.pl?date=${year}-${month}-${day}`;
}

// Function to scrape the third reading for a specific date
async function scrapeThirdReadingForDate(year, month, day) {
    const url = getUrlForDate(year, month, day);
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Find the third reading
        let thirdReading = '';
        $('b:contains("Third Reading")').each((index, element) => {
            thirdReading = $(element).next('p').text().trim(); // Adjust selector based on actual HTML structure
        });

        return { date: `${year}-${month}-${day}`, reading: thirdReading };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return null;
    }
}

// Function to get all days in a year
function getAllDaysInYear(year) {
    const dates = [];
    for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push({ year, month: month.toString().padStart(2, '0'), day: day.toString().padStart(2, '0') });
        }
    }
    return dates;
}

// Main function to scrape third readings for all days in a year
async function scrapeAllThirdReadings(year) {
    const dates = getAllDaysInYear(year);
    const thirdReadings = [];

    for (const date of dates) {
        const readingData = await scrapeThirdReadingForDate(date.year, date.month, date.day);
        if (readingData) {
            thirdReadings.push(readingData);
            console.log(`Scraped: ${date.year}-${date.month}-${date.day}`);
        }
    }

    // Save the readings to a file
    fs.writeFileSync(`third_readings_${year}.json`, JSON.stringify(thirdReadings, null, 2));
    console.log(`Third readings for ${year} have been saved to third_readings_${year}.json`);
}

// Run the script for a specific year (e.g., 2024)
scrapeAllThirdReadings(2024);
