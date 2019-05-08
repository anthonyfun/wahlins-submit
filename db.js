require('custom-env').env(true);
const faunadb = require('faunadb');
const q = faunadb.query;

const Storage = require('./storage');

const storageApartmentsKey = 'apartments';

class DB {
    constructor() {
        this.client = new faunadb.Client(
            { secret: process.env.FAUNADB_SECRET }
        );
        this.storage = new Storage();
    }

    async addApartment(object) {
        const apartment = {
            applicant: process.env.SOCIAL_SECURITY_NUMBER,
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

            this.storage.clear(storageApartmentsKey);
        } catch (error) {
            console.log(`error when adding apartment to db: ${error}`);
            throw error;
        }
    }

    async getAllApartments() {
        if (this.storage.exists(storageApartmentsKey)) {
            return this.storage.get(storageApartmentsKey);
        } 

        try {
            const refs = await this.getAllReferencesFromIndex();            
            const rows = refs.data.map(ref => q.Get(ref));

            // get all instances from references
            let instances = await this.client.query(rows);
            instances = instances
                .filter(instance => instance.data.applicant === process.env.SOCIAL_SECURITY_NUMBER)
                .map(instance => instance.data);

            // add result to storage
            this.storage.set(storageApartmentsKey, instances);
            return instances;
        } catch (error) {
            console.log(`error when retrieving all apartments: ${error}`);
            throw error;
        }
    }

    async deleteAllApartments() {
        try {
            this.storage.clear(storageApartmentsKey);

            const refs = await this.getAllReferencesFromIndex();
            const rows = refs.data.map(ref => q.Delete(ref));

            // delete all instances from references
            await this.client.query(rows);
        } catch (error) {
            console.log(`error when deleting all apartments ${error}`);
            throw error;
        }
    }

    async getAllReferencesFromIndex() {
        return await this.client.query(
            q.Paginate(q.Match(q.Index('all_apartments')))
        );
    }
}

module.exports = DB;