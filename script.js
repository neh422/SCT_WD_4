let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";
let editTaskId = null;

const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskList = document.getElementById("taskList");

const addBtn = document.getElementById("addBtn");

const taskContainer = document.getElementById("taskContainer");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const editTaskDate = document.getElementById("editTaskDate");
const editTaskTime = document.getElementById("editTaskTime");
const editTaskList = document.getElementById("editTaskList");

const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");


// Add Task
addBtn.addEventListener("click", addTask);

function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        date: taskDate.value,
        time: taskTime.value,
        category: taskList.value,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";
    taskDate.value = "";
    taskTime.value = "";
    taskList.value = "Personal";

    displayTasks();
}


// Display Tasks
function displayTasks() {

    taskContainer.innerHTML = "";

    let filteredTasks = tasks.filter(task => {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // Sort tasks by date/time
    filteredTasks.sort((a, b) => {

        const dateA = a.date && a.time
            ? new Date(`${a.date}T${a.time}`)
            : new Date(8640000000000000);

        const dateB = b.date && b.time
            ? new Date(`${b.date}T${b.time}`)
            : new Date(8640000000000000);

        return dateA - dateB;
    });


    if (filteredTasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }


    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        let dateText = task.date
            ? formatDate(task.date)
            : "No date";

        let timeText = task.time
            ? formatTime(task.time)
            : "No time";


        card.innerHTML = `
            
            <div class="task-left">

                <input 
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >

                <div class="task-info">

                    <h3>${escapeHTML(task.text)}</h3>

                    <p>📅 ${dateText}</p>

                    <p>⏰ ${timeText}</p>

                    <span class="category">
                        ${escapeHTML(task.category)}
                    </span>

                </div>

            </div>

            <div class="task-actions">

                <button 
                    class="edit-btn"
                    onclick="openEdit(${task.id})">
                    Edit
                </button>

                <button 
                    class="delete-btn"
                    onclick="deleteTask(${task.id})">
                    Delete
                </button>

            </div>

        `;

        taskContainer.appendChild(card);

    });

    updateStats();
}


// Complete / Uncomplete Task
function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    saveTasks();

    displayTasks();
}


// Delete Task
function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    displayTasks();
}


// Open Edit Modal
function openEdit(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    editTaskId = id;

    editTaskInput.value = task.text;
    editTaskDate.value = task.date;
    editTaskTime.value = task.time;
    editTaskList.value = task.category;

    editModal.style.display = "flex";
}


// Save Edited Task
saveEdit.addEventListener("click", function () {

    const text = editTaskInput.value.trim();

    if (text === "") {
        alert("Task cannot be empty.");
        return;
    }

    const task = tasks.find(task => task.id === editTaskId);

    if (task) {

        task.text = text;
        task.date = editTaskDate.value;
        task.time = editTaskTime.value;
        task.category = editTaskList.value;

    }

    saveTasks();

    closeModal();

    displayTasks();

});


// Cancel Edit
cancelEdit.addEventListener("click", closeModal);


function closeModal() {

    editModal.style.display = "none";

    editTaskId = null;

}


// Filter Buttons
const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        currentFilter = this.dataset.filter;

        displayTasks();

    });

});


// Statistics
function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    totalTasks.textContent = total;

    pendingTasks.textContent = pending;

    completedTasks.textContent = completed;

}


// Save to LocalStorage
function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


// Format Date
function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// Format Time
function formatTime(timeString) {

    const [hours, minutes] = timeString.split(":");

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// Prevent HTML injection
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// Close modal when clicking outside
window.addEventListener("click", function(event) {

    if (event.target === editModal) {
        closeModal();
    }

});


// Enter key adds task
taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});


// Initial Display
displayTasks();