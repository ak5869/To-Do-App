const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filter = 'all';

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    if (
      (filter === 'active' && task.completed) ||
      (filter === 'completed' && !task.completed)
    ) {
      return;
    }

    const li = document.createElement('li');

    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleComplete(index));

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.dueDate) {
        const due = document.createElement('small');
        due.textContent = `${task.dueDate}`;
        due.style.marginRight = '10px';
        due.style.fontSize = '0.8rem';
        due.style.color = '#888';
        label.appendChild(due);
      }
      
    if (task.completed) span.classList.add('task-completed');


    span.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = task.text;
      input.className = 'edit-input';
      input.addEventListener('blur', () => saveEdit(index, input.value));
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit(index, input.value);
      });

      label.replaceChild(input, span);
      input.focus();
    });

    label.appendChild(checkbox);
    label.appendChild(span);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(index));

    li.appendChild(label);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = document.getElementById('dueDateInput').value;
  
    if (taskText === '') return;
  
    tasks.push({ text: taskText, completed: false, dueDate });
    taskInput.value = '';
    document.getElementById('dueDateInput').value = '';
    saveAndRender();
  }
  

function deleteTask(index) {
  tasks.splice(index, 1);
  saveAndRender();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

function saveEdit(index, newText) {
  tasks[index].text = newText.trim() || tasks[index].text;
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    filter = btn.dataset.filter;
    renderTasks();
  });
});

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

renderTasks();

taskList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  const siblings = [...taskList.querySelectorAll('li:not(.dragging)')];

  const nextSibling = siblings.find(sib => {
    const rect = sib.getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2;
  });

  taskList.insertBefore(dragging, nextSibling);
});

taskList.addEventListener('drop', () => {
  const reorderedTasks = [];
  taskList.querySelectorAll('li').forEach(li => {
    const index = li.dataset.index;
    if (index !== undefined) reorderedTasks.push(tasks[index]);
  });
  tasks = reorderedTasks;
  saveAndRender();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
