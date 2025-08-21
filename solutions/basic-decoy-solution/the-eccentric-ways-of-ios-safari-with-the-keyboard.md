The Eccentric Ways of iOS Safari with the Keyboard
https://blog.opendigerati.com/the-eccentric-ways-of-ios-safari-with-the-keyboard-b5aa3f34228d

Safari on iOS does some “interesting” things with the soft keyboard on iPhone and iPad devices, as we found when making what we thought to be a fairly simple web page layout for the Church Online Platform. This article summarizes what we learned through days of debugging and experimentation, in hopes that it’ll save time for others.

The Problem
Our web page consists of a fixed-height header, a variable-height scrolling middle section, and a fixed-height footer containing a text input box. It needs to adjust to exactly fill any width and height, and since our audience is worldwide, it needs to work on essentially every current browser.


The fundamental problem is that when the soft keyboard appears due to a user tap on a text input box near the bottom of the screen, Safari doesn’t resize the browser window but instead moves it upward such that it is partially offscreen — as seen in this animation. This means that the UI elements in the header of our page are inaccessible until the user closes the keyboard again. Since a key feature of our application is reading and writing chat messages, many users will spend their entire time with the keyboard open, and it isn’t acceptable to lose an uncontrolled amount of the UI contained in the header section.

Other browsers (most importantly Chrome on Android) smoothly resize the window when the soft keyboard opens, such that our responsive CSS lays out the page with no further work.

As it turns out, this is actually intentional behavior in Safari, which the team at Apple implemented in an effort to have scrolling be as smooth as possible: see here. Sadly, their optimization technique breaks this page layout.

Why this is challenging
There are several additional difficulties that iOS Safari poses, which make things even more challenging. The primary challenges are:

The amount of the page pushed offscreen varies, so you can’t just add some fixed padding. It depends on the height of your page, the position of the input box, the height of the screen, and other factors. For example: this doesn’t scroll on an iPhone, but a longer page does; adding or removing lines in that second page will change the amount which is moved offscreen.
You can’t tell that you’re in this semi-offscreen state, which means that you can’t shift around any required UI elements at the top of your page.
You don’t know if the keyboard is showing, nor its height since it varies, for example depending on whether or not the user has typing predictions enabled.
The standard DOM scrollIntoView method doesn’t know the keyboard’s presence, nor height, nor whether it’s in the semi-offscreen state. It will happily scroll an element “into view” but still have it be behind the keyboard.
You don’t know if the user has a physical keyboard or not, so you can’t just rely on watching the focus.
You cannot open the soft keyboard programmatically, so you can’t force the screen into a known situation in order to use a certain layout.
How iOS Safari makes this (even more) challenging
There are even more issues to deal with, due to Safari inconsistencies! Testing on many configurations turned out to be crucial, because:

The iOS Simulator sometimes differs from physical devices in how it handles the keyboard. Layouts which were perfect in the Simulator didn’t behave the same way on the actual device being simulated.
Safari’s behavior differs between OS releases in how it handles resizing the page; for instance window.innerHeight behaves differently on iOS 10, 11 and 12 on a test page. On iOS 11, innerHeight doesn’t change when the keyboard becomes visible. On iOS 12, it changes immediately. On iOS 10, it updates window.innerHeight only after you scroll the page a little.
iPhone and iPad have different behavior — and both differ from Mac Safari. How tabs work, and where the browser puts its on-screen controls are different, and this causes different results when you measure page height.
iPad Safari’s behavior differs based on its width — specifically, in the “Split View” mode where two apps are on screen simultaneously. Safari has three different layouts depending on its width, and those cause differences for your page layout.
iOS Safari differs from iOS Chrome, even though both are implemented using WebKit. Chrome on iOS has some of these keyboard-related issues, but not all of them.
The “vh” unit gives different results if you have only one tab open, versus multiple; it seems to refer to the height of the browser page below the URL bar (including the tab area and/or controls lower on the page) instead of the area available to the actual web page. But see below for more on why “vh” should be avoided.
Your page is always scrollable when the keyboard is visible, even if it’s a trivially short page: it can scroll at least as much as the screen’s height even if that’s far beyond where your content ends. This means the user can easily get to a useless “mode” from their perspective, and not know how to get back again. See the example here.
But wait, it gets worse
It gets worse before it gets better. There are several related challenges which are common to other browsers and platforms:

height:100vh differs from height:100%, and
the URL bar changes height, and/or hides, when the user scrolls, and
position:fixed elements behave differently than otherwise positioned elements. These three issues are closely related, since the calculation method for the viewport’s height varies wildly, and has changed over time. Excellent discussions of this subject are here and here. 100vh is (now) usually calculated based on how tall the page will be once the URL section shortens, and the bottom toolbar is hidden — which happens on user scroll, and can’t reliably be triggered programmatically. Thus it is rarely useful to use “vh” units; use percentage-based units instead.
You don’t always know when the page size changes. If the keyboard is open while your page is active, and then the user switches to another application and closes the keyboard before returning to your page, then you won’t get any event notifying you of a change. Resizing on mobile browsers is messy and inconsistent; see here for more.
Zooming (by double taps or pinch-zooming) is unavoidable on modern browsers, so you have to be flexible in terms of how much of the page is visible, and/or about the text size.
The good news
“How beautiful on the mountains are the feet of those who bring good news,” right? Despite all of the above, we did manage to make our page work well on all browsers, using these five techniques:

Tip #1: To make a div on your page always full-height, use height:100% and “position: fixed”, so that normal CSS sizing will make the components always be the full height despite toolbars and URL bars coming and going. That doesn’t fix the keyboard issues, but it’s a great start.

Tip #2: You can outsmart Safari’s “offscreen shift” algorithm by placing your input box high enough on the page. When it gets focus, wait a few milliseconds until Safari has decided that it doesn’t need to move your page partially offscreen, and then move that input box to a place which might otherwise have caused the shift.

Tip #3: Though programmatically setting focus on an input box won’t cause the keyboard to open, you can set focus on another input while handling the touchDown event; the soft keyboard still opens. Pairing this with #2 means that you can position a fake text input box near the bottom of the page, and when that’s tapped instead set focus to the real input box which is higher on the page (even if it’s offscreen, e.g. placed at top=0 left=99999px) … then, use setTimeout to run a function in a few milliseconds which moves that real input box down lower on the page to where you really wanted it.

Tip #4: Watch for changes to window.innerHeight — if it changes soon after your text input element receives focus, then you can be quite confident that the soft keyboard is visible — and you’ll learn how tall it is by seeing the amount of change. This value won’t always change, as discussed above, but when it does, you can confidently add padding so that your page looks perfect above the soft keyboard.

Tip #5: When all else fails, hard-code for the older iPhone models. Since Safari on iPad does (at the moment!) reliably change window.innerHeight, and since all iPhone devices running iOS 12 and up seem to also do that, on older devices you can examine window.screen.height to determine what device you’re running on, and then add between 256px and 294px of padding depending on model. That can’t be perfect since the keyboard’s height can vary (e.g. when predictive text is enabled), but it’ll get you close.

In conclusion …
If more details on these findings would be valuable to you, feel free to leave a comment. We haven’t yet shipped the release which contains the web page that needed this information; it’s part of the UI for the next version of the Church Online Platform which is currently in a private beta test. Our hope is to make some or all of the UI portions be open source; let us know if you’re interested in working with us as we overcome these interesting complexities in software we’re giving away to the global church!

Press enter or click to view image in full size
