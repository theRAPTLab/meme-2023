# CHANGELOG

- [Unreleased](#unreleased)

- [1.4.0-final](#140-final) - 2025-01-02 - IU Winter 2025 Pilot
- [1.4.0-alpha](#140-alpha) - 2024-01-26 - Unreleased version focusing on Electron Build Updates.
- [1.3.2-final](#132-final) - 2024-05-21 - Final version used during Spring 2021 Implementation
- [Final-version-used-during-Spring-2021-Implementation](#final-version-used-during-spring-2021-Implementation) - 2021-06-09 -
- [1.3.0-final](#130-final) - 2021-02-22 - Version 1.3.0
- [1.2.0-final](#120-final) - 2020-10-12 - Version 1.2.0
- [1.1.0-final](#110-final) - 2020-02-11 - Version 1.1 Release
- [1.0.0-final](#100-final) - 2019-11-19 - Version 1.0 Release
- [1.0.0-beta](#100-beta) - 2019-11-04 - Student Data Saving
- [0.3.0-alpha](#030-alpha) - 2019-05-29 - UI pilot test at Rutgers
- [0.2.0-alpha](#020-alpha) - 2019-05-19 - UI pilot test at IU
- [0.1.0-alpha](#010-alpha) - 2019-05-19 - UI pilot test at IU

---

## Unreleased
### Added
### Changed
### Deprecated
### Removed
### Fixed

---

## [1.4.0-final](../../releases/tag/v1.4.0-final)
2025-01-02
IU Winter 2025 Pilot

### Main Changes
* New custom UI components (remove MUI)
* New comment system
* Sortable, resizable Tables
* Support for Turbo360
* Update to Node 18

### Added
* Templated Comment System #41
* Sortable, Resizable Table #90
  - Table columns can now be sorted
  - Table columns can now be resized
  - URTables are customizable tables that can be used with other projects with custom renderers and sorters.
### Changed
* Re-skin UI with custom components (remove MUI) #25
* Evidence badges are now hidden when Evidence Library resources are hidden #34
* Fix MUI Errors #24
* Use "Claim" instead of "Idea" #144
* Add visible comment id #145
* Simplify evidence #143
	- The Evidence "Notes" field is now removed.
	- Evidence "Idea" and "ScreenShot" are shown by default. (And "Target" so that you can select a target).
	- After selecting a target, "Rating" and "Reason" are displayed and can be edited.
* Update help text, evidence link label #138
### Removed
* HandsOnTable #90
* Remove MUI #25
### Fixed
* Login form data no longer auto-refreshed with any admin update #38
* Minor UI Fixes
  - "Enter" submits forms. #62 #65 #69
  - Clear old student names when adding new ons. #66
  - Show prop after adding #55
  - Hide shadow on ModelSelect dialog #98
  - Add "Add process" button when an entity or outcome is sele… 
  - Show prop after adding, but don't pan/zoom #55 #51
  - Restore hover over diagram objects #51
  - Renamed evidence link #134
  - Fixed evidence count badge on resource pane l#134
  - Tweaked comments to include dynamic feedback on whether evidence is referenced #134


### Dev Stack Changes
* CLI for packaging and deploying Turbo360 #72
* Build system now shows webpack build errors #39
* Fix Build System Configuration and Errors
  - #23
  - #20
  - #18
  - #17
  - #14
* Node updated to version 18 (from version 10) #9
* Electron Build Updates -- Runtime folder structure and default/Resource packaging updates #135
  - Update default paths for resources etc for Electron
  - Update build process for cloning new projects from templates
  -  Fix broken Electron build process, including code signing



## [1.4.0-alpha](../../releases/tag/v1.4.0-alpha)
2024-01-26
Unreleased version focusing on Electron Build Updates.
Used for internal testing and teacher pilot testing.

Forked `theRAPTLab/meme-2023` from `theRaptLabl/meme` January 26, 204.

* Use "Claim" instead of "Idea" #144
* Add visible comment id #145
* Simplify evidence #143
	- The Evidence "Notes" field is now removed.
	- Evidence "Idea" and "ScreenShot" are shown by default. (And "Target" so that you can select a target).
	- After selecting a target, "Rating" and "Reason" are displayed and can be edited.
* Update help text, evidence link label #138
* Electron Build Updates -- Runtime folder structure and default/Resource packaging updates #135
  - Update default paths for resources etc for Electron
  - Update build process for cloning new projects from templates
  -  Fix broken Electron build process, including code signing
* Minor UI Fixes
  - Renamed evidence link #134
  - Fixed evidence count badge on resource pane l#134
  - Tweaked comments to include dynamic feedback on whether evidence is referenced #134

## [1.3.2-final](../../releases/tag/v1.3.2-final)
2024-05-21 (tagged)

* Add reference to 1.3.1 release.
* Minor visual changes to the evidence link to make it a bit more intuitive (maybe). Also changed to calling it an "idea"
* Change IDEA to CONCLUSION in evidence link
* Made comment boxes slightly wider.

## [Final-version-used-during-Spring-2021-Implementation](../../releases/tag/Final-version-used-during-Spring-2021-Implementation)
2021-06-09

## [1.3.1-final](../../releases/tag/v1.3.1-final)
2021-03-02
Candidate release for Winter 2021 studies.

## [1.3.0-final](../../releases/tag/v1.3.0-final)
2021-02-22
Version 1.3.0

## [1.2.0-final](../../releases/tag/v1.2.0-final)
2020-10-12
Version 1.2.0

## [1.1.0-final](../../releases/tag/v1.1.0-final)
2020-02-11
Version 1.1 Release

## [1.0.0-final](../../releases/tag/v1.0.0-final)
2019-11-19
Version 1.0 Release

## [1.0.0-beta](../../releases/tag/v1.0.0-beta)
2019-11-04
Student Data Saving

## [0.3.0-alpha](../../releases/tag/v0.3.0-alpha)
2019-05-29
Release for second rough UI pilot testing at Rutgers May 29, 2019.

## [0.2.0-alpha](../../releases/tag/v0.2.0-alpha)
2019-05-19
Second release for rough UI pilot testing at IU.

## [0.1.0-alpha](../../releases/tag/v0.1.0-alpha)
2019-05-19
First release for rough UI pilot testing at IU.
