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

    //get seller details by itn
    async getSellerDetailsByItn(itn) {
        await this.connect();
        return await this.collection.findOne({ itn });
    }

    // create new target 
    async createTarget(target) {
        await this.connect();
        return await this.collection.insertOne(target);
    }

    // search by name / psrn
    async search(field, value) {
        await this.connect();

        const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const query = {
            [field]: {
                $regex: `^${escapedValue}`,
                $options: "i"
            }
        };

        return await this.collection
            .find(query)
            .limit(10)
            .toArray();
    }



    // Пометка для закупки
    async updateImportant(itn, data) {
        await this.connect();

        return await this.collection.updateOne(
            { itn },
            {
                $set: {
                    control: data.control,
                    completed: false
                }
            }
        );
    }

    // Ожидание получения
    async updateCompleted(itn, data) {
        await this.connect();

        return await this.collection.updateOne(
            { itn },
            {
                $set: {
                    control: false,
                    completed: data.completed
                }
            }
        );
    }

    // Внести изменения в задачу
    async update(itn, data) {
        await this.connect();

        const updateData = { ...data };

        // Не изменяем системный идентификатор MongoDB
        delete updateData._id;

        // ITN используется для поиска задачи
        delete updateData.itn;

        return await this.collection.updateOne(
            { itn },
            { $set: updateData }
        );
    }

}