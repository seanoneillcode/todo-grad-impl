var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var itemLabel = document.createElement("div");
            itemLabel.textContent = todo.title;
            itemLabel.className = "item-label";
            var deleteButton = document.createElement("button");
            deleteButton.textContent = "delete";
            deleteButton.onclick = function() {
                deleteTodo(todo);
            };
            var updateButton = document.createElement("button");
            updateButton.textContent = "update";
            updateButton.onclick = function() {
                updateTodo(todo);
            };
            listItem.appendChild(deleteButton);
            listItem.appendChild(updateButton);
            listItem.appendChild(itemLabel);
            todoList.appendChild(listItem);
        });
    });
}

function updateTodo(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        id: todo.id,
        title: todo.title
    }));
    createRequest.onload = function() {
        if (this.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to update item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function deleteTodo(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + todo.id);
    createRequest.onload = function() {
        if (this.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to delete todo. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

reloadTodoList();
