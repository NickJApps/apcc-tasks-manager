import { Service } from "../service/Service.js";
import ExcelJS from "exceljs";
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

export const upload = (req, res) => {
    res.render("pages/upload");
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

// delete task
export const deleteCase = async (req, res) => {
    try {
        const result = await service.delete(req.params.itn);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Кейс не найден"
            });
        }

        res.json({
            success: true,
            message: "Кейс успешно удалён"
        });

    } catch (error) {
        console.error("Ошибка удаления кейса:", error);

        res.status(500).json({
            success: false,
            message: "Не удалось удалить кейс"
        });
    }
};

// export cases
const ALLOWED_EXPORT_TYPES = [
    "opened_cases",
    "closed_cases",
    "all_cases"
];

const ALLOWED_EXPORT_FIELDS = [
    "seller_name",
    "psrn",
    "itn",
    "creation_date",
    "region",
    "address",
    "link_store",
    "monthly_revenue",
    "sales_number",
    "remaining_stock",
    "comment",
    "test_purchase_date",
    "platform",
    "product",
    "product_price",
    "product_link",
    "cd_letter_date",
    "lawsuit_date",
    "lawsuit_decision_date",
    "appeal_date",
    "appeal_decision_date",
    "execution_date",
    "status_to_date",
    "case_complete_date"
];

export const exportCases = async (req, res) => {
    try {
        const { getBy, fields } = req.body;

        if (!ALLOWED_EXPORT_TYPES.includes(getBy)) {
            return res.status(400).json({
                message: "Неизвестный тип выгрузки"
            });
        }

        if (
            !Array.isArray(fields) ||
            fields.length === 0 ||
            !fields.every(field =>
                ALLOWED_EXPORT_FIELDS.includes(field)
            )
        ) {
            return res.status(400).json({
                message: "Некорректный список полей"
            });
        }

        const uniqueFields = [...new Set(fields)];

        const workbook = await service.createExportWorkbook(
            getBy,
            uniqueFields
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="cases.xlsx"'
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Ошибка выгрузки:", error);

        if (res.headersSent) {
            return res.end();
        }

        res.status(500).json({
            message: "Ошибка при формировании файла"
        });
    }
};