class Command {
    constructor() {
        this.functors = [];
    }
    
    set(command, callback) {
        this.functors[command] = callback;
    }

    run(command) {
        const func = this.functors[command];
        return func == null 
            ? {
                result: null,
                isValid: false
            } : {
                result: func(),
                isValid: true
            };
    }
}

module.exports = Command;