$(document).on("submit", "#create-target", async function (e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(this));
    delete formData.product;
    delete formData.product_price;
    delete formData.product_link;

    const products = [];

    $('.test-purchase-container .test-purchase-item').each(function () {

        const product = $(this).find('[name="product"]').val();
        const price = $(this).find('[name="product_price"]').val();
        const link = $(this).find('[name="product_link"]').val();

        if (product && product !== "0") {
            products.push({
                product,
                product_price: Number(price),
                product_link: link
            });
        }
    });

    //Проверить имя на пустое поле 
    if(!formData.seller_name){
        showQuestion("Введите имя селлера");
        return;
    }

    if (!products.length) {
        showWarning("Добавьте хотя бы один продукт в закупку");
        return;
    }

    formData.test_purchases = products;
    formData.status_to_date = 'target';
    formData.case_in_progress = true;

    // проверить установлена ли дата 
    const $dateInput = $("#creation-date");

    if (!$dateInput.val()) {
        formData.creation_date = getLocalDate();
    }

    // 1. Проверка ИНН

    if (!formData.itn || !itnCheck(formData.itn)) {
        showWarning("Поле ИНН пустое или неверное");
        return;
    }


    // 2. Проверка ОГРН
    if (!formData.psrn || !psrnCheck(formData.psrn)) {
        showWarning("Поле ОГРН пустое или неверное");
        return;
    }

    //3. проверить есть ли такая запись в базе 
    const checkResponse = await fetch(`/task/byitn/${formData.itn}`);

    if (checkResponse.status === 200) {
        showError("Такой ИНН уже существует");
        return;
    }

    formData.control = formData.control === 'on';

    //сохранить в базе
    try {
        //сохранить в базе
        const response = await fetch("/task/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Не удалось создать задачу");
        }

        await showSuccess("Задача успешно создана!");

        // Переходим на страницу списка задач
        window.location.href = "/";

    } catch (error) {
        console.error("Ошибка создания задачи:", error);
        showError("Ошибка при создании задачи");
    }

});

// проверить валидность инн
function itnCheck(itn) {
    if (!/^\d+$/.test(itn)) return false;

    if (itn.length === 10) {
        const coeff = [2, 4, 10, 3, 5, 9, 4, 6, 8];
        const n10 = coeff.reduce((sum, k, i) => sum + k * itn[i], 0) % 11 % 10;
        return n10 === Number(itn[9]);
    }

    if (itn.length === 12) {
        const coeff1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
        const coeff2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

        const n11 = coeff1.reduce((sum, k, i) => sum + k * itn[i], 0) % 11 % 10;
        const n12 = coeff2.reduce((sum, k, i) => sum + k * itn[i], 0) % 11 % 10;

        return n11 === Number(itn[10]) && n12 === Number(itn[11]);
    }

    return false;
}

//проверить валидность огрн / огрнип

function psrnCheck(psrn) {
    if (!/^\d+$/.test(psrn)) return false;

    if (psrn.length === 13) {
        const n13 = Number(psrn.slice(0, 12)) % 11 % 10;
        return n13 === Number(psrn[12]);
    }

    if (psrn.length === 15) {
        const n15 = Number(psrn.slice(0, 14)) % 13 % 10;
        return n15 === Number(psrn[14]);
    }

    return false;
}

// Получить текущую дату 

function getLocalDate() {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
}

/*=====================================
    ЗАГРУЗИТЬ ДАННЫЕ ПО СЕЛЛЕРУ
======================================*/

$(document).on('click', '#check-btn', async function () {

    const itn = $('#itn').val().trim();
    const psrn = $('#psrn').val().trim();

    const ident = itn || psrn;

    if (!ident) {
        showQuestion("Введите ИНН или ОГРН/ОГРНИП");
        return;
    }

    try {

        const response = await fetch(`/task/check/${ident}`, {
            method: 'GET'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        $('#seller_name').val(result.name);
        $('#itn').val(result.itn);
        $('#region').val(result.region_address);
        $('#address').val(result.region_address);

    } catch (error) {

        console.error(error);
        showError("Ошибка сохранения")
    }
});

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

    const purchaseIndex = $container.find(".test-purchase-item").length + 1;

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
        showQuestion("Ссылка не указана");
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

    const $item = $(this).closest(".test-purchase-item");
    const link = $item.find("#product-link").val().trim();

    if (!link) {
        showQuestion("Ссылка на товар не указана");
        return;
    }

    window.open(link, "_blank");
});
