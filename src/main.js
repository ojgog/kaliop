import './styles/main.scss';

// Responsive nav overflow logic
function setupNavOverflow() {
  const navList = document.getElementById('navList');
  if (!navList) return;

  // Remove any previous 'more' dropdown
  let moreLi = navList.querySelector('.nav-more');
  if (moreLi) {
    // Move items back to navList
    const moreMenu = moreLi.querySelector('.nav-more-menu');
    if (moreMenu) {
      Array.from(moreMenu.children).forEach(child => {
        navList.insertBefore(child, moreLi);
      });
    }
    moreLi.remove();
  }

  // Only apply on mobile/tablet (max-width: 760px)
  if (window.innerWidth > 760) return;

  // Create the 'More' dropdown
  moreLi = document.createElement('li');
  moreLi.className = 'nav-more';
  moreLi.innerHTML = `
    <button class="nav-more-btn" aria-haspopup="true" aria-expanded="false" tabindex="0">
      <i class="mdi mdi-dots-horizontal"></i>
    </button>
    <ul class="nav-more-menu"></ul>
  `;
  const moreBtn = moreLi.querySelector('.nav-more-btn');
  const moreMenu = moreLi.querySelector('.nav-more-menu');

  // Insert 'More' at the end
  navList.appendChild(moreLi);

  // Move overflowing items into the dropdown
  const navItems = Array.from(navList.children).filter(
    li => li !== moreLi && li.offsetParent !== null
  );

  // Calculate available width
  const navListRect = navList.getBoundingClientRect();
  let usedWidth = 0;
  let lastFittingIdx = -1;
  for (let i = 0; i < navItems.length; i++) {
    usedWidth += navItems[i].getBoundingClientRect().width;
    // 48px is approx width for the 'More' button
    if (usedWidth + 48 < navListRect.width) {
      lastFittingIdx = i;
    } else {
      break;
    }
  }

  // Move items that don't fit into the dropdown
  for (let i = lastFittingIdx + 1; i < navItems.length; i++) {
    moreMenu.appendChild(navItems[i]);
  }

  // Hide 'More' if not needed
  if (!moreMenu.children.length) {
    moreLi.remove();
  } else {
    // Dropdown toggle logic
    moreBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
      moreBtn.setAttribute('aria-expanded', !expanded);
      moreMenu.classList.toggle('open', !expanded);
    });
    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
      moreBtn.setAttribute('aria-expanded', 'false');
      moreMenu.classList.remove('open');
    });
    // Prevent closing when clicking inside
    moreMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}

// Hide all header button text on mobile (even if не в <span>), и возвращать на десктопе
function hideHeaderBtnTextOnMobile() {
  const isMobile = window.innerWidth <= 760;
  document.querySelectorAll('.header-actions .btn').forEach(btn => {
    // Сохраняем оригинальный html в data-атрибут (один раз)
    if (!btn.hasAttribute('data-original-html')) {
      btn.setAttribute('data-original-html', btn.innerHTML);
    }
    if (isMobile) {
      // На мобилке скрываем всё кроме <i>
      Array.from(btn.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'I') {
          node.style.display = 'none';
        }
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = '';
        }
      });
    } else {
      // На десктопе полностью восстанавливаем html
      if (btn.hasAttribute('data-original-html')) {
        btn.innerHTML = btn.getAttribute('data-original-html');
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupNavOverflow();
  hideHeaderBtnTextOnMobile();
});
window.addEventListener('resize', () => {
  // Debounce for performance
  clearTimeout(window.__navOverflowTimeout);
  window.__navOverflowTimeout = setTimeout(() => {
    setupNavOverflow();
    hideHeaderBtnTextOnMobile();
  }, 100);
});
