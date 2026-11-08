/** Shell: light/dark theme (follows the system until the visitor picks one) and the phone menu. */
const KEY = 'egress-theme';
const root = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const meta = document.querySelector('meta[name="theme-color"]');
const system = matchMedia('(prefers-color-scheme: dark)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function saved() {
  try { const value = localStorage.getItem(KEY); return value === 'light' || value === 'dark' ? value : null; } catch { return null; }
}

function apply(theme, fade) {
  if (fade && !reduce.matches) {
    root.classList.add('theme-fade');
    clearTimeout(apply.timer);
    apply.timer = setTimeout(() => root.classList.remove('theme-fade'), 200);
  }
  root.dataset.theme = theme;
  meta.content = theme === 'dark' ? '#0b0c0f' : '#f7f7fa';
  const next = theme === 'dark' ? '浅色' : '深色';
  toggle.querySelector('.theme-label').textContent = next;
  toggle.setAttribute('aria-label', `切换到${next}`);
  toggle.title = `切换到${next}主题`;
}

apply(saved() || (system.matches ? 'dark' : 'light'), false);
toggle.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(KEY, theme); } catch { /* private mode: the choice lasts for this page */ }
  apply(theme, true);
});
system.addEventListener('change', event => { if (!saved()) apply(event.matches ? 'dark' : 'light', true); });

// Phone menu: the nav links move into a sheet under the top bar.
const menuBtn = document.getElementById('menu-btn');
const sheet = document.getElementById('menu-sheet');
function setMenu(open, refocus) {
  sheet.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  if (open) sheet.querySelector('a').focus();
  else if (refocus) menuBtn.focus();
}
menuBtn.addEventListener('click', () => setMenu(sheet.hidden, false));
sheet.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false, false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !sheet.hidden) setMenu(false, true); });
document.addEventListener('click', event => { if (!sheet.hidden && !sheet.contains(event.target) && !menuBtn.contains(event.target)) setMenu(false, false); });
