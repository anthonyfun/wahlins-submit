const { clone } = require('../src/util');

test('should be equal', () => {
    const test = {
        a: 1,
        b: 'hej'
    };

    expect(clone(test)).toEqual({ 
        a: 1, 
        b: 'hej'
    });
});

test('should not be equal', () => {
    const test = {
        a: 1,
        b: 'hej'
    };

    expect(clone(test)).not.toEqual({ 
        a: 1, 
        b: 'heja'
    });
});