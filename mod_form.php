<?php

require_once($CFG->dirroot . '/course/moodleform_mod.php');

class mod_nextstep_mod_form extends moodleform_mod {
    public function definition(): void {
        $mform = $this->_form;

        $mform->addElement('text', 'name', get_string('name'), ['size' => '64']);
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required', null, 'client');

        $this->standard_intro_elements();

        $mform->addElement('advcheckbox', 'skipnocompletion', get_string('skipnocompletion', 'mod_nextstep'));
        $mform->addHelpButton('skipnocompletion', 'skipnocompletion', 'mod_nextstep');
        $mform->setDefault('skipnocompletion', 1);

        $mform->addElement('advcheckbox', 'skiprestricted', get_string('skiprestricted', 'mod_nextstep'));
        $mform->addHelpButton('skiprestricted', 'skiprestricted', 'mod_nextstep');
        $mform->setDefault('skiprestricted', 1);

        $mform->addElement('text', 'moduletypes', get_string('moduletypes', 'mod_nextstep'), ['size' => '64']);
        $mform->setType('moduletypes', PARAM_TEXT);
        $mform->addHelpButton('moduletypes', 'moduletypes', 'mod_nextstep');

        $this->standard_coursemodule_elements();
        $this->add_action_buttons();
    }
}
