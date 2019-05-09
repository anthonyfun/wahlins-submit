const Storage = require('../src/storage');

let storage;

beforeEach(() => {
    storage = new Storage();
});

test('should set value', () => {
    storage.set('test', 3);
    
    expect(storage.get('test')).toBe(3);
});

test('should overwrite value', () => {
    storage.set('test', 3);
    expect(storage.get('test')).toBe(3);
    storage.set('test', 6);
    expect(storage.get('test')).toBe(6);
});

test('should exist', () => {
    storage.set('test', 3);
    
    expect(storage.exists('test')).toBe(true);
});

test('should clear', () => {
    storage.set('test', 3);
    expect(storage.get('test')).toBe(3);
    storage.clear('test');
    expect(storage.exists('test')).toBe(false);
});