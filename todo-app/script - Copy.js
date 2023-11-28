//01 todos von API laden und ausgeben
// => fetch auf die API
// => inhalt der API in den state schreiben
// => daten müssen gerendert werden

//02 update todos
// wenn nutzer auf todo klickt, soll es abgehakt werden und umgekehrt
// => fetch auf die API
// => datensatz in der API updaten
// => state aktualisieren
// => daten müssen wieder gerendert werden

//03 remove todos
// => wenn nutzer ein todo anklickt und den remove button drückt, wird dieses gelöscht
// => fetch auf die API
// => datensatz in der API löschen
// => state aktualisieren
// => daten müssen wieder gerendert werden

const addToDoButton = document.querySelector("#addButton"); //= add button für neues todo
const toDoList = document.querySelector("#List");
const firstToDo = document.querySelector("#firstToDo");
const newTodo = document.querySelector("#newToDo"); //= input
const radioBtn = document.querySelector("#filterListe");
const all = document.querySelector("#all");
const done = document.querySelector("#done");
const open = document.querySelector("#open");
const removeButton = document.querySelector("#removeButton");
let filter = "all";
let state = [];

addToDoButton.addEventListener("click", addToDoItem);
radioBtn.addEventListener("change", filterTodos);
removeButton.addEventListener("click", removeToDoItem);
getToDos();

function getToDos() {
  fetch("http://localhost:4730/todos")
    .then((response) => response.json())
    .then((jsonData) => {
      state = jsonData;

      renderToDos();
    });
}

function addToDoItem(event) {
  event.preventDefault(); //nötig, damit die seite beim drücken des buttons nicht neu lädt
  const todoObj = { description: newTodo.value, done: false };
  if (checkDuplicates()) {
    addToDoAPI(todoObj);
  }

  newTodo.value = ""; //todo aus dem input-feld löschen, placeholder wieder sichtbar
}

function addToDoAPI(todoObj) {
  fetch("http://localhost:4730/todos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(todoObj),
  })
    .then((response) => response.json())
    .then((jsonData) => {
      getToDos(); //state synchronisieren
    });
}

function updateToDoAPI(updatedObj) {
  //todos werden geupdated wenn sie abgehakt werden
  const todoID = updatedObj.id;
  fetch("http://localhost:4730/todos/" + todoID, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(updatedObj),
  })
    .then((response) => response.json())
    .then((jsonData) => {
      console.log(jsonData);
      // getToDos(); //state synchronisieren
      renderToDos();
    });
}

function renderToDos() {
  //function damit bestehender inhalt der liste geladen und angezeigt wird bevor neues todo hinzugefügt wird
  toDoList.innerText = ""; //löscht alte liste, zeigt neue liste mit todo +1 an
  for (let toDo of state) {
    let toDoItem = document.createElement("li");
    let inputItem = document.createElement("input");
    inputItem.type = "checkbox";
    inputItem.checked = toDo.done; //gibt geschafft/nicht geschafft-state aus nach seiten-reload
    inputItem.objInhaltCheckBox = toDo; //listeneintrag an checkbox gehängt || hänge bestehendes obj an die checkbox - ändert sich das objekt, dann auch das ursprungsobjekt
    toDoItem.appendChild(inputItem);
    let toDoText = document.createTextNode(toDo.description); //createTextNode erstellt einen Container für Text im HTML und füllt ihn mit dem Inhalt der in die Funktion übergebenen itemTextVariablen
    console.log(toDo);
    toDoItem.appendChild(toDoText);
    toDoList.appendChild(toDoItem);

    //abgehakte todos auch beim rendern durchgestrichen lassen
    if (toDo.done) {
      toDoItem.style = "text-decoration: line-through;";
    } else {
      toDoItem.style = "text-decoration: none;";
    }

    //gehört zum filtern
    if (filter === "open") {
      toDoItem.hidden = toDo.done; //wenn filter open => setzt die completeten todos auf unsichtbar
    } else if (filter === "done") {
      toDoItem.hidden = !toDo.done; //wenn filter done => toDo.completed nigieren, um das gegenteil zu erreichen
    } else {
      toDoItem.hidden = false; //hidden auf false, alles muss gezeigt werden
    }

    inputItem.addEventListener("change", checkedToDos); //jedes erstellte To-Do braucht ein event => viele To-Dos, viele Events => muss an dieser stelle im code nur 1x geschrieben werden
  }
}

function checkedToDos(event) {
  const updatedObj = event.target.objInhaltCheckBox; //obj
  updatedObj.done = !updatedObj.done;
  // console.log(event.target.objInhaltCheckBox);
  updateToDoAPI(updatedObj);
}

function checkDuplicates() {
  for (let i = 0; i < state.length; i++) {
    if (newTodo.value.toLowerCase() === state[i].description.toLowerCase()) {
      //inhalt von imput element === dem itemText im obj im array, dann false
      alert("No duplicates allowed");
      return false;
    }
  }
  return true;
}

//variable filter = "all" oben angelegt & radiobuttons einzeln über const variablen (open, done, all) geholt
function filterTodos(event) {
  if (event.target === open) {
    //wenn radiobutton mit id open geklickt, filter auf open setzen
    filter = "open";
  } else if (event.target === done) {
    filter = "done";
  } else {
    filter = "all";
  }
  renderToDos();
}

function removeToDoItem() {
  for (deletedToDo of state) {
    if (deletedToDo.done) {
      fetch("http://localhost:4730/todos/" + deletedToDo.id, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Network response was not OK");
          }
        })
        .then(getToDos())
        .catch((error) => {
          alert(error.message);
        });
    }
  }
  renderToDos();
}
