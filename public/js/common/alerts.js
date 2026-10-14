// question icon
function showQuestion(message) {
    Swal.fire({
        text: message,
        icon: "question"
    });
}

// warning icon
function showWarning(message) {
    Swal.fire({
        text: message,
        icon: "warning"
    });
}

// error icon 
function showError(message) {
    Swal.fire({
        text: message,
        icon: "error"
    });
}

//success icon with confirm
function showSuccess(message) {
    return Swal.fire({
        icon: "success",
        text: message,
        confirmButtonText: "ОК",
        allowOutsideClick: false,
        allowEscapeKey: false
    });
}

