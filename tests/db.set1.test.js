const DB = require('../src/db');

let db;

beforeAll(async () => {
    db = new DB();
    await db.deleteAllApartments();
});

test('should add, retrieve and delete correctly', async () => {
    await db.addApartment({});
    let list = await db.getAllApartments();

    expect(list.length).toBe(1);
    expect(list[0].applicant).toBe(process.env.SOCIAL_SECURITY_NUMBER);

    await db.deleteAllApartments();
    
    list = await db.getAllApartments();
    expect(list.length).toBe(0);
});