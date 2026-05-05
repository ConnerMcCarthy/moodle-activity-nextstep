<?php

defined('MOODLE_INTERNAL') || die();

function nextstep_supports($feature): ?bool {
    switch ($feature) {
        case FEATURE_MOD_INTRO:
        case FEATURE_SHOW_DESCRIPTION:
        case FEATURE_BACKUP_MOODLE2:
            return true;
        default:
            return null;
    }
}

function nextstep_add_instance(\stdClass $data, $mform = null): int {
    global $DB;

    $data->skipnocompletion = empty($data->skipnocompletion) ? 0 : 1;
    $data->skiprestricted = empty($data->skiprestricted) ? 0 : 1;
    $data->moduletypes = trim((string)($data->moduletypes ?? ''));
    $data->timemodified = time();

    return (int)$DB->insert_record('nextstep', $data);
}

function nextstep_update_instance(\stdClass $data, $mform = null): bool {
    global $DB;

    $data->id = $data->instance;
    $data->skipnocompletion = empty($data->skipnocompletion) ? 0 : 1;
    $data->skiprestricted = empty($data->skiprestricted) ? 0 : 1;
    $data->moduletypes = trim((string)($data->moduletypes ?? ''));
    $data->timemodified = time();

    return $DB->update_record('nextstep', $data);
}

function nextstep_delete_instance(int $id): bool {
    global $DB;

    if (!$DB->record_exists('nextstep', ['id' => $id])) {
        return false;
    }

    return $DB->delete_records('nextstep', ['id' => $id]);
}

function nextstep_get_coursemodule_info($coursemodule): ?cached_cm_info {
    global $DB;

    if (!$record = $DB->get_record('nextstep', ['id' => $coursemodule->instance], 'id, name, intro, introformat')) {
        return null;
    }

    $info = new cached_cm_info();
    $info->name = $record->name;

    if ($coursemodule->showdescription) {
        $info->content = format_module_intro('nextstep', $record, $coursemodule->id, false);
    }

    return $info;
}

/**
 * Loads course-page highlight JS when a nextcmid parameter is present.
 */
// Intentionally no course-page callback hooks. Highlighting is handled by
// redirecting to #module-<cmid> and CSS :target for broad compatibility.
