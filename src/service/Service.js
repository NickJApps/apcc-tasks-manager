import Target from "../models/Target.js";
import { Repository } from "../repository/Repository.js";
import ExcelJS from "exceljs";

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

    async delete(itn) {
        return await this.repo.delete(itn);
    }


    async createExportWorkbook(getBy, fields) {
        let cases = [];

        if (getBy === "opened_cases") {
            cases = await this.repo.getAllInProgress();
        } else if (getBy === "closed_cases") {
            cases = await this.repo.getAllClosed();
        } else {
            cases = await this.repo.getAll();
        }

        const purchaseFields = [
            "product",
            "product_price",
            "product_link"
        ];

        const needsPurchaseData = fields.some(field =>
            purchaseFields.includes(field)
        );

        const dateFields = [
            "creation_date",
            "test_purchase_date",
            "cd_letter_date",
            "lawsuit_date",
            "lawsuit_decision_date",
            "appeal_date",
            "appeal_decision_date",
            "execution_date",
            "case_complete_date"
        ];

        const fieldMap = {
            seller_name: "Имя",
            psrn: "ОГРН / ОГРНИП",
            itn: "ИНН",
            creation_date: "Дата создания",
            region: "Регион",
            address: "Адрес",
            link_store: "Ссылка на магазин",
            monthly_revenue: "Доход в месяц",
            sales_number: "Кол-во продаж",
            remaining_stock: "Остаток",
            comment: "Комментарий",
            test_purchase_date: "Дата закупки",
            platform: "Платформа",
            product: "Продукт",
            product_price: "Цена",
            product_link: "Ссылка",
            cd_letter_date: "Претензия",
            lawsuit_date: "Иск (дата)",
            lawsuit_decision_date: "Решение суда (дата)",
            appeal_date: "Апелляция (дата)",
            appeal_decision_date: "Решение апелляции (дата)",
            execution_date: "Исполнительное (дата)",
            status_to_date: "Текущий статус",
            case_complete_date: "Кейс закрыт (дата)"
        };

        // Находим последнюю состоявшуюся закупку
        const getLastPurchase = purchases => {
            if (!Array.isArray(purchases)) return null;

            return purchases.reduce((latest, purchase) => {
                if (!purchase.item_purchase_date) return latest;

                if (
                    !latest ||
                    new Date(purchase.item_purchase_date) >
                    new Date(latest.item_purchase_date)
                ) {
                    return purchase;
                }

                return latest;
            }, null);
        };

        // Подготавливаем строки
        const rows = cases.map(item => {
            const row = {};

            const lastPurchase = needsPurchaseData
                ? getLastPurchase(item.test_purchases)
                : null;

            for (const field of fields) {
                let value;

                if (purchaseFields.includes(field)) {
                    value = lastPurchase?.[field] ?? null;
                } else {
                    value = item[field] ?? null;
                }

                if (dateFields.includes(field)) {
                    value = this.formatExportDate(value);
                }

                if (field === "status_to_date" && value) {
                    value = this.translateExportStatus(value);
                }

                row[field] = value;
            }

            return row;
        });

        // Сортировка по имени продавца
        rows.sort((a, b) =>
            String(a.seller_name ?? "").localeCompare(
                String(b.seller_name ?? ""),
                "ru",
                { sensitivity: "base" }
            )
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Cases");

        worksheet.columns = fields.map(field => ({
            header: fieldMap[field] || field,
            key: field,
            width: 20
        }));

        rows.forEach(row => worksheet.addRow(row));

        // Оформление заголовков
        worksheet.getRow(1).font = { bold: true };
        worksheet.views = [{ state: "frozen", ySplit: 1 }];

        // Автоматическая ширина колонок
        worksheet.columns.forEach(column => {
            let maxLength = String(column.header ?? "").length;

            column.eachCell({ includeEmpty: false }, cell => {
                const value = cell.value;

                const text = value && typeof value === "object"
                    ? String(value.text ?? value.hyperlink ?? "")
                    : String(value ?? "");

                maxLength = Math.max(maxLength, text.length);
            });

            column.width = Math.min(maxLength + 2, 60);
        });

        // Кликабельные ссылки на товары
        if (fields.includes("product_link")) {
            const linkColumn = fields.indexOf("product_link") + 1;

            for (let rowNumber = 2;
                rowNumber <= worksheet.rowCount;
                rowNumber++
            ) {
                const cell = worksheet.getRow(rowNumber).getCell(linkColumn);

                if (
                    typeof cell.value === "string" &&
                    /^https?:\/\//i.test(cell.value)
                ) {
                    cell.value = {
                        text: "Открыть",
                        hyperlink: cell.value
                    };
                }
            }
        }

        return workbook;
    }

    formatExportDate(value) {
        if (!value) {
            return null;
        } else {
            const [year, month, day] = value.split("-");
            return `${day}.${month}.${year}`;
        }
    }

    translateExportStatus(value) {
        const statuses = {
            target: "Цель",
            purchase: "Закупка",
            letter: "Претензия",
            lawsuit: "Арбитраж",
            appeal: "Апелляция",
            execution: "Исполнительное производство",
            suspended: "Приостановлено",
            settlement: "Мировое соглашение",
            withdrawal_of_claim: "Отказ от иска",
            cease_traiding: "Покинул рынок",
            executed: "Исполнено",
            original: "Оригинал",
            execution_not_possible: "Исполнение не возможно"
        };

        return statuses[value] || value;
    }

}



