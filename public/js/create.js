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

    if (!products.length) {
        alert('Добавьте хотя бы один корректный продукт');
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
        showError($("#itn"), "Поле ИНН пустое или неверное");
        return;
    }

    // 2. Проверка ОГРН
    if (!formData.psrn || !psrnCheck(formData.psrn)) {
        showError($("#psrn"), "Поле ОГРН пустое или неверное");
        return;
    }

    //3. проверить есть ли такая запись в базе 
    const checkResponse = await fetch(`/task/byitn/${formData.itn}`);

    if (checkResponse.status === 200) {
        showError($("#itn"), "Такой ИНН уже существует");
        return;
    }

    formData.control = formData.control === 'on';

    //сохранить в базе
    const response = await fetch("/task/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    });

    const result = await response.json();
    console.log(result);
    alert("Task created!");


    // ⬇ после закрытия alert — загрузить основную страницу
    loader.loadPage("./pages/main.html").then(html => {
        $(".main-content").html(html);

        // сброс выделения
        $(".nav-item").removeClass("active");

        // выделяем "Текущее"
        $('a[data-page="main"]').addClass("active");

        getAllCasesInProgress();
    });
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

// Загрузить данные по селлеру

$(document).on('click', '#check-btn', async function () {

    const itn = $('#itn').val().trim();
    const psrn = $('#psrn').val().trim();

    const ident = itn || psrn;

    if (!ident) {
        alert("Введите ИНН или ОГРН/ОГРНИП");
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

        console.log(result);

        $('#seller_name').val(result.name);
        $('#itn').val(result.itn);
        $('#region').val(result.region_address);
        $('#address').val(result.region_address);

    } catch (error) {

        console.error(error);
        alert(error.message);
    }
});