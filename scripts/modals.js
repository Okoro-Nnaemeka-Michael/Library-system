// modals.js
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

export function closeModals() {
  document.querySelectorAll('.modal').forEach(m => (m.style.display = 'none'));
}
