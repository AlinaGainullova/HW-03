export class State {
  constructor() {
    this.currentUser = null;
    this.tasks = [];
  }
  set currentUser(user) {
    this._currentUser = user;
  }
  get currentUser() {
    return this._currentUser;
  }

  set task(task) {
    this._tasks.push(task);
  }
  set tasks(tasks) {
    this._tasks = tasks;
  }
  get tasks() {
    return this._tasks
  }
  get currentUserTasks() {
    return this._tasks.filter(task => task.userId === this._currentUser.id);
  }
  get currentUserBacklogTasks() {
    return this._tasks.filter(task => task.userId === this._currentUser.id && task.status === "backlog");
  }
  get currentUserReadyTasks() {
    return this._tasks.filter(task => task.userId === this._currentUser.id && task.status === "ready");
  }
  get currentUserInProgressTasks() {
    return this._tasks.filter(task => task.userId === this._currentUser.id && task.status === "in_progress");
  }
  get currentUserFinishedTasks() {
    return this._tasks.filter(task => task.userId === this._currentUser.id && task.status === "finished");
  }
}
