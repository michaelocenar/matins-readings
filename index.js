const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const qs = require('qs');
const { getSystemErrorMap } = require('util');
const url = 'https://www.divinumofficium.com/cgi-bin/horas/officium.pl';
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
};
const startMarker = "Lectio 3";


// Function to get the URL for a specific date
function getPayloadForDate(year, month, day) {
    let data = {
        command: 'prayMatutinum',
        date: `${month}-${day}-${year}`,
        date1: `${month}-${day}-${year}`,
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
        popuplang: '',
        setup: "general;;;$expand='all';;$version='Rubrics 1960 - 1960';;$lang2='English';;$votive='Hodie';;;generalc;;;$expand='all';;$version='Divino Afflatu';;$version2='Rubrics 1960 - 1960';;$langc='Latin';;$accented='plain';;;generalccheck;;;ooooo;;;generalcheck;;;oooo;;;parameters;;;$priest='1';;$building='';;$lang1='Latin';;$psalmvar='';;$whitebground='1';;$blackfont='';;$smallblack='-1';;$redfont=' italic red';;$initiale='+2 bold italic red';;$largefont='+1 bold italic red';;$smallfont='1 red';;$titlefont='+1 red';;$screenheight='1024';;$textwidth='100';;$oldhymns='';;$nonumbers='';;$nofancychars='';;;parameterscheck;;;bbtbbbtcccccnnbbb;;;"
    };
    return qs.stringify(data);
}

// Function to scrape the third reading for a specific date
async function scrapeThirdReadingForDate(year, month, day) {
    const payload = getPayloadForDate(year, month, day);
    try {
        const response = await axios.post(url, payload, { headers });

        // Check if the request was successful
        if (response.status === 200) {
            // Get the HTML content
            const htmlContent = response.data;
            const $ = cheerio.load(htmlContent);
            const lectio3 = $("body > form > table > tbody > tr >td").each((i,e) =>
                {
                    //console.log(e.text );
                })

            const title= $("body > form > p:nth-child(1) > font").each((i,e) => 
                {

                })
           
            let SaintTitle=title.text().trim();
            let thirdReading = lectio3.text().trim();
            thirdReading= getLectio3(thirdReading);
            let englishThirdReading=getReading3(thirdReading);
            if (!checkTitle(SaintTitle))
                {
                    //console.log(date);
                    return null;
                }
            return {thirdReading,englishThirdReading};
        } else {
            console.log(`Failed to fetch for ${year}-${month}-${day}: Status code ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Error scraping for ${year}-${month}-${day}:`, error);
        return null;
    }
}

// Function to get all days in a year
function getAllDaysInYear(year) {
    const dates = [];
    for (let month = 1; month <= 1; month++) {
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
            thirdReadings.push({ date: `${date.year}-${date.month}-${date.day}`, reading: readingData });
            console.log(`Scraped: ${date.year}-${date.month}-${date.day}`);
        }
    }

    // Save the readings to a file
    fs.writeFileSync(`third_readings_${year}.json`, JSON.stringify(thirdReadings, null, 2));
    console.log(`Third readings for ${year} have been saved to third_readings_${year}.json`);
}
function getLectio3(text)
{
    const bibleVerse = /\b\d+:\d+(-\d+)?\b/g;
    const begin="Lectio 3";
    let startIndex=text.indexOf(begin);
    let cutText=text.substring(startIndex)
    let match=cutText.match(/℟\..*$/m);
   // console.log(match[0]);
    endindex=cutText.indexOf(match[0])+ (match[0].length);
    //let secondCut=cutText.substring(0,secondIndex);
    cutText=cutText.substring(0,endindex)
    let match2=cutText.match(bibleVerse);
    if(match2)
        {
            return null;
        }
    return cutText;
}
function checkTitle(text)
{
    let text2=text;
    const regex = /(Ss\.|S\.|SS\.)/g;
    let matches=text2.match(regex);
    //console.log(matches);
    if (matches)
        {
            return true;
        }
    return false;
}
// Run the script for a specific year (e.g., 2024)
function getReading3(text)
{
    const bibleVerse = /\b\d+:\d+(-\d+)?\b/g;
    const begin="Reading 3";
    let startIndex=text.indexOf(begin);
    let cutText=text.substring(startIndex)
    let match=cutText.match(/℟\..*$/m);
   // console.log(match[0]);
    endindex=cutText.indexOf(match[0])+ (match[0].length);
    //let secondCut=cutText.substring(0,secondIndex);
    cutText=cutText.substring(0,endindex)
    let match2=cutText.match(bibleVerse);
    if(match2)
        {
            return null;
        }
    return cutText;
}
scrapeAllThirdReadings(2024);
