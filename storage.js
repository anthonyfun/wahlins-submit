const { clone } = require('./util');

class Storage {
    constructor() {
        this.dictionary = [];
    }

    get(key) {
        const result = this.dictionary[key];
        return result != null
            ? clone(result) 
            : null;
    }

    exists(key) {
        return this.dictionary[key] != null;
    }

    set(key, value) {
        this.dictionary[key] = clone(value);
    }

    clear(key) {
        this.dictionary[key] = null;
    }
}

module.exports = Storage;