const tabs = document.querySelectorAll('[data-tabs] .tab');
const panels = document.querySelectorAll('[data-panel]');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    tabs.forEach((btn) => btn.classList.remove('active'));
    panels.forEach((panel) => panel.classList.remove('active'));

    tab.classList.add('active');
    document.querySelector(`[data-panel="${target}"]`).classList.add('active');
  });
});

const revealItems = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.88;
  revealItems.forEach((item) => {
    const top = item.getBoundingClientRect().top;
    if (top < trigger) {
      item.classList.add('show');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
