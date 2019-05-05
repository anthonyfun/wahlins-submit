const Command = require('../command');

let command;

beforeEach(() => {
    command = new Command();
});

test('should be set and return', () => {
    command.set('test', () => 3);
    const result = command.run('test');
    
    expect(result.isValid).toBeTruthy();
    expect(result.result).toBe(3);
});

test('should not run', () => {
    command.set('test', () => 3);
    const result = command.run('testa');
    
    expect(result.isValid).toBeFalsy();
    expect(result.result).toBeNull();
});