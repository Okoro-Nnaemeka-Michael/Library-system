// data.js
export let sampleBooks = [
  { id: 1, title: 'The Midnight Library', author: 'Matt Haig', year: 2020, status: 'Available', isbn: '978-1786892707', category: 'Fiction', description: 'A novel about all the choices that go into a life well lived.', borrowedBy: null },
  { id: 2, title: 'Project Hail Mary', author: 'Andy Weir', year: 2021, status: 'Borrowed', isbn: '978-0593135204', category: 'Science Fiction', description: 'A lone astronaut must save the earth from disaster...', borrowedBy: 'John Doe' }
];

export let members = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' }
];

export let borrowHistory = JSON.parse(localStorage.getItem('borrowHistory')) || [];

export function loadData() {
  const storedBooks = JSON.parse(localStorage.getItem('books'));
  const storedMembers = JSON.parse(localStorage.getItem('members'));
  if (Array.isArray(storedBooks)) sampleBooks = storedBooks;
  if (Array.isArray(storedMembers)) members = storedMembers;
}

export function saveData() {
  localStorage.setItem('books', JSON.stringify(sampleBooks));
  localStorage.setItem('members', JSON.stringify(members));
}

export function saveHistory() {
  localStorage.setItem('borrowHistory', JSON.stringify(borrowHistory));
}
