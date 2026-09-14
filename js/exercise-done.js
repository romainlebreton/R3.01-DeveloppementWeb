// Replie le contenu de l'exercice quand la case "Fait" est cochée et mémorise l'état.
// La clé de stockage est basée sur le hash du contenu (et non sur la position de
// l'exercice dans la page), afin qu'insérer un nouvel exercice n'affecte pas l'état
// "fait" des exercices existants.
function toggleExercise(checkbox) {
    var exercise = checkbox.closest(".exercise");
    exercise.classList.toggle("exercise-done", checkbox.checked);
    var content = exercise.querySelector(".exercise-content");
    var key = exerciseKey(content);
    if (checkbox.checked) {
        localStorage.setItem(key, "1");
    } else {
        localStorage.removeItem(key);
    }
}

function exerciseKey(content) {
    return "exercise-done:" + location.pathname + ":" + hashContent(content.textContent);
}

// Calcule un hash simple (non cryptographique) d'une chaîne de caractères,
// utilisé pour identifier un exercice par son contenu
function hashContent(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return String(hash);
}

// Transforme les exercices simples (sans case à cocher) en exercices
// avec label "Fait" et contenu repliable
function wrapExercises() {
    document.querySelectorAll(".exercise").forEach(function (exercise) {
        var content = document.createElement("div");
        content.className = "exercise-content";
        while (exercise.firstChild) {
            content.appendChild(exercise.firstChild);
        }

        var label = document.createElement("label");
        label.className = "exercise-toggle";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "exercise-checkbox";

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" Fait"));

        exercise.appendChild(label);
        exercise.appendChild(content);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    wrapExercises();
    document.querySelectorAll(".exercise-checkbox").forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
            toggleExercise(checkbox);
        });
        var exercise = checkbox.closest(".exercise");
        var content = exercise.querySelector(".exercise-content");
        if (localStorage.getItem(exerciseKey(content)) === "1") {
            checkbox.checked = true;
            exercise.classList.add("exercise-done");
        }
    });
});