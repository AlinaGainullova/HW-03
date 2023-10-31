import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./styles/style.css";
import initialTemplate from "./templates/signIn.html";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { 
  generateTestUser, generateTestTasks, getFromStorage, renderTasks, addTaskBacklog,
  renderAdminMenuItems, removeAdminMenuItems, changeTaskStatus, menuEventsHandler,cookies
} from "./utils";
import { State } from "./state";
import { authUser, logout } from "./services/auth";






export const appState = new State();

const loginForm = document.querySelector("#app-login-form");
const logoutForm = document.querySelector("#app-logout-form");
const userProfile = document.querySelector("#app-userProfile");
export const fieldHTMLContent = document.querySelector("#content");

function getCurrentUser(login = '', password = '') {
  const users = getFromStorage('users');
  for (let user of users) {
    if (user.login === login && user.password === password) {
      setCookie(user.id);
    }
    if (user.id === cookies()) {
    return user;
    }
  }
}


function getCards() {
  appState.tasks = null;
  appState.tasks = getFromStorage("tasks");
 
}

function setCookie(id) {
  document.cookie = `userId=${id}`
}

fieldHTMLContent.innerHTML = initialTemplate;
generateTestUser();
menuEventsHandler();

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");
  const isLogedIn = authUser(login, password);

  if (isLogedIn) {
  
    getCurrentUser();
    getCards();
    fieldHTMLContent.innerHTML = taskFieldTemplate;
    
    renderTasks(appState.currentUserTasks);
    if (appState.currentUser.role === "admin") {
      renderAdminMenuItems();
    }
    loginForm.classList.add('d-none');
    logoutForm.classList.remove('d-none');
    loginForm.childNodes[1].value = '';
    loginForm.childNodes[3].value = '';
  } else {
    fieldHTMLContent.innerHTML = noAccessTemplate;
    fieldHTMLContent.innerHTML += initialTemplate;
  }
  addTaskBacklog();
  
  changeTaskStatus(appState.currentUserTasks);


  
});

logoutForm.addEventListener("submit", function(e) {
  e.preventDefault();
  removeAdminMenuItems();
  logout();
  fieldHTMLContent.innerHTML = initialTemplate;
  loginForm.classList.remove('d-none');
  logoutForm.classList.add('d-none');
  document.querySelector("span.active-tasks").innerText = "-";
  document.querySelector("span.finished-tasks").innerText = "-";
});


