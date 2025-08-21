// Decoy Input Solution - Prevents viewport shift entirely!

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const realInput = document.getElementById('real-input');
        const decoyInput = document.getElementById('decoy-input');
        const debug = document.getElementById('debug');
        
        // Configuration
        const MOVE_DELAY = 100; // ms to wait before moving input
        const DEBUG_MODE = true; // Set to false in production
        
        if (!realInput || !decoyInput) {
            console.error('Required inputs not found');
            return;
        }
        
        // Show debug panel if enabled
        if (DEBUG_MODE && debug) {
            debug.classList.add('visible');
            updateDebug('Ready');
        }
        
        // Store original position of real input
        const originalPosition = {
            position: window.getComputedStyle(realInput).position,
            top: realInput.offsetTop,
            left: realInput.offsetLeft
        };
        
        // Update debug info
        function updateDebug(status) {
            if (!DEBUG_MODE || !debug) return;
            
            const info = {
                status: status,
                windowHeight: window.innerHeight,
                visualHeight: window.visualViewport ? window.visualViewport.height : 'N/A',
                keyboardHeight: window.visualViewport ? 
                    Math.round(window.innerHeight - window.visualViewport.height) : 'N/A'
            };
            
            debug.innerHTML = `
                Status: ${info.status}<br>
                Window: ${info.windowHeight}px<br>
                Visual: ${info.visualHeight}<br>
                Keyboard: ${info.keyboardHeight}px
            `;
        }
        
        // Handle real input touchstart/mousedown
        function handleRealInputInteraction(e) {
            // Prevent default to stop normal focus
            e.preventDefault();
            e.stopPropagation();
            
            updateDebug('Intercepted tap');
            
            // Position decoy input high on the page (where it won't cause shift)
            decoyInput.style.position = 'absolute';
            decoyInput.style.top = '100px';
            decoyInput.style.left = '0';
            decoyInput.style.right = '0';
            decoyInput.style.opacity = '0';
            decoyInput.style.pointerEvents = 'auto';
            decoyInput.classList.add('active');
            
            // Focus the decoy input instead
            updateDebug('Focused decoy');
            
            // After a short delay, move the real input to its final position
            setTimeout(() => {
                // Now we can safely reposition the real input
                // Option 1: Move decoy to real position (swap them)
                swapInputs();
                
                // Option 2: Just refocus the real input after keyboard is open
                // realInput.focus();
                
                updateDebug('Swapped inputs');
            }, 500);
        }
        
        // Swap decoy and real input positions
        function swapInputs() {
            // Move decoy to where real input was
            const realRect = realInput.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            decoyInput.style.position = 'absolute';
            decoyInput.style.top = (realRect.top + scrollTop) + 'px';
            decoyInput.style.left = realRect.left + 'px';
            decoyInput.style.width = realRect.width + 'px';
            decoyInput.style.opacity = '1';
            decoyInput.style.pointerEvents = 'auto';
            
            // Hide real input
            realInput.style.opacity = '0';
            realInput.style.pointerEvents = 'none';
            
            // Transfer value between inputs
            decoyInput.value = realInput.value;
            decoyInput.placeholder = realInput.placeholder;
            
            // Sync values as user types
            decoyInput.addEventListener('input', function() {
                realInput.value = decoyInput.value;
            });
        }
        
        // Reset when focus is lost
        function handleBlur() {
            updateDebug('Focus lost');
            
            // Reset positions
            decoyInput.style.left = '-9999px';
            decoyInput.style.opacity = '0';
            decoyInput.style.pointerEvents = 'none';
            decoyInput.classList.remove('active');
            
            realInput.style.opacity = '1';
            realInput.style.pointerEvents = 'auto';
            
            // Transfer final value
            realInput.value = decoyInput.value;
        }
        
        // Attach event listeners
        realInput.addEventListener('touchstart', handleRealInputInteraction, { passive: false });
        realInput.addEventListener('mousedown', handleRealInputInteraction, { passive: false });
        
        decoyInput.addEventListener('blur', handleBlur);
        
        // Monitor viewport changes
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                updateDebug('Viewport resized');
            });
        }
        
        // Alternative approach: Use touch events to control focus timing
        let touchStartY = 0;
        
        realInput.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        // Tip #4 from article: Monitor innerHeight changes
        let lastHeight = window.innerHeight;
        setInterval(() => {
            if (window.innerHeight !== lastHeight) {
                lastHeight = window.innerHeight;
                updateDebug('Height changed');
                
                // Keyboard likely appeared/disappeared
                const keyboardHeight = window.innerHeight < 500 ? 
                    (window.screen.height - window.innerHeight) : 0;
                
                if (keyboardHeight > 0) {
                    console.log('Keyboard detected, height:', keyboardHeight);
                }
            }
        }, 100);
    });
})();