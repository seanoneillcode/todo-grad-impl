var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var count = document.getElementById("count-label");
var deleteCompletedButton = document.getElementById("delete-completed");
var todos = [];
var markedForDelete = [];

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

function deleteCompleted() {
    if (markedForDelete.length === 0) {
        reloadTodoList();
    } else {
        deleteTodo(markedForDelete.pop(), deleteCompleted);
    }
}

deleteCompletedButton.onclick = function() {
    markedForDelete = _.filter(todos, function(t) {
            return t.isComplete;
    });
    deleteCompleted(markedForDelete);
};

function refreshTodoElements() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "none";
    var uncompleteCount = 0;
    todos.forEach(function(todo) {
        todoList.appendChild(createTodoElement(todo));
        if (!todo.isComplete) {
            uncompleteCount++;
        }
    });
    count.textContent = "Items left to complete : " + uncompleteCount;
    deleteCompletedButton.className = uncompleteCount === todos.length ? "hidden" : "";
}

function reloadTodoList() {
    var self = this;
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        console.log("got back " + todos.length + " todos");
        self.todos = todos;
        refreshTodoElements();
    });
}

function createTodoElement(todo) {
    var listItem = document.createElement("li");
    var itemLabel = document.createElement("input");
    itemLabel.type = "text";
    itemLabel.style = "display:none";
    itemLabel.value = todo.title;
    itemLabel.className = todo.isComplete ? "item-label item-complete" : "item-label";
    itemLabel.onkeydown = function(event) {
        if (event.keyCode === 13) {
            todo.title = itemLabel.value;
            updateTodo(todo, reloadTodoList);
        }
    };
    itemLabel.onblur = function(event) {
        todo.title = itemLabel.value;
        updateTodo(todo, reloadTodoList);
    };
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "delete";
    deleteButton.onclick = function() {
        deleteTodo(todo, reloadTodoList);
    };
    var completeButton = document.createElement("button");
    completeButton.textContent = "complete";
    completeButton.onclick = function() {
        todo.isComplete = !todo.isComplete;
        updateTodo(todo, reloadTodoList);
    };
    listItem.appendChild(completeButton);
    listItem.appendChild(deleteButton);
    listItem.appendChild(itemLabel);
    return listItem;
}

function updateTodo(todo, success) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    console.log(todo);
    createRequest.send(JSON.stringify(todo));
    createRequest.onload = function() {
        if (this.status === 200) {
            success();
        } else {
            error.textContent = "Failed to update item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function deleteTodo(todo, success) {
    console.log(todo);
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + todo.id);
    createRequest.onload = function() {
        if (this.status === 200) {
            success();
        } else {
            error.textContent = "Failed to delete todo. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

reloadTodoList();
