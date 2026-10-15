import Target from "../models/Target.js";
import { Repository } from "../repository/Repository.js";

export class Service {

    constructor() {
        this.repo = new Repository();
    }

    async getAllInProgress() {
        return await this.repo.getAllInProgress();
    }

    async getSellerDetailsByItn(itn) {
        return await this.repo.getSellerDetailsByItn(itn);
    }

    async createTarget(data) {
        const target = new Target(data);
        return await this.repo.createTarget(target);
    }

    async search(field, value) {
        return await this.repo.search(field, value);
    }

    async updateImportant(itn, data) {
        return await this.repo.updateImportant(itn, data);
    }

    async updateCompleted(itn, data) {
        return await this.repo.updateCompleted(itn, data);
    }

    async update(itn, data) {
        return await this.repo.update(itn, data);
    }
}