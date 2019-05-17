discord = require('./discord');

const sendMessage = (message) => {
    console.log(message);
    discord.sendMessage(message);
};

const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj)); 
};

const formatAddress = (about, header) => {
    header = header || '';

    // remove object number 
    let index = header.indexOf('|');
    if (index >= 0) {
        header = header.substring(index + 1);
    }
    
    about = removeCommonOccurences(about);
    header = removeCommonOccurences(header);

    const cities = [
        'sundbyberg',
        'stockholm',
        'johanneshov',
        'huvudsta',
        'bagarmossen',
        'ursvik',
        'spånga',
        'bromsten'
    ];
    const cityIndex = cities.indexOf(about.toLowerCase());
    const isOnlyCityName = cityIndex >= 0 && cities[cityIndex].length === about.length;

    return about.length < 7 || isOnlyCityName
        ? header 
        : about;
}

const removeCommonOccurences = (str) => {
    if (str == null || str === '') {
        return '';
    }

    const phrases = [
        'max 4 år',
        'max 3 år',
        'max 2 år',
        'max 1 år',
        'Max 4 år',
        'Max 3 år',
        'Max 4 år',
        'Max 1 år',
        'Centralt',
        'Centrala',
        'Central',
        '1 rok',
        '2 rok',
        '3 rok',
        '4 rok',
        '1 rokvrå',
        '2 rokvrå',
        '3 rokvrå',
        '4 rokvrå',
        'Korttidskontrakt',
        'Nyproducerad',
        'Rökfri',
        'Fastighet',
        'Lägenhet', 
        'Söder ',
        'Kungsholmen ',
    ];

    const replace = (str, phrase) => {
        return str 
            .replace(`${phrase}, `, '')
            .replace(`${phrase} `, '')
            .replace(`${phrase},`, '')
            .replace(`${phrase}`, '');
    };

    for (let phrase of phrases) {
        const lower = phrase.toLowerCase();
        const upper = phrase.toUpperCase();
        str = replace(str, upper)
        str = replace(str, phrase)
        str = replace(str, lower)
    }

    // special cases
    str = str 
        .replace('.', '')
        .replace(' i ', ', ')
        .replace(' på ', '')
        .replace('!', ' ')
        .replace(/\s+/g, ' ');

    // remove strings like 'Inflytt den 3/6'
    const inflyttIndex = str.toLowerCase().indexOf('inflytt');
    if (inflyttIndex >= 0) {
        const commaIndex = str.indexOf(',');
        if (commaIndex > inflyttIndex && commaIndex !== str.length - 1) {
            str = str.replace(str.substring(inflyttIndex, commaIndex), '');
        }
    }

    // trim and remove special characters in beginning and end. 
    str.trim();
    if (str.length > 0) {
        if (str[0].match(/^[^A-Za-z]+$/)) {
            str = str.substring(1, str.length);
        }
        if (str[str.length - 1].match(/^[^A-Za-z0-9]+$/)) {
            str = str.substring(0, str.length - 2);
        }
    }
    return str.trim();
};

module.exports = {
    sendMessage,
    clone,
    formatAddress
};