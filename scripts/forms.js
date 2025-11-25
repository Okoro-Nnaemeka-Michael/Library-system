// forms.js
import { sampleBooks, saveData } from './data.js';
import { closeModals } from './modals.js';
import { showNotification } from './ui.js';
import { refreshUI } from './main.js';

export function handleAddBook(e) {
  e.preventDefault();

  const newBook = {
    id: sampleBooks.length ? sampleBooks[sampleBooks.length - 1].id + 1 : 1,
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    year: parseInt(document.getElementById('bookYear').value) || new Date().getFullYear(),
    isbn: document.getElementById('bookIsbn').value.trim(),
    category: document.getElementById('bookCategory').value.trim(),
    description: document.getElementById('bookDescription').value.trim(),
    status: 'Available',
    borrowedBy: null
  };

  if (!newBook.title || !newBook.author) {
    showNotification('Please fill in title and author.');
    return;
  }

  sampleBooks.unshift(newBook);
  saveData();
  refreshUI();
  closeModals();
  document.getElementById('addBookForm').reset();
  showNotification('Book added successfully!');
}
