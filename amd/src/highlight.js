define([], function() {
    var HIGHLIGHT_CLASS = 'mod-nextstep-highlight';
    var ANNOUNCE_ID = 'mod-nextstep-announce';

    var selectorsForCmid = function(cmid) {
        return [
            '[data-id="' + cmid + '"]',
            '#module-' + cmid,
            '[id="module-' + cmid + '"]',
            '.activity[data-id="' + cmid + '"]',
            '.course-content [data-cmid="' + cmid + '"]'
        ];
    };

    var findTarget = function(cmid) {
        var selectors = selectorsForCmid(cmid);
        for (var i = 0; i < selectors.length; i++) {
            var el = document.querySelector(selectors[i]);
            if (el) {
                return el;
            }
        }
        return null;
    };

    var announce = function(message) {
        var el = document.getElementById(ANNOUNCE_ID);
        if (!el) {
            el = document.createElement('div');
            el.id = ANNOUNCE_ID;
            el.setAttribute('aria-live', 'polite');
            el.className = 'mod-nextstep-sr-only';
            document.body.appendChild(el);
        }
        el.textContent = message;
    };

    var init = function(cmid) {
        if (!cmid || cmid <= 0) {
            return;
        }

        var target = findTarget(cmid);
        if (!target) {
            return;
        }

        target.classList.add(HIGHLIGHT_CLASS);
        target.scrollIntoView({behavior: 'smooth', block: 'center'});
        target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
        announce('Your next activity is highlighted.');

        window.setTimeout(function() {
            target.classList.remove(HIGHLIGHT_CLASS);
            target.removeAttribute('tabindex');
        }, 8000);
    };

    return {
        init: init
    };
});
