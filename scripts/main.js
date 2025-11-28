// ========== DATA MANAGEMENT ==========
const sampleBooks = [
  {id: 1, title: 'The Midnight Library', author: 'Matt Haig', year: 2020, status: 'Available', isbn: '978-1786892707', category: 'Fiction', description: 'A novel about all the choices that go into a life well lived.', borrowedBy: null},
  {id: 2, title: 'Project Hail Mary', author: 'Andy Weir', year: 2021, status: 'Borrowed', isbn: '978-0593135204', category: 'Science Fiction', description: 'A lone astronaut must save the earth from disaster...', borrowedBy: 'John Doe'},
  {id: 3, title: 'The Silent Patient', author: 'Alex Michaelides', year: 2019, status: 'Available', isbn: '978-1250301697', category: 'Mystery', description: 'A psychological thriller...', borrowedBy: null},
  {id: 4, title: 'Dune', author: 'Frank Herbert', year: 1965, status: 'Available', isbn: '978-0441172719', category: 'Science Fiction', description: 'A masterpiece of world-building...', borrowedBy: null}
];

let members = [
  { id: 1, name: 'Gift Vivian', email: 'gift@email.com', phone: '123-456-7890', joinDate: '2024-01-15' },
  { id: 2, name: 'Samuel Edward', email: 'samuel@email.com', phone: '987-654-3210', joinDate: '2024-01-20' }
];

let borrowHistory = JSON.parse(localStorage.getItem('borrowHistory')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ========== UTILITY FUNCTIONS ==========
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function showNotification(msg, type = 'success') {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = msg;
  notification.className = 'notification show';
  notification.style.backgroundColor = type === 'error' ? 'var(--danger)' : 'var(--success)';
  
  setTimeout(() => {
    notification.className = 'notification';
  }, 3000);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
}

function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
    modal.classList.remove('active');
  });
}

function loadData() {
  const storedBooks = JSON.parse(localStorage.getItem('books'));
  const storedMembers = JSON.parse(localStorage.getItem('members'));
  const storedHistory = JSON.parse(localStorage.getItem('borrowHistory'));
  
  if (Array.isArray(storedBooks)) {
    sampleBooks.splice(0, sampleBooks.length, ...storedBooks);
  }
  if (Array.isArray(storedMembers)) {
    members.splice(0, members.length, ...storedMembers);
  }
  if (Array.isArray(storedHistory)) {
    borrowHistory.splice(0, borrowHistory.length, ...storedHistory);
  }
}

function saveData() {
  localStorage.setItem('books', JSON.stringify(sampleBooks));
  localStorage.setItem('members', JSON.stringify(members));
  localStorage.setItem('borrowHistory', JSON.stringify(borrowHistory));
}

// ========== PAGE DETECTION ==========
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('index.html') || path.endsWith('/')) return 'dashboard';
  if (path.includes('books.html')) return 'books';
  if (path.includes('members.html')) return 'members';
  if (path.includes('report.html')) return 'report';
  return 'dashboard';
}

// ========== DASHBOARD-SPECIFIC FUNCTIONS ==========
function setupDashboardNavigation() {
  const navLinks = document.querySelectorAll('nav .nav-link[data-section]');
  const sections = document.querySelectorAll('main .content > div');
  
  // Only run if we're on the dashboard page and have multiple sections
  if (getCurrentPage() !== 'dashboard' || sections.length <= 1) return;
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute('data-section');
      
      // Update active nav link
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');
      
      // Show/hide sections
      sections.forEach(section => {
        if (section.id === `${targetSection}-section`) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
}

// ========== SIDEBAR NAVIGATION ==========
function setupSidebarNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      navigateToSection(section);
    });
  });
}

function navigateToSection(section) {
  const pageMap = {
    'dashboard': 'index.html',
    'books': 'books.html',
    'members': 'members.html',
    'statistics': 'report.html',
    'history': 'report.html',
    'overdue': 'report.html'
  };

  const targetPage = pageMap[section];
  if (targetPage && targetPage !== window.location.pathname.split('/').pop()) {
    window.location.href = targetPage;
  }
}

// ========== BOOK MANAGEMENT - FIXED BORROW/RETURN ==========
function createBookElement(book) {
  const div = document.createElement('div');
  div.className = 'book-card';
  div.dataset.id = book.id;

  const borrowerText = book.borrowedBy ? ` — borrowed by ${book.borrowedBy}` : '';
  const statusClass = book.status && book.status.toLowerCase().includes('borrow') ? 'status-borrowed' : 'status-available';
  const buttonText = book.status === 'Available' ? 'Borrow' : 'Return';
  const buttonClass = book.status === 'Available' ? 'btn-primary' : 'btn-outline';

  div.innerHTML = `
    <div class="book-cover"><i class="fas fa-book"></i></div>
    <div class="book-details">
      <h3 class="book-title">${escapeHtml(book.title)}</h3>
      <p class="book-author">${escapeHtml(book.author)}</p>
      <div class="book-meta">
        <span class="book-year">${book.year}</span>
        <span class="${statusClass}">${escapeHtml(book.status)}</span>
      </div>
      <div class="book-borrower" style="margin-top:8px; color:var(--gray); font-size:0.9rem;">${borrowerText}</div>
      <div style="margin-top:10px;">
        <button class="borrow-btn btn ${buttonClass}" data-book-id="${book.id}">
          ${buttonText}
        </button>
      </div>
    </div>
  `;

  // Fix: Proper event listener attachment
  const btn = div.querySelector('.borrow-btn');
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    const bookId = parseInt(this.getAttribute('data-book-id'));
    console.log('Button clicked for book:', bookId, 'Status:', book.status);
    
    if (book.status === 'Available') {
      borrowBook(bookId);
    } else {
      returnBook(bookId);
    }
  });

  div.addEventListener('click', function(e) {
    if (!e.target.classList.contains('borrow-btn') && !e.target.closest('.borrow-btn')) {
      showBookDetails(book);
    }
  });

  return div;
}

function renderBooks() {
  const booksContainer = document.getElementById('books-container');
  const allBooksContainer = document.getElementById('all-books-container');
  
  console.log('Rendering books...');
  
  if (booksContainer) {
    booksContainer.innerHTML = '';
    sampleBooks.forEach(book => {
      const bookElement = createBookElement(book);
      booksContainer.appendChild(bookElement);
    });
  }

  if (allBooksContainer) {
    allBooksContainer.innerHTML = '';
    sampleBooks.forEach(book => {
      const bookElement = createBookElement(book);
      allBooksContainer.appendChild(bookElement);
    });
  }
}

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

  // Update borrow button
  const borrowBtn = document.getElementById('borrowBookBtn');
  if (borrowBtn) {
    borrowBtn.textContent = book.status === 'Available' ? 'Borrow Book' : 'Return Book';
    borrowBtn.onclick = function() {
      if (book.status === 'Available') {
        borrowBook(book.id);
      } else {
        returnBook(book.id);
      }
      closeModals();
    };
  }

  // Update edit button
  const editBtn = document.getElementById('editBookBtn');
  if (editBtn) {
    editBtn.onclick = function() {
      populateEditBookForm(book);
      closeModals();
      openModal('addBookModal');
    };
  }
}

function populateEditBookForm(book) {
  document.getElementById('bookTitle').value = book.title;
  document.getElementById('bookAuthor').value = book.author;
  document.getElementById('bookIsbn').value = book.isbn;
  document.getElementById('bookYear').value = book.year;
  document.getElementById('bookCategory').value = book.category.toLowerCase();
  document.getElementById('bookDescription').value = book.description || '';
  
  // Change form to edit mode
  const form = document.getElementById('addBookForm');
  form.dataset.editId = book.id;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Update Book';
}

function handleAddBook(e) {
  e.preventDefault();
  
  const form = e.target;
  const isEdit = form.dataset.editId;
  
  const bookData = {
    title: document.getElementById('bookTitle').value,
    author: document.getElementById('bookAuthor').value,
    year: parseInt(document.getElementById('bookYear').value) || new Date().getFullYear(),
    isbn: document.getElementById('bookIsbn').value,
    category: document.getElementById('bookCategory').value,
    description: document.getElementById('bookDescription').value,
    status: 'Available',
    borrowedBy: null
  };

  if (isEdit) {
    // Update existing book
    const bookId = parseInt(isEdit);
    const bookIndex = sampleBooks.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
      sampleBooks[bookIndex] = { ...sampleBooks[bookIndex], ...bookData };
      showNotification('Book updated successfully!');
    }
  } else {
    // Add new book
    const newBook = {
      id: sampleBooks.length ? Math.max(...sampleBooks.map(b => b.id)) + 1 : 1,
      ...bookData
    };
    sampleBooks.unshift(newBook);
    showNotification('Book added successfully!');
  }

  saveData();
  refreshUI();
  closeModals();
  form.reset();
  delete form.dataset.editId;
  
  // Reset submit button text
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Add Book';
}

// ========== MEMBER MANAGEMENT ==========
function handleAddMember() {
  const name = prompt('Enter member full name:');
  if (!name) {
    showNotification('Member creation cancelled or name empty.');
    return;
  }
  
  const email = prompt('Enter member email:') || '';
  const phone = prompt('Enter member phone:') || '';
  
  const newMember = { 
    id: members.length ? Math.max(...members.map(m => m.id)) + 1 : 1, 
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    joinDate: new Date().toISOString().split('T')[0]
  };
  
  members.push(newMember);
  saveData();
  showNotification(`Member "${newMember.name}" added successfully!`);
}

function renderMembersTable() {
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;
  
  if (members.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding:2.5rem; text-align:center; color:var(--gray);">
          No members yet. Click <strong>Add Member</strong> to create the first member.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = members.map(member => `
    <tr>
      <td style="padding:12px 16px;">${member.id}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.name)}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.email || 'N/A')}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.phone || 'N/A')}</td>
      <td style="padding:12px 16px;">${member.joinDate || 'N/A'}</td>
      <td style="padding:12px 16px; text-align:center;">
        <button class="btn btn-outline view-member" data-id="${member.id}">View</button>
        <button class="btn btn-outline edit-member" data-id="${member.id}">Edit</button>
        <button class="btn btn-outline delete-member" data-id="${member.id}" style="color:var(--danger);">Delete</button>
      </td>
    </tr>
  `).join('');
  
  attachMemberEventListeners();
}

function attachMemberEventListeners() {
  document.querySelectorAll('.view-member').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const memberId = parseInt(e.target.dataset.id);
      viewMember(memberId);
    });
  });
  
  document.querySelectorAll('.edit-member').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const memberId = parseInt(e.target.dataset.id);
      editMember(memberId);
    });
  });
  
  document.querySelectorAll('.delete-member').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const memberId = parseInt(e.target.dataset.id);
      confirmDeleteMember(memberId);
    });
  });
}

function viewMember(memberId) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  document.getElementById('viewMemberName').textContent = member.name;
  document.getElementById('viewMemberEmail').textContent = member.email || 'N/A';
  document.getElementById('viewMemberPhone').textContent = member.phone || 'N/A';
  document.getElementById('viewMemberDate').textContent = member.joinDate || 'N/A';
  
  // Show borrowed books
  const borrowedBooks = sampleBooks.filter(b => b.borrowedBy === member.name);
  const borrowedContainer = document.getElementById('viewBorrowedBooks');
  if (borrowedBooks.length > 0) {
    borrowedContainer.innerHTML = borrowedBooks.map(book => 
      `<div style="margin-bottom: 0.5rem;">• ${book.title} (Due: ${book.dueDate || 'N/A'})</div>`
    ).join('');
  } else {
    borrowedContainer.textContent = 'No books borrowed.';
  }
  
  // Set up edit button
  const editBtn = document.getElementById('viewMemberEditBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      closeModals();
      editMember(memberId);
    };
  }
  
  openModal('viewMemberModal');
}

function editMember(memberId) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  document.getElementById('editMemberId').value = member.id;
  document.getElementById('editMemberName').value = member.name;
  document.getElementById('editMemberEmail').value = member.email || '';
  document.getElementById('editMemberPhone').value = member.phone || '';
  
  openModal('editMemberModal');
}

function confirmDeleteMember(memberId) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  // Check if member has borrowed books
  const borrowedBooks = sampleBooks.filter(b => b.borrowedBy === member.name);
  if (borrowedBooks.length > 0) {
    showNotification(`Cannot delete member. ${member.name} has ${borrowedBooks.length} borrowed book(s).`, 'error');
    return;
  }
  
  document.getElementById('deleteMemberName').textContent = member.name;
  
  const confirmBtn = document.getElementById('confirmDeleteMember');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      deleteMember(memberId);
      closeModals();
    };
  }
  
  openModal('deleteMemberModal');
}

function deleteMember(memberId) {
  members = members.filter(m => m.id !== memberId);
  saveData();
  renderMembersTable();
  showNotification('Member deleted successfully!');
}

function handleAddMemberForm(e) {
  e.preventDefault();
  
  const newMember = {
    id: members.length ? Math.max(...members.map(m => m.id)) + 1 : 1,
    name: document.getElementById('memberName').value,
    email: document.getElementById('memberEmail').value,
    phone: document.getElementById('memberPhone').value,
    joinDate: new Date().toISOString().split('T')[0]
  };
  
  members.push(newMember);
  saveData();
  renderMembersTable();
  closeModals();
  showNotification('Member added successfully!');
  
  // Reset form
  e.target.reset();
}

function handleEditMemberForm(e) {
  e.preventDefault();
  
  const memberId = parseInt(document.getElementById('editMemberId').value);
  const memberIndex = members.findIndex(m => m.id === memberId);
  
  if (memberIndex !== -1) {
    members[memberIndex] = {
      ...members[memberIndex],
      name: document.getElementById('editMemberName').value,
      email: document.getElementById('editMemberEmail').value,
      phone: document.getElementById('editMemberPhone').value
    };
    
    saveData();
    renderMembersTable();
    closeModals();
    showNotification('Member updated successfully!');
  }
}

function handleMemberSearch() {
  const searchInput = document.getElementById('memberSearchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.trim().toLowerCase();
  const tbody = document.getElementById('membersTableBody');
  
  if (!query) {
    renderMembersTable();
    return;
  }
  
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(query) ||
    (member.email && member.email.toLowerCase().includes(query)) ||
    (member.phone && member.phone.includes(query))
  );
  
  if (filteredMembers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding:2.5rem; text-align:center; color:var(--gray);">
          No members found matching "${query}".
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredMembers.map(member => `
    <tr>
      <td style="padding:12px 16px;">${member.id}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.name)}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.email || 'N/A')}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.phone || 'N/A')}</td>
      <td style="padding:12px 16px;">${member.joinDate || 'N/A'}</td>
      <td style="padding:12px 16px; text-align:center;">
        <button class="btn btn-outline view-member" data-id="${member.id}">View</button>
        <button class="btn btn-outline edit-member" data-id="${member.id}">Edit</button>
        <button class="btn btn-outline delete-member" data-id="${member.id}" style="color:var(--danger);">Delete</button>
      </td>
    </tr>
  `).join('');
  
  attachMemberEventListeners();
}

// ========== BORROW/RETURN SYSTEM - FIXED ==========
function borrowBook(bookId) {
  console.log('Borrowing book:', bookId);
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) {
    showNotification('Book not found', 'error');
    return;
  }

  if (members.length === 0) {
    showNotification('No members exist. Add a member first.', 'error');
    return;
  }

  // Create member selection modal
  const memberOptions = members.map(m => 
    `<option value="${m.id}">${m.name}</option>`
  ).join('');

  const modalHtml = `
    <div class="modal active" id="selectMemberModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Borrow Book</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="form-group">
          <label for="memberSelect">Select Member:</label>
          <select id="memberSelect" class="form-control" required>
            <option value="">Choose a member...</option>
            ${memberOptions}
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" id="cancelBorrowBtn">Cancel</button>
          <button type="button" class="btn btn-primary" id="confirmBorrowBtn">Borrow Book</button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('selectMemberModal');
  if (existingModal) existingModal.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Add event listeners to the new modal buttons
  setTimeout(() => {
    const cancelBtn = document.getElementById('cancelBorrowBtn');
    const confirmBtn = document.getElementById('confirmBorrowBtn');
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModals);
    }
    
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => confirmBorrow(bookId));
    }
    
    // Add close event to the close button
    const closeBtn = document.querySelector('#selectMemberModal .close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModals);
    }
  }, 100);
}

function confirmBorrow(bookId) {
  const select = document.getElementById('memberSelect');
  if (!select) {
    showNotification('Member selection not found', 'error');
    return;
  }
  
  const memberId = parseInt(select.value);
  const member = members.find(m => m.id === memberId);
  
  if (!member) {
    showNotification('Please select a valid member', 'error');
    return;
  }

  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) return;

  if (book.status === "Borrowed") {
    showNotification("This book is already borrowed.", "error");
    return;
  }

  // ===== Create borrow + due dates =====
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(borrowDate.getDate() + 14);

  book.status = "Borrowed";
  book.borrowedBy = member.name;
  book.borrowDate = borrowDate.toISOString().split("T")[0];
  book.dueDate = dueDate.toISOString().split("T")[0];

  // Add to history
  borrowHistory.push({
    id: borrowHistory.length + 1,
    bookId,
    memberId,
    bookTitle: book.title,
    memberName: member.name,
    borrowDate: book.borrowDate,
    dueDate: book.dueDate,
    returnDate: null
  });

  saveData();
  closeModals();
  refreshUI();
  showNotification(`"${book.title}" borrowed by ${member.name}`);
}


// ================= RETURN SYSTEM =====================
function returnBook(bookId) {
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) return;

  if (book.status === "Available") {
    showNotification("This book is not borrowed.", "error");
    return;
  }

  // Update book
  book.status = "Available";
  book.borrowedBy = null;
  const returnDate = new Date().toISOString().split("T")[0];

  // Update history
  const historyRecord = borrowHistory
    .slice()
    .reverse()
    .find(h => h.bookId === bookId && !h.returnDate);

  if (historyRecord) {
    historyRecord.returnDate = returnDate;
  }

  saveData();
  refreshUI();
  showNotification(`"${book.title}" has been returned`);
}



function renderBorrowReturnList() {
  const borrowed = sampleBooks.filter(b => b.status === 'Borrowed');
  if (borrowed.length === 0) {
    showNotification('No borrowed books currently.');
    return;
  }

  const list = borrowed.map(b => `• ${b.title} → ${b.borrowedBy} (Due: ${b.dueDate})`).join('\n');
  
  // Create a modal to show the list
  const modalHtml = `
    <div class="modal active" id="borrowedListModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Borrowed Books</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div style="padding: 1.5rem; max-height: 400px; overflow-y: auto;">
          <pre style="white-space: pre-wrap; font-family: inherit;">${list}</pre>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" id="closeBorrowedList">Close</button>
        </div>
      </div>
    </div>
  `;

  const existingModal = document.getElementById('borrowedListModal');
  if (existingModal) existingModal.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Add event listener to close button
  setTimeout(() => {
    const closeBtn = document.getElementById('closeBorrowedList');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModals);
    }
    
    // Add close event to the close button
    const modalCloseBtn = document.querySelector('#borrowedListModal .close-modal');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModals);
    }
  }, 100);
}

// ========== ADMIN TOOLS - FIXED ==========
function calculateOverdueFines() {
  const now = new Date();
  let totalFines = 0;
  const overdueBooks = [];

  sampleBooks.forEach(book => {
    if (book.status === 'Borrowed' && book.dueDate) {
      const dueDate = new Date(book.dueDate);
      if (dueDate < now) {
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        const fine = Math.min(daysOverdue * 0.50, 10.00); // $0.50/day, max $10
        totalFines += fine;
        overdueBooks.push({
          title: book.title,
          borrower: book.borrowedBy,
          daysOverdue: daysOverdue,
          fine: fine.toFixed(2)
        });
      }
    }
  });

  return { totalFines: totalFines.toFixed(2), overdueBooks };
}

function showFineReport() {
  console.log('Showing fine report');
  const fineData = calculateOverdueFines();
  
  if (fineData.overdueBooks.length === 0) {
    showNotification('No overdue fines at this time.');
    return;
  }

  const report = fineData.overdueBooks.map(book => 
    `• ${book.title} - ${book.borrower}: ${book.daysOverdue} days overdue ($${book.fine})`
  ).join('\n');

  const modalHtml = `
    <div class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Overdue Fines Report</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div style="padding: 1.5rem;">
          <p><strong>Total Fines Due: $${fineData.totalFines}</strong></p>
          <div style="max-height: 300px; overflow-y: auto;">
            <pre style="white-space: pre-wrap;">${report}</pre>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" id="closeFineReport">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Add event listener to close button
  setTimeout(() => {
    const closeBtn = document.getElementById('closeFineReport');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModals);
    }
  }, 100);
}

function showBulkImportModal() {
  console.log('Showing bulk import modal');
  const modalHtml = `
    <div class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Bulk Book Import</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div style="padding: 1.5rem;">
          <textarea id="bulkImportText" placeholder="Enter book data in format:
Title, Author, ISBN, Year, Category
Example:
The Great Gatsby, F. Scott Fitzgerald, 978-0-7432-7356-5, 1925, Fiction
1984, George Orwell, 978-0-452-28423-4, 1949, Science Fiction" 
          rows="10" style="width: 100%; padding: 0.5rem;"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-outline" id="cancelBulkImport">Cancel</button>
          <button class="btn btn-primary" id="processBulkImport">Import Books</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Add event listeners
  setTimeout(() => {
    const cancelBtn = document.getElementById('cancelBulkImport');
    const processBtn = document.getElementById('processBulkImport');
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModals);
    }
    
    if (processBtn) {
      processBtn.addEventListener('click', processBulkImport);
    }
  }, 100);
}

function processBulkImport() {
  const textarea = document.getElementById('bulkImportText');
  const lines = textarea.value.split('\n').filter(line => line.trim());
  let importedCount = 0;

  lines.forEach((line, index) => {
    if (index === 0 && line.toLowerCase().includes('title')) return; // Skip header
    
    const parts = line.split(',').map(part => part.trim());
    if (parts.length >= 4) {
      const newBook = {
        id: sampleBooks.length ? Math.max(...sampleBooks.map(b => b.id)) + 1 + importedCount : 1 + importedCount,
        title: parts[0],
        author: parts[1],
        isbn: parts[2] || '',
        year: parseInt(parts[3]) || new Date().getFullYear(),
        category: parts[4] || 'General',
        status: 'Available',
        borrowedBy: null,
        description: ''
      };
      
      // Check for duplicates by ISBN
      if (!sampleBooks.some(book => book.isbn === newBook.isbn && newBook.isbn !== '')) {
        sampleBooks.push(newBook);
        importedCount++;
      }
    }
  });

  saveData();
  refreshUI();
  closeModals();
  showNotification(`Successfully imported ${importedCount} new books!`);
}

function showSystemSettings() {
  console.log('Showing system settings');
  const modalHtml = `
    <div class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h2>System Settings</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div style="padding: 1.5rem;">
          <div class="form-group">
            <label>Library Name</label>
            <input type="text" class="form-control" value="Mike's Library" id="libraryName">
          </div>
          <div class="form-group">
            <label>Max Books Per Member</label>
            <input type="number" class="form-control" value="5" id="maxBooks">
          </div>
          <div class="form-group">
            <label>Borrow Period (Days)</label>
            <input type="number" class="form-control" value="14" id="borrowPeriod">
          </div>
          <div class="form-group">
            <label>Daily Fine Amount ($)</label>
            <input type="number" class="form-control" value="0.50" step="0.01" id="dailyFine">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-outline" id="cancelSettings">Cancel</button>
          <button class="btn btn-primary" id="saveSettings">Save Settings</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Add event listeners
  setTimeout(() => {
    const cancelBtn = document.getElementById('cancelSettings');
    const saveBtn = document.getElementById('saveSettings');
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModals);
    }
    
    if (saveBtn) {
      saveBtn.addEventListener('click', saveSystemSettings);
    }
  }, 100);
}

function saveSystemSettings() {
  // In a real app, you'd save these to localStorage
  showNotification('System settings saved successfully!');
  closeModals();
}

// ========== SEARCH FUNCTIONALITY ==========
function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    refreshUI();
    return;
  }

  const filtered = sampleBooks.filter(book => 
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query)
  );

  const booksContainer = document.getElementById('books-container');
  const allBooksContainer = document.getElementById('all-books-container');

  if (booksContainer) {
    booksContainer.innerHTML = '';
    filtered.forEach(book => {
      booksContainer.appendChild(createBookElement(book));
    });
  }

  if (allBooksContainer) {
    allBooksContainer.innerHTML = '';
    filtered.forEach(book => {
      allBooksContainer.appendChild(createBookElement(book));
    });
  }
}

// ========== AUTHENTICATION SYSTEM ==========
let isSignup = false;

function toggleAuthMode() {
  isSignup = !isSignup;
  const authTitle = document.getElementById('authTitle');
  const nameField = document.getElementById('nameField');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authToggle = document.getElementById('authToggle');
  
  if (authTitle) authTitle.textContent = isSignup ? 'Sign Up' : 'Login';
  if (nameField) nameField.style.display = isSignup ? 'block' : 'none';
  if (authSubmitBtn) authSubmitBtn.textContent = isSignup ? 'Sign Up' : 'Login';
  if (authToggle) {
    authToggle.innerHTML = isSignup
      ? 'Already have an account? <a href="#">Login</a>'
      : "Don't have an account? <a href='#'>Sign up</a>";
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value.trim();

  if (isSignup) {
    const name = document.getElementById('authName').value.trim();
    if (!name || !email || !password) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    if (users.some(u => u.email === email)) {
      showNotification('User already exists', 'error');
      return;
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: users.length === 0 ? 'admin' : 'member',
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Automatically add to members list
    const newMember = {
      id: members.length ? Math.max(...members.map(m => m.id)) + 1 : 1,
      name,
      email,
      joinDate: new Date().toISOString().split('T')[0]
    };
    members.push(newMember);
    saveData();

    showNotification('Account created successfully! Please login.');
    toggleAuthMode();
  } else {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      showNotification('Invalid email or password', 'error');
      return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Hide auth modal and show app
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.style.display = 'none';
    
    setupRoleAccess();
    showNotification(`Welcome, ${user.name}!`);
  }

  const authForm = document.getElementById('authForm');
  if (authForm) authForm.reset();
}

function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('currentUser');
    location.reload();
  }
}

function setupRoleAccess() {
  const addBookBtn = document.getElementById('addBookBtn');
  const addMemberBtn = document.getElementById('addMemberBtn');
  const addBookSidebarBtn = document.getElementById('addBookSidebarBtn');
  const addMemberSidebarBtn = document.getElementById('addMemberSidebarBtn');

  if (!currentUser) return;

  if (currentUser.role === 'member') {
    [addBookBtn, addMemberBtn, addBookSidebarBtn, addMemberSidebarBtn].forEach(btn => {
      if (btn) btn.style.display = 'none';
    });
  }
}

// ========== DASHBOARD STATISTICS ==========
function updateDashboardStats() {
  const totalBooks = sampleBooks.length;
  const borrowedBooks = sampleBooks.filter(b => b.status === 'Borrowed').length;
  const membersCount = members.length;

  // Update dashboard stats
  const totalBooksEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
  const borrowedBooksEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
  const membersEl = document.querySelector('.stat-card:nth-child(3) .stat-value');

  if (totalBooksEl) totalBooksEl.textContent = totalBooks.toLocaleString();
  if (borrowedBooksEl) borrowedBooksEl.textContent = borrowedBooks.toLocaleString();
  if (membersEl) membersEl.textContent = membersCount.toLocaleString();

  // Update notification badge
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = document.querySelector('.notification-badge');
  if (!badge) return;

  const now = new Date();
  const overdueCount = sampleBooks.filter(b =>
    b.status === 'Borrowed' &&
    b.dueDate &&
    new Date(b.dueDate) < now
  ).length;

  if (overdueCount > 0) {
    badge.textContent = overdueCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ========== REPORTING FUNCTIONS ==========
function showStatistics() {
  navigateToSection('statistics');
}

function showBorrowHistory() {
  navigateToSection('history');
}

function showOverdueBooks() {
  navigateToSection('overdue');
}

// ========== PAGE-SPECIFIC INITIALIZATION ==========
function refreshUI() {
  const currentPage = getCurrentPage();
  
  // Only run page-specific refreshes
  if (currentPage === 'dashboard' || currentPage === 'books') {
    renderBooks();
    updateDashboardStats();
  }
  
  if (currentPage === 'members') {
    renderMembersTable();
  }
}

function setupPageSpecificListeners() {
  const currentPage = getCurrentPage();
  
  // Common listeners for all pages
  setupSidebarNavigation();
  
  // Page-specific listeners
  if (currentPage === 'dashboard') {
    setupDashboardNavigation();
    
    // Dashboard-specific buttons
    const addMemberSidebarBtn = document.getElementById('addMemberSidebarBtn');
    if (addMemberSidebarBtn) {
      addMemberSidebarBtn.addEventListener('click', handleAddMember);
    }

    const borrowReturnSidebarBtn = document.getElementById('borrowReturnSidebarBtn');
    if (borrowReturnSidebarBtn) {
      borrowReturnSidebarBtn.addEventListener('click', renderBorrowReturnList);
    }
  }
  
  // Book-related listeners (dashboard and books pages)
  if (currentPage === 'dashboard' || currentPage === 'books') {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) addBookForm.addEventListener('submit', handleAddBook);
    
    const addBookBtn = document.getElementById('addBookBtn');
    const addBookSidebarBtn = document.getElementById('addBookSidebarBtn');
    const addBookFromCatalogBtn = document.getElementById('addBookFromCatalogBtn');
    
    [addBookBtn, addBookSidebarBtn, addBookFromCatalogBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', () => openModal('addBookModal'));
    });

    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') handleSearch();
      });
    }
  }
  
  // Members page listeners
  if (currentPage === 'members') {
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', () => openModal('addMemberModal'));
    }

    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) addMemberForm.addEventListener('submit', handleAddMemberForm);

    const editMemberForm = document.getElementById('editMemberForm');
    if (editMemberForm) editMemberForm.addEventListener('submit', handleEditMemberForm);

    const memberSearchBtn = document.getElementById('memberSearchBtn');
    if (memberSearchBtn) {
      memberSearchBtn.addEventListener('click', handleMemberSearch);
    }

    const memberSearchInput = document.getElementById('memberSearchInput');
    if (memberSearchInput) {
      memberSearchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') handleMemberSearch();
      });
    }
  }
  
  // Reports page listeners
  if (currentPage === 'report') {
    const statsBtn = document.getElementById('statsBtn');
    const historyBtn = document.getElementById('historyBtn');
    const overdueBtn = document.getElementById('overdueBtn');
    
    if (statsBtn) statsBtn.addEventListener('click', showStatistics);
    if (historyBtn) historyBtn.addEventListener('click', showBorrowHistory);
    if (overdueBtn) overdueBtn.addEventListener('click', showOverdueBooks);
  }
}

// ========== GLOBAL EVENT LISTENERS - FIXED ADMIN TOOLS ==========
function setupGlobalListeners() {
  console.log('Setting up global listeners...');
  
  // Authentication
  const authToggle = document.getElementById('authToggle');
  if (authToggle) {
    authToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthMode();
    });
  }

  const authForm = document.getElementById('authForm');
  if (authForm) authForm.addEventListener('submit', handleAuthSubmit);
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Admin tools (available on all pages) - FIXED SELECTOR
  const fineReportBtn = document.getElementById('fineReportBtn');
  console.log('Fine report button:', fineReportBtn);
  if (fineReportBtn) {
    fineReportBtn.addEventListener('click', showFineReport);
  }

  const bulkImportBtn = document.getElementById('bulkImportBtn');
  console.log('Bulk import button:', bulkImportBtn);
  if (bulkImportBtn) {
    bulkImportBtn.addEventListener('click', showBulkImportModal);
  }

  const systemSettingsBtn = document.getElementById('systemSettingsBtn');
  console.log('System settings button:', systemSettingsBtn);
  if (systemSettingsBtn) {
    systemSettingsBtn.addEventListener('click', showSystemSettings);
  }

  // Modal close events
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  document.querySelectorAll('[data-close="true"]').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  const cancelAddBook = document.getElementById('cancelAddBook');
  if (cancelAddBook) cancelAddBook.addEventListener('click', closeModals);

  const cancelAddMember = document.getElementById('cancelAddMember');
  if (cancelAddMember) cancelAddMember.addEventListener('click', closeModals);

  // Close modals when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModals();
    }
  });
}

// ========== MAIN INITIALIZATION ==========
function initializeApp() {
  console.log('Initializing app...');
  loadData();
  setupGlobalListeners();
  setupPageSpecificListeners();
  refreshUI();

  // Check authentication
  if (!currentUser) {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.style.display = 'flex';
    // Hide main content if not logged in
    const mainContent = document.querySelector('main');
    const header = document.querySelector('header');
    const sidebar = document.querySelector('.sidebar');
    
    if (mainContent) mainContent.style.display = 'none';
    if (header) header.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
  } else {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.style.display = 'none';
    setupRoleAccess();
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally for HTML onclick handlers
window.confirmBorrow = confirmBorrow;
window.closeModals = closeModals;
window.borrowBook = borrowBook;
window.returnBook = returnBook;
window.showFineReport = showFineReport;
window.showBulkImportModal = showBulkImportModal;
window.showSystemSettings = showSystemSettings;
window.processBulkImport = processBulkImport;
