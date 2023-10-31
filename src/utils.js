import { User } from "./models/User";
import { Task } from "./models/Task";
import { appState } from "./app";
import adminPageUsersTemplate from "./templates/adminPageUsers.html";
import taskFieldTemplate from "./templates/taskField.html";
import { fieldHTMLContent , getCurrentUser} from "./app";
import { dragAndDrop } from "./services/dragdrop";

const tasks = [];

export const getFromStorage = function(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export function setObject(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj))
}

export const addToStorage = function(obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function() {
  localStorage.clear();
  const adminUser = {name: "admin", password: "admin", role: "admin"};
  generateUser(User, adminUser);
  const testUser = {name: "test", password: "qwerty123"};
  generateUser(User, testUser);
}

export const generateUser = function(User, userData) {
  const user = new User(userData.name, userData.password, userData.role || "user");
  User.save(user);
}

export const generateTestTasks = function(userId) {
  tasks.forEach(task => {
    const newTask = new Task(userId, task.text);
    Task.save(newTask);
  });
}


export const addTaskBacklog = function() {
    const addTaskBtn = document.querySelector('.add-to-backlog');
    const submitBtn = document.querySelector('.submit-btn');
    
    function handleAddTaskBtnClick(){  
      appendTextArea();
      const taskTextBox = document.querySelector('.task-text-box');
      taskTextBox.scrollIntoView({behavior: 'smooth', block: 'end'});
      addTaskBtn.classList.add("d-none");
      submitBtn.classList.remove("d-none");
    }

    addTaskBtn && addTaskBtn.addEventListener('click', handleAddTaskBtnClick);
    addTaskBtn && addTaskBtn.removeEventListener('click', handleAddTaskBtnClick, true);
  
    function handleSubmitBtnClick(){  
      const taskTextBox = document.querySelector('.task-text-box');
      if (appState.currentUser && !!taskTextBox.value) {
        const task = new Task(appState.currentUser.id, taskTextBox.value);
        Task.save(task);
        appState.task = task;
        createTask(document.querySelector(".card-body"), task);
        dragAndDrop();
        appendDropDownMenuItems([task]);
        changeTaskStatus(appState.currentUserTasks);
        tasksCountByStatus(appState.currentUserTasks);
      }
      addTaskBtn.classList.remove("d-none");
      submitBtn.classList.add("d-none");
      removeTextArea();
    }

    submitBtn && submitBtn.addEventListener('click', handleSubmitBtnClick);
    submitBtn && submitBtn.removeEventListener('click', handleSubmitBtnClick, true);

};

function createTask(taskParentNode, taskObj) {
  const divBox = document.createElement('div');
  divBox.className = 'item';
  divBox.id = 'task' + taskObj.id;

  divBox.draggable = "true";
  ondragstart="drag(event)"; 
  divBox.innerHTML=  taskObj.text;
  taskParentNode.appendChild(divBox);

}

function appendTextArea() {
  const card = document.querySelector('.card-body');
  const taskTextBox = document.createElement('textarea');
  taskTextBox.classList.add('card-text', 'task-text-box');
  card.appendChild(taskTextBox);
}

function removeTextArea() {
  const card = document.querySelector('.card-body');
  const taskTextBox = document.querySelector('.task-text-box');
  card.removeChild(taskTextBox);
}

export const changeTaskStatus = function(tasks) {
  const cardDropdownMenu = document.querySelectorAll(".card-dropdown-menu");
  const dropdownButtons = document.querySelectorAll(".dropdown-btn");
  const taskStatuses = {11: "backlog", 12: "ready", 13: "in_progress", 14: "finished"};
  dropdownButtons.forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault();
      cardDropdownMenu.forEach(item => item.innerHTML = '');
      appendDropDownMenuItems(tasks);
      let dropdownItems = document.querySelectorAll(".card-dropdown-item");
      for (let i = 0; i < dropdownItems.length; i++) {
        dropdownItems[i].addEventListener("click", function(e1) {
          e1.preventDefault();
          let taskId = dropdownItems[i].parentNode.id.substr(2);
          tasks.forEach(task => {
            if (task.id === taskId) {
              task.statusId++;
              task.status = taskStatuses[task.statusId];
              let allTasks = appState.tasks;
              localStorage.removeItem("tasks");
              localStorage.setItem("tasks", JSON.stringify(allTasks));
              renderTasks(tasks);
              
            }
          });
        });
      }
    });
  });
}

export const renderTasks = function(tasks) {
  const cards = document.querySelectorAll('.card-body');
  if (tasks.length === 0) return;
    for (let i = 0; i < cards.length; i++) {
      cards[i].innerHTML = '';
      for (let j = 0; j < tasks.length; j++) { {
        if (tasks[j].statusId == i + 11) {
          createTask(cards[i], tasks[j])
        }
      }
    }
  }
  tasksCountByStatus(tasks);
};
  

const appendDropDownMenuItems = function(tasks) {
  const dropDownMenus = document.querySelectorAll('.card-dropdown-menu');
  const taskStatuses = ["backlog", "ready", "in_progress", "finished"];
  for (let i = 0; i < dropDownMenus.length; i++) {
    tasks.forEach(task => {
      if (task.status === taskStatuses[i]) {
        const li = document.createElement('li');
        const dropDownMenuItem = document.createElement('a');
        li.id = "li" + task.id;
        dropDownMenuItem.classList.add("dropdown-item", "card-dropdown-item");
        dropDownMenuItem.href = "#";
        dropDownMenuItem.innerText = task.text;
        li.appendChild(dropDownMenuItem);
        dropDownMenus[i].appendChild(li);
      }
    });
  }
}

const tasksCountByStatus = function(tasks) {
  const activeTasks = document.querySelector("span.active-tasks");
  const finishedTasks = document.querySelector("span.finished-tasks");
  const taskStatuses = {11: "backlog", 12: "ready", 13: "in_progress", 14: "finished"};
  let tasksQuantityByStatus = {backlog: 0, ready: 0, in_progress: 0, finished: 0};
  let activeTasksQuantity = 0;
  let finishedTasksQuantity = 0;
  tasks.forEach(task => {
    tasksQuantityByStatus[taskStatuses[task.statusId]]++;
    task.statusId !== "finished" ? activeTasksQuantity++ : finishedTasksQuantity++;
  });
  activeTasks.innerText = activeTasksQuantity;
  finishedTasks.innerText = finishedTasksQuantity;
  disableDropdownButton(tasksQuantityByStatus);
}

const disableDropdownButton = function(tasksByStatusesObj) {
  const dropdownButtons = document.querySelectorAll(".dropdown-btn");
  dropdownButtons[0].disabled = tasksByStatusesObj.backlog === 0;
  dropdownButtons[1].disabled = tasksByStatusesObj.ready === 0;
  dropdownButtons[2].disabled = tasksByStatusesObj.in_progress === 0;
}

export const renderAdminMenuItems = function () {
  const navBarNav = document.querySelector(".navbar-nav");
  const adminMenu = ['Users', 'Tasks'];
  const menuIds = ['users-page', 'navbar-brand'];
  let i = 0;
  adminMenu.forEach(element => {
    const li = document.createElement("li");
    const navLink = document.createElement("a");
    li.className = "nav-item admin-menu-item";
    navLink.className = "nav-link";
    navLink.id = menuIds[i];
    i++;
    navLink.href = "#";
    navLink.innerText = element;
    navBarNav.appendChild(li).appendChild(navLink);
  }) 
}

export const removeAdminMenuItems = function () {
  if (appState.currentUser.role === "admin") {
    const navBarNav = document.querySelector(".navbar-nav");
    const adminMenuItems = document.querySelectorAll(".admin-menu-item");
    if (adminMenuItems.length > 0) {
      adminMenuItems.forEach(item => navBarNav.removeChild(item));
    }
  }
}

export const menuEventsHandler = function() {
  
  const templatesByMenuIds = {
    "navbar-brand": taskFieldTemplate,
    "users-page": adminPageUsersTemplate,
  };
  const headerNav = document.querySelector("nav ul");
  let menuItems = document.querySelectorAll("nav a");
  addMenuEventListener();
  removeMenuEventListener();
  let config = {childList: true};
  const callback = function(mutationList) {
    menuItems = document.querySelectorAll("nav a");
    addMenuEventListener();
    removeMenuEventListener();
  }
  let observer = new MutationObserver(callback);
  observer.observe(headerNav, config);
  
  function addMenuEventListener() {
    for (let i = 0; i < menuItems.length; i++) {
      menuItems[i].addEventListener("click", menuEventListener);
    }
  }

  function menuEventListener(e) {
    e.preventDefault();
    menuItems.forEach(item => {
      if (!e.target.classList.contains("navbar-brand")) {
        item.classList.remove("active")
      } else {
        item.classList.remove("active");
        item.id === "home" ? item.classList.add("active") : '';
      }
    });
    e.target.classList.add("active");
    fieldHTMLContent.innerHTML = templatesByMenuIds[e.target.id];
    if (e.target.id === "users-page") {
      showUserList();
      addNewUser();
      deleteUser ();
   
    }
  }

  function removeMenuEventListener() {
    for (let i = 0; i < menuItems.length; i++) {
      menuItems[i].removeEventListener("click", menuEventListener, true);
    }
  }
}

const addNewUser = function() {
  const addUserForm = document.querySelector('#new-user-form');
  addUserForm.addEventListener("submit", listener);
  function listener(e) {
    e.preventDefault();
    const formData = new FormData(addUserForm);
    const userData = {name: formData.get("login"), password: formData.get("password"), role: formData.get("role")};
    generateUser(User, userData);
    addUserForm.childNodes[1].value = '';
    addUserForm.childNodes[3].value = '';
    addUserForm.childNodes[5].options[0].selected = "selected";
    showUserList();
  }
}

const deleteUser = function() {
  
  const deleteForm = document.querySelector('#delete-user-form');
  deleteForm.addEventListener("submit", listener);
  function listener(e) {
    e.preventDefault();
    const formData = new FormData(deleteForm);
    
    const userID = formData.get("id");
    const users = getFromStorage('users');
    const index = users.findIndex(user => user.id === userID.id);
    users.splice(index, 1);
    setObject('users', users);
    const usersList = document.querySelector('.users-list');
    usersList.innerHTML = '';
    let user;
    for (let i =  0; i < users.length; i++) {
      user = document.createElement('p');
      user.className = 'user-list-item'
      user.innerText = `${i + 1}. Login: ${users[i].login}, Password: ${users[i].password}, Role: ${users[i].role}`
      usersList.appendChild(user);
    }

    }
}


const showUserList = function() {
  const usersList = document.querySelector('.users-list');
  const users = getFromStorage('users');
  usersList.innerHTML = '';
  let user;
  for (let i =  0; i < users.length; i++) {
    user = document.createElement('p');
    user.className = 'user-list-item'
    user.innerText = `${i + 1}. Login: ${users[i].login}, Password: ${users[i].password}, Role: ${users[i].role}`
    usersList.appendChild(user);
  }
}

export function cookies() {
  if (document.cookie.split(';').some(item => item.trim().startsWith('userId='))) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('userId='))
      .split('=')[1]

    return cookieValue
  }
}