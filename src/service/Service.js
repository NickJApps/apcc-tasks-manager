import Target from "../models/Target.js";
import { Repository } from "../repository/Repository.js";
import ExcelJS from "exceljs";
import axios from "axios";
import * as cheerio from "cheerio";

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


    // Get seller info from Rusprofile
    async getSellerInfo(ident) {

        let type;
        let url;

        // Определяем тип продавца и формируем URL
        if (/^\d{13}$/.test(ident)) {
            type = "company";
            url = `https://www.rusprofile.ru/id/${ident}/`;

        } else if (/^\d{15}$/.test(ident)) {
            type = "entrepreneur";
            url = `https://www.rusprofile.ru/ip/${ident}`;

        } else {
            throw new Error("Введите корректный ОГРН или ОГРНИП");
        }

        try {

            let response;

            try {
                response = await this.fetchRusprofile(url);

            } catch (error) {

                // Если ООО не найдено по прямому URL,
                // используем Advanced Search
                if (type === "company" && error.response?.status === 404) {

                    url = await this.findCompanyUrl(ident);
                    response = await this.fetchRusprofile(url);

                } else {
                    throw error;
                }
            }

            const $ = cheerio.load(response.data);

            const result = type === "company"
                ? this.parseCompany($)
                : this.parseIndividual($);

            if (!result.name && !result.itn && !result.psrn) {
                throw new Error("Не удалось найти продавца в Rusprofile");
            }

            return result;

        } catch (error) {

            console.error("Rusprofile error:", error.message);

            // Сохраняем понятные ошибки, сформированные нашими методами
            if (error.status) throw error;

            const externalError = new Error(
                error.response?.status === 404
                    ? "Профиль продавца не найден"
                    : "Не удалось получить данные из Rusprofile"
            );

            externalError.status =
                error.response?.status === 404 ? 404 :
                    error.code === "ECONNABORTED" ? 504 : 502;

            throw externalError;
        }
    }

    async fetchRusprofile(url) {

        return await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            timeout: 15000
        });
    }

    async findCompanyUrl(ogrn) {

        const response = await this.fetchRusprofile(
            "https://www.rusprofile.ru/search-advanced?query=" +
            encodeURIComponent(ogrn)
        );

        const $ = cheerio.load(response.data);

        const results = [];

        $(".list-element").each((i, el) => {

            const item = $(el);

            const resultOgrn = item
                .find(".list-element__row-info span")
                .filter((i, el) => $(el).text().includes("ОГРН:"))
                .find("mark")
                .text()
                .trim();

            // Проверяем точное совпадение ОГРН
            if (resultOgrn !== ogrn) return;

            const href = item
                .find("a.list-element__title")
                .attr("href");

            if (href) {
                results.push(href);
            }
        });

        if (results.length === 0) {
            const error = new Error(
                "Организация по указанному ОГРН не найдена"
            );
            error.status = 404;
            throw error;
        }

        if (results.length > 1) {
            const error = new Error(
                "Найдено несколько организаций с указанным ОГРН"
            );
            error.status = 409;
            throw error;
        }

        return `https://www.rusprofile.ru${results[0]}`;
    }

    parseCompany($) {

        const name = $('h1[itemprop="name"]').first().text().trim();
        const itn = $("#clip_inn").text().trim();
        const psrn = $("#clip_ogrn").text().trim();

        const region = $('span[itemprop="addressRegion"]')
            .first()
            .text()
            .trim();

        const addressElement = $("#clip_address").clone();

        addressElement.find(".copy_button, meta").remove();

        const address = addressElement.text()
            .replace(/\s+/g, " ")
            .replace(/\s*,\s*/g, ", ")
            .trim();

        return { name, itn, psrn, region, address };
    }

    parseIndividual($) {

        const name = $("#clip_name").text().trim();
        const itn = $("#req_inn").text().trim();
        const psrn = $("#req_ogrnip").text().trim();

        const getInfo = (title) => {
            return $("dt.company-info__title")
                .filter((i, el) => $(el).text().trim() === title)
                .first()
                .next("dd.company-info__text")
                .text()
                .replace(/\s+/g, " ")
                .replace(/\s*,\s*/g, ", ")
                .trim();
        };

        const region = getInfo("Регион");
        const address = getInfo("Адрес");

        return { name, itn, psrn, region, address };
    }

}



