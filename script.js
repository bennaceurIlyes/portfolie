document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const menuBtn = document.querySelector('.menu-btn');
    const links = document.querySelector('.links');
    const menuIcon = menuBtn.querySelector('i');
    
    // Toggle menu function
    function toggleMenu() {
        const isOpen = links.classList.contains('active');
        
        // Toggle classes
        menuBtn.classList.toggle('active');
        links.classList.toggle('active');
        
        // Toggle aria-expanded
        menuBtn.setAttribute('aria-expanded', !isOpen);
        
        // Toggle menu icon
        if (!isOpen) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        } else {
            menuIcon.classList.add('fa-bars');
            menuIcon.classList.remove('fa-times');
        }
    }
    
    // Event listeners
    menuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking a link
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (links.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (links.classList.contains('active') && 
            !links.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            toggleMenu();
        }
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && links.classList.contains('active')) {
            toggleMenu();
        }
    });
});
