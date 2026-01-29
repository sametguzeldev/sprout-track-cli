# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2024-01-29

### Added

- Cache server settings locally after login
- Use server default units for measurements and feeding:
  - Bottle feeding uses `defaultBottleUnit` from server
  - Solid feeding uses `defaultSolidsUnit` from server
  - Height/head measurements use `defaultHeightUnit` from server
  - Weight measurements use `defaultWeightUnit` from server
  - Temperature measurements use `defaultTempUnit` from server
- New `settings refresh` command to manually refresh cached settings
- New `settings cached` command to view locally cached settings

### Changed

- Unit options in commands now show "uses server default if not specified"
- Settings are automatically cached on login
- Settings are cleared on logout

## [1.0.2] - 2024-01-29

### Fixed

- Read version dynamically from package.json instead of hardcoded value

## [1.0.1] - 2024-01-29

### Fixed

- Corrected repository URL in package.json

## [1.0.0] - 2024-01-29

### Added

- Initial release of sprout-track-cli
- Configuration management (`config` commands)
  - Server URL configuration
  - Default output format setting
  - Config reset and path display
- Authentication (`auth` commands)
  - PIN-based authentication
  - Account-based authentication (email/password)
  - Token refresh, status, and whoami commands
- Baby management (`baby` commands)
  - Full CRUD operations
  - Default baby selection for quick commands
- Activity logging commands:
  - **Feed** - Breast, bottle, and solids logging with quick log variants
  - **Sleep** - Start/end workflow for naps and night sleep
  - **Diaper** - Wet, dirty, both with quick log variants
  - **Bath** - With soap/shampoo tracking
  - **Pump** - Start/end workflow with left/right amounts
  - **Measurement** - Height, weight, head circumference, temperature
  - **Milestone** - Motor, cognitive, social, language categories
  - **Note** - Quick note addition with categories
  - **Medicine** - Medicine definition and administration logging
- Timeline view combining all activities
- Management commands:
  - **Caretaker** - User management with PIN authentication
  - **Contact** - Doctors, teachers, family contacts
  - **Calendar** - Appointments and reminders
  - **Settings** - Family settings and unit preferences
  - **Family** - Family information management
  - **Units** - List available measurement units
- Output formats: JSON, table, and plain text
- Comprehensive documentation:
  - README.md with quick start guide
  - COMMANDS.md with full command reference
  - AI_AGENT_GUIDE.md for AI integration
  - EXAMPLES.md with real-world usage scenarios
