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

        // Распределить данные task по полям формы
        console.log(task);

        container = $(".test-purchase-container");
        template = container.find(".test-purchase-item.template");

        // Удаляем ранее загруженные товары, сохраняя шаблон
        container.find(".test-purchase-item:not(.template)").remove();

        //update status line
        updateStatusLine(task.status_to_date);

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

        if (purchases) {
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

                    item.find(".clear-field-btn").addClass("invisible");

                } else {
                    item.addClass("removable");
                }

                container.append(item);
            });
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
                item.find('[class="h-creation-date"]').text(formatDate(history.h_creation_date));
                item.find('[id="h-last-status"]').text(history.h_last_status);
                item.find('[id="h-last-action"]').text(history.h_last_action);
                item.find('[id="h-last-action-date"]').text(formatDate(history.h_last_action_date));
                item.find('[id="h-products"]').text(history.h_products);
                item.find('[id="h-link-store"]').val(history.h_link_store);
                item.find('[id="h-complete-status"]').text(history.h_complete_status);
                item.find('[class="h-case-complete-date"]').text(formatDate(history.h_case_complete_date));
                container.append(item);
            });
        }

    } catch (error) {
        console.error("Ошибка загрузки деталей:", error);
    }
}

// Установить текущий статус для Status Line

function updateStatusLine(status) {

    const currentIndex = STATUS_STEPS.indexOf(status);

    if (currentIndex === -1) {
        console.warn(`Unknown status: ${status}`);
        return;
    }

    STATUS_STEPS.forEach((step, index) => {

        const stepLine = $(`#${step}-step-line`);
        const stepCircle = $(`#${step}-step-circle`);

        if (index <= currentIndex) {
            stepLine.addClass("active");
            stepCircle.addClass("active");
        }
    });
}

// СТАТУСЫ ДЛЯ STATUS LINE

const STATUS_STEPS = [
    "target",
    "purchase",
    "letter",
    "lawsuit",
    "appeal",
    "execution"
];

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
    const $items = $container.find(".test-purchase-item.removable");

    if ($items.length > 0) {
        $items.last().remove();
    }
});
