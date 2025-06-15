// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDatetime = document.getElementById('task-datetime');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskInput = document.getElementById('edit-task-input');
const editTaskDatetime = document.getElementById('edit-task-datetime');
const cancelEditBtn = document.getElementById('cancel-edit');
const totalTasksSpan = document.getElementById('total-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

// Initialize
updateTaskStats();
renderTasks();

// Event Listeners
taskForm.addEventListener('submit', addTask);
searchInput.addEventListener('input', renderTasks);
clearCompletedBtn.addEventListener('click', clearCompletedTasks);
editForm.addEventListener('submit', saveEdit);
cancelEditBtn.addEventListener('click', closeEditModal);

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

// Functions
function addTask(e) {
    e.preventDefault();
    
    const taskTitle = taskInput.value.trim();
    const taskDate = taskDatetime.value;
    
    if (taskTitle) {
        const newTask = {
            id: Date.now(),
            title: taskTitle,
            datetime: taskDate,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        
        taskInput.value = '';
        taskDatetime.value = '';
    }
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        editingTaskId = taskId;
        editTaskInput.value = task.title;
        editTaskDatetime.value = task.datetime;
        editModal.classList.add('active');
    }
}

function saveEdit(e) {
    e.preventDefault();
    
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.title = editTaskInput.value.trim();
        task.datetime = editTaskDatetime.value;
        saveTasks();
        renderTasks();
    }
    
    closeEditModal();
}

function closeEditModal() {
    editModal.classList.remove('active');
    editingTaskId = null;
    editTaskInput.value = '';
    editTaskDatetime.value = '';
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskStats();
}

function updateTaskStats() {
    totalTasksSpan.textContent = `Total: ${tasks.length}`;
    const completedCount = tasks.filter(task => task.completed).length;
    completedTasksSpan.textContent = `Completed: ${completedCount}`;
}

function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        
        switch (currentFilter) {
            case 'active':
                return !task.completed && matchesSearch;
            case 'completed':
                return task.completed && matchesSearch;
            default:
                return matchesSearch;
        }
    });
    
    taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                 onclick="toggleTask(${task.id})"></div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.datetime ? `<div class="task-datetime">${formatDateTime(task.datetime)}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

function formatDateTime(datetime) {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 