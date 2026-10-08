/*************************/
/*** ОСНОВНАЯ СТРАНИЦА ***/
/*************************/

/*  Получить всех селлеров если case_in_progress == true и рапраделить по таблицам */
document.addEventListener("DOMContentLoaded", () => {
    getAllCasesInProgress();

    setInterval(() => {
        getAllCasesInProgress();
    }, 30000);
    
});

async function getAllCasesInProgress() {
    const response = await fetch("/progress");
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    const targets = await response.json();
    renderTargets(targets);
}

async function renderTargets(targets) {
   
    const tbodyTargets = $("#targets-table");
    const tbodyPurchase = $("#purchase-table");
    const tbodyLetter = $("#letter-table");
    const tbodyLawsuit = $("#lawsuit-table");
    const tbodyAppeal = $("#appeal-table");
    const tbodyExecution = $("#execution-table");
    const tbodySuspended = $('#suspended-table');

    tbodyTargets.empty();
    tbodyPurchase.empty();
    tbodyLetter.empty();
    tbodyLawsuit.empty();
    tbodyAppeal.empty();
    tbodyExecution.empty();
    tbodySuspended.empty();

    // отдельные счетчики
    let idxTarget = 0;
    let idxPurchase = 0;
    let idxLetter = 0;
    let idxLawsuit = 0;
    let idxAppeal = 0;
    let idxExecution = 0;
    let idxSuspended = 0;

    targets.forEach((t) => {

        //цель

        if (t.status_to_date == "target") {
            idxTarget++;
            $(".target-container").removeClass('invisible');
            const tr = $(`
                <tr class="tr-hover" data-id="${t.itn}" title="${t.comment || ''}">
                    <td class="td-w4" data-title="num">${idxTarget}</td>
                    <td class="td-w12" data-title="create">${formatDate(t.creation_date)}</td>
                    <td class="td-w12" data-title="itn" data-type="currency">${t.itn}</td>
                    <td class="td-w12" data-title="psrn" data-type="currency">${t.psrn}</td>
                    <td data-title="name" data-type="currency">${t.seller_name}</td>
                    <td class="td-w4" data-title="platform" data-type="currency">${t.platform || '--'}</td>
                    <td class="td-w12" data-title="status" data-type="currency">--</td>
                    <td class="td-w12" data-title="date" data-type="currency">--</td>
                    <td data-title="executant" data-type="currency">${t.executant}</td>
                    <td class="control-cell" data-title="control" data-type="currency">
                        ${t.control === true ? '<img src="images/label-important.svg">' : ''}
                    </td>
                    <td class="completed-cell" data-title="completed" data-type="currency">
                        ${t.completed === true ? '<img src="images/purchase-check.svg">' : ''}
                    </td>
                </tr>`);
            tbodyTargets.append(tr);

            tr.on("click", () => {
                loadDetailsPage(t.itn);
            });

            tr.find(".control-cell").on("click", async function (e) {
                e.stopPropagation();

                const newControl = !t.control;
                const newCompleted = false;

                const response = await fetch(`/task/mark/${t.itn}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        control: newControl,
                        completed: newCompleted
                    })
                });

                if (!response.ok) {
                    alert("Ошибка сохранения");
                    return;
                }

                // обновляем объект
                t.control = newControl;
                t.completed = newCompleted;

                // обновляем обе ячейки
                tr.find(".control-cell").html(
                    t.control
                        ? '<img src="images/label-important.svg">'
                        : ''
                );

                tr.find(".completed-cell").html('');
            });


            tr.find(".completed-cell").on("click", async function (e) {
                e.stopPropagation();

                const newCompleted = !t.completed;
                const newControl = false;

                const response = await fetch(`/task/completed/${t.itn}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        control: newControl,
                        completed: newCompleted
                    })
                });

                if (!response.ok) {
                    alert("Ошибка сохранения");
                    return;
                }

                // обновляем объект
                t.completed = newCompleted;
                t.control = newControl;

                // обновляем обе ячейки
                tr.find(".completed-cell").html(
                    t.completed
                        ? '<img src="images/purchase-check.svg">'
                        : ''
                );

                tr.find(".control-cell").html('');
            });
        }

        //закупка

        if (t.status_to_date == "purchase") {
            idxPurchase++;
            let lastAction = getLastAction(t);
            $(".test-purchase-container").removeClass("invisible");
            const tr = $(`
                <tr class="tr-hover" data-id="${t.itn}">
                    <td class="td-w4" data-title="num">${idxPurchase}</td>
                    <td class="td-w12" data-title="create">${formatDate(t.creation_date)}</td>
                    <td class="td-w12" data-title="itn" data-type="currency">${t.itn}</td>
                    <td class="td-w12" data-title="psrn" data-type="currency">${t.psrn}</td>
                    <td data-title="name" data-type="currency">${t.seller_name}</td>
                    <td class="td-w4" data-title="platform" data-type="currency">${t.platform || "--"}</td>
                    <td class="td-w12" data-title="status" data-type="currency">${lastAction.last_action}</td>
                    <td class="td-w12" data-title="date" data-type="currency">${formatDate(lastAction.last_action_date)}</td>
                    <td data-title="executant" data-type="currency">${t.executant}</td>
                </tr>`);
            tbodyPurchase.append(tr);

            tr.on("click", () => {
                loadDetailsPage(t.itn);
            });
        }

        //претензия

        if (t.status_to_date == "letter") {
            idxLetter++;
            let lastAction = getLastAction(t);
            $(".letter-container").removeClass("invisible");
            const tr = $(`
                <tr class="tr-hover" data-id="${t.itn}">
                    <td class="td-w4" data-title="num">${idxLetter}</td>
                    <td class="td-w12" data-title="create">${formatDate(t.creation_date)}</td>
                    <td class="td-w12" data-title="itn" data-type="currency">${t.itn}</td>
                    <td class="td-w12" data-title="psrn" data-type="currency">${t.psrn}</td>
                    <td data-title="name" data-type="currency">${t.seller_name}</td>
                    <td class="td-w4" data-title="platform" data-type="currency">${t.platform || "--"}</td>
                    <td class="td-w12" data-title="status" data-type="currency">${lastAction.last_action}</td>
                    <td class="td-w12" data-title="date" data-type="currency">${formatDate(lastAction.last_action_date)}</td>
                    <td data-title="executant" data-type="currency">${t.executant}</td>
                </tr>`);
            tbodyLetter.append(tr);
            tr.on("click", () => {
                loadDetailsPage(t.itn);
            });
        }

        //арбитраж

        if (t.status_to_date == "lawsuit") {
            idxLawsuit++;
            let lastAction = getLastAction(t);
            $(".lawsuit-container").removeClass("invisible");
            const tr = $(`
                <tr class="tr-hover" data-id="${t.itn}">
                    <td class="td-w4" data-title="num">${idxLawsuit}</td>
                    <td class="td-w12" data-title="create">${formatDate(t.creation_date)}</td>
                    <td class="td-w12" data-title="itn" data-type="currency">${t.itn}</td>
                    <td class="td-w12" data-title="psrn" data-type="currency">${t.psrn}</td>
                    <td data-title="name" data-type="currency">${t.seller_name}</td>
                    <td class="td-w4" data-title="platform" data-type="currency">${t.platform || "--"}</td>
                    <td class="td-w12" data-title="status" data-type="currency">${lastAction.last_action}</td>
                    <td class="td-w12" data-title="date" data-type="currency">${formatDate(lastAction.last_action_date)}</td>
                    <td data-title="executant" data-type="currency">${t.executant}</td>
                </tr>`);
            tbodyLawsuit.append(tr);
            tr.on("click", () => {
                loadDetailsPage(t.itn);
            });
        }

        //aпелляция

        if (t.status_to_date == "appeal") {
            idxAppeal++;
            let lastAction = getLastAction(t);
            $(".appeal-container").removeClass("invisible");
            const tr = $(`
                <tr class="tr-hover" data-id="${t.itn}">
                    <td class="td-w4" data-title="num">${idxAppeal}</td>
                    <td class="td-w12" data-title="create">${formatDate(t.creation_date)}</td>
                    <td class="td-w12" data-title="itn" data-type="currency">${t.itn}</td>
                    <td class="td-w12" data-title="psrn" data-type="currency">${t.psrn}</td>
                    <td data-title="name" data-type="currency">${t.seller_name}</td>
                    <td class="td-w4" data-title="platform" data-type="currency">${t.platform || "--"}</td>
                    <td class="td-w12" data-title="status" data-type="currency">${lastAction.last_action}</td>
                    <td class="td-w12" data-title="date" data-type="currency">${formatDate(lastAction.last_action_date)}</td>
                    <td data-title="executant" data-type="currency">${t.executant}</td>
                </tr>`);
            tbodyAppeal.append(tr);
            tr.on("click", () => {
                loadDetailsPage(t.itn);
            });
        }

        //исполнительное

        if (t.status_to_date == "execution") {
            idxExecution++;
            let lastAction = getLastAction(t);
            $(".execution-container").removeClass("invisible");
            const tr = $(`
                <tr class="tr-hover" data-id="${t.itn}">
                    <td class="td-w4" data-title="num">${idxExecution}</td>
                    <td class="td-w12" data-title="create">${formatDate(t.creation_date)}</td>
                    <td class="td-w12" data-title="itn" data-type="currency">${t.itn}</td>
                    <td class="td-w12" data-title="psrn" data-type="currency">${t.psrn}</td>
                    <td data-title="name" data-type="currency">${t.seller_name}</td>
                    <td class="td-w4" data-title="platform" data-type="currency">${t.platform || "--"}</td>
                    <td class="td-w12" data-title="status" data-type="currency">${lastAction.last_action}</td>
                    <td class="td-w12" data-title="date" data-type="currency">${formatDate(lastAction.last_action_date)}</td>
                    <td data-title="executant" data-type="currency">${t.executant}</td>
                </tr>`);
            tbodyExecution.append(tr);
            tr.on("click", () => {
                loadDetailsPage(t.itn);
            });
        }

        //приостановленные дела

        if (t.status_to_date == "suspended") {
            idxSuspended++;
            $(".suspended-container").removeClass("invisible");
            const tr = $(`
                <tr class="tr-hover" data-id="${t.itn}">
                    <td class="td-w4" data-title="num">${idxSuspended}</td>
                    <td class="td-w12" data-title="create">${t.creation_date}</td>
                    <td class="td-w12" data-title="itn" data-type="currency">${t.itn}</td>
                    <td class="td-w12" data-title="psrn" data-type="currency">${t.psrn}</td>
                    <td data-title="name" data-type="currency">${t.seller_name}</td>
                    <td class="td-w4" data-title="platform" data-type="currency">${t.platform || "--"}</td>
                    <td class="td-w12" data-title="status" data-type="currency">${getLastAction(t).last_status}</td>
                    <td class="td-w12" data-title="date" data-type="currency">${formatDate(getLastAction(t).last_action_date)}</td>
                    <td data-title="executant" data-type="currency">${t.executant}</td>
                </tr>`);
            tbodySuspended.append(tr);
            tr.on("click", () => {
                loadDetailsPage(t.itn);
            });
        }

    })
}

//получить последний статус и дату 
function getLastAction(obj) {

    if (obj.execution_date) return { last_status: "Исполнительное", last_action: "Лист получен", last_action_date: obj.execution_date };
    if (obj.appeal_decision_date) return { last_status: "Апелляция", last_action: "Определение", last_action_date: obj.appeal_decision_date };
    if (obj.appeal_date) return { last_status: "Апелляция", last_action: "Подана", last_action_date: obj.appeal_date };
    if (obj.lawsuit_decision_date) return { last_status: "Арбитраж", last_action: "Решение", last_action_date: obj.lawsuit_decision_date };
    if (obj.lawsuit_date) return { last_status: "Арбитраж", last_action: "Подан", last_action_date: obj.lawsuit_date };
    if (obj.cd_letter_date) return { last_status: "Претензия", last_action: "Направлена", last_action_date: obj.cd_letter_date };
    if (obj.test_purchase_date) return { last_status: "Закупка", last_action: "Закупка", last_action_date: obj.test_purchase_date };
    if (obj.creation_date) return { last_status: "Цель", last_action: "Цель", last_action_date: obj.creation_date }
}

//изменить формат даты
function formatDate(dateStr) {
    if (!dateStr) {
        return null;
    } else {
        const [year, month, day] = dateStr.split("-");
        return `${day}.${month}.${year}`;
    }
}


