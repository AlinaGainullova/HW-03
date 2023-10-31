import {setObject, getFromStorage } from "../utils";


export const dragAndDrop = () => {

    const items = document.querySelector('.item');

    
    items.addEventListener('dragstart', dragStart);
    
    function dragStart(e) {
       
        e.dataTransfer.setData('text/plain', e.target.id);
       
        setTimeout(() => {
            e.target.classList.add('hide');
        }, 0);
    }
    
    const boxes = document.querySelectorAll('.card-body');
    
    boxes.forEach(box => {
        box.addEventListener('dragenter', dragEnter)
        box.addEventListener('dragover', dragOver);
        box.addEventListener('dragleave', dragLeave);
        box.addEventListener('drop', drop);
        
    });
    
    
    
    function dragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }
    
    function dragOver(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }
    
    function dragLeave(e) {
        e.target.classList.remove('drag-over');
    }
    
     function drop(e) {
        
        e.target.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.getElementById(id);
        e.target.appendChild(document.getElementById(id));
        draggable.dataset.status = e.target.id;
        draggable.classList.remove('hide');

   
        const tasks = getFromStorage('tasks');
        for (let task of tasks){
        if(e.target.id == document.getElementById('backlog')){
            task.status = "backlog"; 
        }else if(e.target.id == document.getElementById('ready')){
            task.status = "ready";
        }else if(e.target.id == document.getElementById('progress')){
            task.status = "progress";    
        }else if(e.target.id == document.getElementById('finished')){
            task.status = "finished";
        }
        setObject('tasks', tasks);
    }
       
   
    }
}
  