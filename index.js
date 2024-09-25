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

// List of specific dates and their associated saints/feasts
const specialDays = [
    { month: '01', day: '04', saint: 'St. Elisabeth Ann Seton' },
    { month: '01', day: '05', saint: 'St. John Neumann' },
    { month: '01', day: '11', saint: 'St. Hyginus' },
    { month: '01', day: '15', saint: 'St. Maurus' },
    { month: '01', day: '18', saint: 'St. Prisca' },
    { month: '01', day: '19', saint: 'Ss. Marius, Martha, Audifax and Abachum' },
    { month: '01', day: '19', saint: 'St. Canute' },
    { month: '01', day: '23', saint: 'St. Emerentiana' },
    { month: '02', day: '03', saint: 'St. Blaise' },
    { month: '02', day: '04', saint: 'St. Andrew Corsini' },
    { month: '02', day: '06', saint: 'St. Dorothy' },
    { month: '02', day: '09', saint: 'St. Apollonia' },
    { month: '02', day: '11', saint: 'Apparition of BVM Immaculate' },
    { month: '02', day: '15', saint: 'Ss. Faustinus and Jovita' },
    { month: '02', day: '23', saint: 'St. Peter Damian' },
    { month: '02', day: '27', saint: 'St. Gabriel of the Most Sorrowful Virgin' },
    { month: '02', day: '28', saint: 'St. Gabriel of Our Lady of Sorrows' },
    { month: '03', day: '04', saint: 'St. Casimir' },
    { month: '03', day: '06', saint: 'Sts. Perpetua and Felicitas' },
    { month: '03', day: '07', saint: 'St. Thomas Aquinas' },
    { month: '03', day: '08', saint: 'St. John of God' },
    { month: '03', day: '09', saint: 'St. Frances of Rome' },
    { month: '03', day: '12', saint: 'St. Gregory, Pope and Doctor' },
    { month: '03', day: '18', saint: 'St. Cyril of Jerusalem' },
    { month: '03', day: '21', saint: 'St. Benedict' },
    { month: '04', day: '02', saint: 'St. Francis of Paula' },
    { month: '04', day: '04', saint: 'St. Isidore' },
    { month: '04', day: '05', saint: 'St. Vincent Ferrer' },
    { month: '04', day: '14', saint: 'St. Justin' },
    { month: '04', day: '17', saint: 'St. Anicetus' },
    { month: '04', day: '21', saint: 'St. Anselm' },
    { month: '04', day: '23', saint: 'St. George' },
    { month: '04', day: '28', saint: 'St. Paul of the Cross' },
    { month: '05', day: '03', saint: 'Ss. Alexander and Companions' },
    { month: '05', day: '05', saint: 'St. Pius V' },
    { month: '05', day: '09', saint: 'St. Gregory Nazianzen' },
    { month: '05', day: '10', saint: 'Ss. Gordian and Epimachus' },
    { month: '05', day: '12', saint: 'Ss. Nereus, Achilleus, Domitilla, Pancras' },
    { month: '05', day: '14', saint: 'St. Boniface' },
    { month: '05', day: '18', saint: 'St. Venantius' },
    { month: '05', day: '19', saint: 'St. Peter Celestine' },
    { month: '05', day: '20', saint: 'St. Bernardine of Siena' },
    { month: '05', day: '25', saint: 'St. Gregory VII' },
    { month: '05', day: '26', saint: 'St. Philip Neri' },
    { month: '05', day: '27', saint: 'St. John I' },
    { month: '05', day: '31', saint: 'St. Petronilla' },
    { month: '06', day: '12', saint: 'Ss. Basilidus, Cyrinus, Naborus, and Nazarius' },
    { month: '06', day: '15', saint: 'Ss. Vitus and Companions' },
    { month: '06', day: '18', saint: 'Ss. Marcus and Marcellianus' },
    { month: '06', day: '19', saint: 'Ss. Gervasius and Protasius' },
    { month: '06', day: '20', saint: 'St. Silverius' },
    { month: '06', day: '27', saint: 'Our Lady of Perpetual Help' },
    { month: '07', day: '02', saint: 'Ss. Processus and Martinianus' },
    { month: '07', day: '04', saint: 'Commemoration of All Holy Popes' },
    { month: '07', day: '06', saint: 'St. Maria Goretti' },
    { month: '07', day: '07', saint: 'Sts. Cyril and Methodius' },
    { month: '07', day: '11', saint: 'St. Pius I' },
    { month: '07', day: '14', saint: 'St. Bonaventure' },
    { month: '07', day: '18', saint: 'St. Symphorosa and her Seven Sons' },
    { month: '07', day: '20', saint: 'St. Margaret' },
    { month: '07', day: '21', saint: 'St. Lawrence of Brindisi' },
    { month: '07', day: '23', saint: 'St. Liborius' },
    { month: '07', day: '24', saint: 'St. Christina' },
    { month: '07', day: '25', saint: 'St. Christopher' },
    { month: '07', day: '27', saint: 'St. Pantaleon' },
    { month: '07', day: '28', saint: 'St. Nazarius and Celsus' },
    { month: '07', day: '29', saint: 'Ss. Felix, Simplicius, Faustinus, and Beatrice' },
    { month: '07', day: '30', saint: 'St. Abdon and Sennen' },
    { month: '08', day: '01', saint: 'Holy Maccabees, Martyrs' },
    { month: '08', day: '01', saint: 'St. Peter in Chains' },
    { month: '08', day: '02', saint: 'St. Stephen I' },
    { month: '08', day: '03', saint: 'Finding of the Body of St. Stephen' },
    { month: '08', day: '04', saint: 'St. Dominic' },
    { month: '08', day: '05', saint: 'Dedication of Church of Our Lady of the Snow' },
    { month: '08', day: '06', saint: 'Ss. Sixtus II, Pope, and Felicissimus and Agapitus' },
    { month: '09', day: '09', saint: 'St. Peter Claver (USA)' },
    { month: '09', day: '18', saint: 'St. Joseph Cupertino' },
    { month: '09', day: '22', saint: 'St. Thomas of Villanova' },
    { month: '09', day: '26', saint: 'Ss. Isaac Jogues, John de Brebeuf, Companions (USA + Canada)' },
    { month: '10', day: '06', saint: 'St. Bruno' },
    { month: '10', day: '13', saint: 'St. Edward' },
    { month: '10', day: '20', saint: 'St. John Cantius' },
    { month: '10', day: '25', saint: 'St. Isidore (USA), Ss. Chrysanthi et Dariæ Martyrum' },
    { month: '11', day: '17', saint: 'St. Gregory Thaumaturgus' },
    { month: '11', day: '24', saint: 'St. John of the Cross' }
];

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
            const htmlContent = response.data;
            const $ = cheerio.load(htmlContent);
            const lectio3 = $("body > form > table > tbody > tr >td").text().trim();
            const title = $("body > form > p:nth-child(1) > font").text().trim();

            let thirdReadingLatin = getLectio3(lectio3);
            let englishThirdReading = getReading3(lectio3);
            if (!checkTitle(title)) {
                return null;
            }
            return { thirdReadingLatin, englishThirdReading };
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
    const dynamicDates = getAllDaysInYear(year);

    // Combine dynamic dates with the hardcoded specialDays
    const combinedDates = [
        ...dynamicDates, 
        ...specialDays.map(({ month, day }) => ({ year, month, day }))
    ];

    // Remove duplicate dates
    const uniqueDates = combinedDates.reduce((acc, current) => {
        const x = acc.find(date => date.month === current.month && date.day === current.day);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    const thirdReadings = [];
    for (const date of uniqueDates) {
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

function getLectio3(text) {
    const bibleVerse = /\b\d+:\d+(-\d+)?\b/g;
    const begin = "Lectio 3";
    let startIndex = text.indexOf(begin);
    let cutText = text.substring(startIndex);
    let match = cutText.match(/℟\..*$/m);
    let endindex = cutText.indexOf(match[0]) + match[0].length;
    cutText = cutText.substring(0, endindex);
    let match2 = cutText.match(bibleVerse);
    if (match2) {
        return null;
    }
    return cutText;
}

function checkTitle(text) {
    const regex = /(Ss\.|S\.|SS\.)/g;
    let matches = text.match(regex);
    if (matches) {
        return true;
    }
    return false;
}

function getReading3(text) {
    const bibleVerse = /\b\d+:\d+(-\d+)?\b/g;
    const begin = "Reading 3";
    let startIndex = text.indexOf(begin);
    let cutText = text.substring(startIndex);
    let match = cutText.match(/℟\..*$/m);
    let endindex = cutText.indexOf(match[0]) + match[0].length;
    cutText = cutText.substring(0, endindex);
    let match2 = cutText.match(bibleVerse);
    if (match2) {
        return null;
    }
    return cutText;
}

// Run the script for a specific year (e.g., 2024)
scrapeAllThirdReadings(2024);
