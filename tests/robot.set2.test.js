const Robot = require('../robot');
const DB = require('../db');

let db;
let robot;

beforeAll(async () => {
    db = new DB();
    robot = new Robot();

    await db.deleteAllApartments();
});

test('should run without throwing exception', async () => {
    jest.setTimeout(60000);

    await robot.run(db);

    let list = await db.getAllApartments();
    expect(list.length).toBe(3);

    await db.deleteAllApartments();
    list = await db.getAllApartments();
    expect(list.length).toBe(0);
});