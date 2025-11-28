// Import functions from main script
import { 
  sampleBooks, 
  members, 
  borrowHistory, 
  escapeHtml, 
  showNotification,
  openModal,
  closeModals 
} from './index.js';

// ========== STATISTICS FUNCTIONS ==========
function updateStatistics() {
  const totalBooks = sampleBooks.length;
  const borrowedBooks = sampleBooks.filter(b => b.status === 'Borrowed').length;
  const totalMembers = members.length;
  
  const now = new Date();
  const overdueBooks = sampleBooks.filter(b => 
    b.status === 'Borrowed' && b.dueDate && new Date(b.dueDate) < now
  ).length;
  
  // Update statistics cards
  const statTotalBooks = document.getElementById('statTotalBooks');
  const statBorrowedBooks = document.getElementById('statBorrowedBooks');
  const statMembers = document.getElementById('statMembers');
  const statOverdue = document.getElementById('statOverdue');
  
  if (statTotalBooks) statTotalBooks.textContent = totalBooks;
  if (statBorrowedBooks) statBorrowedBooks.textContent = borrowedBooks;
  if (statMembers) statMembers.textContent = totalMembers;
  if (statOverdue) statOverdue.textContent = overdueBooks;
}

// ========== BORROW HISTORY TABLE ==========
function renderBorrowHistory() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;
  
  if (borrowHistory.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:2rem; color: var(--gray);">
          No borrow history recorded.
        </td>
      </tr>
    `;
    return;
  }
  
  // Sort by date (newest first)
  const sortedHistory = [...borrowHistory].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  tbody.innerHTML = sortedHistory.map(record => `
    <tr>
      <td>${escapeHtml(record.title)}</td>
      <td>${escapeHtml(record.member)}</td>
      <td>${record.action === 'borrowed' ? record.date : '-'}</td>
      <td>${record.action === 'returned' ? record.date : 
           (record.dueDate ? `Due: ${record.dueDate}` : 'Not returned')}</td>
    </tr>
  `).join('');
}

// ========== OVERDUE BOOKS TABLE ==========
function renderOverdueBooks() {
  const tbody = document.getElementById('overdueTableBody');
  if (!tbody) return;
  
  const now = new Date();
  const overdue = sampleBooks.filter(b => 
    b.status === 'Borrowed' && b.dueDate && new Date(b.dueDate) < now
  );
  
  if (overdue.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:2rem; color: var(--gray);">
          No overdue books.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = overdue.map(book => {
    const dueDate = new Date(book.dueDate);
    const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
    
    return `
      <tr>
        <td>${escapeHtml(book.title)}</td>
        <td>${escapeHtml(book.borrowedBy)}</td>
        <td>${book.dueDate}</td>
        <td style="color: var(--danger); font-weight: 600;">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}</td>
      </tr>
    `;
  }).join('');
}

// ========== EXPORT FUNCTIONS ==========
function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    showNotification('No data to export', 'error');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  showNotification(`${filename} exported successfully!`);
}

function exportBooksCSV() {
  const booksData = sampleBooks.map(book => ({
    Title: book.title,
    Author: book.author,
    Year: book.year,
    ISBN: book.isbn,
    Category: book.category,
    Status: book.status,
    'Borrowed By': book.borrowedBy || '',
    'Due Date': book.dueDate || ''
  }));
  
  exportToCSV(booksData, 'library_books');
}

function exportMembersCSV() {
  const membersData = members.map(member => ({
    ID: member.id,
    Name: member.name,
    Email: member.email || '',
    Phone: member.phone || '',
    'Join Date': member.joinDate || ''
  }));
  
  exportToCSV(membersData, 'library_members');
}

function exportHistoryCSV() {
  const historyData = borrowHistory.map(record => ({
    Book: record.title,
    Member: record.member,
    Action: record.action,
    Date: record.date,
    'Due Date': record.dueDate || ''
  }));
  
  exportToCSV(historyData, 'borrow_history');
}

// ========== REPORT NAVIGATION ==========
function setupReportNavigation() {
  const sections = ['statistics', 'history', 'overdue', 'export'];
  const links = document.querySelectorAll('.sidebar-link[data-section]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      
      // Hide all sections
      sections.forEach(s => {
        const sectionEl = document.getElementById(`${s}-section`);
        if (sectionEl) sectionEl.style.display = 'none';
      });
      
      // Show selected section
      const activeSection = document.getElementById(`${section}-section`);
      if (activeSection) activeSection.style.display = 'block';
      
      // Update active link
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Refresh section data
      switch(section) {
        case 'statistics':
          updateStatistics();
          break;
        case 'history':
          renderBorrowHistory();
          break;
        case 'overdue':
          renderOverdueBooks();
          break;
        case 'export':
          // No specific refresh needed for export section
          break;
      }
    });
  });
}

// ========== INITIALIZATION ==========
function initializeReports() {
  // Set up navigation
  setupReportNavigation();
  
  // Load initial data
  updateStatistics();
  renderBorrowHistory();
  renderOverdueBooks();
  
  // Set up export buttons
  const exportBooksBtn = document.querySelector('#export-section button:nth-child(1)');
  const exportMembersBtn = document.querySelector('#export-section button:nth-child(2)');
  const exportHistoryBtn = document.querySelector('#export-section button:nth-child(3)');
  
  if (exportBooksBtn) {
    exportBooksBtn.textContent = 'Export Books CSV';
    exportBooksBtn.onclick = exportBooksCSV;
  }
  
  if (exportMembersBtn) {
    exportMembersBtn.textContent = 'Export Members CSV';
    exportMembersBtn.onclick = exportMembersCSV;
  }
  
  if (exportHistoryBtn) {
    exportHistoryBtn.textContent = 'Export History CSV';
    exportHistoryBtn.onclick = exportHistoryCSV;
  }
  
  showNotification('Reports page loaded successfully!');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeReports);

// Make export functions available globally
window.exportBooksCSV = exportBooksCSV;
window.exportMembersCSV = exportMembersCSV;
window.exportHistoryCSV = exportHistoryCSV;