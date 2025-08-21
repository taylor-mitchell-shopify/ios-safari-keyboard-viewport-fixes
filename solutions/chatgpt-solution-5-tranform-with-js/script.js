// Solution 5: Fixed Header with Visual Viewport API
// This should actually work! It compensates for iOS Safari's viewport shift

(function () {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        const header = document.querySelector('.header-fixed');
        const debug = document.getElementById('debug');
        
        if (!header) {
            console.error('Header element not found');
            return;
        }
        
        // Check if Visual Viewport API is supported
        if (!window.visualViewport) {
            console.warn('Visual Viewport API not supported');
            return;
        }
        
        // Show debug info (optional - can be removed in production)
        const showDebug = false; // Set to true to see viewport info
        if (showDebug && debug) {
            debug.style.display = 'block';
        }
        
        // Function to update header position based on visual viewport
        const updateHeaderPosition = () => {
            // Get the offset between visual and layout viewport
            const offsetTop = window.visualViewport.offsetTop || 0;
            
            // Apply transform to keep header at visual viewport top
            header.style.transform = `translateY(${offsetTop}px)`;
            
            // Update debug info if enabled
            if (showDebug && debug) {
                debug.innerHTML = `
                    Visual VP Height: ${Math.round(window.visualViewport.height)}<br>
                    Visual VP OffsetTop: ${Math.round(offsetTop)}<br>
                    Window Height: ${window.innerHeight}<br>
                    Scale: ${window.visualViewport.scale.toFixed(2)}
                `;
            }
        };
        
        // Initial update
        updateHeaderPosition();
        
        // Listen to visual viewport changes
        window.visualViewport.addEventListener('scroll', updateHeaderPosition);
        window.visualViewport.addEventListener('resize', updateHeaderPosition);
        
        // Also listen to window resize for orientation changes
        window.addEventListener('resize', updateHeaderPosition);
        
        // Optional: Smooth out the animation
        // Add a small debounce to prevent jank
        let updateTimer;
        const smoothUpdate = () => {
            clearTimeout(updateTimer);
            updateTimer = setTimeout(updateHeaderPosition, 10);
        };
        
        // Use smooth update for scroll events
        window.visualViewport.addEventListener('scroll', smoothUpdate);
    });
})();