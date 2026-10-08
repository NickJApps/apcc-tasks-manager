export default class Target {

    constructor(data) {

        //seller inform
        this.creation_date = data.creation_date;
        this.quarter = this.getQuarter(this.creation_date);
        this.itn = data.itn;
        this.psrn = data.psrn;
        this.seller_name = data.seller_name ?? null;
        this.region = data.region;
        this.address = data.address;
        this.comment = data.comment;

        //purchase detales
        this.test_purchase_date = data.test_purchase_date;
        this.platform = data.platform;
        this.link_store = data.link_store;
        this.monthly_revenue = data.monthly_revenue;
        this.sales_number = data.sales_number;
        this.remaining_stock = data.remaining_stock;

        // purchase
        this.test_purchases = data.test_purchases;

        //cd_letter
        this.cd_letter_date = data.cd_letter_date;

        //lowsuit
        this.lawsuit_date = data.lawsuit_date;
        this.lawsuit_decision_date = data.lawsuit_decision_date;

        //appeal
        this.appeal_date = data.appeal_date;
        this.appeal_decision_date = data.appeal_decision_date;

        //execution
        this.execution_date = data.execution_date;

        //case status
        this.case_complete_date = data.case_complete_date;
        this.status_to_date = data.status_to_date;
        this.case_in_progress = data.case_in_progress;

        // executant
        this.executant = data.executant;

        // history
        this.history = data.history;

        //control
        this.control = data.control;

        //the purchase is completed
        this.completed = data.comleted;

    }


    // Получить квартал по дате

    getQuarter(dateStr) {

        if (!dateStr) return null;

        let year, month;

        // если Excel вернул Date
        if (dateStr instanceof Date) {
            year = dateStr.getFullYear();
            month = dateStr.getMonth() + 1;
        }

        // формат YYYY-MM-DD
        else if (typeof dateStr === "string" && dateStr.includes("-")) {
            [year, month] = dateStr.split("-").map(Number);
        }

        // формат DD.MM.YYYY
        else if (typeof dateStr === "string" && dateStr.includes(".")) {
            [, month, year] = dateStr.split(".").map(Number);
        }

        if (month <= 3) return `Q4 FY${year - 1}`;
        if (month <= 6) return `Q1 FY${year}`;
        if (month <= 9) return `Q2 FY${year}`;
        return `Q3 FY${year}`;
    }

}