// events.js
import { handleAddBook } from './forms.js';
import { handleAddMember } from './members.js';
import { showStatistics, showBorrowHistory, showOverdueBooks } from './stats.js';
import { openModal, closeModals } from './modals.js';


export function setupEventListeners() {
  document.getElementById('addBookBtn')?.addEventListener('click', () => openModal('addBookModal'));
  document.getElementById('addMemberBtn')?.addEventListener('click', handleAddMember);
  document.getElementById('addBookForm')?.addEventListener('submit', handleAddBook);
  document.getElementById('statsBtn')?.addEventListener('click', showStatistics);
  document.getElementById('historyBtn')?.addEventListener('click', showBorrowHistory);
  document.getElementById('overdueBtn')?.addEventListener('click', showOverdueBooks);
  document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModals));
}
