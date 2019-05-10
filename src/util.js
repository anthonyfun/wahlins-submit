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

    return about.length < 8 
        ? header 
        : about;
}

const removeCommonOccurences = (str) => {
    if (str == null || str === '') {
        return '';
    }

    str = str 
        .replace('.', '')
        .replace(' i ', ', ')
        .replace(' på ', '')
        .replace('!', ' ')
        .replace('1 rok, ', '')
        .replace('2 rok, ', '')
        .replace('3 rok, ', '')
        .replace('1 rok ', '')
        .replace('2 rok ', '')
        .replace('3 rok ', '')
        .replace('1 rok', '')
        .replace('2 rok', '')
        .replace('3 rok', '')
        .replace('1 rokvrå, ', '')
        .replace('2 rokvrå, ', '')
        .replace('3 rokvrå, ', '')
        .replace('1 rokvrå ', '')
        .replace('2 rokvrå ', '')
        .replace('3 rokvrå ', '')
        .replace('1 rokvrå', '')
        .replace('2 rokvrå', '')
        .replace('3 rokvrå', '')
        .replace('korttidskontrakt, ', '')
        .replace('korttidskontrakt ', '')
        .replace('korttidskontrakt,', '')
        .replace('korttidskontrakt', '')
        .replace('Korttidskontrakt, ', '')
        .replace('Korttidskontrakt ', '')
        .replace('Korttidskontrakt,', '')
        .replace('Korttidskontrakt', '')
        .replace(/\s+/g, ' ');

    if (str.length > 0) {
        if (str[0].match(/^[^A-Za-z0-9]+$/)) {
            str = str.substring(1, str.length);
        }
        if (str[str.length - 1].match(/^[^A-Za-z0-9]+$/)) {
            str = str.substring(0, str.length - 2);
        }
    }

    return str;
};

module.exports = {
    sendMessage,
    clone,
    formatAddress
};