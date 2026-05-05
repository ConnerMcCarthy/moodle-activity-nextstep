<?php

namespace mod_nextstep\local;

defined('MOODLE_INTERNAL') || die();

class next_finder {
    /**
     * Finds the first incomplete and eligible course module for a user.
     *
     * @param \stdClass $course
     * @param int $userid
     * @param int $ignorecmid The nextstep activity cmid to ignore.
     * @param array $options Finder options.
     * @return \cm_info|null
     */
    public static function find_next_cm(\stdClass $course, int $userid, int $ignorecmid, array $options = []): ?\cm_info {
        $skipnocompletion = (bool)($options['skipnocompletion'] ?? true);
        $skiprestricted = (bool)($options['skiprestricted'] ?? true);
        $allowedmodules = self::parse_moduletypes((string)($options['moduletypes'] ?? ''));

        $modinfo = get_fast_modinfo($course, $userid);
        $completion = new \completion_info($course);

        foreach ($modinfo->get_cms() as $cm) {
            if ((int)$cm->id === $ignorecmid) {
                continue;
            }

            if (!empty($cm->deletioninprogress)) {
                continue;
            }

            if ($skiprestricted && !$cm->uservisible) {
                continue;
            }

            if (self::is_resource_like_module($cm->modname)) {
                continue;
            }

            if (!empty($allowedmodules) && !in_array($cm->modname, $allowedmodules, true)) {
                continue;
            }

            if ((int)$cm->completion === COMPLETION_TRACKING_NONE) {
                if ($skipnocompletion) {
                    continue;
                }
                return $cm;
            }

            $data = $completion->get_data($cm, false, $userid);
            if ((int)$data->completionstate === COMPLETION_INCOMPLETE) {
                return $cm;
            }
        }

        return null;
    }

    /**
     * @param string $value
     * @return array<string>
     */
    private static function parse_moduletypes(string $value): array {
        if ($value === '') {
            return [];
        }

        $items = array_filter(array_map('trim', explode(',', strtolower($value))));
        return array_values(array_unique($items));
    }

    private static function is_resource_like_module(string $modname): bool {
        $resourcelikes = ['book', 'folder', 'imscp', 'label', 'page', 'resource', 'url'];
        return in_array($modname, $resourcelikes, true);
    }
}
