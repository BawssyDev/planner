import { data, saveData } from './data.js';
import { renderFlow } from './render.js';

export function showDialog(html, onSubmit) {
  const dialogs = document.getElementById('dialogs');
  dialogs.innerHTML = `
    <div class="dialog-backdrop" onclick="closeDialogOnBackdrop(event)">
      <div class="dialog-modal" onclick="event.stopPropagation()">
        ${html}
        <div class="dialog-actions">
          <button type="button" onclick="closeDialog()">Cancel</button>
          <button type="button" onclick="dialogSubmit()">OK</button>
        </div>
      </div>
    </div>
  `;

  window.dialogSubmit = () => {
    onSubmit();
    closeDialog();
  };

  // Close dialog if user clicks outside the modal content (on backdrop)
  window.closeDialogOnBackdrop = (event) => {
    if (event.target.classList.contains('dialog-backdrop')) {
      closeDialog();
    }
  };
}

export function closeDialog() {
  const dialogs = document.getElementById('dialogs');
  dialogs.innerHTML = '';
}
window.closeDialog = closeDialog;  // expose globally for inline onclick to find it


export function showAddTaskToHolder(hIdx) {
  showDialog(`
    <div>
      <label>Task Name:</label>
      <input type="text" id="taskName">
    </div>
  `, () => {
    const name = document.getElementById('taskName').value.trim();
    if (name) {
      data.holders[hIdx].tasks.push({
        name,
        status: 'ToDo',
        priority: 3
      });
      saveData();
      renderFlow();
    }
  });
}

export function showAddHolder() {
  showDialog(`
    <div>
      <label>Holder Name:</label>
      <input type="text" id="holderName">
    </div>
  `, () => {
    const name = document.getElementById('holderName').value.trim();
    if (name) {
      data.holders.push({ name, tasks: [] });
      saveData();
      renderFlow();
    }
  });
}

export function showEditTask(hIdx, tIdx) {
  const task = data.holders[hIdx].tasks[tIdx];
  showDialog(`
    <div>
      <label>Edit Task Name:</label>
      <input type="text" id="editTaskName" value="${task.name}">
    </div>
    <div>
      <label>Status:</label>
      <select id="editTaskStatus">
        <option value="ToDo" ${task.status === 'ToDo' ? 'selected' : ''}>ToDo</option>
        <option value="Started" ${task.status === 'Started' ? 'selected' : ''}>Started</option>
        <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
      </select>
    </div>
    <div>
      <label>Priority (1-5):</label>
      <select id="editTaskPriority">
        ${[1,2,3,4,5].map(n => `<option value="${n}" ${task.priority === n ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
    </div>
  `, () => {
    const name = document.getElementById('editTaskName').value.trim();
    const status = document.getElementById('editTaskStatus').value;
    const priority = Number(document.getElementById('editTaskPriority').value);
    if (name) {
      task.name = name;
      task.status = status;
      task.priority = priority;
      saveData();
      renderFlow();
    }
  });
}

export function showEditHolder(hIdx) {
  const holder = data.holders[hIdx];
  showDialog(`
    <div>
      <label>Edit Holder Name:</label>
      <input type="text" id="editHolderName" value="${holder.name}">
    </div>
  `, () => {
    const name = document.getElementById('editHolderName').value.trim();
    if (name) {
      holder.name = name;
      saveData();
      renderFlow();
    }
  });
}

export function confirmDeleteHolder(hIdx) {
  showDialog(`
    <div style="text-align:center;">
      <p>Are you sure you want to delete holder <b>${data.holders[hIdx].name}</b>?</p>
      <p>All tasks will be moved to <b>Unassigned Tasks</b>.</p>
    </div>
  `, () => {
    const holder = data.holders[hIdx];
    if (holder.tasks.length > 0) {
      let idx = data.holders.findIndex(h => h.name === "Unassigned Tasks");
      if (idx === -1) {
        data.holders.push({ name: "Unassigned Tasks", tasks: [] });
        idx = data.holders.length - 1;
      }
      data.holders[idx].tasks.push(...holder.tasks);
    }
    data.holders.splice(hIdx, 1);
    saveData();
    renderFlow();
  });
}

export function confirmDeleteTask(hIdx, tIdx) {
  showDialog(`
    <div style="text-align:center;">
      <p>Are you sure you want to delete task <b>${data.holders[hIdx].tasks[tIdx].name}</b>?</p>
    </div>
  `, () => {
    data.holders[hIdx].tasks.splice(tIdx, 1);
    saveData();
    renderFlow();
  });
}
// Expose to global scope for use in inline HTML event handlers
window.showAddTaskToHolder = showAddTaskToHolder;
window.showAddHolder = showAddHolder;
window.showEditTask = showEditTask;
window.showEditHolder = showEditHolder;
window.confirmDeleteHolder = confirmDeleteHolder;
window.confirmDeleteTask = confirmDeleteTask;
