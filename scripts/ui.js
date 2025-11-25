// ui.js
import { sampleBooks } from './data.js';
import { borrowBook, returnBook } from './borrowReturn.js';

export function showNotification(msg) {
  const notification = document.getElementById('notification');
  notification.textContent = msg;
  notification.style.display = 'block';
  setTimeout(() => notification.style.display = 'none', 3000);
}

export function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function createBookElement(book) {
  const div = document.createElement('div');
  div.className = 'book-card';
  div.dataset.id = book.id;

  const borrowerText = book.borrowedBy ? ` — borrowed by ${book.borrowedBy}` : '';
  const statusClass = book.status.toLowerCase().includes('borrow') ? 'status-borrowed' : 'status-available';

  div.innerHTML = `
    <div class="book-cover"><i class="fas fa-book"></i></div>
    <div class="book-details">
      <h3 class="book-title">${escapeHtml(book.title)}</h3>
      <p class="book-author">${escapeHtml(book.author)}</p>
      <div class="book-meta">
        <span class="book-year">${book.year}</span>
        <span class="${statusClass}">${escapeHtml(book.status)}</span>
      </div>
      <div class="book-borrower">${borrowerText}</div>
      <div><button class="borrow-btn btn btn-outline">${book.status === 'Available' ? 'Borrow' : 'Return'}</button></div>
    </div>
  `;

  const btn = div.querySelector('.borrow-btn');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (book.status === 'Available') borrowBook(book.id);
    else returnBook(book.id);
  });

  return div;
}

export function renderBooks() {
  const booksContainer = document.getElementById('books-container');
  const allBooksContainer = document.getElementById('all-books-container');
  booksContainer.innerHTML = '';
  allBooksContainer.innerHTML = '';
  sampleBooks.forEach(book => {
    booksContainer.appendChild(createBookElement(book));
    allBooksContainer.appendChild(createBookElement(book));
  });
}
