import {useLayoutEffect, useState} from 'react';

function useDeviceOrientation() {
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia('(orientation: portrait)').matches,
  );

  useLayoutEffect(() => {
    const handleOrientationChange = () => {
      // We need to wait after the orientation event to get the correct orientation match
      setTimeout(() => {
        setIsPortrait(window.matchMedia('(orientation: portrait)').matches);
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () =>
      window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  return isPortrait;
}

export function usePreventVirtualKeyboardScrolling() {
  const isPortrait = useDeviceOrientation();

  useLayoutEffect(() => {
    const preventScrolling = (event: TouchEvent) => {
      event.preventDefault();
      console.log('preventScrolling');
    };

    function onFocusIn() {
      document.addEventListener('touchmove', preventScrolling, {
        passive: false,
      });
    }

    function onFocusOut() {
      document.removeEventListener('touchmove', preventScrolling);
    }

    if ('virtualKeyboard' in navigator) {
      // Prevent the virtual keyboard from scrolling the page on Android and iOS
      // https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API
      (navigator as any).virtualKeyboard.overlaysContent = isPortrait;
    }

    if (isPortrait) {
      document.addEventListener('focusin', onFocusIn);
      document.addEventListener('focusout', onFocusOut);
    }

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('touchmove', preventScrolling);
    };
  }, [isPortrait]);
}
