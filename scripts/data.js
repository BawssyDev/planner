export let data = {
  holders: []
};

export function loadData() {
  const saved = localStorage.getItem('projectMap');
  if (saved) data = JSON.parse(saved);
}

export function saveData() {
  localStorage.setItem('projectMap', JSON.stringify(data));
}

export function setData(newData) {
  data = newData;
  saveData();
}
