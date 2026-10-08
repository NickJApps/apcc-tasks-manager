import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "apcc"; //имя базы данных

export class Repository {
    constructor() {
        this.db = client.db(dbName);
        this.collection = this.db.collection("targets"); // имя коллекции
    }

    async connect() {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }
    }

    //get all cases if case_in_progress == true
    async getAllInProgress() {
        await this.connect();
        return await this.collection.find({ case_in_progress: true }).toArray();
    }    
}