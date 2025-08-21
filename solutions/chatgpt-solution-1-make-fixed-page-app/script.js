// iOS Sticky Header Fix
// Listens for viewport changes and adjusts header position accordingly

(function () {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    // Create test divs to access CSS env() values
    function getEnvValues() {
        const testDiv = document.createElement('div');
        testDiv.style.cssText = `
            position: fixed;
            top: env(safe-area-inset-top, 0px);
            left: env(safe-area-inset-left, 0px);
            right: env(safe-area-inset-right, 0px);
            bottom: env(safe-area-inset-bottom, 0px);
            width: env(keyboard-inset-width, 0px);
            height: env(keyboard-inset-height, 0px);
            visibility: hidden;
            pointer-events: none;
        `;
        document.body.appendChild(testDiv);
        
        const computedStyle = getComputedStyle(testDiv);
        const envValues = {
            safeTop: computedStyle.top,
            safeLeft: computedStyle.left,
            safeRight: computedStyle.right,
            safeBottom: computedStyle.bottom,
            keyboardWidth: computedStyle.width,
            keyboardHeight: computedStyle.height
        };
        
        document.body.removeChild(testDiv);
        return envValues;
    }

    // Debug function to log viewport and env values
    function logEnvValues() {
        const envValues = getEnvValues();
        const vv = window.visualViewport;
        const hiddenHeight = vv ? window.innerHeight - vv.height : 0;
        const topPosition = vv ? hiddenHeight + vv.offsetTop : 0;
        
        console.log(`[${new Date().toLocaleTimeString()}] CSS Debug:`, {
            ...envValues,
            windowInnerHeight: window.innerHeight,
            visualViewportHeight: vv?.height,
            visualViewportOffsetTop: vv?.offsetTop,
            hiddenHeight: hiddenHeight,
            calculatedTopPosition: topPosition,
            keyboardOpen: vv ? (window.innerHeight - vv.height) > 100 : false
        });
    }

    function positionHeaderForKeyboard() {
        const vv = window.visualViewport;
        if (!vv) return;
        
        // Calculate how much of the viewport is hidden by the keyboard
        const hiddenHeight = window.innerHeight - vv.height;
        
        // Account for visual viewport scroll offset
        const topPosition = hiddenHeight + vv.offsetTop;
        
        // Position header at the top of the visible area
        header.style.position = 'fixed';
        header.style.top = `${topPosition}px`;
        header.style.left = '0';
        header.style.right = '0';
        header.style.zIndex = '1000';
        header.style.transform = 'none';
        header.style.backgroundColor = 'red'; // Visual indicator
        
        console.log(`Positioning header at ${topPosition}px from top (hiddenHeight: ${hiddenHeight}, offsetTop: ${vv.offsetTop})`);
    }

    function resetHeader() {
        header.style.position = 'fixed';
        header.style.top = 'env(safe-area-inset-top, 0px)';
        header.style.left = '0';
        header.style.right = '0';
        header.style.transform = 'translateZ(0)';
        header.style.backgroundColor = 'blue'; // Visual indicator
        
        console.log('Resetting header to normal position');
    }

    // Check if Visual Viewport API is supported
    // if (window.visualViewport) {
    //     function updateHeaderPosition() {
    //         const vv = window.visualViewport;
    //         // Keyboard heuristics: significant height difference indicates keyboard
    //         const keyboardOpen = (window.innerHeight - vv.height) > 100;

    //         if (keyboardOpen) {
    //             positionHeaderForKeyboard();
    //         } else {
    //             resetHeader();
    //         }
    //     }

    //     // Listen for viewport changes
    //     window.visualViewport.addEventListener('resize', () => {
    //         console.log('Visual viewport resize event');
    //         logEnvValues();
    //         updateHeaderPosition();
    //     });
        
    //     window.visualViewport.addEventListener('scroll', () => {
    //         console.log('Visual viewport scroll event');
    //         updateHeaderPosition();
    //     });

    //     // Listen for focus changes
    //     window.addEventListener('focusin', () => {
    //         console.log('Focus in event');
    //         setTimeout(() => {
    //             logEnvValues();
    //             updateHeaderPosition();
    //         }, 300);
    //     });
        
    //     window.addEventListener('focusout', () => {
    //         console.log('Focus out event');
    //         setTimeout(() => {
    //             logEnvValues();
    //             updateHeaderPosition();
    //         }, 300);
    //     });

    //     // Initial setup
    //     updateHeaderPosition();
    // }

    // // Log initial values
    // logEnvValues();
    
    // // Expose functions for debugging
    // window.resetHeader = resetHeader;
    // window.positionHeaderForKeyboard = positionHeaderForKeyboard;
    // window.logEnvValues = logEnvValues;

})();