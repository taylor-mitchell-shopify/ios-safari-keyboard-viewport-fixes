# iOS Safari Sticky Header Solution

## The Problem
This is the classic iOS Safari keyboard/viewport quirk where "fixed" stuff gets anchored to the layout viewport while the keyboard shrinks the visual viewport. Your header slides off when inputs focus.

## Solution 1: Fixed App Shell with Scrolling Content

Here's a robust pattern that avoids the bug and keeps the close button/logo always visible:

### HTML Structure
```html
<body>
  <div class="app">
    <header class="app__header">
      <button class="close">Close</button>
      <img class="logo" src="…" alt="…">
    </header>

    <main class="app__scroll">
      <!-- your form / inputs live here -->
    </main>
  </div>
</body>
```

### CSS Implementation

#### 1a. Full-bleed app shell that doesn't scroll with the window
```css
html, body { 
  height: 100%; 
  margin: 0; 
}

.app {
  position: fixed; 
  inset: 0; /* pin to screen */
  display: flex; 
  flex-direction: column;
  /* respect notches */
  padding-top: env(safe-area-inset-top, 0);
  background: #fff;
}
```

#### 1b. Header that sticks inside the scroll container (not window)
```css
.app__header {
  position: sticky; 
  top: 0;
  z-index: 1000;
  background: inherit;
  /* give it a solid paint layer so it doesn't flicker */
  will-change: transform;
  /* optional border/shadow */
  box-shadow: 0 1px 0 rgba(0,0,0,.08);
}
```

#### 1c. Only this area scrolls; keyboard won't shove the header off
```css
.app__scroll {
  flex: 1;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  /* prevent the browser from "anchoring" scroll and yanking things */
  overflow-anchor: none;
}
```

### Why This Works
iOS Safari's keyboard resizes the visual viewport and messes with `position: fixed`/`100vh`. By moving scrolling into an inner container (`.app__scroll`) and making the header `position: sticky` inside that container, the header stays pinned at the top of that container regardless of keyboard state.

## Solution 2: Dynamic Viewport Units (with Fallback)

Avoid `100vh` on iOS (it includes the URL bar, etc). If you need viewport-height sections, prefer `dvh` with a fallback:

### CSS
```css
/* Fallback for older browsers */
:root { 
  --vh: 1vh; 
}

@supports (height: 100dvh) {
  .app { 
    height: 100dvh; /* modern browsers */
  } 
}
/* Fallback JS below updates --vh on iOS if needed */
```

### JavaScript
```javascript
// Only if you rely on vh somewhere else; not required for the sticky approach.
(function () {
  const setVH = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener('resize', setVH);

  // Better on iOS 13+: keep in sync with the visual viewport
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', setVH);
  }
})();
```

Then use `height: calc(var(--vh) * 100);` where you previously used `100vh`.

## Solution 3: Meta Viewport + Safe-Area

Add this if it's a full-bleed webview (not an in-app browser):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

And keep `padding-top: env(safe-area-inset-top)` on the app shell or header so it clears the notch/status bar.

## Solution 4: Input Focus Niceties (Optional)

Prevent the browser from "helpfully" autoscrolling the page in ways that fight your header:

```javascript
// Ensure focused inputs are visible without jumping the whole layout
document.addEventListener('focusin', (e) => {
  const el = e.target;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
    // Scroll only the inner container
    const scroller = document.querySelector('.app__scroll');
    el.scrollIntoView({ 
      block: 'center', 
      inline: 'nearest', 
      behavior: 'smooth' 
    });
    // Or: scroller.scrollTop = el.offsetTop - 80; // if you prefer manual control
  }
});
```

## Solution 5: Fixed Header with Visual Viewport API

Sometimes design demands `position: fixed`. Use the Visual Viewport API to counter the keyboard shift:

### CSS
```css
.header-fixed {
  position: fixed; 
  left: 0; 
  right: 0; 
  top: 0;
  z-index: 1000;
  transform: translateY(0); /* we'll adjust this in JS */
  will-change: transform;
}
```

### JavaScript
```javascript
(function () {
  if (!window.visualViewport) return;
  const header = document.querySelector('.header-fixed');
  const onVV = () => {
    // pin header to the *visual* viewport top
    const offsetTop = visualViewport.offsetTop || 0;
    header.style.transform = `translateY(${offsetTop}px)`;
  };
  onVV();
  visualViewport.addEventListener('scroll', onVV);
  visualViewport.addEventListener('resize', onVV);
})();
```

This keeps the fixed header visually glued to the top of the screen as the keyboard changes the visual viewport's offset.

## TL;DR

1. **Prefer a scrolling inner container + `position: sticky` header** (most reliable on iOS).
2. **Avoid `100vh`**; use `100dvh` or a `--vh` custom property fallback.
3. **Include `viewport-fit=cover` and safe-area insets**.
4. **If you can't change layout**, use `visualViewport` to adjust a fixed header's transform on keyboard open.

> If you show me your current DOM/CSS for that view, I'll drop in the exact classes and minimal changes to get this stable in your wrapper.