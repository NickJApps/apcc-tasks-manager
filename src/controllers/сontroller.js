import { Service } from "../service/Service.js";
const service = new Service();

export const home = async (req, res) => {
    res.render("pages/home");
};

export const create = (req, res) => {
    res.render("pages/create");
};

export const details = (req, res) => {
    res.render("pages/details");
};

export const getProgress = async (req, res) => {
    const targets = await service.getAllInProgress();
    res.json(targets);
};