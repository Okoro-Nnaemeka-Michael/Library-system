// scripts/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Navigation and Section Management
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('main > div');
    
    // Function to show a specific section
    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = section.id === `${sectionId}-section` ? 'block' : 'none';
        });
        
        // Update active states
        updateActiveStates(sectionId);
    }
    
    // Function to update active states
    function updateActiveStates(activeSection) {
        // Update nav links
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === activeSection);
        });
        
        // Update sidebar links
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === activeSection);
        });
    }
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });
    
    // Add click event listeners to sidebar links with data-section
    sidebarLinks.forEach(link => {
        if (link.dataset.section) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                showSection(section);
            });
        }
    });
    
    // Sidebar Toggle Functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebar = document.querySelector('.sidebar');
    
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarBackdrop.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', toggleSidebar);
    }
    
    // Modal Management
    const modals = document.querySelectorAll('.modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    function closeAllModals() {
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
    
    // Close modal when clicking close button
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    // Close modal when clicking outside modal content
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
    
    // Sidebar Button Event Handlers
    const addBookSidebarBtn = document.getElementById('addBookSidebarBtn');
    const addMemberSidebarBtn = document.getElementById('addMemberSidebarBtn');
    const borrowReturnSidebarBtn = document.getElementById('borrowReturnSidebarBtn');
    const historyBtn = document.getElementById('historyBtn');
    const overdueBtn = document.getElementById('overdueBtn');
    const fineReportBtn = document.getElementById('fineReportBtn');
    const bulkImportBtn = document.getElementById('bulkImportBtn');
    const systemSettingsBtn = document.getElementById('systemSettingsBtn');
    
    // Add Book functionality
    if (addBookSidebarBtn) {
        addBookSidebarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('addBookModal');
        });
    }
    
    // Add Book button in dashboard
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('addBookModal');
        });
    }
    
    // Add Book button in catalog
    const addBookFromCatalogBtn = document.getElementById('addBookFromCatalogBtn');
    if (addBookFromCatalogBtn) {
        addBookFromCatalogBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('addBookModal');
        });
    }
    
    // Add Member functionality
    if (addMemberSidebarBtn) {
        addMemberSidebarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // For now, just show a notification since we don't have the modal
            showNotification('Add Member functionality will be implemented soon!');
        });
    }
    
    // Add Member button in members section
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Add Member functionality will be implemented soon!');
        });
    }
    
    // Borrow/Return functionality
    if (borrowReturnSidebarBtn) {
        borrowReturnSidebarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('borrowModal');
        });
    }
    
    // Borrow History
    if (historyBtn) {
        historyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Borrow History will be displayed here!');
            // You can implement a modal or section for history
        });
    }
    
    // Overdue Books
    if (overdueBtn) {
        overdueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Overdue Books report will be displayed here!');
            // You can implement a modal or section for overdue books
        });
    }
    
    // Fine Report
    if (fineReportBtn) {
        fineReportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Fines Report will be displayed here!');
        });
    }
    
    // Bulk Import
    if (bulkImportBtn) {
        bulkImportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Bulk Import functionality will be implemented soon!');
        });
    }
    
    // System Settings
    if (systemSettingsBtn) {
        systemSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('System Settings will be implemented soon!');
        });
    }
    
    // Book Detail Modal and Borrow Functionality
    const borrowBookBtn = document.getElementById('borrowBookBtn');
    if (borrowBookBtn) {
        borrowBookBtn.addEventListener('click', function() {
            closeModal('bookDetailModal');
            openModal('borrowModal');
        });
    }
    
    // Confirm Borrow Button
    const confirmBorrowBtn = document.getElementById('confirmBorrowBtn');
    if (confirmBorrowBtn) {
        confirmBorrowBtn.addEventListener('click', function() {
            closeModal('borrowModal');
            showNotification('Book borrowed successfully!');
        });
    }
    
    // Add Book Form Submission
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            closeModal('addBookModal');
            showNotification('Book added successfully!');
            // Here you would typically send the data to your backend
            this.reset();
        });
    }
    
    // Cancel Add Book
    const cancelAddBook = document.getElementById('cancelAddBook');
    if (cancelAddBook) {
        cancelAddBook.addEventListener('click', function() {
            closeModal('addBookModal');
        });
    }
    
    // Notification System
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification ' + type;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        } else {
            alert(message); // Fallback if notification element doesn't exist
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                showNotification('Logged out successfully!');
                // Here you would typically redirect to login page
                // window.location.href = 'login.html';
            }
        });
    }
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim()) {
                showNotification(`Searching for: ${searchInput.value}`);
                // Implement actual search functionality here
            }
        });
    }
    
    // Enter key for search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
    
    // Initialize the page
    function init() {
        // Show dashboard by default
        showSection('dashboard');
        
        // Load sample books (you would replace this with actual data)
        loadSampleBooks();
    }
    
    // Sample book data loading
    function loadSampleBooks() {
        const booksContainer = document.getElementById('books-container');
        const allBooksContainer = document.getElementById('all-books-container');
        
        const sampleBooks = [
            {
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                year: 1925,
                category: "Fiction",
                description: "A classic novel of the Jazz Age"
            },
            {
                title: "To Kill a Mockingbird",
                author: "Harper Lee", 
                year: 1960,
                category: "Fiction",
                description: "A gripping tale of racial injustice"
            },
            {
                title: "1984",
                author: "George Orwell",
                year: 1949,
                category: "Science Fiction",
                description: "A dystopian social science fiction novel"
            }
        ];
        
        if (booksContainer) {
            booksContainer.innerHTML = sampleBooks.map(book => `
                <div class="book-card">
                    <div class="book-cover">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">by ${book.author}</p>
                        <p class="book-year">${book.year}</p>
                        <span class="book-category">${book.category}</span>
                    </div>
                    <button class="btn btn-outline view-details-btn">View Details</button>
                </div>
            `).join('');
        }
        
        if (allBooksContainer) {
            allBooksContainer.innerHTML = sampleBooks.map(book => `
                <div class="book-card">
                    <div class="book-cover">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">by ${book.author}</p>
                        <p class="book-year">${book.year}</p>
                        <span class="book-category">${book.category}</span>
                    </div>
                    <button class="btn btn-outline view-details-btn">View Details</button>
                </div>
            `).join('');
        }
        
        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookCard = this.closest('.book-card');
                const title = bookCard.querySelector('.book-title').textContent;
                const author = bookCard.querySelector('.book-author').textContent.replace('by ', '');
                const year = bookCard.querySelector('.book-year').textContent;
                const category = bookCard.querySelector('.book-category').textContent;
                
                // Update modal content
                document.getElementById('detailBookTitle').textContent = title;
                document.getElementById('detailBookAuthor').textContent = author;
                document.getElementById('detailBookYear').textContent = year;
                document.getElementById('detailBookCategory').textContent = category;
                document.getElementById('detailBookDescription').textContent = sampleBooks.find(book => book.title === title)?.description || 'No description available.';
                
                openModal('bookDetailModal');
            });
        });
    }
    
    // Initialize the application
    init();
});