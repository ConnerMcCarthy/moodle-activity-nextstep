<?php

require_once(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT);

$cm = get_coursemodule_from_id('nextstep', $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$nextstep = $DB->get_record('nextstep', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/nextstep:view', $context);

$completion = new completion_info($course);
if (!$completion->is_enabled()) {
    redirect(
        new moodle_url('/course/view.php', ['id' => $course->id]),
        get_string('missingcompletion', 'mod_nextstep'),
        null,
        \core\output\notification::NOTIFY_WARNING
    );
}

$target = mod_nextstep\local\next_finder::find_next_cm(
    $course,
    (int)$USER->id,
    (int)$cm->id,
    [
        'skipnocompletion' => !empty($nextstep->skipnocompletion),
        'skiprestricted' => !empty($nextstep->skiprestricted),
        'moduletypes' => (string)($nextstep->moduletypes ?? ''),
    ]
);

if ($target) {
    $url = new moodle_url('/course/view.php', ['id' => $course->id, 'nextcmid' => $target->id]);
    $url->set_anchor('module-' . $target->id);
    redirect($url);
}

redirect(
    new moodle_url('/course/view.php', ['id' => $course->id]),
    get_string('nexttargetnotfound', 'mod_nextstep'),
    null,
    \core\output\notification::NOTIFY_INFO
);
