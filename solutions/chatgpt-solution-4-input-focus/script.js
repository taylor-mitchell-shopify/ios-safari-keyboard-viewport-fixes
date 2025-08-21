// Solution 4: Input Focus Niceties
// Prevent the browser from "helpfully" autoscrolling the page

document.addEventListener('DOMContentLoaded', function() {
    // Ensure focused inputs are visible without jumping the whole layout
    document.addEventListener('focusin', (e) => {
        const el = e.target;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
            // Prevent default browser scrolling behavior
            e.preventDefault();
            
            // Scroll only the inner container
            const scroller = document.querySelector('.app__scroll');
            if (scroller) {
                // Option 1: Scroll input into center of view
                setTimeout(() => {
                    el.scrollIntoView({ 
                        block: 'center', 
                        inline: 'nearest', 
                        behavior: 'smooth' 
                    });
                }, 100);
                
                // Option 2: Manual control (uncomment to use)
                // const inputTop = el.offsetTop;
                // const scrollerHeight = scroller.clientHeight;
                // const targetScroll = inputTop - (scrollerHeight / 2) + (el.offsetHeight / 2);
                // scroller.scrollTo({
                //     top: targetScroll,
                //     behavior: 'smooth'
                // });
            }
        }
    });
    
    // Additional: Prevent iOS from zooming on double-tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});