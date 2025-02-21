# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added

- Reset Parameters and input dataset buttons in Execution create step. [#68](https://github.com/IN-CORE/incore-studio/issues/68)

### Changed

- Update how filter and searchbox works on homepage and project resource page [#44](https://github.com/IN-CORE/incore-studio/issues/44)

### Fixed

- Issue where there were discrepancies in reporting wrong status color and icon of an execution [#94](https://github.com/IN-CORE/incore-studio/issues/94)

## [Alpha-2] - 02-04-2025

### Added

- Support to automatically add the result datasets to project. [#70](https://github.com/IN-CORE/incore-studio/issues/70)
- Autosave feature on Workflow-editor [#72](https://github.com/IN-CORE/incore-studio/issues/72)
- Checks on the workflow-editor to prevent the user to make edits on finalized workflow. [#73](https://github.com/IN-CORE/incore-studio/issues/73)
- Search, filter and sort for project resources [#48](https://github.com/IN-CORE/incore-studio/issues/48)

### Changed

- Show warning message on execution page when refresh [#69](https://github.com/IN-CORE/incore-studio/issues/69)
- Improve "add from service" modal. [#66](https://github.com/IN-CORE/incore-studio/issues/66)

### Fixed

- Stale state cleanup and ensure correctness of the state on page load through internal navigation [#79](https://github.com/IN-CORE/incore-studio/issues/79)

## [Alpha-1] - 01-09-2025

### Added

- React-flow package and workflow component. [#1](https://github.com/IN-CORE/incore-studio/issues/1)
- Github action for building container [#2](https://github.com/IN-CORE/incore-studio/issues/2)
- Keycloak authentication to every route [#3](https://github.com/IN-CORE/incore-studio/issues/3)
- Create home page that lists all the projects [#4](https://github.com/IN-CORE/incore-studio/issues/4)
- Add Workflow Editor component. [#15](https://github.com/IN-CORE/incore-studio/issues/15)
- Add "Add Next" and "Add Previous" analysis in analysis node. [#6](https://github.com/IN-CORE/incore-studio/issues/6)
- Move dependency_graph.json to public and fetch it so it can be overwritten by helm. [#33](https://github.com/IN-CORE/incore-studio/issues/33)
- Add analysis configuration panel. [#31](https://github.com/IN-CORE/incore-studio/issues/31)
- Workflow Execution Summary page. [#16](https://github.com/IN-CORE/incore-studio/issues/16)
- Error Handling for missing dependency graph or Valid tools in workflow. [#50](https://github.com/IN-CORE/incore-studio/issues/50)
- Create visualization components [#18](https://github.com/IN-CORE/incore-studio/issues/18)
- Snackbar for user actions [#51](https://github.com/IN-CORE/incore-studio/issues/51)
- Create empty project [#42](https://github.com/IN-CORE/incore-studio/issues/42)
- Modal that adds resources from service to project [#40](https://github.com/IN-CORE/incore-studio/issues/40)
- Create Execution component for displaying configurations and results [#5](https://github.com/IN-CORE/incore-studio/issues/5)
- Ability to fill out parameters and input datasets for execution [#61](https://github.com/IN-CORE/incore-studio/issues/61)
- Display status of each execution steps [#39](https://github.com/IN-CORE/incore-studio/issues/39)
- Modal to create a new workflow and add to project [#41](https://github.com/IN-CORE/incore-studio/issues/41)

### Changed

- Navbar file structure. [#37](https://github.com/IN-CORE/incore-studio/issues/37)

### Fixed

- Direct URL access to the sub pages in studio [#75](https://github.com/IN-CORE/incore-studio/issues/75)
- Github action to create a container with the name with string value [#85](https://github.com/IN-CORE/incore-studio/issues/85)
