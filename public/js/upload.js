// Выгрузить данные из базы в таблицу
$(document).on("submit", "#get-data-form", async function (e) {
    e.preventDefault();

    const getBy = $('#get-data-form input[name="getBy"]:checked').val();

    const fields = $('#get-data-form input[type="checkbox"]:checked')
        .map(function () {
            return this.name;
        })
        .get();

    if (!getBy) {
        showError("Выберите тип кейсов");
        return;
    }

    if (fields.length === 0) {
        showError("Выберите хотя бы одно поле");
        return;
    }

    // Добавляем обязательные поля и убираем дубликаты
    if (getBy === "opened_cases") {
        fields.push("status_to_date");
    } else if (getBy === "closed_cases" || getBy === "all_cases") {
        fields.push("status_to_date", "case_complete_date");
    }

    const uniqueFields = [...new Set(fields)];

    // Локальная дата, без преобразования в UTC
    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    const suffix = {
        opened_cases: "progress",
        closed_cases: "closed",
        all_cases: "all"
    }[getBy];

    const fileName = `cases_${suffix}_${today}.xlsx`;

    const $form = $(this);
    const $submitButton = $form.find('[type="submit"]');

    $submitButton.prop("disabled", true);

    try {
        const response = await fetch("/export", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                getBy,
                fields: uniqueFields
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(
                error?.message || `Ошибка выгрузки: HTTP ${response.status}`
            );
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Освобождаем URL после начала скачивания
        setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
        console.error("Ошибка выгрузки:", error);
        showError(error.message || "Не удалось выгрузить данные");
    } finally {
        $submitButton.prop("disabled", false);
    }

});
