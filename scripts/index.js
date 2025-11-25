
const sampleBooks = [
  {id: 1, title: 'The Midnight Library', author: 'Matt Haig', year: 2020, status: 'Available', isbn: '978-1786892707', category: 'Fiction', description: 'A novel about all the choices that go into a life well lived.', borrowedBy: null},
  {id: 2, title: 'Project Hail Mary', author: 'Andy Weir', year: 2021, status: 'Borrowed', isbn: '978-0593135204', category: 'Science Fiction', description: 'A lone astronaut must save the earth from disaster...', borrowedBy: 'John Doe'},
  {id: 3, title: 'The Silent Patient', author: 'Alex Michaelides', year: 2019, status: 'Available', isbn: '978-1250301697', category: 'Mystery', description: 'A psychological thriller...', borrowedBy: null},
  {id: 4, title: 'Dune', author: 'Frank Herbert', year: 1965, status: 'Available', isbn: '978-0441172719', category: 'Science Fiction', description: 'A masterpiece of world-building...', borrowedBy: null}
];

let members = [
  { id: 1, name: 'Gift Vivian' },
  { id: 2, name: 'Samuel Edward' }
];

const addBookBtn = document.getElementById('addBookBtn');
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberSidebarBtn = document.getElementById('addMemberSidebarBtn'); 
const borrowReturnSidebarBtn = document.getElementById('borrowReturnSidebarBtn');
const booksContainer = document.getElementById('books-container');
const allBooksContainer = document.getElementById('all-books-container');
const addBookForm = document.getElementById('addBookForm');
const notification = document.getElementById('notification');
const statsBtn = document.getElementById('statsBtn');
const historyBtn = document.getElementById('historyBtn');
const overdueBtn = document.getElementById('overdueBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

/* load saved data if present */
function loadData() {
  const storedBooks = JSON.parse(localStorage.getItem('books'));
  const storedMembers = JSON.parse(localStorage.getItem('members'));
  if (Array.isArray(storedBooks)) {
    // replace contents of sampleBooks array (splice keeps reference)
    sampleBooks.splice(0, sampleBooks.length, ...storedBooks);
  }
  if (Array.isArray(storedMembers)) {
    members.splice(0, members.length, ...storedMembers);
  }
}

/* save to localStorage */
function saveData() {
  localStorage.setItem('books', JSON.stringify(sampleBooks));
  localStorage.setItem('members', JSON.stringify(members));
}

/* utility notifications */
function showNotification(msg) {
  notification.textContent = msg;
  notification.style.display = 'block';
  setTimeout(() => notification.style.display = 'none', 3000);
}

/* create a fresh book card element (with listeners) */
function createBookElement(book) {
  const div = document.createElement('div');
  div.className = 'book-card';
  div.dataset.id = book.id;

  // safe values
  const borrowerText = book.borrowedBy ? ` — borrowed by ${book.borrowedBy}` : '';
  const statusClass = book.status && book.status.toLowerCase().includes('borrow') ? 'status-borrowed' : 'status-available';

  div.innerHTML = `
    <div class="book-cover"><i class="fas fa-book"></i></div>
    <div class="book-details">
      <h3 class="book-title">${escapeHtml(book.title)}</h3>
      <p class="book-author">${escapeHtml(book.author)}</p>
      <div class="book-meta">
        <span class="book-year">${book.year}</span>
        <span class="${statusClass}">${escapeHtml(book.status)}</span>
      </div>
      <div class="book-borrower" style="margin-top:8px; color:var(--text-secondary); font-size:0.9rem;">${borrowerText}</div>
      <div style="margin-top:10px;">
        <button class="borrow-btn btn btn-outline">${book.status === 'Available' ? 'Borrow' : 'Return'}</button>
      </div>
    </div>
  `;

  // attach listener to the button (fresh element => works)
  const btn = div.querySelector('.borrow-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    if (book.status === 'Available') borrowBook(book.id);
    else returnBook(book.id);
  });

  // show details when clicking the card (optional)
  div.addEventListener('click', () => showBookDetails(book));

  return div;
}

/* escape helper to avoid injecting untrusted HTML */
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* render books into both containers using fresh elements (no clone) */
function renderBooks() {
  booksContainer.innerHTML = '';
  allBooksContainer.innerHTML = '';

  sampleBooks.forEach(book => {
    const elForDashboard = createBookElement(book);
    const elForCatalog = createBookElement(book);
    booksContainer.appendChild(elForDashboard);
    allBooksContainer.appendChild(elForCatalog);
  });
}

/* show details in modal (re-uses existing modal DOM in your page) */
function showBookDetails(book) {
  const titleEl = document.getElementById('detailBookTitle');
  if (!titleEl) return;

  document.getElementById('detailBookTitle').textContent = book.title;
  document.getElementById('detailBookAuthor').textContent = book.author;
  document.getElementById('detailBookYear').textContent = book.year;
  document.getElementById('detailBookCategory').textContent = book.category;
  document.getElementById('detailBookIsbn').textContent = book.isbn;
  const statusEl = document.getElementById('detailBookStatus');
  statusEl.textContent = book.status;
  statusEl.className = book.status.toLowerCase().includes('borrow') ? 'status-borrowed' : 'status-available';
  document.getElementById('detailBookDescription').textContent = book.description || '';
  openModal('bookDetailModal');

  const borrowBtn = document.getElementById('borrowBookBtn');
  const editBtn = document.getElementById('editBookBtn');

  if (borrowBtn) {
    const newBorrow = borrowBtn.cloneNode(true);
    borrowBtn.parentNode.replaceChild(newBorrow, borrowBtn);
    newBorrow.addEventListener('click', () => {
      if (book.status === 'Available') borrowBook(book.id);
      else returnBook(book.id);
      closeModals();
    });
  }

  if (editBtn) {
    const newEdit = editBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(newEdit, editBtn);
    newEdit.addEventListener('click', () => {
      openModal('addBookModal');
      // populate form for edit (simple UX)
      document.getElementById('bookTitle').value = book.title;
      document.getElementById('bookAuthor').value = book.author;
      document.getElementById('bookIsbn').value = book.isbn;
      document.getElementById('bookYear').value = book.year;
      document.getElementById('bookCategory').value = book.category.toLowerCase() || '';
      document.getElementById('bookDescription').value = book.description || '';
      closeModals();
      showNotification('Edit flow opened in Add Book modal (you can improve to support full edit).');
    });
  }
}

/* Add Member (prompt-based) */
function handleAddMember() {
  const name = prompt('Enter member full name:');
  if (!name) {
    showNotification('Member creation cancelled or name empty.');
    return;
  }
  const newMember = { id: (members.length ? members[members.length - 1].id + 1 : 1), name: name.trim() };
  members.push(newMember);
  saveData();
  showNotification(`Member "${newMember.name}" added.`);
}

/* Borrow / Return */
function borrowBook(bookId) {
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) { showNotification('Book not found'); return; }

  if (members.length === 0) {
    showNotification('No members exist. Add a member first.');
    return;
  }

  // build prompt list
  const memberList = members.map(m => `${m.id}: ${m.name}`).join('\n');
  const input = prompt(`Select member id to borrow "${book.title}":\n${memberList}`);
  if (!input) { showNotification('Borrow cancelled'); return; }

  const memberId = parseInt(input);
  const member = members.find(m => m.id === memberId);
  if (!member) { showNotification('Invalid member selected'); return; }

  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(borrowDate.getDate() + 7); // due in 7 days

  book.status = 'Borrowed';
  book.borrowedBy = member.name;
  book.borrowDate = borrowDate.toISOString().split('T')[0];
  book.dueDate = dueDate.toISOString().split('T')[0];

  borrowHistory.push({
    member: member.name,
    title: book.title,
    action: 'borrowed',
    date: borrowDate.toLocaleString()
  });

  saveData();
  saveHistory();
  refreshUI();
  showNotification(`"${book.title}" borrowed by ${member.name} (Due: ${book.dueDate})`);
}

function returnBook(bookId) {
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) { showNotification('Book not found'); return; }

  const returnDate = new Date();

  borrowHistory.push({
    member: book.borrowedBy,
    title: book.title,
    action: 'returned',
    date: returnDate.toLocaleString()
  });

  book.status = 'Available';
  book.borrowedBy = null;
  book.borrowDate = null;
  book.dueDate = null;

  saveData();
  saveHistory();
  refreshUI();
  showNotification(`"${book.title}" returned.`);
}

/* Borrowed list quick view */
function renderBorrowReturnList() {
  const borrowed = sampleBooks.filter(b => b.status === 'Borrowed');
  if (borrowed.length === 0) return showNotification('No borrowed books currently.');
  const list = borrowed.map(b => `• ${b.title} → ${b.borrowedBy}`).join('\n');
  alert('Borrowed Books:\n' + list);
}

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    refreshUI(); // show all if empty
    return;
  }

  const filtered = sampleBooks.filter(book => 
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query)
  );

  // render filtered results
  booksContainer.innerHTML = '';
  allBooksContainer.innerHTML = '';
  filtered.forEach(book => {
    booksContainer.appendChild(createBookElement(book));
    allBooksContainer.appendChild(createBookElement(book));
  });
}

// wire up search
if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (searchInput) searchInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') handleSearch();
});

/* Add book form handling */
function handleAddBook(e) {
  e && e.preventDefault && e.preventDefault();
  const newBook = {
    id: (sampleBooks.length ? sampleBooks[sampleBooks.length - 1].id + 1 : 1),
    title: document.getElementById('bookTitle').value,
    author: document.getElementById('bookAuthor').value,
    year: parseInt(document.getElementById('bookYear').value) || new Date().getFullYear(),
    isbn: document.getElementById('bookIsbn').value,
    category: document.getElementById('bookCategory').value,
    description: document.getElementById('bookDescription').value,
    status: 'Available',
    borrowedBy: null
  };
  sampleBooks.unshift(newBook);
  saveData();
  refreshUI();
  closeModals();
  addBookForm.reset();
  showNotification('Book added successfully!');
}

/* modal helpers */
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.style.display = 'flex';
}
function closeModals() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

/*  Statistics, History, Overdue */

let borrowHistory = JSON.parse(localStorage.getItem('borrowHistory')) || [];
function saveHistory() {
  localStorage.setItem('borrowHistory', JSON.stringify(borrowHistory));
}

// 🧮 Statistics modal / display
function showStatistics() {
  const totalBooks = sampleBooks.length;
  const borrowedBooks = sampleBooks.filter(b => b.status === 'Borrowed').length;
  const availableBooks = totalBooks - borrowedBooks;
  const totalMembers = members.length;

  const statsMsg = `
📊 Library Statistics
----------------------------
Total Books: ${totalBooks}
Available Books: ${availableBooks}
Borrowed Books: ${borrowedBooks}
Total Members: ${totalMembers}
  `;

  alert(statsMsg);
}

// 📜 Borrow history log
function showBorrowHistory() {
  if (borrowHistory.length === 0) {
    showNotification('No borrow history recorded yet.');
    return;
  }

  const historyText = borrowHistory
    .map(h => `• ${h.member} ${h.action} "${h.title}" on ${h.date}`)
    .join('\n');

  alert('Borrow History:\n' + historyText);
}

// =Overdue books
function showOverdueBooks() {
  const now = new Date();
  const overdue = sampleBooks.filter(b =>
    b.status === 'Borrowed' &&
    b.dueDate &&
    new Date(b.dueDate) < now
  );

  if (overdue.length === 0) {
    showNotification('No overdue books.');
    return;
  }

  const list = overdue.map(b =>
    `• ${b.title} — borrowed by ${b.borrowedBy} (Due: ${b.dueDate})`
  ).join('\n');

  alert('📅 Overdue Books:\n' + list);
}

/* AUTHENTICATION SYSTEM */
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const nameField = document.getElementById('nameField');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authName = document.getElementById('authName');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggle = document.getElementById('authToggle');

let isSignup = false;

/* Toggle between login and signup */
authToggle.addEventListener('click', (e) => {
  e.preventDefault();
  isSignup = !isSignup;
  authTitle.textContent = isSignup ? 'Sign Up' : 'Login';
  nameField.style.display = isSignup ? 'block' : 'none';
  authSubmitBtn.textContent = isSignup ? 'Sign Up' : 'Login';
  authToggle.innerHTML = isSignup
    ? 'Already have an account? <a href="#">Login</a>'
    : "Don't have an account? <a href='#'>Sign up</a>";
});

/* Handle Login/Signup Submission */
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value.trim();

  if (isSignup) {
    const name = authName.value.trim();
    if (!name || !email || !password) return alert('Please fill all fields.');

    if (users.some(u => u.email === email)) return alert('User already exists.');

    const newUser = {
      name,
      email,
      password,
      role: users.length === 0 ? 'admin' : 'member', //
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Automatically add to members list if not admin
    if (newUser.role === 'member') {
      sampleMembers.push({ name, email, id: sampleMembers.length + 1 });
      saveData();
    }

    alert('Account created successfully! You can now log in.');
    isSignup = false;
    authTitle.textContent = 'Login';
    nameField.style.display = 'none';
    authSubmitBtn.textContent = 'Login';
    authToggle.innerHTML = "Don't have an account? <a href='#'>Sign up</a>";
  } else {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return alert('Invalid email or password.');

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Hide auth modal and show app
    authModal.style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('header').style.display = 'flex';
    document.querySelector('.sidebar').style.display = 'flex';
    alert(`Welcome, ${user.name}!`);
  }

  authForm.reset();
});


window.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) {
    document.querySelector('main').style.display = 'none';
    // document.querySelector('header').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'none';
    authModal.style.display = 'flex';
  } else {
    authModal.style.display = 'none';
  }
});


/* LOGOUT FUNCTIONALITY */
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('currentUser');
      location.reload();
    }
  });
}

/* ADMIN ACCESS CONTROL */
function setupRoleAccess() {
  const addBookBtn = document.getElementById('addBookBtn');
  const addMemberBtn = document.getElementById('addMemberBtn');
  const statsBtn = document.getElementById('statsBtn');

  if (!currentUser) return;

  if (currentUser.role === 'member') {
    if (addBookBtn) addBookBtn.style.display = 'none';
    if (addMemberBtn) addMemberBtn.style.display = 'none';
    if (statsBtn) statsBtn.style.display = 'none';
  } else if (currentUser.role === 'admin') {
    if (addBookBtn) addBookBtn.style.display = 'inline-block';
    if (addMemberBtn) addMemberBtn.style.display = 'inline-block';
    if (statsBtn) statsBtn.style.display = 'inline-block';
  }
}

/* Call this after login */
window.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    setupRoleAccess();
  }
});

/* UPDATE DASHBOARD STATS */
function updateDashboardStats() {
  const totalBooks = sampleBooks.length;
  const borrowedBooks = sampleBooks.filter(b => b.status === 'Borrowed').length;
  const membersCount = members.length;

  // Target the HTML elements
  const totalBooksEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
  const borrowedBooksEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
  const membersEl = document.querySelector('.stat-card:nth-child(3) .stat-value');

  if (totalBooksEl) totalBooksEl.textContent = totalBooks.toLocaleString();
  if (borrowedBooksEl) borrowedBooksEl.textContent = borrowedBooks.toLocaleString();
  if (membersEl) membersEl.textContent = membersCount.toLocaleString();
}

/* NOTIFICATION BADGE (Overdue Books Count) */
function updateNotificationBadge() {
  const badge = document.querySelector('.notification-badge');
  if (!badge) return;

  // Count overdue books
  const now = new Date();
  const overdueCount = sampleBooks.filter(b =>
    b.status === 'Borrowed' &&
    b.dueDate &&
    new Date(b.dueDate) < now
  ).length;

  // Show or hide badge dynamically
  if (overdueCount > 0) {
    badge.textContent = overdueCount;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
} 

function refreshUI() {
  renderBooks();
  updateDashboardStats();
}


/* wire up events and initialize app */
function setupEventListeners() {
  if (addMemberBtn) addMemberBtn.addEventListener('click', handleAddMember);
  if (addMemberSidebarBtn) addMemberSidebarBtn.addEventListener('click', handleAddMember);

  if (borrowReturnSidebarBtn) borrowReturnSidebarBtn.addEventListener('click', renderBorrowReturnList);

  if (addBookForm) addBookForm.addEventListener('submit', handleAddBook);

  if (addBookBtn) addBookBtn.addEventListener('click', () => openModal('addBookModal'));

  if (statsBtn) statsBtn.addEventListener('click', showStatistics);
  if (historyBtn) historyBtn.addEventListener('click', showBorrowHistory);
  if (overdueBtn) overdueBtn.addEventListener('click', showOverdueBooks);

  const addBookSidebarBtn = document.getElementById('addBookSidebarBtn');
  const addBookFromCatalogBtn = document.getElementById('addBookFromCatalogBtn');
  if (addBookSidebarBtn) addBookSidebarBtn.addEventListener('click', () => openModal('addBookModal'));
  if (addBookFromCatalogBtn) addBookFromCatalogBtn.addEventListener('click', () => openModal('addBookModal'));

  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModals));
  const cancelBtn = document.getElementById('cancelAddBook');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModals);
}

loadData();
setupEventListeners();
refreshUI();