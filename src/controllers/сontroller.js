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
        res.status(500).json({
            success: false,
            message: "Не удалось создать задачу"
        });
    }
};

export const search = async (req, res) => {
    try {
        const { field, value } = req.query;

        const allowedFields = ["psrn", "seller_name"];

        if (!allowedFields.includes(field)) {
            return res.status(400).json({
                error: "Недопустимое поле для поиска"
            });
        }

        if (typeof value !== "string" || !value.trim()) {
            return res.status(400).json({
                error: "Необходимо указать значение для поиска"
            });
        }

        const result = await service.search(field, value.trim());

        res.json(result);
    } catch (error) {
        console.error("Ошибка поиска:", error);

        res.status(500).json({
            error: "Не удалось выполнить поиск"
        });
    }

};

// Mark important 
export const updateImportant = async (req, res) => {
    try {
        const result = await service.updateImportant(
            req.params.itn,
            req.body
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Задача не найдена"
            });
        }

        res.json({
            success: true,
            message: "Маркировка обновлена"
        });

    } catch (error) {
        console.error("Ошибка обновления маркировки:", error);
        res.status(500).json({
            success: false,
            message: "Не удалось обновить маркировку"
        });
    }
};

// Mark completed 
export const updateCompleted = async (req, res) => {
    try {
        const result = await service.updateCompleted(
            req.params.itn,
            req.body
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Задача не найдена"
            });
        }

        res.json({
            success: true,
            message: "Статус задачи обновлён"
        });
    } catch (error) {
        console.error("Ошибка обновления статуса:", error);

        res.status(500).json({
            success: false,
            message: "Не удалось обновить статус задачи"
        });
    }
};

// Update task
export const update = async (req, res) => {
    try {
        const result = await service.update(
            req.params.itn,
            req.body
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Задача не найдена"
            });
        }

        res.json({
            success: true,
            message: "Задача успешно обновлена"
        });
    } catch (error) {
        console.error("Ошибка обновления задачи:", error);

        res.status(500).json({
            success: false,
            message: "Не удалось обновить задачу"
        });
    }
};
