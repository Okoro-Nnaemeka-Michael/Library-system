// ========== MOBILE NAVIGATION ==========
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const header = document.querySelector('header');

// Toggle mobile menu (header navigation)
if (hamburgerBtn && header) {
    hamburgerBtn.addEventListener('click', () => {
        header.classList.toggle('mobile-menu-active');
    });
}

// Toggle sidebar
if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.toggle('active');
        }
        // Add logout button to sidebar when opened on mobile
        addLogoutToSidebar();
    });
}

// Close sidebar when backdrop is clicked
if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
        if (header) header.classList.remove('mobile-menu-active');
        // Remove logout button when sidebar closes
        removeLogoutFromSidebar();
    });
}

// Close mobile menu when clicking on a link
document.addEventListener('click', (e) => {
    if (e.target.closest('nav a') && window.innerWidth <= 768) {
        if (header) header.classList.remove('mobile-menu-active');
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        // Remove logout button when sidebar closes
        removeLogoutFromSidebar();
    }
});

// Window resize handler
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        if (header) header.classList.remove('mobile-menu-active');
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        // Remove logout button when switching to desktop
        removeLogoutFromSidebar();
    }
});

// ========== MOBILE LOGOUT FUNCTIONALITY ==========
function addLogoutToSidebar() {
    // Only add on mobile devices
    if (window.innerWidth > 768) return;
    
    // Check if logout button already exists
    if (document.getElementById('mobileLogoutBtn')) return;
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Create logout section
    const logoutSection = document.createElement('div');
    logoutSection.className = 'sidebar-section';
    logoutSection.innerHTML = `
        <div class="sidebar-title">Account</div>
        <a href="#" class="sidebar-link" id="mobileLogoutBtn">
            <i class="fas fa-sign-out-alt"></i> Logout
        </a>
    `;
    
    // Add to the bottom of sidebar
    sidebar.appendChild(logoutSection);
    
    // Add event listener to the logout button
    const logoutBtn = document.getElementById('mobileLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

function removeLogoutFromSidebar() {
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        const logoutSection = mobileLogoutBtn.closest('.sidebar-section');
        if (logoutSection) {
            logoutSection.remove();
        }
    }
}

// Also add logout button when sidebar opens via other methods (like clicking backdrop)
document.addEventListener('click', (e) => {
    if (e.target.closest('.sidebar-link') && window.innerWidth <= 768) {
        // Re-add logout button if it was removed
        setTimeout(() => {
            if (sidebar.classList.contains('active') && !document.getElementById('mobileLogoutBtn')) {
                addLogoutToSidebar();
            }
        }, 100);
    }
});

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

// *** NEW: keep track of which book we're borrowing when the modal is open
let borrowBookId = null;

// ========== AI HEAT MAP VISUALIZATION ==========
let categoryHeatMapChart = null;


  // Compute heat map data based on the selected view mode

function computeHeatMapData(viewMode = 'borrowed') {
    const categories = {};

    // Initialize categories from all books
    sampleBooks.forEach(book => {
        const cat = book.category || 'Uncategorized';
        if (!categories[cat]) {
            categories[cat] = { 
                name: cat, 
                inventoryCount: 0, 
                borrowedCount: 0,
                currentBorrowed: 0
            };
        }
        categories[cat].inventoryCount++;
        if (book.status === 'Borrowed') {
            categories[cat].currentBorrowed++;
        }
    });

    // Count total borrows by category from history
    borrowHistory.forEach(record => {
        const book = sampleBooks.find(b => b.id === record.bookId);
        if (book) {
            const cat = book.category || 'Uncategorized';
            if (categories[cat]) {
                categories[cat].borrowedCount++;
            }
        }
    });

    // Also count currently-borrowed books as one borrow each
    sampleBooks.forEach(book => {
        if (book.status === 'Borrowed') {
            const cat = book.category || 'Uncategorized';
            if (categories[cat]) {
                categories[cat].borrowedCount++;
            }
        }
    });

    // Convert to array with score
    const data = Object.values(categories).map(cat => {
        let value = 0;
        if (viewMode === 'borrowed') {
            value = cat.borrowedCount;
        } else if (viewMode === 'inventory') {
            value = cat.inventoryCount;
        } else { // popularity
            // Popularity = borrows per book (ratio)
            value = cat.inventoryCount > 0 
                ? (cat.borrowedCount / cat.inventoryCount) 
                : 0;
        }
        return {
            ...cat,
            value,
            displayValue: viewMode === 'popularity' 
                ? value.toFixed(2) + ' borrows/book'
                : value + (viewMode === 'inventory' ? ' books' : ' borrows')
        };
    });

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
}

/**
 * Get color based on heat intensity
 */
function getHeatColor(value, maxValue, alpha = 1) {
    // Normalize 0-1
    const ratio = maxValue > 0 ? value / maxValue : 0;
    
    let color;
    if (ratio >= 0.7) {
        // Hot
        color = `rgba(255, 51, 51, ${alpha})`;
    } else if (ratio >= 0.4) {
        // Warm
        color = `rgba(255, 204, 0, ${alpha})`;
    } else if (ratio >= 0.15) {
        // Mild
        color = `rgba(138, 43, 226, ${alpha})`;
    } else {
        // Cool
        color = `rgba(0, 204, 102, ${alpha})`;
    }
    return color;
}

/**
 * Render the heat map using Chart.js
 */
function renderCategoryHeatMap(viewMode = 'borrowed') {
    const canvas = document.getElementById('categoryHeatMap');
    if (!canvas) return;

    // Destroy previous chart if it exists
    if (categoryHeatMapChart) {
        categoryHeatMapChart.destroy();
        categoryHeatMapChart = null;
    }

    const data = computeHeatMapData(viewMode);

    if (data.length === 0) {
        canvas.parentElement.innerHTML = `
            <p style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                No data available for heat map yet.
            </p>
        `;
        return;
    }

    const labels = data.map(d => d.name);
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const colors = values.map(v => getHeatColor(v, maxValue, 0.85));
    const borderColors = values.map(v => getHeatColor(v, maxValue, 1));

    // Detect theme
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#1f2937' : '#f0f0f0';
    const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

    // Chart type depends on view mode
    const isHorizontal = true; // Horizontal bars look better for categories

    categoryHeatMapChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: viewMode === 'borrowed' ? 'Borrows' :
                       viewMode === 'inventory' ? 'Books in inventory' :
                       'Borrows per book',
                data: values,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: borderColors
            }]
        },
        options: {
            indexAxis: isHorizontal ? 'y' : 'x', // horizontal bars
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isLight ? 'rgba(0,0,0,0.85)' : 'rgba(30,30,30,0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const idx = context.dataIndex;
                            const item = data[idx];
                            return [
                                `${item.displayValue}`,
                                `Inventory: ${item.inventoryCount} books`,
                                `Total borrows: ${item.borrowedCount}`,
                                `Currently borrowed: ${item.currentBorrowed}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        font: { size: 12 }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        font: { size: 13, weight: '500' }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Initialize the heat map view selector
 */
function initHeatMapControls() {
    const select = document.getElementById('heatMapViewSelect');
    if (!select) return;

    if (!select.dataset.listenerAttached) {
        select.addEventListener('change', (e) => {
            renderCategoryHeatMap(e.target.value);
        });
        select.dataset.listenerAttached = 'true';
    }
}

// ========== UTILITY FUNCTIONS ==========
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function showNotification(msg, type = 'success', options = {}) {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Add icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '✅';
      break;
    case 'error':
      icon = '❌';
      break;
    case 'warning':
      icon = '⚠️';
      break;
    case 'info':
      icon = 'ℹ️';
      break;
    case 'auth-success':
      icon = '🎉';
      type = 'success'; // Override for styling
      break;
    case 'auth-error':
      icon = '🔒';
      type = 'error'; // Override for styling
      break;
    default:
      icon = '💡';
  }
  
  // Add custom icon if provided
  if (options.icon) icon = options.icon;
  
  notification.innerHTML = `${icon} ${msg}`;
  notification.className = `notification show ${type}`;
  
  // Set background color based on type
  switch (type) {
    case 'error':
    case 'auth-error':
      notification.style.backgroundColor = 'var(--danger)';
      break;
    case 'warning':
      notification.style.backgroundColor = 'var(--warning)';
      break;
    case 'info':
      notification.style.backgroundColor = 'var(--info)';
      break;
    case 'success':
    case 'auth-success':
    default:
      notification.style.backgroundColor = 'var(--success)';
  }
  
  // Set text color for readability
  notification.style.color = '#fff';
  notification.style.fontWeight = '500';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  
  // Custom duration for auth notifications
  const duration = options.duration || (type.includes('error') ? 5000 : 3000);
  
  // Auto-hide after delay
  clearTimeout(notification.timeoutId);
  notification.timeoutId = setTimeout(() => {
    notification.className = 'notification';
  }, duration);
  
  // Add click to dismiss
  notification.onclick = () => {
    notification.className = 'notification';
    clearTimeout(notification.timeoutId);
  };
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

// ========== AI BOOK RECOMMENDATION ENGINE ==========
let currentRecommendationMember = null;

/**
 * Populate the recommendation member selector
 */
function populateRecommendationSelector() {
    const select = document.getElementById('recommendationMemberSelect');
    if (!select) return;

    // Preserve current selection
    const currentValue = select.value;

    // Clear and repopulate
    select.innerHTML = '<option value="">Select a member to see recommendations...</option>';
    
    members.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        select.appendChild(opt);
    });

    // Restore selection if still valid
    if (currentValue && members.some(m => m.id === parseInt(currentValue))) {
        select.value = currentValue;
    }

    // Attach change handler (only once)
    if (!select.dataset.listenerAttached) {
        select.addEventListener('change', (e) => {
            const memberId = parseInt(e.target.value);
            if (memberId) {
                currentRecommendationMember = memberId;
                renderRecommendations(memberId);
            } else {
                currentRecommendationMember = null;
                showRecommendationPlaceholder();
            }
        });
        select.dataset.listenerAttached = 'true';
    }
}

/**
 * Show placeholder when no member is selected
 */
function showRecommendationPlaceholder() {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;
    container.innerHTML = `
        <p style="padding: 2rem; text-align: center; color: var(--text-secondary);">
            <i class="fas fa-info-circle"></i>
            Select a member above to see personalized book recommendations.
        </p>
    `;
}

/**
 * Main recommendation function — hybrid approach
 */
function renderRecommendations(memberId) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const recommendations = generateRecommendations(member);

    if (recommendations.length === 0) {
        container.innerHTML = `
            <p style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-search"></i>
                No recommendations available yet. ${member.name} needs to borrow a few books first.
            </p>
        `;
        return;
    }

    // Render recommendation cards with reason badges
    container.innerHTML = '';
    recommendations.forEach(rec => {
        const card = createRecommendationCard(rec.book, rec.reason, rec.score);
        container.appendChild(card);
    });
}

/**
 * Core recommendation algorithm
 * Combines: Content-Based + Collaborative + Popularity
 */
function generateRecommendations(member, limit = 4) {
    // 1. Get the member's borrowing history
    const memberHistory = borrowHistory.filter(h => h.memberId === member.id);
    const memberBookIds = new Set(memberHistory.map(h => h.bookId));

    // Also check books currently borrowed by name (fallback)
    sampleBooks.forEach(b => {
        if (b.borrowedBy === member.name) memberBookIds.add(b.id);
    });

    // 2. Get books the member has read (for content-based)
    const readBooks = sampleBooks.filter(b => memberBookIds.has(b.id));
    const readAuthors = new Set(readBooks.map(b => b.author));
    const readCategories = new Set(readBooks.map(b => b.category));

    // 3. Build candidate pool — books the member hasn't read
    const candidates = sampleBooks.filter(b => !memberBookIds.has(b.id));

    // 4. Score each candidate
    const scored = candidates.map(book => {
        let score = 0;
        let reasons = [];

        // Content-Based: same author
        if (readAuthors.has(book.author)) {
            score += 40;
            reasons.push(`Same author as a book you've read`);
        }

        // Content-Based: same category
        if (readCategories.has(book.category)) {
            score += 20;
            reasons.push(`In your favorite category: ${book.category}`);
        }

        // Collaborative: borrowed by similar members
        const similarMembers = members.filter(m => m.id !== member.id);
        similarMembers.forEach(other => {
            const otherHistory = borrowHistory.filter(h => h.memberId === other.id);
            const otherBooks = new Set(otherHistory.map(h => h.bookId));
            // If they borrowed a book you also read, they're "similar"
            const overlap = [...memberBookIds].filter(id => otherBooks.has(id));
            if (overlap.length > 0 && otherBooks.has(book.id)) {
                score += 15;
                if (!reasons.includes(`Popular with members like you`)) {
                    reasons.push(`Popular with members like you`);
                }
            }
        });

        // Popularity: how many times has this book been borrowed total?
        const totalBorrows = borrowHistory.filter(h => h.bookId === book.id).length;
        if (totalBorrows > 0) {
            score += totalBorrows * 5;
        }
        if (totalBorrows >= 2) {
            reasons.push(`Borrowed ${totalBorrows} times`);
        }

        // Bonus: Available books are more useful to recommend
        if (book.status === 'Available') {
            score += 10;
        }

        // If nothing matched, just give it a baseline score for popularity
        if (score === 0) {
            score = 1;
            reasons.push('New addition to the library');
        }

        return {
            book,
            score,
            reason: reasons[0] || 'Recommended for you'
        };
    });

    // 5. Sort by score (descending) and return top N
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Create a recommendation card with a reason badge
 */
function createRecommendationCard(book, reason, score) {
    const div = document.createElement('div');
    div.className = 'book-card recommendation-card';

    const statusClass = book.status === 'Borrowed' ? 'status-borrowed' : 'status-available';
    const buttonText = book.status === 'Available' ? 'Borrow' : 'Borrowed';
    const buttonDisabled = book.status === 'Borrowed' ? 'disabled' : '';

    div.innerHTML = `
        <div class="book-cover" style="background: linear-gradient(45deg, var(--accent), var(--accent-light));">
            <i class="fas fa-magic"></i>
        </div>
        <div class="book-details">
            <div class="recommendation-badge" title="Why we recommend this">
                <i class="fas fa-lightbulb"></i> ${escapeHtml(reason)}
            </div>
            <h3 class="book-title">${escapeHtml(book.title)}</h3>
            <p class="book-author">${escapeHtml(book.author)}</p>
            <div class="book-meta">
                <span class="book-year">${book.year}</span>
                <span class="${statusClass}">${escapeHtml(book.status)}</span>
            </div>
            <div style="margin-top: 10px;">
                <button class="btn btn-primary rec-borrow-btn" ${buttonDisabled} data-book-id="${book.id}">
                    <i class="fas fa-book-reader"></i> ${buttonText}
                </button>
            </div>
        </div>
    `;

    // Attach borrow handler
    const btn = div.querySelector('.rec-borrow-btn');
    if (btn && !buttonDisabled) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            borrowBook(book.id);
        });
    }

    // Attach details handler
    div.addEventListener('click', (e) => {
        if (!e.target.closest('.rec-borrow-btn')) {
            showBookDetails(book);
        }
    });

    return div;
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

// ========== SIDEBAR BUTTONS FUNCTIONALITY ==========
function setupSidebarButtons() {
  console.log('Setting up sidebar buttons...');
  
  // Add Book sidebar button
  const addBookSidebarBtn = document.getElementById('addBookSidebarBtn');
  if (addBookSidebarBtn) {
    addBookSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Add Book sidebar clicked');
      openModal('addBookModal');
    });
  }

  // Add Member sidebar button
  const addMemberSidebarBtn = document.getElementById('addMemberSidebarBtn');
  if (addMemberSidebarBtn) {
    addMemberSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Add Member sidebar clicked');
      handleAddMember();
    });
  }

  // Borrow/Return sidebar button
  const borrowReturnSidebarBtn = document.getElementById('borrowReturnSidebarBtn');
  if (borrowReturnSidebarBtn) {
    borrowReturnSidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Borrow/Return sidebar clicked');
      renderBorrowReturnList();
    });
  }

  // Reports sidebar buttons
  const historyBtn = document.getElementById('historyBtn');
  if (historyBtn) {
    historyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Borrow History clicked');
      showBorrowHistory();
    });
  }

  const overdueBtn = document.getElementById('overdueBtn');
  if (overdueBtn) {
    overdueBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Overdue Books clicked');
      showOverdueBooks();
    });
  }

  // Admin Tools sidebar buttons
  const fineReportBtn = document.getElementById('fineReportBtn');
  if (fineReportBtn) {
    fineReportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Fine Report clicked');
      showFineReport();
    });
  }

  const bulkImportBtn = document.getElementById('bulkImportBtn');
  if (bulkImportBtn) {
    bulkImportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Bulk Import clicked');
      showBulkImportModal();
    });
  }

  const systemSettingsBtn = document.getElementById('systemSettingsBtn');
  if (systemSettingsBtn) {
    systemSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('System Settings clicked');
      showSystemSettings();
    });
  }

  // Stats button
  const statsBtn = document.getElementById('statsBtn');
  if (statsBtn) {
    statsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Statistics clicked');
      showStatistics();
    });
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
      borrowBook(bookId); // will open the borrow modal
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

    // *** CHANGED:
    // If available -> open the member selection modal (so user can pick a member).
    // If borrowed -> return immediately.
    borrowBtn.onclick = function() {
      if (book.status === 'Available') {
        openBorrowModal(book.id); // use the static borrow modal in the HTML
      } else {
        returnBook(book.id);
        closeModals();
      }
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
  
  tbody.innerHTML = members.map(member => {
    const hasFace = member.faceDescriptor && Array.isArray(member.faceDescriptor);
    const faceBtnText = hasFace ? '✅ Face' : '📸 Register Face';
    const faceBtnStyle = hasFace ? 'color: var(--success);' : '';
    
    return `
    <tr>
      <td style="padding:12px 16px;">${member.id}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.name)}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.email || 'N/A')}</td>
      <td style="padding:12px 16px;">${escapeHtml(member.phone || 'N/A')}</td>
      <td style="padding:12px 16px;">${member.joinDate || 'N/A'}</td>
      <td style="padding:12px 16px; text-align:center;">
        <button class="btn btn-outline view-member" data-id="${member.id}">View</button>
        <button class="btn btn-outline edit-member" data-id="${member.id}">Edit</button>
        <button class="btn btn-outline register-face-btn" data-id="${member.id}" style="${faceBtnStyle}">${faceBtnText}</button>
        <button class="btn btn-outline delete-member" data-id="${member.id}" style="color:var(--danger);">Delete</button>
      </td>
    </tr>
  `}).join('');
  
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

  // ✅ FIX: Attach the Register Face listener
  document.querySelectorAll('.register-face-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const memberId = parseInt(e.target.dataset.id);
      openFaceModal('register', memberId);
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

// ========== BORROW/RETURN SYSTEM - UPDATED TO USE STATIC MODAL ==========
function borrowBook(bookId) {
  // *** CHANGED: do not create a dynamic modal; use the static borrow modal in the HTML
  openBorrowModal(bookId);
}

// *** NEW: Open the static borrow modal and populate members
function openBorrowModal(bookId) {
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) {
    showNotification('Book not found', 'error');
    return;
  }

  if (members.length === 0) {
    showNotification('No members exist. Add a member first.', 'error');
    return;
  }

  borrowBookId = bookId; // Store this so facial recognition knows which book to borrow

  const select = document.getElementById('memberSelect');
  if (select) {
    select.innerHTML = `<option value="">Choose a member...</option>`;
    members.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      select.appendChild(opt);
    });
  }

  // ✅ FIX: Attach the Face Login button listener
  const faceLoginBtn = document.getElementById('faceLoginBtn');
  if (faceLoginBtn) {
    // Remove old listeners by cloning
    const newBtn = faceLoginBtn.cloneNode(true);
    faceLoginBtn.parentNode.replaceChild(newBtn, faceLoginBtn);
    
    newBtn.addEventListener('click', () => {
      closeModals();
      openFaceModal('login');
    });
  }

  openModal('borrowModal');
}

// confirmBorrow can accept a bookId or use borrowBookId if omitted
function confirmBorrow(bookId) {
  const bid = bookId || borrowBookId;
  if (!bid) {
    showNotification('No book selected to borrow', 'error');
    return;
  }

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

  const book = sampleBooks.find(b => b.id === bid);
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
    bookId: bid,
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

  // reset stored id
  borrowBookId = null;
}

  // ========== THEME MANAGEMENT ==========
let currentTheme = localStorage.getItem('theme') || 'dark';

function initializeTheme() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update theme toggle button text
    updateThemeToggleButton();
    
    // Add theme section to sidebar
    addThemeSectionToSidebar();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    updateThemeToggleButton();
    updateSidebarThemeOptions();
    showNotification(`Switched to ${currentTheme} theme`, 'success');

    if (document.getElementById('categoryHeatMap')) {
        const select = document.getElementById('heatMapViewSelect');
        renderCategoryHeatMap(select ? select.value : 'borrowed');
    }
    
}

function updateThemeToggleButton() {
    const themeToggleBtn = document.getElementById('theme');
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i> Light Mode'
            : '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function addThemeSectionToSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar || document.querySelector('.theme-section')) return;
    
    const themeSection = document.createElement('div');
    themeSection.className = 'sidebar-section theme-section';
    themeSection.innerHTML = `
        <div class="sidebar-title">Theme</div>
        <div class="theme-options">
            <button class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
                <i class="fas fa-moon theme-icon"></i>
                <span class="theme-name">Dark Mode</span>
                <i class="fas fa-check theme-check"></i>
            </button>
            <button class="theme-option ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
                <i class="fas fa-sun theme-icon"></i>
                <span class="theme-name">Light Mode</span>
                <i class="fas fa-check theme-check"></i>
            </button>
        </div>
    `;
    
    sidebar.appendChild(themeSection);
    
    // Add event listeners to theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const selectedTheme = this.dataset.theme;
            if (selectedTheme !== currentTheme) {
                currentTheme = selectedTheme;
                document.documentElement.setAttribute('data-theme', currentTheme);
                localStorage.setItem('theme', currentTheme);
                
                updateThemeToggleButton();
                updateSidebarThemeOptions();
                showNotification(`Switched to ${currentTheme} theme`, 'success');
            }
        });
    });
}


function updateSidebarThemeOptions() {
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
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

// ========== AI FACIAL RECOGNITION ==========
let faceModelsLoaded = false;
let faceVideoStream = null;
let faceDetectionInterval = null;
let currentFaceMode = null; // 'register' or 'login'
let faceRegisterMemberId = null;

// Model URL (loaded from CDN — no downloads needed)
const FACE_MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

/**
 * Load face-api.js models (once, cached after first load)
 */
async function loadFaceModels() {
    if (faceModelsLoaded) return true;
    if (typeof faceapi === 'undefined') {
        console.warn('face-api.js not loaded yet');
        return false;
    }

    try {
        console.log('Loading face models...');
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL)
        ]);
        faceModelsLoaded = true;
        console.log('✅ Face models loaded');
        return true;
    } catch (err) {
        console.error('❌ Failed to load face models:', err);
        showNotification('Failed to load facial recognition models. Check your internet.', 'error');
        return false;
    }
}

/**
 * Open the Face Recognition modal (register or login mode)
 */
async function openFaceModal(mode, memberId = null) {
    currentFaceMode = mode;
    faceRegisterMemberId = memberId;

    // Update UI to show loading
    const title = document.getElementById('faceModalTitle');
    const subtitle = document.getElementById('faceModalSubtitle');
    const status = document.getElementById('faceStatus');
    
    if (mode === 'register') {
        const member = members.find(m => m.id === memberId);
        if(title) title.textContent = 'Register Face';
        if(subtitle) subtitle.textContent = `Capturing face for: ${member ? member.name : 'Member'}`;
    } else if (mode === 'login') {
        if(title) title.textContent = 'Facial Recognition Login';
        if(subtitle) subtitle.textContent = 'Position your face in the frame';
    }
    
    if(status) {
        status.textContent = '⏳ Loading AI models... Please wait.';
        status.className = '';
    }

    openModal('faceModal');

    // Now load models
    const loaded = await loadFaceModels();
    if (!loaded) {
        if(status) {
            status.textContent = '❌ Failed to load AI models. Check your internet.';
            status.className = 'error';
        }
        return;
    }

    if(status) status.textContent = 'Starting camera...';
    await startFaceCamera();
    startFacePreview();
}

/**
 * Start the webcam stream
 */
async function startFaceCamera() {
    const video = document.getElementById('faceVideo');
    if (!video) return;

    try {
        faceVideoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 480, height: 360, facingMode: 'user' },
            audio: false
        });
        video.srcObject = faceVideoStream;
        await video.play();

        const status = document.getElementById('faceStatus');
        if (status) {
            status.textContent = '📸 Camera ready. Position your face.';
            status.className = 'success';
        }
    } catch (err) {
        console.error('Camera error:', err);
        const status = document.getElementById('faceStatus');
        if (status) {
            status.textContent = '❌ Cannot access camera. Allow camera access and try again.';
            status.className = 'error';
        }
        showNotification('Camera access denied', 'error');
    }
}

/**
 * Live preview: draw a box around the detected face
 */
function startFacePreview() {
    const video = document.getElementById('faceVideo');
    const canvas = document.getElementById('faceCanvas');
    const status = document.getElementById('faceStatus');
    if (!video || !canvas) return;

    // Stop any previous interval
    if (faceDetectionInterval) clearInterval(faceDetectionInterval);

    faceDetectionInterval = setInterval(async () => {
        if (video.readyState !== 4 || !faceModelsLoaded) return;

        try {
            const detection = await faceapi
                .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks();

            // Match canvas size to video
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            if (displaySize.width === 0 || displaySize.height === 0) return;
            faceapi.matchDimensions(canvas, displaySize);

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detection) {
                const resized = faceapi.resizeResults(detection, displaySize);
                const box = resized.detection.box;
                ctx.strokeStyle = '#00cc66';
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                if (status && currentFaceMode) {
                    status.textContent = '✅ Face detected. Click the action button to proceed.';
                    status.className = 'success';
                }
            } else {
                if (status && currentFaceMode) {
                    status.textContent = '🔍 No face detected. Move closer to the camera.';
                    status.className = 'listening';
                }
            }
        } catch (e) {
            // Silent — just skip frames that error out
        }
    }, 300);
}

/**
 * Stop camera and detection
 */
function stopFaceCamera() {
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    if (faceVideoStream) {
        faceVideoStream.getTracks().forEach(t => t.stop());
        faceVideoStream = null;
    }
    const video = document.getElementById('faceVideo');
    if (video) video.srcObject = null;
    const canvas = document.getElementById('faceCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Capture face descriptor from current video frame
 */
async function captureFaceDescriptor() {
    const video = document.getElementById('faceVideo');
    if (!video || video.readyState !== 4) return null;

    try {
        const detection = await faceapi
            .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) return null;
        return Array.from(detection.descriptor); // Convert Float32Array → regular array
    } catch (err) {
        console.error('Capture error:', err);
        return null;
    }
}

/**
 * Handle the action button inside the face modal
 */
async function handleFaceAction() {
    const status = document.getElementById('faceStatus');
    const actionBtn = document.getElementById('faceActionBtn');

    if (!currentFaceMode) return;

    if (actionBtn) actionBtn.disabled = true;
    status.textContent = '⏳ Processing...';
    status.className = '';

    const descriptor = await captureFaceDescriptor();

    if (!descriptor) {
        status.textContent = '❌ No face detected. Please adjust your position and try again.';
        status.className = 'error';
        if (actionBtn) actionBtn.disabled = false;
        return;
    }

    if (currentFaceMode === 'register') {
        // Save descriptor to member
        const member = members.find(m => m.id === faceRegisterMemberId);
        if (!member) {
            status.textContent = '❌ Member not found.';
            status.className = 'error';
            if (actionBtn) actionBtn.disabled = false;
            return;
        }

        member.faceDescriptor = descriptor;
        saveData();
        renderMembersTable();

        status.textContent = `✅ Face registered for ${member.name}!`;
        status.className = 'success';
        showNotification(`Face registered for ${member.name}`, 'success');

        setTimeout(() => {
            closeFaceModal();
        }, 2000);

    } else if (currentFaceMode === 'login') {
        // Compare with all registered members
        const matched = findMatchingMember(descriptor);

        if (matched) {
            status.textContent = `✅ Welcome, ${matched.name}! (Distance: ${matched.distance.toFixed(3)})`;
            status.className = 'success';
            showNotification(`Authenticated as ${matched.name}`, 'success');

            // If we were in the middle of a borrow, complete it
            if (borrowBookId) {
                setTimeout(() => {
                    closeFaceModal();
                    completeBorrowWithMember(matched.member, borrowBookId);
                }, 1500);
            } else {
                setTimeout(() => {
                    closeFaceModal();
                }, 2000);
            }
        } else {
            status.textContent = '❌ Face not recognized. Please register first or try again.';
            status.className = 'error';
            if (actionBtn) actionBtn.disabled = false;
        }
    }
}

/**
 * Compare a face descriptor against all registered members
 * Uses Euclidean distance; threshold 0.6 (standard for face-api.js)
 */
function findMatchingMember(descriptor) {
    let bestMatch = null;
    let bestDistance = Infinity;
    const THRESHOLD = 0.55;

    const descFloat = new Float32Array(descriptor);

    members.forEach(member => {
        if (!member.faceDescriptor || !Array.isArray(member.faceDescriptor)) return;
        const memberDesc = new Float32Array(member.faceDescriptor);
        const distance = faceapi.euclideanDistance(descFloat, memberDesc);

        if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = member;
        }
    });

    if (bestMatch && bestDistance < THRESHOLD) {
        return { member: bestMatch, distance: bestDistance };
    }
    return null;
}

/**
 * Close the face modal and clean up
 */
function closeFaceModal() {
    stopFaceCamera();
    currentFaceMode = null;
    faceRegisterMemberId = null;
    closeModals();
}

/**
 * Complete a borrow using an authenticated member (used by face login)
 */
function completeBorrowWithMember(member, bookId) {
    const book = sampleBooks.find(b => b.id === bookId);
    if (!book || book.status === 'Borrowed') {
        showNotification('Book not available', 'error');
        return;
    }

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + 14);

    book.status = 'Borrowed';
    book.borrowedBy = member.name;
    book.borrowDate = borrowDate.toISOString().split('T')[0];
    book.dueDate = dueDate.toISOString().split('T')[0];

    borrowHistory.push({
        id: borrowHistory.length + 1,
        bookId: book.id,
        memberId: member.id,
        bookTitle: book.title,
        memberName: member.name,
        borrowDate: book.borrowDate,
        dueDate: book.dueDate,
        returnDate: null
    });

    saveData();
    refreshUI();
    showNotification(`"${book.title}" borrowed by ${member.name} via face login`, 'success');
    borrowBookId = null;
}

// ========== VOICE SEARCH AI FEATURE (IMPROVED) ==========
let voiceRecognition = null;
let isVoiceListening = false;
let voiceRestartCount = 0;
const MAX_RESTARTS = 3;

function initVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    const voiceBtn = document.getElementById('voiceSearchBtn');
    if (voiceBtn) {
      voiceBtn.disabled = true;
      voiceBtn.title = 'Voice search not supported. Use Chrome.';
      voiceBtn.style.opacity = '0.5';
    }
    console.warn('Web Speech API not supported.');
    return;
  }

  // Check for HTTPS / localhost (Web Speech API requires secure context)
  const isSecure = location.protocol === 'https:' || 
                   location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1';
  
  if (!isSecure) {
    console.warn('Web Speech API requires HTTPS or localhost.');
    showNotification('⚠️ Voice search requires HTTPS. Please use a secure connection.', 'warning');
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = true;   // ✅ Show partial results while speaking
  voiceRecognition.lang = 'en-US';
  voiceRecognition.maxAlternatives = 1;

  const voiceBtn = document.getElementById('voiceSearchBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  const searchInput = document.getElementById('searchInput');

  if (!voiceBtn) return;

  // ✅ Mic button click handler
  voiceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isVoiceListening) {
      voiceRecognition.stop();
    } else {
      voiceRestartCount = 0;
      startVoiceRecognition();
    }
  });

  // ✅ Helper: start recognition with error handling
  function startVoiceRecognition() {
    try {
      voiceRecognition.start();
    } catch (err) {
      // If it's already started, stop and retry
      if (err.name === 'InvalidStateError') {
        voiceRecognition.stop();
        setTimeout(() => {
          try { voiceRecognition.start(); } catch (e) { console.error(e); }
        }, 300);
      } else {
        console.error('Voice start error:', err);
        showNotification('Could not start voice search. Try again.', 'error');
      }
    }
  }

  // ✅ When recognition starts
  voiceRecognition.onstart = () => {
    isVoiceListening = true;
    voiceBtn.classList.add('listening');
    voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    if (voiceStatus) {
      voiceStatus.textContent = '🎤 Listening... Speak now (you have ~8 seconds).';
      voiceStatus.className = 'listening';
    }
  };

  // ✅ When partial or final speech is recognized
  voiceRecognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Show what we're hearing in real-time
    if (voiceStatus) {
      if (interimTranscript) {
        voiceStatus.textContent = `🎤 Hearing: "${interimTranscript}"...`;
        voiceStatus.className = 'listening';
      }
    }

    // Once we have a final result, use it
    if (finalTranscript) {
      const transcript = finalTranscript.trim();
      const confidence = event.results[event.results.length - 1][0].confidence;

      if (voiceStatus) {
        voiceStatus.textContent = `✅ You said: "${transcript}" (${Math.round(confidence * 100)}% confidence)`;
        voiceStatus.className = 'success';
      }

      if (searchInput) {
        searchInput.value = transcript;
        handleBookSearch();
      }

      showNotification(`Voice search: "${transcript}"`, 'success');
    }
  };

  // ✅ When recognition ends
  voiceRecognition.onend = () => {
    isVoiceListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';

    // If no result and we haven't reached max restarts, keep trying
    if (voiceRestartCount < MAX_RESTARTS && voiceStatus && 
        !voiceStatus.classList.contains('success') && 
        voiceStatus.classList.contains('listening')) {
      // Don't auto-restart — just clear status after 4 seconds
    }

    setTimeout(() => {
      if (voiceStatus && !voiceStatus.classList.contains('success')) {
        voiceStatus.textContent = '';
        voiceStatus.className = '';
      }
    }, 4000);
  };

  // ✅ Improved error handling
  voiceRecognition.onerror = (event) => {
    console.warn('Voice error:', event.error);

    // 🔑 KEY FIX: If "no-speech", restart ONCE automatically (Chrome often fires this too early)
    if (event.error === 'no-speech') {
      if (voiceRestartCount < 2) {
        voiceRestartCount++;
        console.log(`No speech detected. Auto-retrying (${voiceRestartCount}/2)...`);
        if (voiceStatus) {
          voiceStatus.textContent = `🎤 Listening... (attempt ${voiceRestartCount + 1})`;
          voiceStatus.className = 'listening';
        }
        // Restart after a short delay
        setTimeout(() => {
          try { voiceRecognition.start(); } catch (e) { console.error(e); }
        }, 400);
        return; // Don't show error yet
      }
    }

    // For other errors, show them and stop
    isVoiceListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';

    let errorMsg = 'Voice search error.';
    switch (event.error) {
      case 'no-speech':
        errorMsg = '❌ No speech detected. Make sure your mic is working and try again.';
        break;
      case 'audio-capture':
        errorMsg = '❌ No microphone found. Check your device settings.';
        break;
      case 'not-allowed':
        errorMsg = '❌ Microphone access denied. Click the 🔒 icon in the address bar and allow mic access.';
        break;
      case 'network':
        errorMsg = '❌ Network error. Check your internet connection.';
        break;
      case 'aborted':
        errorMsg = '🎤 Voice search cancelled.';
        break;
      case 'service-not-allowed':
        errorMsg = '❌ Speech service not allowed. Try reloading the page.';
        break;
      default:
        errorMsg = `❌ Error: ${event.error}`;
    }

    if (voiceStatus) {
      voiceStatus.textContent = errorMsg;
      voiceStatus.className = 'error';
    }

    showNotification(errorMsg, 'error', { duration: 5000 });
  };
}


// ========== SEARCH FUNCTIONALITY ==========
function handleDashboardSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  
  const query = searchInput.value.trim().toLowerCase();
  const booksContainer = document.getElementById('books-container');
  
  if (!booksContainer) return;

  booksContainer.innerHTML = "";

  const filtered = sampleBooks.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query) ||
    (book.isbn && book.isbn.includes(query))
  );

  if (filtered.length === 0) {
    booksContainer.innerHTML = `
      <p style="padding:2rem; text-align:center; color:var(--gray)">
        No books found.
      </p>
    `;
    return;
  }

  filtered.forEach(book => {
    booksContainer.appendChild(createBookElement(book));
  });
}

function handleBookSearch() {
  const currentPage = getCurrentPage();
  
  if (currentPage === 'dashboard') {
    handleDashboardSearch();
  } else if (currentPage === 'books') {
    handleAllBooksSearch();
  }
}

function handleAllBooksSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  
  const query = searchInput.value.trim().toLowerCase();
  const allBooksContainer = document.getElementById('all-books-container');
  
  if (!allBooksContainer) return;

  allBooksContainer.innerHTML = "";

  const filtered = sampleBooks.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query) ||
    (book.isbn && book.isbn.includes(query))
  );

  if (filtered.length === 0) {
    allBooksContainer.innerHTML = `
      <p style="padding:2rem; text-align:center; color:var(--gray)">
        No books found.
      </p>
    `;
    return;
  }

  filtered.forEach(book => {
    allBooksContainer.appendChild(createBookElement(book));
  });
}

// ========== ENHANCED AUTHENTICATION SYSTEM ==========
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
  
  // Clear form when toggling
  const authForm = document.getElementById('authForm');
  if (authForm) authForm.reset();
}

function validateAuthForm(email, password, name = '') {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('Please enter a valid email address', 'error');
    return false;
  }
  
  // Password validation
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters long', 'error');
    return false;
  }
  
  // Name validation for signup
  if (isSignup && name.trim().length < 2) {
    showNotification('Please enter your full name', 'error');
    return false;
  }
  
  return true;
}

function handleAuthSubmit(e) {
  e.preventDefault();
  
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value.trim();
  const name = isSignup ? document.getElementById('authName').value.trim() : '';

  // Show loading state
  const submitBtn = document.getElementById('authSubmitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = isSignup ? 'Creating Account...' : 'Logging in...';
  submitBtn.disabled = true;

  // Validate form inputs
  if (!validateAuthForm(email, password, name)) {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    return;
  }

  // Add slight delay for better UX
  setTimeout(() => {
    if (isSignup) {
      handleSignup(email, password, name);
    } else {
      handleLogin(email, password);
    }
    
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 800); // Simulate API delay for better UX
}

function handleSignup(email, password, name) {
  // Check if user already exists
  if (users.some(u => u.email === email)) {
    showNotification(
      'This email is already registered. Please login or use a different email.',
      'auth-error',
      { duration: 5000 }
    );
    
    // Auto-switch to login mode with helpful suggestion
    showNotification(
      'Switching to login mode...',
      'info',
      { duration: 2000, icon: '↻' }
    );
    
    setTimeout(() => {
      if (!isSignup) toggleAuthMode();
      // Pre-fill email for login
      document.getElementById('authEmail').value = email;
      document.getElementById('authPassword').value = '';
      document.getElementById('authPassword').focus();
    }, 1500);
    return;
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: users.length === 0 ? 'admin' : 'member',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Automatically add to members list
  const newMember = {
    id: members.length ? Math.max(...members.map(m => m.id)) + 1 : 1,
    name,
    email,
    joinDate: new Date().toISOString().split('T')[0],
    phone: '',
    membershipId: `MEM${Date.now()}`
  };
  members.push(newMember);
  saveData();

  // Show comprehensive success message
  showNotification(
    `🎉 Welcome ${name}! Your account has been created successfully!`,
    'auth-success',
    { duration: 4000 }
  );
  
  // Additional welcome message
  setTimeout(() => {
    const roleMsg = newUser.role === 'admin' ? 'as an Administrator' : 'as a Member';
    showNotification(
      `You've been registered ${roleMsg}. Redirecting to dashboard...`,
      'success',
      { duration: 3000 }
    );
  }, 1500);
  
  // Auto-login the new user
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  // Redirect to dashboard after a brief delay
  setTimeout(() => {
    redirectToDashboard();
  }, 3000);
}

function handleLogin(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    showNotification(
      'Invalid email or password. Please check your credentials and try again.',
      'auth-error',
      { duration: 4000 }
    );
    
    // Clear password field on failed login
    document.getElementById('authPassword').value = '';
    document.getElementById('authPassword').focus();
    
    // Show helpful hints
    setTimeout(() => {
      showNotification(
        '💡 Tip: Check caps lock and ensure you\'re using the correct email/password.',
        'info',
        { duration: 3000 }
      );
    }, 500);
    return;
  }

  // Successful login
  currentUser = user;
  
  // Update last login time
  user.lastLogin = new Date().toISOString();
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(user));

  // Show personalized welcome message
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : 
                   new Date().getHours() < 18 ? 'afternoon' : 'evening';
  
  showNotification(
    `👋 Good ${timeOfDay}, ${user.name}! Welcome back to Mike's Library.`,
    'auth-success',
    { duration: 3500 }
  );
  
  // Show role-specific message
  setTimeout(() => {
    const roleMsg = user.role === 'admin' ? 
      'You have administrator privileges.' : 
      'You can browse and borrow books.';
    showNotification(
      `${roleMsg} Redirecting to dashboard...`,
      'success',
      { duration: 2500 }
    );
  }, 1000);
  
  // Hide auth modal
  const authModal = document.getElementById('authModal');
  if (authModal) authModal.style.display = 'none';
  
  // Redirect to dashboard after a brief delay
  setTimeout(() => {
    redirectToDashboard();
  }, 2500);
  
  setupRoleAccess();
}

function redirectToDashboard() {
  // Get current page
  const currentPage = getCurrentPage();
  
  // Only redirect if we're not already on the dashboard
  if (currentPage !== 'dashboard') {
    window.location.href = 'index.html';
  } else {
    // If already on dashboard, just refresh the UI
    refreshUI();
    showAppContent();
  }
}

function showAppContent() {
  // Show main content after successful login
  const mainContent = document.querySelector('main');
  const header = document.querySelector('header');
  const sidebar = document.querySelector('.sidebar');
  const footer = document.querySelector('footer');
  
  if (mainContent) mainContent.style.display = 'block';
  if (header) header.style.display = 'flex';
  if (sidebar) sidebar.style.display = 'flex';
  if (footer) footer.style.display = 'block';
}

function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    // Show logout message
    showNotification('👋 Logging out...', 'success');
    
    // Clear user data after a brief delay
    setTimeout(() => {
      localStorage.removeItem('currentUser');
      currentUser = null;
      
      // Reload to show login modal
      location.reload();
    }, 1000);
  }
}

function setupRoleAccess() {
  const addBookBtn = document.getElementById('addBookBtn');
  const addMemberBtn = document.getElementById('addMemberBtn');
  const addBookSidebarBtn = document.getElementById('addBookSidebarBtn');
  const addMemberSidebarBtn = document.getElementById('addMemberSidebarBtn');
  const adminToolsSection = document.querySelector('.sidebar-section:nth-child(4)'); // Admin Tools section

  if (!currentUser) return;

  if (currentUser.role === 'member') {
    // Hide admin features for regular members
    [addBookBtn, addMemberBtn, addBookSidebarBtn, addMemberSidebarBtn].forEach(btn => {
      if (btn) btn.style.display = 'none';
    });
    
    // Hide admin tools section
    if (adminToolsSection) {
      adminToolsSection.style.display = 'none';
    }
    
    // Update user menu to show member role
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
      userMenuBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name} (Member)`;
    }
  } else {
    // Show admin features
    [addBookBtn, addMemberBtn, addBookSidebarBtn, addMemberSidebarBtn].forEach(btn => {
      if (btn) btn.style.display = 'flex';
    });
    
    // Show admin tools section
    if (adminToolsSection) {
      adminToolsSection.style.display = 'block';
    }
    
    // Update user menu to show admin role
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
      userMenuBtn.innerHTML = `<i class="fas fa-user-shield"></i> ${currentUser.name} (Admin)`;
    }
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
    if (currentPage === 'dashboard') {
      updateDashboardStats();
      populateRecommendationSelector();   // ✅ ADD THIS
      // If a member was selected, re-render their recommendations
      if (currentRecommendationMember) {
          renderRecommendations(currentRecommendationMember);
      }
    }
  }
  
  if (currentPage === 'members') {
    renderMembersTable();
  }
  
  if (currentPage === 'report') {
      updateReportsStats();
      renderCategoryDistribution();
      renderBorrowingActivity();
      initHeatMapControls();           // ✅ ADD THIS
      renderCategoryHeatMap('borrowed'); // ✅ ADD THIS
  }

}

function setupPageSpecificListeners() {
  const currentPage = getCurrentPage();
  
  // Common listeners for all pages
  setupSidebarNavigation();
  setupSidebarButtons(); // NEW: Setup sidebar buttons
  
  // Page-specific listeners
  if (currentPage === 'dashboard') {
    setupDashboardNavigation();
    
    // Add book button in dashboard
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
      addBookBtn.addEventListener('click', () => openModal('addBookModal'));
    }
  }
  
  if (currentPage === 'books') {
    const addBookFromCatalogBtn = document.getElementById('addBookFromCatalogBtn');
    if (addBookFromCatalogBtn) {
      addBookFromCatalogBtn.addEventListener('click', () => openModal('addBookModal'));
    }
  }
  
  if (currentPage === 'members') {
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', handleAddMember);
    }
    
    // Member form handlers
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
      addMemberForm.addEventListener('submit', handleAddMemberForm);
    }
    
    const editMemberForm = document.getElementById('editMemberForm');
    if (editMemberForm) {
      editMemberForm.addEventListener('submit', handleEditMemberForm);
    }
  }

  if (currentPage === 'report') {
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
      generateReportBtn.addEventListener('click', generateReport);
    }

    const viewOverdueBtn = document.getElementById('viewOverdueBtn');
    if (viewOverdueBtn) {
      viewOverdueBtn.addEventListener('click', showOverdueBooksReport);
    }
  }

  // Add book form handler (available on multiple pages)
  const addBookForm = document.getElementById('addBookForm');
  if (addBookForm) {
    addBookForm.addEventListener('submit', handleAddBook);
  }
}

// ========== REPORTS PAGE FUNCTIONS ==========
function updateReportsStats() {
    const totalBooks = sampleBooks.length;
    const borrowedBooks = sampleBooks.filter(b => b.status === 'Borrowed').length;
    const membersCount = members.length;
    
    // Calculate overdue books
    const now = new Date();
    const overdueBooks = sampleBooks.filter(b => 
        b.status === 'Borrowed' && 
        b.dueDate && 
        new Date(b.dueDate) < now
    ).length;

    // Update stats cards
    document.getElementById('totalBooksStat').textContent = totalBooks.toLocaleString();
    document.getElementById('activeMembersStat').textContent = membersCount.toLocaleString();
    document.getElementById('borrowedBooksStat').textContent = borrowedBooks.toLocaleString();
    document.getElementById('overdueBooksStat').textContent = overdueBooks.toLocaleString();

    // Update detailed stats
    document.getElementById('availableBooksCount').textContent = (totalBooks - borrowedBooks).toLocaleString();
    document.getElementById('borrowedBooksCount').textContent = borrowedBooks.toLocaleString();
    document.getElementById('totalTransactions').textContent = borrowHistory.length.toLocaleString();
    document.getElementById('pendingReturns').textContent = borrowedBooks.toLocaleString();
}

function renderCategoryDistribution() {
    const categoryContainer = document.getElementById('categoryDistribution');
    if (!categoryContainer) return;

    // Count books by category
    const categoryCount = {};
    sampleBooks.forEach(book => {
        const category = book.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    // Create category list
    const categories = Object.keys(categoryCount);
    if (categories.length === 0) {
        categoryContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--gray);">No books available.</p>';
        return;
    }

    categoryContainer.innerHTML = categories.map(category => `
        <div class="category-item">
            <span class="category-name">${escapeHtml(category)}</span>
            <span class="category-count">${categoryCount[category]} books</span>
            <div class="category-bar">
                <div class="category-fill" style="width: ${(categoryCount[category] / sampleBooks.length) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

function renderBorrowingActivity() {
    const activityBody = document.getElementById('borrowingActivityBody');
    if (!activityBody) return;

    // Get recent borrow history (last 10 records)
    const recentHistory = [...borrowHistory]
        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
        .slice(0, 10);

    if (recentHistory.length === 0) {
        activityBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 2rem; text-align: center; color: var(--gray);">
                    No borrowing activity yet.
                </td>
            </tr>
        `;
        return;
    }

    activityBody.innerHTML = recentHistory.map(record => {
        const isOverdue = !record.returnDate && record.dueDate && new Date(record.dueDate) < new Date();
        const status = record.returnDate ? 
            `<span class="status-available">Returned</span>` : 
            isOverdue ? 
            `<span class="status-overdue">Overdue</span>` : 
            `<span class="status-borrowed">Borrowed</span>`;

        return `
            <tr>
                <td style="padding: 12px 16px;">${escapeHtml(record.bookTitle)}</td>
                <td style="padding: 12px 16px;">${escapeHtml(record.memberName)}</td>
                <td style="padding: 12px 16px;">${record.borrowDate}</td>
                <td style="padding: 12px 16px;">${record.dueDate}</td>
                <td style="padding: 12px 16px;">${record.returnDate || '-'}</td>
                <td style="padding: 12px 16px;">${status}</td>
            </tr>
        `;
    }).join('');
}

function showOverdueBooksReport() {
    const now = new Date();
    const overdueBooks = sampleBooks.filter(b => 
        b.status === 'Borrowed' && 
        b.dueDate && 
        new Date(b.dueDate) < now
    );

    if (overdueBooks.length === 0) {
        showNotification('No overdue books at this time.');
        return;
    }

    const report = overdueBooks.map(book => 
        `• ${book.title} → ${book.borrowedBy} (Due: ${book.dueDate})`
    ).join('\n');

    const modalHtml = `
        <div class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Overdue Books Report</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div style="padding: 1.5rem; max-height: 400px; overflow-y: auto;">
                    <p><strong>Total Overdue: ${overdueBooks.length} books</strong></p>
                    <pre style="white-space: pre-wrap; font-family: inherit;">${report}</pre>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" id="closeOverdueReport">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    setTimeout(() => {
        const closeBtn = document.getElementById('closeOverdueReport');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModals);
        }
    }, 100);
}

function generateReport() {
    const reportData = {
        generatedAt: new Date().toLocaleString(),
        totalBooks: sampleBooks.length,
        totalMembers: members.length,
        borrowedBooks: sampleBooks.filter(b => b.status === 'Borrowed').length,
        availableBooks: sampleBooks.filter(b => b.status === 'Available').length,
        totalTransactions: borrowHistory.length,
        categoryBreakdown: getCategoryBreakdown(),
        recentActivity: borrowHistory.slice(-10)
    };

    // Create a downloadable report
    const reportContent = `
Mike's Library System - Report
Generated: ${reportData.generatedAt}

SUMMARY:
========
Total Books: ${reportData.totalBooks}
Total Members: ${reportData.totalMembers}
Borrowed Books: ${reportData.borrowedBooks}
Available Books: ${reportData.availableBooks}
Total Transactions: ${reportData.totalTransactions}

CATEGORY BREAKDOWN:
===================
${reportData.categoryBreakdown.map(item => `${item.category}: ${item.count} books (${item.percentage}%)`).join('\n')}

RECENT ACTIVITY:
================
${reportData.recentActivity.map(record => 
    `${record.borrowDate} - ${record.bookTitle} borrowed by ${record.memberName}`
).join('\n')}
    `;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Report generated and downloaded successfully!');
}

function getCategoryBreakdown() {
    const categoryCount = {};
    sampleBooks.forEach(book => {
        const category = book.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.keys(categoryCount).map(category => ({
        category,
        count: categoryCount[category],
        percentage: ((categoryCount[category] / sampleBooks.length) * 100).toFixed(1)
    }));
}

function setupFaceButtons() {
    const cancelBtn = document.getElementById('cancelFaceBtn');
    const actionBtn = document.getElementById('faceActionBtn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeFaceModal();
        });
    }

    if (actionBtn) {
        actionBtn.addEventListener('click', async () => {
            // Change button text to show it's working
            const originalText = actionBtn.textContent;
            actionBtn.textContent = '⏳ Processing...';
            actionBtn.disabled = true;

            await handleFaceAction();

            // Restore button
            actionBtn.textContent = originalText;
            actionBtn.disabled = false;
        });
    }
}

// Add these to your global functions
window.showOverdueBooksReport = showOverdueBooksReport;
window.generateReport = generateReport;

// ========== GLOBAL EVENT LISTENERS - FIXED ADMIN TOOLS ==========
function setupGlobalListeners() {
  console.log('Setting up global listeners...');

   // Theme toggle
    const themeToggleBtn = document.getElementById('theme');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
  
  // Authentication
  const authToggle = document.getElementById('authToggle');
  if (authToggle) {
    authToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthMode();
    });
  }

  // Face login button in borrow modal
  const faceLoginBtn = document.getElementById('faceLoginBtn');
  if (faceLoginBtn && !faceLoginBtn.dataset.listenerAttached) {
      faceLoginBtn.addEventListener('click', () => {
          closeModals();
          openFaceModal('login');
      });
      faceLoginBtn.dataset.listenerAttached = 'true';
  }

  const authForm = document.getElementById('authForm');
  if (authForm) authForm.addEventListener('submit', handleAuthSubmit);
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Admin tools (available on all pages) - FIXED SELECTOR
  const fineReportBtn = document.getElementById('fineReportBtn');
  if (fineReportBtn) {
    fineReportBtn.addEventListener('click', showFineReport);
  }

  const bulkImportBtn = document.getElementById('bulkImportBtn');
  if (bulkImportBtn) {
    bulkImportBtn.addEventListener('click', showBulkImportModal);
  }

  const systemSettingsBtn = document.getElementById('systemSettingsBtn');
  if (systemSettingsBtn) {
    systemSettingsBtn.addEventListener('click', showSystemSettings);
  }

  // Modal close events (static elements present at init)
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

  // Confirm borrow button in static borrow modal
  const confirmBorrowBtn = document.getElementById('confirmBorrowBtn');
  if (confirmBorrowBtn) {
    confirmBorrowBtn.addEventListener('click', () => {
      confirmBorrow(borrowBookId);
    });
  }

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
  initializeTheme()
  setupPageSpecificListeners();
  refreshUI();
  
  initVoiceSearch();
  setupFaceButtons();

  const currentPage = getCurrentPage();

  // Set up book search for dashboard and books pages
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleBookSearch);
  }

  // Also add search button functionality
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", handleBookSearch);
  }

  // Set up member search for members page
  const memberSearchInput = document.getElementById('memberSearchInput');
  if (memberSearchInput) {
    memberSearchInput.addEventListener("input", handleMemberSearch);
  }

  // Check authentication
  if (!currentUser) {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.style.display = 'flex';
      // Focus on email field when modal opens
      setTimeout(() => {
        const emailInput = document.getElementById('authEmail');
        if (emailInput) emailInput.focus();
      }, 300);
    }
    
    // Hide main content if not logged in
    const mainContent = document.querySelector('main');
    const header = document.querySelector('header');
    const sidebar = document.querySelector('.sidebar');
    
    if (mainContent) mainContent.style.display = 'none';
    if (header) header.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
  } else {
    // User is logged in
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.style.display = 'none';
    
    showAppContent();
    setupRoleAccess();
  
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (!justLoggedIn) {
      showNotification(`👋 Welcome back, ${currentUser.name}!`, 'success');
      sessionStorage.setItem('justLoggedIn', 'true');
    }
  }
}

window.addEventListener('load', () => {
  if (sessionStorage.getItem('justLoggedIn')) {
    sessionStorage.removeItem('justLoggedIn');
  }
});

document.addEventListener('DOMContentLoaded', initializeApp);

window.confirmBorrow = confirmBorrow;
window.closeModals = closeModals;
window.borrowBook = borrowBook;
window.returnBook = returnBook;
window.showFineReport = showFineReport;
window.showBulkImportModal = showBulkImportModal;
window.showSystemSettings = showSystemSettings;
window.processBulkImport = processBulkImport;