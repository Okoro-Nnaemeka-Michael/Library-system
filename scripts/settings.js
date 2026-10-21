// ========== SETTINGS PAGE FUNCTIONALITY ==========
document.addEventListener("DOMContentLoaded", function () {
  // Only initialize settings if we're on the settings page
  if (
    window.location.pathname.includes("settings.html") ||
    document.querySelector(".settings-container")
  ) {
    initializeSettingsPage();
  }
  checkAuthentication();
});

function initializeSettingsPage() {
  setupSettingsNavigation();
  loadSettingsFromStorage();
  setupSettingsForms();
  setupEventListeners();
  loadUserProfile();
}

function setupSettingsNavigation() {
  const navLinks = document.querySelectorAll(".settings-nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach((nav) => nav.classList.remove("active"));

      // Add active class to clicked link
      this.classList.add("active");

      // Hide all sections
      document.querySelectorAll(".settings-section").forEach((section) => {
        section.classList.remove("active");
      });

      // Show target section
      const targetSection = this.getAttribute("data-settings-section");
      const targetElement = document.getElementById(`${targetSection}-section`);
      if (targetElement) {
        targetElement.classList.add("active");
      }
    });
  });
}

function setupEventListeners() {
  // Logout buttons
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  const logoutAccountBtn = document.getElementById("logoutAccountBtn");
  if (logoutAccountBtn)
    logoutAccountBtn.addEventListener("click", handleLogout);

  // Change password form
  const changePasswordForm = document.getElementById("changePasswordForm");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", handleChangePassword);
  }

  // Modal close events
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", closeModals);
  });
}

function checkAuthentication() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const settingsContainer = document.querySelector(".settings-container");

  // Only redirect if we're on settings page and not logged in
  if (settingsContainer && !currentUser) {
    showNotification("Please login to access settings", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
    return;
  }
}

function loadUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    const userNameElement = document.getElementById("currentUserName");
    const userEmailElement = document.getElementById("currentUserEmail");
    const userRoleElement = document.getElementById("currentUserRole");

    if (userNameElement) userNameElement.textContent = currentUser.name;
    if (userEmailElement) userEmailElement.textContent = currentUser.email;
    if (userRoleElement)
      userRoleElement.textContent = currentUser.role || "Member";

    // Populate profile form if elements exist
    const userNameInput = document.getElementById("userName");
    const userEmailInput = document.getElementById("userEmail");
    const userPhoneInput = document.getElementById("userPhone");

    if (userNameInput) userNameInput.value = currentUser.name;
    if (userEmailInput) userEmailInput.value = currentUser.email;
    if (userPhoneInput) userPhoneInput.value = currentUser.phone || "";

    // Update session info
    updateSessionInfo();
  }
}

function updateSessionInfo() {
  const now = new Date();
  const loginTimeElement = document.getElementById("loginTime");
  const lastActiveElement = document.getElementById("lastActive");
  const ipAddressElement = document.getElementById("ipAddress");

  if (loginTimeElement) loginTimeElement.textContent = now.toLocaleString();
  if (lastActiveElement) lastActiveElement.textContent = now.toLocaleString();
  if (ipAddressElement) ipAddressElement.textContent = "192.168.1.1"; // Simulated IP
}

function loadSettingsFromStorage() {
  const settings = JSON.parse(localStorage.getItem("librarySettings")) || {};

  // General Settings
  const libraryNameInput = document.getElementById("libraryName");
  const libraryEmailInput = document.getElementById("libraryEmail");
  const libraryPhoneInput = document.getElementById("libraryPhone");
  const libraryAddressInput = document.getElementById("libraryAddress");

  if (libraryNameInput && settings.libraryName)
    libraryNameInput.value = settings.libraryName;
  if (libraryEmailInput && settings.libraryEmail)
    libraryEmailInput.value = settings.libraryEmail;
  if (libraryPhoneInput && settings.libraryPhone)
    libraryPhoneInput.value = settings.libraryPhone;
  if (libraryAddressInput && settings.libraryAddress)
    libraryAddressInput.value = settings.libraryAddress;

  // Borrowing Rules
  const maxBooksInput = document.getElementById("maxBooks");
  const borrowPeriodInput = document.getElementById("borrowPeriod");
  const dailyFineInput = document.getElementById("dailyFine");

  if (maxBooksInput && settings.maxBooks)
    maxBooksInput.value = settings.maxBooks;
  if (borrowPeriodInput && settings.borrowPeriod)
    borrowPeriodInput.value = settings.borrowPeriod;
  if (dailyFineInput && settings.dailyFine)
    dailyFineInput.value = settings.dailyFine;

  // Appearance Settings
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect && settings.theme) {
    themeSelect.value = settings.theme;
  }
}

function setupSettingsForms() {
  // General Settings Form
  const generalForm = document.getElementById("generalSettingsForm");
  if (generalForm) {
    generalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveGeneralSettings();
    });
  }

  // Borrowing Rules Form
  const borrowingForm = document.getElementById("borrowingSettingsForm");
  if (borrowingForm) {
    borrowingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveBorrowingSettings();
    });
  }

  // Appearance Settings Form
  const appearanceForm = document.getElementById("appearanceSettingsForm");
  if (appearanceForm) {
    appearanceForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveAppearanceSettings();
    });
  }

  // Profile Settings Form
  const profileForm = document.getElementById("profileSettingsForm");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveProfileSettings();
    });
  }

  // Security Settings Form
  const securityForm = document.getElementById("securitySettingsForm");
  if (securityForm) {
    securityForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveSecuritySettings();
    });
  }
}

function saveGeneralSettings() {
  const settings = JSON.parse(localStorage.getItem("librarySettings")) || {};

  const libraryNameInput = document.getElementById("libraryName");
  const libraryEmailInput = document.getElementById("libraryEmail");
  const libraryPhoneInput = document.getElementById("libraryPhone");
  const libraryAddressInput = document.getElementById("libraryAddress");
  const publicCatalogInput = document.getElementById("publicCatalog");
  const memberRegistrationInput = document.getElementById("memberRegistration");

  if (libraryNameInput) settings.libraryName = libraryNameInput.value;
  if (libraryEmailInput) settings.libraryEmail = libraryEmailInput.value;
  if (libraryPhoneInput) settings.libraryPhone = libraryPhoneInput.value;
  if (libraryAddressInput) settings.libraryAddress = libraryAddressInput.value;
  if (publicCatalogInput) settings.publicCatalog = publicCatalogInput.checked;
  if (memberRegistrationInput)
    settings.memberRegistration = memberRegistrationInput.checked;

  localStorage.setItem("librarySettings", JSON.stringify(settings));
  showNotification("General settings saved successfully!", "success");
}

function saveBorrowingSettings() {
  const settings = JSON.parse(localStorage.getItem("librarySettings")) || {};

  settings.borrowingRules = {
    maxBooks: parseInt(document.getElementById("maxBooks").value) || 5,
    borrowPeriod: parseInt(document.getElementById("borrowPeriod").value) || 14,
    renewalLimit: parseInt(document.getElementById("renewalLimit").value) || 2,
    dailyFine: parseFloat(document.getElementById("dailyFine").value) || 0.5,
    maxFine: parseFloat(document.getElementById("maxFine").value) || 10.0,
    autoRenewal: document.getElementById("autoRenewal").checked,
    dueDateReminders: document.getElementById("dueDateReminders").checked,
  };

  localStorage.setItem("librarySettings", JSON.stringify(settings));
  showNotification("Borrowing rules saved successfully!", "success");
}

function saveAppearanceSettings() {
  const settings = JSON.parse(localStorage.getItem("librarySettings")) || {};

  settings.appearance = {
    theme: document.getElementById("themeSelect").value,
    language: document.getElementById("languageSelect").value,
    dateFormat: document.getElementById("dateFormat").value,
    compactLayout: document.getElementById("compactLayout").checked,
    showCovers: document.getElementById("showCovers").checked,
  };

  localStorage.setItem("librarySettings", JSON.stringify(settings));
  showNotification("Appearance settings saved successfully!", "success");
}

function saveProfileSettings() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (currentUser) {
    // Update current user
    currentUser.name = document.getElementById("userName").value;
    currentUser.email = document.getElementById("userEmail").value;
    currentUser.phone = document.getElementById("userPhone").value;

    // Update in users array
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = currentUser;
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("users", JSON.stringify(users));

    // Update UI
    loadUserProfile();
    showNotification("Profile updated successfully!", "success");
  }
}

function saveSecuritySettings() {
  const settings = JSON.parse(localStorage.getItem("librarySettings")) || {};

  settings.security = {
    minPasswordLength:
      parseInt(document.getElementById("minPasswordLength").value) || 8,
    requireSpecialChars: document.getElementById("requireSpecialChars").checked,
    requireNumbers: document.getElementById("requireNumbers").checked,
    sessionTimeout:
      parseInt(document.getElementById("sessionTimeout").value) || 30,
    forceLogout: document.getElementById("forceLogout").checked,
  };

  localStorage.setItem("librarySettings", JSON.stringify(settings));
  showNotification("Security settings saved successfully!", "success");
}

function handleChangePassword(e) {
  e.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (!currentUser) {
    showNotification("User not found", "error");
    return;
  }

  // Verify current password
  if (currentUser.password !== currentPassword) {
    showNotification("Current password is incorrect", "error");
    return;
  }

  // Check if new password matches confirmation
  if (newPassword !== confirmPassword) {
    showNotification("New passwords do not match", "error");
    return;
  }

  // Check password strength
  if (newPassword.length < 8) {
    showNotification("Password must be at least 8 characters long", "error");
    return;
  }

  // Update password
  currentUser.password = newPassword;

  // Update in users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
  }

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("users", JSON.stringify(users));

  showNotification("Password changed successfully!", "success");
  closeModals();
  document.getElementById("changePasswordForm").reset();
}

function refreshSession() {
  showNotification("Session refreshed successfully!", "success");
  updateSessionInfo();
}

function showChangePasswordModal() {
  const modal = document.getElementById("changePasswordModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

// Export/Import functions
function exportData() {
  const data = {
    books: JSON.parse(localStorage.getItem("books")) || [],
    members: JSON.parse(localStorage.getItem("members")) || [],
    borrowHistory: JSON.parse(localStorage.getItem("borrowHistory")) || [],
    users: JSON.parse(localStorage.getItem("users")) || [],
    settings: JSON.parse(localStorage.getItem("librarySettings")) || {},
    exportDate: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `library-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;
  link.click();

  showNotification("Data exported successfully!", "success");
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);

        if (confirm("This will replace all current data. Are you sure?")) {
          if (data.books)
            localStorage.setItem("books", JSON.stringify(data.books));
          if (data.members)
            localStorage.setItem("members", JSON.stringify(data.members));
          if (data.borrowHistory)
            localStorage.setItem(
              "borrowHistory",
              JSON.stringify(data.borrowHistory)
            );
          if (data.users)
            localStorage.setItem("users", JSON.stringify(data.users));
          if (data.settings)
            localStorage.setItem(
              "librarySettings",
              JSON.stringify(data.settings)
            );

          showNotification("Data imported successfully!", "success");
          setTimeout(() => location.reload(), 1000);
        }
      } catch (error) {
        showNotification("Error importing data: Invalid file format", "error");
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

function confirmReset() {
  const resetType = document.getElementById("resetType").value;

  if (!resetType) {
    showNotification("Please select what to reset", "error");
    return;
  }

  const message = {
    books: "This will delete ALL books. This action cannot be undone.",
    members: "This will delete ALL members. This action cannot be undone.",
    history:
      "This will clear ALL borrow history. This action cannot be undone.",
    all: "This will reset EVERYTHING - books, members, history, and settings. This action cannot be undone.",
  }[resetType];

  if (confirm(`WARNING: ${message}\n\nAre you absolutely sure?`)) {
    performReset(resetType);
  }
}

function performReset(resetType) {
  switch (resetType) {
    case "books":
      localStorage.removeItem("books");
      break;
    case "members":
      localStorage.removeItem("members");
      break;
    case "history":
      localStorage.removeItem("borrowHistory");
      break;
    case "all":
      localStorage.clear();
      break;
  }

  showNotification(`Data reset successfully: ${resetType}`, "success");
  setTimeout(() => location.reload(), 1500);
}

// ========== INTEGRATION WITH EXISTING FUNCTIONS ==========
// These functions will be overridden by your main JS file if loaded
function showNotification(msg, type = "success") {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.className = "notification";
    document.body.appendChild(notification);
  }

  let icon = "";
  switch (type) {
    case "success":
      icon = "✅";
      break;
    case "error":
      icon = "❌";
      break;
    case "warning":
      icon = "⚠️";
      break;
    default:
      icon = "💡";
  }

  notification.innerHTML = `${icon} ${msg}`;
  notification.className = `notification show ${type}`;
  notification.style.backgroundColor =
    type === "error"
      ? "var(--danger)"
      : type === "warning"
      ? "var(--warning)"
      : "var(--success)";

  setTimeout(
    () => {
      notification.className = "notification";
    },
    type === "error" ? 5000 : 3000
  );
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none";
  });
}

function handleLogout() {
  if (confirm("Are you sure you want to log out?")) {
    showNotification("👋 Logging out...", "success");
    setTimeout(() => {
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    }, 1000);
  }
}

// Make functions available globally
window.exportData = exportData;
window.importData = importData;
window.confirmReset = confirmReset;
window.refreshSession = refreshSession;
window.showChangePasswordModal = showChangePasswordModal;
window.closeModals = closeModals;
