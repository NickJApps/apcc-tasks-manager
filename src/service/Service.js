import Target from "../models/Target.js";
import { Repository } from "../repository/Repository.js";

export class Service {

    constructor() {
        this.repo = new Repository();
    }

    async getAllInProgress() {
        return await this.repo.getAllInProgress();
    }

}