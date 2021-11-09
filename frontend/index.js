import "./assets/css/style.css";

const app = document.getElementById("app");

app.innerHTML = `
  <div class="todos">
    <div class="todos-header">
      <h3 class="todos-title">Todo List</h3>
      <div>
        <p>You have <span class="todos-count"></span> items</p>
        <button type="button" class="todos-clear" style="display: none;">
          Clear Completed
        </button>
      </div>
    </div>
    <form class="todos-form" name="todos">
      <input type="text" placeholder="What's next?" name="todo">
    </form>
    <ul class="todos-list"></ul>
  </div>
`;

// state
let todosLocalCache = JSON.parse(localStorage.getItem("todos")) || [];

// selectors
const root = document.querySelector(".todos");
const list = root.querySelector(".todos-list");
const count = root.querySelector(".todos-count");
const clear = root.querySelector(".todos-clear");
const form = document.forms.todos;
const input = form.elements.todo;

// functions
const api = (() => {
  function makeApiRequest(path, method, bodyObject) {
    return fetch("https://todo-list-nestjs-api.herokuapp.com/" + path, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyObject)
    });
  }
  return {
    create: todo => makeApiRequest("todo", "POST", todo),
    findAll: () => makeApiRequest("todo", "GET"),
    findOne: todo => makeApiRequest("todo/" + todo.id, "GET"),
    update: todo => makeApiRequest("todo/" + todo.id, "PUT", todo),
    remove: id => makeApiRequest("todo/" + id, "DELETE")
  };
})();

function renderTodos(todos) {
  todosLocalCache = todos;
  console.log({ todosLocalCache });
  let todoString = "";
  todos.forEach(todo => {
    todoString += `
      <li data-id="${todo.id}"${todo.complete ? ' class="todos-complete"' : ""}>
        <input type="checkbox"${todo.complete ? " checked" : ""}>
        <span>${todo.label}</span>
        <button type="button"></button>
      </li>
    `;
  });
  list.innerHTML = todoString;
  count.innerText = todos.filter(todo => !todo.complete).length;
  clear.style.display = todos.filter(todo => todo.complete).length
    ? "block"
    : "none";
}

function addTodo(event) {
  event.preventDefault();

  const todo = {
    label: input.value.trim(),
    complete: false
  };

  api
    .create(todo)
    .then(() => api.findAll())
    .then(response => response.json())
    .then(todos => {
      renderTodos(todos);
      input.value = "";
    });
}

function updateTodo(event) {
  const id = parseInt(event.target.parentNode.getAttribute("data-id"), 10);
  const cachedTodo = todosLocalCache.find(t => t.id === id);
  const updatedTodo = {
    ...cachedTodo,
    complete: event.target.checked
  };

  console.log({
    updatedTodo,
    todosLocalCache,
    id,
    cachedTodo
  });

  api
    .update(updatedTodo)
    .then(() => api.findAll())
    .then(response => response.json())
    .then(todos => {
      renderTodos(todos);
      input.value = "";
    });
}

function editTodo(event) {
  if (event.target.nodeName.toLowerCase() !== "span") {
    return;
  }
  const id = parseInt(event.target.parentNode.getAttribute("data-id"), 10);
  const cachedTodo = todosLocalCache.find(t => t.id === id);

  const input = document.createElement("input");
  input.type = "text";
  input.value = cachedTodo.label;

  function handleEdit(event) {
    event.stopPropagation();
    const label = this.value;
    if (label !== cachedTodo.label) {
      const updatedTodo = {
        ...cachedTodo,
        label
      };

      console.log({
        updatedTodo,
        todosLocalCache,
        label,
        cachedTodo
      });

      api
        .update(updatedTodo)
        .then(() => api.findAll())
        .then(response => response.json())
        .then(todos => {
          renderTodos(todos);

          // clean up
          event.target.style.display = "";
          this.removeEventListener("change", handleEdit);
          this.remove();
        });
    }
  }

  event.target.style.display = "none";
  event.target.parentNode.append(input);
  input.addEventListener("change", handleEdit);
  input.focus();
}

function deleteTodo(event) {
  if (event.target.nodeName.toLowerCase() !== "button") {
    return;
  }
  const id = parseInt(event.target.parentNode.getAttribute("data-id"), 10);
  const label = event.target.previousElementSibling.innerText;
  if (window.confirm(`Delete ${label}?`)) {
    api
      .remove(id)
      .then(() => api.findAll())
      .then(response => response.json())
      .then(todos => renderTodos(todos));
  }
}

function clearCompleteTodos() {
  const count = todosLocalCache.filter(todo => todo.complete).length;
  if (count === 0) {
    return;
  }
  if (window.confirm(`Delete ${count} todos?`)) {
    const completedTodos = todosLocalCache.filter(todo => todo.complete);
    Promise.all(completedTodos.map(t => api.remove(t.id)))
      .then(() => api.findAll())
      .then(response => response.json())
      .then(todos => renderTodos(todos));
  }
}

// init
function init() {
  api
    .findAll()
    .then(response => response.json())
    .then(todos => renderTodos(todos));

  // Add Todo
  form.addEventListener("submit", addTodo);
  // Update Todo
  list.addEventListener("change", updateTodo);
  // Edit Todo
  list.addEventListener("dblclick", editTodo);
  // Delete Todo
  list.addEventListener("click", deleteTodo);
  // Complete All Todos
  clear.addEventListener("click", clearCompleteTodos);
}

init();
