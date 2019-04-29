require('dotenv').config();
const faunadb = require('faunadb');
const q = faunadb.query;

class DB {
    constructor() {
        this.client = new faunadb.Client(
            { secret: process.env.FAUNADB_SECRET }
        );
    }

    async add(apartment) {
        apartment.created = new Date().toUTCString();
        try {
            // add apartment to db
            const result = await this.client.query(
                q.Create(q.Class('apartments'), { data: apartment })
            );

            console.log('added apartment to db');
            console.log(result.data);
        } catch (error) {
            console.log(`Error when adding apartment to db: ${error}`);
            throw error;
        }
    }

    async getAll() {
        try {
            // get all references from index
            const refs = await this.client.query(
                q.Paginate(q.Match(q.Index('all_apartments')))
            );

            // get all instances from references
            const rows = refs.data.map(ref => q.Get(ref));
            const instances = await this.client.query(rows);
            return instances.map(instance => instance.data);
        } catch (error) {
            console.log(`Error when retrieving all apartments: ${error}`);
            throw error;
        }
    }
}

const db = new DB();
module.exports = db;