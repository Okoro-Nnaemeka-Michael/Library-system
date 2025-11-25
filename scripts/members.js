// members.js
import { members, saveData } from './data.js';
import { showNotification } from './ui.js';

export function handleAddMember() {
  const name = prompt('Enter member full name:');
  if (!name || !name.trim()) {
    showNotification('Member creation cancelled or name empty.');
    return;
  }

  const newMember = {
    id: members.length ? members[members.length - 1].id + 1 : 1,
    name: name.trim()
  };

  members.push(newMember);
  saveData();
  showNotification(`Member "${newMember.name}" added.`);
}
