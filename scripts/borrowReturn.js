// borrowReturn.js
import { sampleBooks, members, borrowHistory, saveData, saveHistory } from './data.js';
import { showNotification } from './ui.js';
import { refreshUI } from './main.js';

export function borrowBook(bookId) {
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) return showNotification('Book not found');

  const memberList = members.map(m => `${m.id}: ${m.name}`).join('\n');
  const input = prompt(`Select member id:\n${memberList}`);
  const member = members.find(m => m.id === parseInt(input));
  if (!member) return showNotification('Invalid member');

  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(borrowDate.getDate() + 7);

  book.status = 'Borrowed';
  book.borrowedBy = member.name;
  book.dueDate = dueDate.toISOString().split('T')[0];

  borrowHistory.push({ member: member.name, title: book.title, action: 'borrowed', date: borrowDate.toLocaleString() });

  saveData();
  saveHistory();
  refreshUI();
  showNotification(`${book.title} borrowed by ${member.name}`);
}

export function returnBook(bookId) {
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) return showNotification('Book not found');

  borrowHistory.push({ member: book.borrowedBy, title: book.title, action: 'returned', date: new Date().toLocaleString() });

  book.status = 'Available';
  book.borrowedBy = null;
  saveData();
  saveHistory();
  refreshUI();
  showNotification(`${book.title} returned.`);
}
