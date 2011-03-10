MicroS - The MICRO Javascipt Lib
================================

MicroS is a Javascript development library centred around Size, Simplicity and Speed.  
It offers DOM manipulation, event management, platform detection (browser and OS), user interaction (dragging of elements etc) and features a very powerful animation engine.  
The goal is to offer as simple and complete a development platform as possible while keeping all paradigms as simple and lightweight as possible and achieving maximum performance.  
It is currently very well suited to "tweaking" websites with interactive behaviours, and building interactive interfaces.  
It hopes to eventually power in-browser game development, too.

What MicroS does *not* do:
--------------------------

- MicroS does not extend any of the DOM or core javascript\*. It is lightweight and non-intrusive. (\*It may add some standard core functionality if it is missing.)
- MicroS does not pollute the global namespace. It is compatible with other libraries like Prototype and jQuery & is designed to run alongside them.
- MicroS does not use css selector strings for targeting DOM nodes. This is slow to parse and inefficient.
- MicroS does not currently offer any ajax functions, but can be used alongside other javascript libraries. This *is* planned, it just has not been implemented yet.
- Micros tries not to add *too* many methods. It wants to be simple and easy to remember.
- MicroS does not try to be *too* clever. It does not invent new ways of creating classes or build paradigms around extended system types.
- MicroS cannot play chess.

What MicroS *does* do:
----------------------

+ MicroS allows you to select and filter document elements according to id, tag name, css class, parent, child & sibling relationships.
+ MicroS uses function-chaining throughout. It is simple and effective.
+ MicroS treats a collection of elements as a single object, allowing you to easily apply batch-apply effects.
+ MicroS allows you to chain animation calls to create sequences.
+ MicroS allows you to stop active, or run extra animations/sequences in parallel, on already animating elements.
+ MicroS uses time-based animations rather than fixed framerate, to execute much smoother.

What MicroS *will* do:
----------------------

* MicroS will allow really easy ajax.
* MicroS will offer full audio support, for both streaming audio like music, & preloaded sound effects.
* MicroS will offer css-accelerated animations and hardware accelerated movement. (These can already be enabled on a per-animation basis, but have functional side-effects.)
* MicroS will purr if you make it happy.

The License
===========

MicroS is released by 31i73.com under the [Public Library License](http://31i73.com/license/publiclibrary), which basically says you can do whatever you want with it as long as you credit who made it.