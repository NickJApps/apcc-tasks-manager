import { Service } from "../service/Service.js";
const service = new Service();

export const home = async (req, res) => {
    res.render("pages/home");
};

export const create = (req, res) => {
    res.render("pages/create");
};

export const details = (req, res) => {
    res.render("pages/details", {
        itn: req.params.itn
    });
};

export const getSellerDetailsByItn = async (req, res) => {
    const task = await service.getSellerDetailsByItn(req.params.itn);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json(task);
};

export const getProgress = async (req, res) => {
    const targets = await service.getAllInProgress();
    res.json(targets);
};

export const createTarget = async (req, res) => {
    try {
        const result = await service.createTarget(req.body);

        res.status(201).json({
            success: true,
            message: "Задача успешно создана",
            id: result.insertedId
        });
    } catch (error) {
        console.error("Ошибка создания задачи:", error);

        res.status(500).json({
            success: false,
            message: "Не удалось создать задачу"
        });
    }
};

