// iOS Dynamic Viewport Units
// Updates CSS custom property with real viewport height on resize/keyboard events

(function () {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        // Also set dvh fallback for browsers that don't support it
        document.documentElement.style.setProperty('--full-height', `${window.innerHeight}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    
    // Better on iOS 13+: keep in sync with the visual viewport
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', setVH);
        window.visualViewport.addEventListener('scroll', setVH);
    }
})();