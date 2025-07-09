# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## [Unreleased]

### Added

- Implement Adding of parent dataset id to a dataset of table format. [#179](https://github.com/IN-CORE/incore-studio/issues/179)

### Fixed

- Add preview support for DFR3Mapping, Dataset, and Hazard when selecting resources from services [#180](https://github.com/IN-CORE/incore-studio/issues/180)
- CSS for Submitting exeuction dialog. [#185](https://github.com/IN-CORE/incore-studio/issues/185)
- Bug where we cannot edit fields that were prepopulated with not allowed characters in execution sidepanel. [#174](https://github.com/IN-CORE/incore-studio/issues/174)
- Execution count not showing up issue. [#172](https://github.com/IN-CORE/incore-studio/issues/172)
- Adapt progress bar to fit smaller screen [#171](https://github.com/IN-CORE/incore-studio/issues/171)
- Finalized workflows not being saved first issue. [#204](https://github.com/IN-CORE/incore-studio/issues/204)
- The items in project dashboard to be default sorted by date in descending order. [#206](https://github.com/IN-CORE/incore-studio/issues/206)
- Switch from webpack to esbuild and find alternative to serve app with SPA routes [#200](https://github.com/IN-CORE/incore-studio/issues/200)

### Changed

- Improve resource card layout [#65](https://github.com/IN-CORE/incore-studio/issues/65)
- Disable unused buttons from navbar [#215](https://github.com/IN-CORE/incore-studio/issues/215)
- Execution Page UI and Analysis Node Look and feel [#223](https://github.com/IN-CORE/incore-studio/issues/223)

## [Beta-1] - 05-01-2025

### Added

- Batch select and delete resources [#140](https://github.com/IN-CORE/incore-studio/issues/140)
- Implement basic chart visualization using vega-lite [#152](https://github.com/IN-CORE/incore-studio/issues/152)
- Add default parameters when setting execution. [#153](https://github.com/IN-CORE/incore-studio/issues/153)
- Edit project metadata [#148](https://github.com/IN-CORE/incore-studio/issues/148)
- Ability to rerun the workflow with same parameters. [#144](https://github.com/IN-CORE/incore-studio/issues/144)
- Group analyses in the workflow editor by tags [#32](https://github.com/IN-CORE/incore-studio/issues/32)

### Fixed

- Fix inconsistency in styling [#156](https://github.com/IN-CORE/incore-studio/issues/156)

### Changed

- Update GeoServer style selection [#168](https://github.com/IN-CORE/incore-studio/issues/168)

## [Alpha-4] - 04-11-2025

### Fixed

- Visual feedback of results tab to show execution still running and avoid N/A in output fields [#96](https://github.com/IN-CORE/incore-studio/issues/96)
- Resolve map layer visibility issue when create new hazard [#113](https://github.com/IN-CORE/incore-studio/issues/113)
- Visualzation pagination in Execution side panel and select existing visualizations in the dialog dropdown [#95](https://github.com/IN-CORE/incore-studio/issues/95)
- Allow only alpha-numeric characters as inputs from text fields and some punctuations. [#129](https://github.com/IN-CORE/incore-studio/issues/129)

### Added

- Create Hazard option to project dashboard hazard section [#118](https://github.com/IN-CORE/incore-studio/issues/118)
- Drawing capability to the map. [#115](https://github.com/IN-CORE/incore-studio/issues/115)
- Upload dataset modal that uploads dataset to IN-CORE [#128](https://github.com/IN-CORE/incore-studio/issues/128)

### Changed

- Get the layer bounding box and fly to the bound [#124](https://github.com/IN-CORE/incore-studio/issues/124)
- Allow user to add a region not present in the dropdown [#127](https://github.com/IN-CORE/incore-studio/issues/127)

## [Alpha-3] - 03-10-2025

### Added

- Reset Parameters and input dataset buttons in Execution create step. [#68](https://github.com/IN-CORE/incore-studio/issues/68)
- Dataset type enforced when selecting datasets/hazards/dfr3 mappings based on the allowed input dataset type. [#81](https://github.com/IN-CORE/incore-studio/issues/81)
- Upload hazard components to create hazard and add to project [#106](https://github.com/IN-CORE/incore-studio/issues/106)
- Confirmation dialogs on Edges and Analyses removal in workflow editor. [#49](https://github.com/IN-CORE/incore-studio/issues/49)
- Information SidePanel for analysis to view more information. [#100](https://github.com/IN-CORE/incore-studio/issues/100)

### Changed

- Update how filter and searchbox works on homepage and project resource page [#44](https://github.com/IN-CORE/incore-studio/issues/44)
- Project Dashboard page [#99](https://github.com/IN-CORE/incore-studio/issues/99)
- Hide map provider info icon [#114](https://github.com/IN-CORE/incore-studio/issues/114)

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
