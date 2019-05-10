const { clone, formatAddress } = require('../src/util');

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

test('should format correct addresses', () => {
    expect(formatAddress('Storgatan 100 B Solna'))
        .toEqual('Storgatan 100 B Solna');

    expect(formatAddress('Storgatan 100 B Solna', ''))
        .toEqual('Storgatan 100 B Solna');

    expect(formatAddress('Storgatan 100 B Solna', '337-171 | Tvåa i Huvudsta'))
        .toEqual('Storgatan 100 B Solna');

    expect(formatAddress('Tallgatan 1 i Sundbyberg', '309-122 | 3 rok på Tallgatan 1, korttidskontrakt'))
        .toEqual('Tallgatan 1, Sundbyberg');

    expect(formatAddress('Järnvägsgatan 46 i Sundbyberg', '324-114 | 1 rok, Järnvägsgatan 46, korttidskontrakt'))
        .toEqual('Järnvägsgatan 46, Sundbyberg');

    expect(formatAddress('2 rok', '324-114 | 1 rok, Järnvägsgatan 46, korttidskontrakt'))
        .toEqual('Järnvägsgatan 46');

    expect(formatAddress('1 rokvrå. Korttidskontrakt!', '324-114 | 1 rok, Järnvägsgatan 46, korttidskontrakt'))
        .toEqual('Järnvägsgatan 46');
});