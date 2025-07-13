import { data, saveData } from './data.js';
import {
  showEditHolder,
  showEditTask,
  confirmDeleteHolder,
  confirmDeleteTask,
  showAddTaskToHolder
} from './dialogs.js';

export function renderFlow() {
  const flow = document.getElementById('flow');
  flow.innerHTML = '';

  const statusColors = {
    'ToDo': '#e74c3c',
    'Started': '#f1c40f',
    'Done': '#27ae60'
  };

  let dragTask = null;
  let dragFromHolder = null;
  let dragFromIdx = null;
  let dragHolderIdx = null;
  let dragOverHolderIdx = null;

  data.holders.forEach((holder, hIdx) => {
    const holderDiv = document.createElement('div');
    holderDiv.className = 'holder';
    holderDiv.dataset.holderIdx = hIdx;
    holderDiv.draggable = true;

    // Drag for holders
    holderDiv.addEventListener('dragstart', () => {
      dragHolderIdx = hIdx;
      holderDiv.classList.add('dragging');
    });

    holderDiv.addEventListener('dragend', () => {
      dragHolderIdx = null;
      dragOverHolderIdx = null;
      holderDiv.classList.remove('dragging');
      document.querySelectorAll('.holder.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    holderDiv.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (dragHolderIdx !== null && dragHolderIdx !== hIdx) {
        dragOverHolderIdx = hIdx;
        holderDiv.classList.add('drag-over');
      }
    });

    holderDiv.addEventListener('dragleave', () => {
      holderDiv.classList.remove('drag-over');
    });

    holderDiv.addEventListener('drop', function () {
      holderDiv.classList.remove('drag-over');
      if (dragTask !== null && dragFromHolder !== null) {
        const taskObj = data.holders[dragFromHolder].tasks.splice(dragFromIdx, 1)[0];
        if (taskObj) {  // <-- check here
          data.holders[hIdx].tasks.push(taskObj);
          saveData();
          renderFlow();
        } else {
          // Optional: log error for debugging
          console.error('Invalid task object on drop, ignoring.');
        }
      }
    });

    // === Holder Header ===
    const holderHeader = document.createElement('div');
    holderHeader.className = 'holder-title-row';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'holder-title';
    titleSpan.textContent = holder.name;

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '8px';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'holder-cog-btn';
    editBtn.title = 'Edit Holder';
    editBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;">
        <g fill="none" stroke="#2980b9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"/>
          <line x1="4" y1="10" x2="4" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12" y2="3"/>
          <line x1="20" y1="21" x2="20" y2="16"/>
          <line x1="20" y1="12" x2="20" y2="3"/>
          <circle cx="4" cy="12" r="2"/>
          <circle cx="12" cy="10" r="2"/>
          <circle cx="20" cy="14" r="2"/>
        </g>
      </svg>`;
    editBtn.addEventListener('click', () => showEditHolder(hIdx));

    // Add task button
    const addBtn = document.createElement('button');
    addBtn.className = 'holder-add-btn';
    addBtn.title = 'Add Task';
    addBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;">
        <circle cx="12" cy="12" r="10" fill="#2980b9"/>
        <line x1="12" y1="8" x2="12" y2="16" stroke="#fff" stroke-width="2"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke="#fff" stroke-width="2"/>
      </svg>`;
    addBtn.addEventListener('click', () => showAddTaskToHolder(hIdx));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'holder-x-btn';
    deleteBtn.title = 'Delete Holder';
    deleteBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;">
        <circle cx="12" cy="12" r="10" fill="#e74c3c"/>
        <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2"/>
        <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2"/>
      </svg>`;
    deleteBtn.addEventListener('click', () => confirmDeleteHolder(hIdx));

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(addBtn);
    btnGroup.appendChild(deleteBtn);

    holderHeader.appendChild(titleSpan);
    holderHeader.appendChild(btnGroup);
    holderDiv.appendChild(holderHeader);

    // === Tasks ===
    const tasksDiv = document.createElement('div');
    tasksDiv.className = 'tasks';
    tasksDiv.dataset.holderIdx = hIdx;

    holderDiv.addEventListener('dragover', (e) => {
      e.preventDefault();
      holderDiv.classList.add('drag-over');
    });

    holderDiv.addEventListener('dragleave', () => {
      holderDiv.classList.remove('drag-over');
    });

    holderDiv.addEventListener('drop', () => {
      holderDiv.classList.remove('drag-over');
      if (dragTask !== null && dragFromHolder !== null) {
        const taskObj = data.holders[dragFromHolder].tasks.splice(dragFromIdx, 1)[0];
        data.holders[hIdx].tasks.push(taskObj);
        saveData();
        renderFlow();
      }
    });

    holder.tasks.forEach((task, tIdx) => {
      if (!task) return; // Skip null or undefined tasks to avoid errors

      const taskDiv = document.createElement('div');
      taskDiv.className = 'task';
      taskDiv.draggable = true;
      taskDiv.dataset.holderIdx = hIdx;
      taskDiv.dataset.taskIdx = tIdx;

      taskDiv.addEventListener('dragstart', () => {
        dragTask = tIdx;
        dragFromHolder = hIdx;
        dragFromIdx = tIdx;
        taskDiv.classList.add('dragging');
      });

      taskDiv.addEventListener('dragend', () => {
        dragTask = null;
        dragFromHolder = null;
        dragFromIdx = null;
        taskDiv.classList.remove('dragging');
      });

      const statusColor = statusColors[task.status] || '#999'; // fallback color if undefined

      taskDiv.innerHTML = `
    <span>
      <span class="status" style="background:${statusColor};"></span>
      <b>${task.name}</b>
      <span class="priority">Priority: ${task.priority}</span>
    </span>
    <div>Stage: ${task.status}</div>
  `;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'actions';

      const editTaskBtn = document.createElement('button');
      editTaskBtn.className = 'task-cog-btn';
      editTaskBtn.title = 'Edit Task';
      editTaskBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align:middle;">
      <g fill="none" stroke="#2980b9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="21" x2="4" y2="14"/>
        <line x1="4" y1="10" x2="4" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12" y2="3"/>
        <line x1="20" y1="21" x2="20" y2="16"/>
        <line x1="20" y1="12" x2="20" y2="3"/>
        <circle cx="4" cy="12" r="2"/>
        <circle cx="12" cy="10" r="2"/>
        <circle cx="20" cy="14" r="2"/>
      </g>
    </svg>`;
      editTaskBtn.addEventListener('click', () => showEditTask(hIdx, tIdx));

      const deleteTaskBtn = document.createElement('button');
      deleteTaskBtn.className = 'task-x-btn';
      deleteTaskBtn.title = 'Delete Task';
      deleteTaskBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align:middle;">
      <circle cx="12" cy="12" r="10" fill="#e74c3c"/>
      <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2"/>
      <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2"/>
    </svg>`;
      deleteTaskBtn.addEventListener('click', () => confirmDeleteTask(hIdx, tIdx));

      actionsDiv.appendChild(editTaskBtn);
      actionsDiv.appendChild(deleteTaskBtn);
      taskDiv.appendChild(actionsDiv);

      tasksDiv.appendChild(taskDiv);
    });


    holderDiv.appendChild(tasksDiv);
    flow.appendChild(holderDiv);

    if (hIdx < data.holders.length - 1) {
      const arrowDiv = document.createElement('div');
      arrowDiv.className = 'arrow';
      flow.appendChild(arrowDiv);
    }
  });
}
