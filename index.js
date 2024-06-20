const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const url = 'http://yourwebsite.com/officium.pl';
var data,payload;

// Function to get the URL for a specific date
function getpayloadForDate(year, month, day) {
    data={
        command: 'prayMatutinum',
        date: '1-4-2025',
        date1: '1-4-2025',
        searchvalue: '0',
        officium: 'officium.pl',
        browsertime: '6-20-2024',
        version: 'Rubrics 1960 - 1960',
        version2: '',
        caller: '0',
        compare: '',
        notes: '',
        plures: '',
        expand: 'all',
        lang2: 'English',
        votive: 'Hodie',
        expandnum: '',
        popup: '0',
        popuplang: ''
    };
    return `https://www.divinumofficium.com/cgi-bin/horas/officium.pl?date=${year}-${month}-${day}`;
}

// Function to scrape the third reading for a specific date
async function scrapeThirdReadingForDate(year, month, day) {
    const url = getUrlForDate(year, month, day);
    try {
        const response = await axios.get(url);
        console.log(response);
        const html = response.data;
        console.log(html);
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
    for (let month = 2; month <= 2; month++) { ///edit month to 12 later
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
