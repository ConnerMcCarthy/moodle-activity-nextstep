<?php

require_once(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = required_param('id', PARAM_INT);

$course = get_course($id);
require_login($course);

$context = context_course::instance($course->id);
require_capability('moodle/course:view', $context);

$PAGE->set_url('/mod/nextstep/index.php', ['id' => $id]);
$PAGE->set_title(get_string('modulenameplural', 'mod_nextstep'));
$PAGE->set_heading(format_string($course->fullname));

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('modulenameplural', 'mod_nextstep'));

$instances = get_all_instances_in_course('nextstep', $course);
if (!$instances) {
    echo $OUTPUT->notification(get_string('none'), 'notifymessage');
    echo $OUTPUT->footer();
    exit;
}

$table = new html_table();
$table->head = [get_string('name'), get_string('section')];

foreach ($instances as $instance) {
    $url = new moodle_url('/mod/nextstep/view.php', ['id' => $instance->coursemodule]);
    $table->data[] = [html_writer::link($url, format_string($instance->name)), (string)$instance->section];
}

echo html_writer::table($table);
echo $OUTPUT->footer();
