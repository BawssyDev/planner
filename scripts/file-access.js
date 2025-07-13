import { data, setData } from './data.js';
import { renderFlow } from './render.js';

let fileHandle = null;

export async function exportDataPersistent() {
  try {
    if (!fileHandle) {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: 'project-map.json',
        types: [{
          description: 'JSON File',
          accept: { 'application/json': ['.json'] }
        }]
      });
    }
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    alert('Data saved to disk.');
  } catch (err) {
    console.error('Save failed', err);
  }
}

export async function importDataPersistent() {
  try {
    [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON File',
        accept: { 'application/json': ['.json'] }
      }]
    });
    const file = await fileHandle.getFile();
    const contents = await file.text();
    const parsed = JSON.parse(contents);
    if (parsed && Array.isArray(parsed.holders)) {
      setData(parsed);
      renderFlow();
    } else {
      alert('Invalid JSON format.');
    }
  } catch (err) {
    console.error('Load failed', err);
  }
}