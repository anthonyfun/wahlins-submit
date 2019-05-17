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

    expect(formatAddress('max 4 år, Emågatan 9, Bagarmossen', '183-223 | 1 rok, 25 kvm, Emågatan 9, Bagarmossen, KORTTIDSKONTRAKT, INFLYTT 1/6'))
        .toEqual('Emågatan 9, Bagarmossen');

    expect(formatAddress('Inflytt 1 juni 2019, Södergatan 2B, Märsta', '503-144, Södergatan 2B, Märsta | 2 rok, plan 4, 63 kvm, Södergatan 2B, Märsta (nära Arlanda), inflytt 1 juni'))
        .toEqual('Södergatan 2B, Märsta');

    expect(formatAddress('Inflytt 1 juni 2019, Mjölnarstigen 37', '209-431 | 4 rok, Mjölnarstigen 37, Spånga-Bromsten, inflytt 1/6'))
        .toEqual('Mjölnarstigen 37');

    expect(formatAddress('Centrala Sundbyberg', '322-113 | Rosengatan 1 i Sundbyberg'))
        .toEqual('Rosengatan 1, Sundbyberg');

    expect(formatAddress('Centralt, Sundbyberg', '314-124 | Starrbäcksgatan 16 A, Sundbyberg')) 
        .toEqual('Starrbäcksgatan 16 A, Sundbyberg');

    expect(formatAddress('Emågatan 9, Bagarmossen', '183-223 | 1 rok, 25 kvm, Emågatan 9, Bagarmossen, KORTTIDSKONTRAKT, INFLYTT 1/6')) 
        .toEqual('Emågatan 9, Bagarmossen');

    expect(formatAddress('Bondegatan 61', '142-102 | Korttidskontrakt på Söder')) 
        .toEqual('Bondegatan 61');
});