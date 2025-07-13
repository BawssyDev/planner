import { loadData } from './data.js';
import { renderFlow } from './render.js';
import { exportDataPersistent, importDataPersistent } from './file-access.js';
import { 
    showAddHolder, 
    showAddTaskToHolder,
    showEditTask,
    showEditHolder,
    confirmDeleteHolder,
    confirmDeleteTask
} from './dialogs.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service worker registered.', reg))
      .catch(err => console.log('Service worker registration failed:', err));
  });
}


// Expose for buttons in HTML
window.exportDataPersistent = exportDataPersistent;
window.importDataPersistent = importDataPersistent;
window.showAddHolder = showAddHolder;
window.showAddTaskToHolder = showAddTaskToHolder;
window.showEditTask = showEditTask;
window.showEditHolder = showEditHolder;
window.confirmDeleteHolder = confirmDeleteHolder;
window.confirmDeleteTask = confirmDeleteTask;

loadData();
renderFlow();