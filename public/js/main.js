/**
 * Apex Dental Care - Main Shared Frontend Utilities
 */

// Toast Notification Engine
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '24px';
    toastContainer.style.right = '24px';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '12px';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgMap = {
    success: 'background: #059669; color: #FFF;',
    error: 'background: #DC2626; color: #FFF;',
    warning: 'background: #D97706; color: #FFF;',
    info: 'background: #0E7490; color: #FFF;'
  };
  const iconMap = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  };

  toast.style.cssText = `
    ${bgMap[type] || bgMap.info}
    padding: 14px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    max-width: 420px;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  toast.innerHTML = `
    <i class="bi ${iconMap[type] || iconMap.info} fs-5"></i>
    <span style="flex-grow: 1;">${message}</span>
    <button type="button" style="background:none; border:none; color:#FFF; font-size:1.1rem; cursor:pointer; opacity:0.8;">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);

  const closeBtn = toast.querySelector('button');
  const removeToast = () => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 300);
  };

  closeBtn.addEventListener('click', removeToast);
  setTimeout(removeToast, 4500);
}

// Active Nav Link Highlighter
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link-custom');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
