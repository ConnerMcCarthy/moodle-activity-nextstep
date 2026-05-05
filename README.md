# mod_nextstep

Moodle activity module that redirects a learner to highlight the next unfinished activity in a course.

Plugin name:
- `Highlight next unfinished activity`

Component:
- `mod_nextstep`

Compatibility:
- Moodle `4.1.12+`
- Moodle `5.1.3`

## What it does

Add a `Highlight next unfinished activity` activity to a course. When a learner opens it, the plugin:

1. Checks that course completion tracking is enabled.
2. Finds the next unfinished eligible course module for the learner.
3. Redirects the learner back to the course page and anchors them to that module.

If no suitable incomplete activity is found, it returns the learner to the course page with an informational message.

## Options

- `Skip items without completion tracking`
- `Skip unavailable/restricted items`
- `Include only these activity types`

The activity-type filter accepts Moodle module names such as `assign,quiz,forum`.

## Repository layout

This repository is the plugin itself, so the Moodle plugin files live at the repo root.

Important files:
- [version.php](version.php)
- [lib.php](lib.php)
- [mod_form.php](mod_form.php)
- [view.php](view.php)

## Install

### From zip

Use the packaged zip in `dist/nextstep.zip` and install it from:

`Site administration -> Plugins -> Install plugins`

### From source

Copy this repository into your Moodle codebase as:

`mod/nextstep`

Then run Moodle upgrade.

## Packaging

The installable package built on this machine is:

- `dist/nextstep.zip`

The zip contains a top-level `nextstep/` directory, ready for Moodle plugin installation.

## License

GPL v3 or later, consistent with Moodle plugin conventions.
