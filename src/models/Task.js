import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage } from "../utils";

export class Task extends BaseModel {
    constructor(userId, text) {
        super();
        this.userId = userId;
        this.text = text;
        this.status = "backlog";
        this.statusId = 11;
        this.storageKey = "tasks"; 
    }

    get tasks() {
        return getFromStorage(this.storageKey);
    }

    static save(task) {
        try {
            addToStorage(task, task.storageKey);
            return true;
        } catch (e) {
            throw new Error(e);
        }
    }
}