// APEX 26.2: Universal Theme fires apexwindowresized when the title bar changes size, and opening the side menu
// below --js-mq-lg narrows it - the menu closed again at once on phones. Skip that event while the menu is open
// and the window kept its width.
(function ($) {
    var large = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--js-mq-lg")) || 1200,
        width = window.innerWidth;
    $.event.special.apexwindowresized = {
        trigger: function () {
            if (window.innerWidth === width && width < large && document.body.classList.contains("js-navExpanded")) {
                return false;
            }
            width = window.innerWidth;
        }
    };
})(apex.jQuery);
