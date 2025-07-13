let data = {
  holders: []
};

function loadData() {
  const saved = localStorage.getItem('projectMap');
  if (saved) data = JSON.parse(saved);
}
function saveData() {
  localStorage.setItem('projectMap', JSON.stringify(data));
}

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

function getUnassignedHolder() {
  let idx = data.holders.findIndex(h => h.name === "Unassigned Tasks");
  if (idx === -1) {
    data.holders.push({ name: "Unassigned Tasks", tasks: [] });
    idx = data.holders.length - 1;
  }
  return idx;
}

function renderFlow() {
  const flow = document.getElementById('flow');
  flow.innerHTML = '';
  data.holders.forEach((holder, hIdx) => {
    const holderDiv = document.createElement('div');
    holderDiv.className = 'holder';
    holderDiv.dataset.holderIdx = hIdx;
    holderDiv.draggable = true;

    // Drag events for holders
    holderDiv.addEventListener('dragstart', function(e) {
      dragHolderIdx = hIdx;
      holderDiv.classList.add('dragging');
    });
    holderDiv.addEventListener('dragend', function(e) {
      dragHolderIdx = null;
      dragOverHolderIdx = null;
      holderDiv.classList.remove('dragging');
      document.querySelectorAll('.holder.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
    holderDiv.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (dragHolderIdx !== null && dragHolderIdx !== hIdx) {
        dragOverHolderIdx = hIdx;
        holderDiv.classList.add('drag-over');
      }
    });
    holderDiv.addEventListener('dragleave', function(e) {
      holderDiv.classList.remove('drag-over');
    });
    holderDiv.addEventListener('drop', function(e) {
      holderDiv.classList.remove('drag-over');
      if (dragHolderIdx !== null && dragHolderIdx !== hIdx) {
        const moved = data.holders.splice(dragHolderIdx, 1)[0];
        data.holders.splice(hIdx, 0, moved);
        saveData();
        renderFlow();
      }
    });

    // Holder controls: Edit, Add Task, Delete
    holderDiv.innerHTML = `
      <div class="holder-title-row">
        <span class="holder-title">${holder.name}</span>
        <div style="display:flex;gap:8px;">
          <button class="holder-cog-btn" onclick="showEditHolder(${hIdx})" title="Edit Holder">
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
            </svg>
          </button>
          <button class="holder-add-btn" onclick="showAddTaskToHolder(${hIdx})" title="Add Task">
            <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;">
              <circle cx="12" cy="12" r="10" fill="#2980b9"/>
              <line x1="12" y1="8" x2="12" y2="16" stroke="#fff" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="#fff" stroke-width="2"/>
            </svg>
          </button>
          <button class="holder-x-btn" onclick="confirmDeleteHolder(${hIdx})" title="Delete Holder">
            <svg width="22" height="22" viewBox="0 0 24 24" style="vertical-align:middle;">
              <circle cx="12" cy="12" r="10" fill="#e74c3c"/>
              <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    const tasksDiv = document.createElement('div');
    tasksDiv.className = 'tasks';
    tasksDiv.dataset.holderIdx = hIdx;

    // Drag events for tasks
    holderDiv.addEventListener('dragover', function(e) {
      e.preventDefault();
      holderDiv.classList.add('drag-over');
    });
    holderDiv.addEventListener('dragleave', function(e) {
      holderDiv.classList.remove('drag-over');
    });
    holderDiv.addEventListener('drop', function(e) {
      holderDiv.classList.remove('drag-over');
      if (dragTask !== null && dragFromHolder !== null) {
        const taskObj = data.holders[dragFromHolder].tasks.splice(dragFromIdx, 1)[0];
        data.holders[hIdx].tasks.push(taskObj);
        saveData();
        renderFlow();
      }
    });

    holder.tasks.forEach((task, tIdx) => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'task';
      taskDiv.draggable = true;
      taskDiv.dataset.holderIdx = hIdx;
      taskDiv.dataset.taskIdx = tIdx;

      taskDiv.addEventListener('dragstart', function(e) {
        dragTask = tIdx;
        dragFromHolder = hIdx;
        dragFromIdx = tIdx;
        taskDiv.classList.add('dragging');
      });
      taskDiv.addEventListener('dragend', function(e) {
        dragTask = null;
        dragFromHolder = null;
        dragFromIdx = null;
        taskDiv.classList.remove('dragging');
      });

      taskDiv.innerHTML = `
        <span>
          <span class="status" style="background:${statusColors[task.status]};"></span>
          <b>${task.name}</b>
          <span class="priority">Priority: ${task.priority}</span>
        </span>
        <div>Stage: ${task.status}</div>
        <div class="actions">
          <button class="task-cog-btn" onclick="showEditTask(${hIdx},${tIdx})" title="Edit Task">
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
            </svg>
          </button>
          <button class="task-x-btn" onclick="confirmDeleteTask(${hIdx},${tIdx})" title="Delete Task">
            <svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align:middle;">
              <circle cx="12" cy="12" r="10" fill="#e74c3c"/>
              <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2"/>
            </svg>
          </button>
        </div>
      `;
      tasksDiv.appendChild(taskDiv);
    });
    holderDiv.appendChild(tasksDiv);
    flow.appendChild(holderDiv);
    if (hIdx < data.holders.length - 1) {
      const arrowDiv = document.createElement('div');
      arrowDiv.className = 'arrow';
      //arrowDiv.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 12h16m0 0l-6-6m6 6l-6 6"/></svg>`;
      flow.appendChild(arrowDiv);
    }
  });
}

function showDialog(html, onSubmit) {
  const dialogs = document.getElementById('dialogs');
  dialogs.innerHTML = `
    <div class="dialog-modal">
      ${html}
      <div class="dialog-actions">
        <button onclick="closeDialog()">Cancel</button>
        <button onclick="dialogSubmit()">OK</button>
      </div>
    </div>
  `;
  window.dialogSubmit = () => {
    onSubmit();
    closeDialog();
  };
}
function closeDialog() {
  document.getElementById('dialogs').innerHTML = '';
}

function showAddHolder() {
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


function showAddTaskToHolder(hIdx) {
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

function showEditHolder(hIdx) {
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

function showEditTask(hIdx, tIdx) {
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

function confirmDeleteHolder(hIdx) {
  showDialog(`
    <div style="text-align:center;">
      <p>Are you sure you want to delete holder <b>${data.holders[hIdx].name}</b>?</p>
      <p>All tasks will be moved to <b>Unassigned Tasks</b>.</p>
    </div>
  `, () => {
    const holder = data.holders[hIdx];
    if (holder.tasks.length > 0) {
      const unassignedIdx = getUnassignedHolder();
      data.holders[unassignedIdx].tasks.push(...holder.tasks);
    }
    data.holders.splice(hIdx, 1);
    saveData();
    renderFlow();
  });
}

function confirmDeleteTask(hIdx, tIdx) {
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

loadData();
renderFlow();