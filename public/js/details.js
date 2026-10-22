let container = null;
let template = null;
let purchaseIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#detales-form");
    const itn = form.dataset.itn;

    loadTaskDetails(itn);
});

async function loadTaskDetails(itn) {

    try {
        const response = await fetch(`/task/byitn/${encodeURIComponent(itn)}`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const task = await response.json();

        if (!task.case_in_progress) {
            $(".case-complete-info-section").removeClass("invisible");

            $("#date-complete-info").text(formatDate(task.case_complete_date));
            $("#status-complete-info").text(HISTORY_TRANSLATE_STATUS(task.status_to_date));

            // $(".save-change-btn").addClass("invisible");
            // $(".detales-purchase-add-btn").prop("disabled", true);
        }

        // Распределить данные task по полям формы
        // console.log(task);

        container = $(".test-purchase-container");
        template = container.find(".test-purchase-item.template");

        // Удаляем ранее загруженные товары, сохраняя шаблон
        container.find(".test-purchase-item:not(.template)").remove();

        //update status line
        updateStatusLine(task);

        // general
        $("#creation-date").text(formatDate(task.creation_date));
        $("#seller-name").text(task.seller_name);
        $("#itn").text(task.itn);
        $("#psrn").text(task.psrn);

        $("#region").val(task.region);
        $("#address").val(task.address);
        $("#comment").text(task.comment);


        //stages - purchase

        const purchases = task.test_purchases;

        $("#platform").val(task.platform);
        $("#link-store").val(task.link_store);
        $("#monthly-revenue").val(task.monthly_revenue);
        $("#sales-number").val(task.sales_number);
        $("#remaining-stock").val(task.remaining_stock);

        if (purchases && purchases.length > 0) {

            purchases.forEach((purchase, index) => {

                const item = template
                    .clone(false)
                    .removeClass("template")
                    .prop("hidden", false);

                const purchaseIndex = index + 1;

                item.find(".purchase-subtitle").text(`Товар № ${purchaseIndex}`);

                item.find('[id="product"]').val(purchase.product);
                item.find('[id="product-link"]').val(purchase.product_link);
                item.find('[id="product-price"]').val(purchase.product_price);
                item.find('[id="item-purchase-date"]').val(purchase.item_purchase_date || "");

                if (purchase.item_purchase_date) {

                    item.addClass("loaded-purchase");

                    item.find("input, select").prop("disabled", true);
                    item.find(".delete-product-btn").addClass("invisible");
                    item.find(".clear-product-btn").addClass("invisible");

                } else {
                    item.addClass("removable");
                }

                container.append(item);
            });

        } else {

            // Если товаров нет, создаём один пустой блок
            const item = template
                .clone(false)
                .removeClass("template")
                .prop("hidden", false);

            item.find(".purchase-subtitle").text("Товар № 1");

            container.append(item);
        }


        // stages - cd letter

        if (task.cd_letter_date) {
            $("#cd-letter-date").val(task.cd_letter_date).prop("disabled", true)
        }

        // stages - lawsuit

        if (task.lawsuit_date) {
            $("#lawsuit-date").val(task.lawsuit_date).prop("disabled", true);
        }

        if (task.lawsuit_decision_date) {
            $("#lawsuit-decision-date").val(task.lawsuit_decision_date).prop("disabled", true);
        }

        //stages - appeal

        if (task.appeal_date) {
            $("#appeal-date").val(task.appeal_date).prop("disabled", true);
        }

        if (task.appeal_decision_date) {
            $("#appeal_decision_date").val(task.appeal_decision_date).prop("disabled", true);
        }

        //stages - execution

        if (task.execution_date) {
            $("#execution-date").val(task.execution_date).prop("disabled", true);
        }

        // stages - complete
        if (task.case_complete_date) {
            $("#case-complete-date").val(task.case_complete_date).prop("disabled", true);
            $("#status-to-date").val(task.status_to_date).prop("disabled", true);
        }

        // история
        if (task.history) {
            $(".history-container").removeClass("invisible");

            const historyArr = task.history;

            const container = $(".history-container");
            const pattern = $(".history-case.pattern");
            container.find(".history-case").not(".pattern").remove();
            $(".history-case.pattern").remove();

            historyArr.forEach((history, index) => {

                const item = pattern.clone().removeClass("pattern");
                item.find('[id="h-creation-date"]').text(formatDate(history.h_creation_date));
                item.find('[id="h-last-status"]').text(history.h_last_status);
                item.find('[id="h-last-action"]').text(history.h_last_action);
                item.find('[id="h-last-action-date"]').text(formatDate(history.h_last_action_date));
                item.find('[id="h-products"]').text(history.h_products);
                item.find('[id="h-link-store"]').text(history.h_link_store);
                item.find('[id="h-complete-status"]').text(HISTORY_TRANSLATE_STATUS(history.h_complete_status));
                item.find('[id="h-case-complete-date"]').text(formatDate(history.h_case_complete_date));
                container.append(item);
            });
        }

    } catch (error) {
        console.error("Ошибка загрузки деталей:", error);
    }
}

// Установить текущий статус для Status Line

function updateStatusLine(obj) {
    if(obj.test_purchase_date){
        $('#purchase-step-circle').addClass("active");
        $('#purchase-step-line').addClass("active");
    }

    if(obj.cd_letter_date){
        $('#letter-step-circle').addClass("active");
        $('#letter-step-line').addClass("active");
    }

    if (obj.lawsuit_date || obj.lawsuit_decision_date) {
        $('#lawsuit-step-circle').addClass("active");
        $('#lawsuit-step-line').addClass("active");
    }

    if (obj.appeal_date || obj.appeal_decision_date) {
        $('#appeal-step-circle').addClass("active");
        $('#appeal-step-line').addClass("active");
    }

    if (obj.execution_date){
        $('#execution-step-circle').addClass("active");
        $('#execution-step-line').addClass("active");
    }

    if(!obj.case_in_progress){
        $("#completed-step-circle").addClass("active");
    }
}


/*======================================
    ДОБАВИТЬ И УДАЛИТЬ ТОВАРЫ 
=======================================*/

// Добавить товар в закупку 

$(document).on("click", ".add-product-btn", function () {
    const $container = $(".test-purchase-container");
    const $template = $container.find(".test-purchase-item.template");

    const $clone = $template
        .clone(false)
        .removeClass("template")
        .addClass("pattern removable")
        .prop("hidden", false);

    $clone.find("input").val("").prop("disabled", false);
    $clone.find("select").prop("selectedIndex", 0).prop("disabled", false);
    const purchaseIndex = $container.find(".test-purchase-item:not(.template)").length + 1;
    $clone.find(".purchase-subtitle").text(`Товар № ${purchaseIndex}`);
    $container.append($clone);
});

// Удалить товар из закупки
$(document).on("click", ".delete-product-btn", function () {
    const $container = $(".test-purchase-container");

    // Все реальные товары, исключая шаблон
    const $items = $container.find(".test-purchase-item:not(.template)");

    // Не позволяем удалить последний товар
    if ($items.length <= 1) {
        return;
    }

    // Удаляем последний товар
    $items.last().remove();
});

/*================================
 ОЧИСТИТЬ ПОЛЯ ПЕРЕЙТИ ПО ССЫЛКАМ
=================================*/

// Очистить поле store link
$(document).on("click", "#clear-store-btn", function () {
    $('input[id="link-store"]').val('');
});

// Открыть ссылку на store в новой вкладке
$(document).on("click", "#open-store-btn", function () {
    const link = $("#link-store").val();
    if (!link) {
        alert("Ссылка не указана");
        return;
    }
    window.open(link, "_blank");
});

// Очистить поле ссылки конкретного товара
$(document).on("click", ".clear-product-btn", function () {

    const $item = $(this).closest(".test-purchase-item");
    $item.find("#product-link").val("");
});

// Открыть ссылку на товар в новой вкладке
$(document).on("click", ".link-btn.open-product-btn", function () {
    console.log('click')

    const $item = $(this).closest(".test-purchase-item");
    const link = $item.find("#product-link").val().trim();

    if (!link) {
        alert("Ссылка на товар не указана");
        return;
    }

    window.open(link, "_blank");
});


/*=============================
        HISTORY BLOCK
==============================*/

// Блок history accordion

$(document).on("click", ".accordion", function () {

    let panel = $(this).next(".panel");

    // закрыть все кроме текущего
    $(".panel").not(panel).slideUp();
    $(".accordion").not(this).removeClass("active");

    // переключить текущий
    $(this).toggleClass("active");
    panel.slideToggle();
});

/*======================================== 
 Сохранить изменения detales в базу данных
=========================================*/

$(document).on("submit", "#detales-form", async function (e) {
    e.preventDefault();

    const form = this;
    const itn = $(form).data("itn");

    if (!itn) {
        showError("Не удалось определить ITN задачи");
        return;
    }

    const formData = Object.fromEntries(new FormData(form));

    // Удаляем поля повторяющихся товаров
    delete formData.product;
    delete formData.product_price;
    delete formData.product_link;
    delete formData.item_purchase_date;

    const completeDate = $("#case-complete-date").val();
    const status = $("#status-to-date").val();

    if (completeDate && !status) {
        showError("Выберите статус завершения кейса");
        return;
    }

    if (status && !completeDate) {
        showError("Установите дату завершения кейса");
        return;
    }

    const products = [];

    $(".test-purchase-container .test-purchase-item").each(function () {
        const product = $(this).find('[name="product"]').val();
        const price = $(this).find('[name="product_price"]').val();
        const link = $(this).find('[name="product_link"]').val();
        const item_purchase_date = $(this)
            .find('[name="item_purchase_date"]')
            .val();

        if (product && product !== "0") {
            products.push({
                product,
                product_price: price === "" ? null : Number(price),
                product_link: link,
                item_purchase_date
            });
        }
    });

    formData.test_purchase_date = getLatestDate(products);
    formData.test_purchases = products;
    formData.status_to_date = putCaseStatus(formData);

    // Состояние задачи рассчитываем исходя из её статуса
    formData.case_in_progress = !COMPLETION_STATUS.has(formData.status_to_date);

    try {

        const response = await fetch(
            `/update/${encodeURIComponent(itn)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        await showSuccess(result.message || "Задача успешно обновлена!");

        // Переходим на страницу списка задач
        window.location.href = "/";

    } catch (error) {
        console.error("Ошибка обновления задачи:", error);
        showError(error.message || "Не удалось обновить задачу");
    }
});


// получить последнюю дату для записи в переменную test_purchase_date
function getLatestDate(products) {
    if (!products?.length) return null;

    return products.reduce((latest, item) => {
        if (!item.item_purchase_date) return latest;

        return (!latest || item.item_purchase_date > latest)
            ? item.item_purchase_date
            : latest;

    }, null);
}

// установить текущий статус  

function putCaseStatus(obj) {
    // 1. Если есть ручной статус — используем его
    if (obj.status_to_date && MANUAL_STATUSES.has(obj.status_to_date)) {
        return obj.status_to_date;
    }

    // 2. Проверяем автоматические статусы (с конца — самый приоритетный)
    if (obj.execution_date) {
        return "execution";
    }

    if (obj.appeal_date || obj.appeal_decision_date) {
        return "appeal";
    }

    if (obj.lawsuit_date || obj.lawsuit_decision_date) {
        return "lawsuit";
    }

    if (obj.cd_letter_date) {
        return "letter";
    }

    if (obj.test_purchase_date) {
        return "purchase";
    }

    // 3. Если ничего нет — начальный статус
    return "target";
}

// СТАТУС ЗАВЕРШЕНИЯ

const COMPLETION_STATUS = new Set([
    "settlement",
    "withdrawal_of_claim",
    "cease_traiding",
    "executed",
    "original",
    "execution_not_possible"
]);

// MANUAL STATUS TYPE
const MANUAL_STATUSES = new Set([
    "settlement",
    "withdrawal_of_claim",
    "cease_traiding",
    "suspended",
    "executed",
    "original",
    "execution_not_possible"
]);

// СТАТУС ЗАВЕРШЕНИЯ ДЛЯ ИСТОРИИ

function HISTORY_TRANSLATE_STATUS(status) {

    const map = {
        settlement: "Мировое соглашение",
        withdrawal_of_claim: "Отказ от иска",
        cease_traiding: "Покинул рынок",
        executed: "Исполнено",
        original: "Оригинал",
        execution_not_possible: "Исполнение не возможно"
    };

    return map[status];
}

/* ==============================
    УДАЛИТЬ КЕЙС
=============================== */
$(document).on("click", "#delete-case", async function () {
    const itn = $("#detales-form").data("itn");

    if (!itn) {
        showError("Не удалось определить ITN кейса");
        return;
    }

    const confirmation = await showConfirmAction("Внимание!", "Кейс будет удалён без возможности восстановления.", "Удалить")

    if (!confirmation.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`/task/delete/${encodeURIComponent(itn)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(
                result.message || "Не удалось удалить кейс"
            );
        }

        await showSuccess("Кейс успешно удалён!");

        // Возвращаемся на главную после закрытия сообщения
        window.location.href = "/";

    } catch (error) {
        console.error("Ошибка удаления кейса:", error);
        showError(error.message || "Ошибка при удалении кейса");
    }
});

/*=================================
    ПЕРЕЗАПУСК КЕЙСА
===================================*/
$(document).on("click", "#reopen-case", async function () {

    const itn = $("#detales-form").data("itn");

    if (!itn) {
        showError("Не удалось определить ITN кейса");
        return;
    }

    const $button = $(this);
    $button.prop("disabled", true);

    try {

        // 1. Получаем актуальные данные кейса

        let response = await fetch(
            `/task/byitn/${encodeURIComponent(itn)}`
        );

        if (!response.ok) {
            throw new Error("Не удалось загрузить данные кейса");
        }

        const task = await response.json();

        // 2. Проверяем статус завершения

        if (!COMPLETION_STATUS.has(task.status_to_date)) {
            showError("Кейс должен быть завершён перед перезапуском.");
            return;
        }

        // 3. Подтверждение пользователя

        const confirmation = await showConfirmAction("Перезапустить кейс?", "Данные текущего кейса будут очищены, а сведения о нём сохранены в историю.", "Перезапустить");

        if (!confirmation.isConfirmed) return;

        // 4. Формируем запись истории

        const lastAction = getLastAction(task);

        const historyArr = [...(task.history || [])];

        const toHistory = {
            h_creation_date: task.creation_date,
            h_last_status: lastAction.last_status,
            h_last_action: lastAction.last_action,
            h_last_action_date: lastAction.last_action_date,
            h_link_store: task.link_store,
            h_products: task.products,
            h_complete_status: task.status_to_date,
            h_case_complete_date: task.case_complete_date
        };

        historyArr.push(toHistory);

        // 5. Обновляем данные кейса

        const newDate = getLocalDate();

        const taskToUpdate = {
            ...task,

            history: historyArr,

            creation_date: newDate,
            quarter: getQuarter(newDate),

            // Очищаем предыдущий цикл
            test_purchase_date: null,
            test_purchases: null,
            cd_letter_date: null,
            lawsuit_date: null,
            lawsuit_decision_date: null,
            appeal_date: null,
            appeal_decision_date: null,
            execution_date: null,

            comment: null,

            case_complete_date: null,
            status_to_date: "target",
            case_in_progress: true,

            control: false,
            completed: false,

            executant: "APCC"
        };

        // Не передаём системные поля
        delete taskToUpdate._id;
        delete taskToUpdate.itn;

        // 6. Сохраняем изменения

        response = await fetch(
            `/update/${encodeURIComponent(itn)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskToUpdate)
            }
        );

        if (!response.ok) {
            throw new Error("Не удалось перезапустить кейс");
        }

        // 7. Уведомление и переход

        await showSuccess("Кейс успешно перезапущен!");

        window.location.href = "/";

    } catch (error) {

        console.error("Ошибка перезапуска кейса:", error);

        showError(error.message || "Ошибка при перезапуске кейса");

    } finally {

        $button.prop("disabled", false);

    }

});

function getLocalDate() {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
}

function getQuarter(dateStr) {

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
