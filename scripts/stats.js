// stats.js
import { sampleBooks, members, borrowHistory } from './data.js';
import { showNotification } from './ui.js';

export function showStatistics() {
  const totalBooks = sampleBooks.length;
  const borrowedBooks = sampleBooks.filter(b => b.status === 'Borrowed').length;
  const availableBooks = totalBooks - borrowedBooks;
  const totalMembers = members.length;

  const msg = `
📊 Library Statistics
----------------------------
Total Books: ${totalBooks}
Available Books: ${availableBooks}
Borrowed Books: ${borrowedBooks}
Total Members: ${totalMembers}
  `;
  alert(msg);
}

export function showBorrowHistory() {
  if (borrowHistory.length === 0) {
    showNotification('No borrow history recorded yet.');
    return;
  }

  const text = borrowHistory
    .map(h => `• ${h.member} ${h.action} "${h.title}" on ${h.date}`)
    .join('\n');

  alert('Borrow History:\n' + text);
}

export function showOverdueBooks() {
  const now = new Date();
  const overdue = sampleBooks.filter(
    b => b.status === 'Borrowed' && b.dueDate && new Date(b.dueDate) < now
  );

  if (overdue.length === 0) {
    showNotification('No overdue books.');
    return;
  }

  const list = overdue
    .map(b => `• ${b.title} — borrowed by ${b.borrowedBy} (Due: ${b.dueDate})`)
    .join('\n');

  alert('📅 Overdue Books:\n' + list);
}

// Dashboard stats
export function updateDashboardStats() {
  const totalBooks = sampleBooks.length;
  const borrowedBooks = sampleBooks.filter(b => b.status === 'Borrowed').length;
  const membersCount = members.length;

  const totalBooksEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
  const borrowedBooksEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
  const membersEl = document.querySelector('.stat-card:nth-child(3) .stat-value');

  if (totalBooksEl) totalBooksEl.textContent = totalBooks.toLocaleString();
  if (borrowedBooksEl) borrowedBooksEl.textContent = borrowedBooks.toLocaleString();
  if (membersEl) membersEl.textContent = membersCount.toLocaleString();
}

export function updateNotificationBadge() {
  const badge = document.querySelector('.notification-badge');
  if (!badge) return;

  const now = new Date();
  const overdueCount = sampleBooks.filter(
    b => b.status === 'Borrowed' && b.dueDate && new Date(b.dueDate) < now
  ).length;

  if (overdueCount > 0) {
    badge.textContent = overdueCount;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}
