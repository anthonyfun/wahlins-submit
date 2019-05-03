require('dotenv').config();
const faunadb = require('faunadb');
const q = faunadb.query;

const { clone } = require('./util');

class DB {
    constructor() {
        this.client = new faunadb.Client(
            { secret: process.env.FAUNADB_SECRET }
        );
        this.cache = [];
    }

    async addApartment(object) {
        const apartment = {
            applicant: process.env.SOCIAL_SECURITY_NUMBER,
            href: object.href,
            objectNumber: object.objectNumber,
            address: object.address,
            rooms: object.rooms,
            area: object.area,
            rent: object.rent,
            moveIn: object.moveIn,
            type: object.type,
            salaryRequirement: object.salaryRequirement,
            importantNotice: object.importantNotice,
            lottery: object.lottery,
            created: new Date().toUTCString()
        };
        
        try {
            // add apartment to db
            const result = await this.client.query(
                q.Create(q.Class('apartments'), { data: apartment })
            );

            console.log('added apartment to db');
            console.log(result.data);

            this.cache = null;
        } catch (error) {
            console.log(`error when adding apartment to db: ${error}`);
            throw error;
        }
    }

    async getAllApartments() {
        if (this.cache) {
            return clone(this.cache);
        }

        try {
            // get all references from index
            const refs = await this.client.query(
                q.Paginate(q.Match(q.Index('all_apartments')))
            );

            // get all instances from references
            const rows = refs.data.map(ref => q.Get(ref));
            let instances = await this.client.query(rows);
            instances = instances
                .filter(instance => instance.applicant === process.env.SOCIAL_SECURITY_NUMBER)
                .map(instance => instance.data);

            // add result to cache
            this.cache = instances;
            return clone(this.cache);
        } catch (error) {
            console.log(`error when retrieving all apartments: ${error}`);
            throw error;
        }
    }
}

const db = new DB();
module.exports = db;