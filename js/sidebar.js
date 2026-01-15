// Hide sidebar when footer is visible
export function setupSidebarObserver() {
    const sidebar = document.querySelector('.quick-contact-sidebar');
    const footer = document.querySelector('footer');
    if (!sidebar || !footer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sidebar.classList.add('hidden');
            } else {
                sidebar.classList.remove('hidden');
            }
        });
    }, { root: null, threshold: 0 });

    observer.observe(footer);
}
