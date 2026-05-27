define(['core_courseformat/courseeditor'], function(CourseEditor) {
    var HIGHLIGHT_CLASS = 'mod-nextstep-highlight';
    var ANNOUNCE_ID = 'mod-nextstep-announce';
    var SECTION_SELECTOR = '[data-for="section"]';
    var COLLAPSE_TOGGLER_SELECTOR = '[data-toggle="collapse"], [data-bs-toggle="collapse"]';
    var EXPAND_DELAY_MS = 600;
    var EXPAND_RETRY_DELAY_MS = 300;
    var MAX_EXPAND_ATTEMPTS = 3;
    var HIGHLIGHT_TIMEOUT_MS = 8000;

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

    var findTargetSection = function(target) {
        return target ? target.closest(SECTION_SELECTOR) : null;
    };

    var getSectionId = function(section) {
        if (!section) {
            return 0;
        }
        return parseInt(section.getAttribute('data-id'), 10) || 0;
    };

    var findSectionHeaderTargets = function(section) {
        if (!section) {
            return null;
        }

        var candidates = [
            section.querySelector('.course-section-header'),
            section.querySelector('[data-for="section_title"]'),
            section.querySelector(COLLAPSE_TOGGLER_SELECTOR),
            section
        ];
        var targets = [];

        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] && targets.indexOf(candidates[i]) === -1) {
                targets.push(candidates[i]);
            }
        }

        return targets.length ? targets : null;
    };

    var findSectionToggler = function(section) {
        return section ? section.querySelector(COLLAPSE_TOGGLER_SELECTOR) : null;
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

    var highlightElements = function(targets, message) {
        if (!targets || !targets.length) {
            return;
        }

        targets[0].scrollIntoView({behavior: 'smooth', block: 'center'});
        targets[0].setAttribute('tabindex', '-1');
        targets[0].focus({preventScroll: true});

        for (var i = 0; i < targets.length; i++) {
            targets[i].classList.add(HIGHLIGHT_CLASS);
        }

        announce(message);

        window.setTimeout(function() {
            for (var i = 0; i < targets.length; i++) {
                targets[i].classList.remove(HIGHLIGHT_CLASS);
            }
            targets[0].removeAttribute('tabindex');
        }, HIGHLIGHT_TIMEOUT_MS);
    };

    var highlightTarget = function(target) {
        highlightElements([target], 'Your next activity is highlighted.');
    };

    var highlightSectionTarget = function(section) {
        var sectionTargets = findSectionHeaderTargets(section);
        if (!sectionTargets) {
            return;
        }

        highlightElements(sectionTargets, 'Your next activity is in the highlighted topic.');
    };

    var isSectionCollapsed = function(section) {
        var toggler = findSectionToggler(section);
        if (!toggler) {
            return false;
        }

        var expanded = toggler.getAttribute('aria-expanded');
        if (expanded === 'false') {
            return true;
        }

        return toggler.classList.contains('collapsed');
    };

    var isTargetEffectivelyVisible = function(target) {
        if (!target || !target.getClientRects || !target.getClientRects().length) {
            return false;
        }

        var style = window.getComputedStyle ? window.getComputedStyle(target) : null;
        if (style && (style.visibility === 'hidden' || style.display === 'none')) {
            return false;
        }

        var collapse = target.closest('.collapse');
        if (collapse && !collapse.classList.contains('show')) {
            return false;
        }

        return true;
    };

    var whenCourseEditorReady = function(callback) {
        if (!CourseEditor || typeof CourseEditor.getCurrentCourseEditor !== 'function') {
            callback(null);
            return;
        }

        try {
            var editor = CourseEditor.getCurrentCourseEditor();
            if (!editor || typeof editor.getInitialStatePromise !== 'function') {
                callback(editor || null);
                return;
            }

            Promise.resolve(editor.getInitialStatePromise())
                .then(function() {
                    callback(editor);
                })
                .catch(function() {
                    callback(editor);
                });
        } catch (e) {
            callback(null);
        }
    };

    var expandTargetSection = function(section, done, attempt) {
        if (attempt === undefined) {
            attempt = 1;
        }

        if (!section) {
            done(false);
            return;
        }

        var toggler = findSectionToggler(section);
        if (!toggler) {
            done(false);
            return;
        }

        if (!isSectionCollapsed(section)) {
            done(false);
            return;
        }

        var postAttempt = function() {
            window.setTimeout(function() {
                if (!isSectionCollapsed(section)) {
                    done(true);
                    return;
                }

                if (attempt >= MAX_EXPAND_ATTEMPTS) {
                    done(true);
                    return;
                }

                window.setTimeout(function() {
                    expandTargetSection(section, done, attempt + 1);
                }, EXPAND_RETRY_DELAY_MS);
            }, EXPAND_DELAY_MS);
        };

        whenCourseEditorReady(function(editor) {
            var sectionId = getSectionId(section);
            if (editor && sectionId && typeof editor.dispatch === 'function') {
                Promise.resolve(editor.dispatch('sectionContentCollapsed', [sectionId], false))
                    .then(function() {
                        postAttempt();
                    })
                    .catch(function() {
                        toggler.click();
                        postAttempt();
                    });
                return;
            }

            toggler.click();
            postAttempt();
        });
    };

    var init = function(cmid) {
        if (!cmid || cmid <= 0) {
            return;
        }

        var target = findTarget(cmid);
        if (!target) {
            return;
        }

        var section = findTargetSection(target);
        expandTargetSection(section, function() {
            var refreshedTarget = findTarget(cmid) || target;
            if (isTargetEffectivelyVisible(refreshedTarget)) {
                highlightTarget(refreshedTarget);
                return;
            }

            highlightSectionTarget(section || findTargetSection(refreshedTarget));
        });
    };

    return {
        init: init
    };
});
