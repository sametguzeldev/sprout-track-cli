# Sprout-Track CLI Command Reference

Complete reference for all available commands.

## Global Options

All commands support:
- `--output <format>` - Output format: `json`, `table`, or `plain`
- `--help` - Show command help

## Configuration Commands

### `config set-server <url>`
Set the Sprout-Track server URL.

```bash
sprout-track config set-server https://my-instance.com
```

### `config set-output <format>`
Set default output format.

```bash
sprout-track config set-output json
```

### `config show`
Display current configuration.

### `config reset`
Reset configuration to defaults.

Options:
- `-y, --yes` - Skip confirmation

### `config path`
Show configuration file path.

---

## Authentication Commands

### `auth login`
Authenticate with the server.

PIN-based:
```bash
sprout-track auth login --pin 123456 --family my-family
sprout-track auth login --pin 123456 --family my-family --login-id 01
```

Account-based:
```bash
sprout-track auth login --email user@example.com --password secret
```

Options:
- `-p, --pin <pin>` - Security PIN
- `-l, --login-id <id>` - Caretaker login ID
- `-f, --family <slug>` - Family slug
- `-e, --email <email>` - Email address
- `--password <password>` - Account password

### `auth logout`
Clear authentication credentials.

### `auth status`
Show authentication status.

### `auth whoami`
Show current user information.

### `auth refresh`
Refresh authentication token.

---

## Baby Commands

### `baby list`
List all babies.

Options:
- `--active` - Show only active babies

### `baby get <id>`
Get baby details.

### `baby create`
Create a new baby.

Options:
- `--first-name <name>` (required)
- `--birth-date <YYYY-MM-DD>` (required)
- `--last-name <name>`
- `--gender <MALE|FEMALE>`

### `baby update <id>`
Update baby information.

Options:
- `--first-name <name>`
- `--last-name <name>`
- `--birth-date <date>`
- `--gender <MALE|FEMALE>`
- `--inactive <true|false>`

### `baby delete <id>`
Delete a baby.

Options:
- `-y, --yes` - Skip confirmation

### `baby select <id>`
Set default baby for quick commands.

### `baby unselect`
Clear default baby selection.

---

## Feed Commands

### `feed list`
List feed logs.

Options:
- `-b, --baby <id>` (required)
- `--start <date>` - Start date
- `--end <date>` - End date
- `--type <BREAST|BOTTLE|SOLIDS>` - Filter by type

### `feed get <id>`
Get feed log details.

### `feed last`
Get most recent feed log.

Options:
- `-b, --baby <id>` (required)

### `feed create`
Create a feed log with full options.

Options:
- `-b, --baby <id>` (required)
- `--type <BREAST|BOTTLE|SOLIDS>` (required)
- `--time <ISO8601>` - Default: now
- `--amount <number>`
- `--unit <unit>`
- `--side <LEFT|RIGHT>`
- `--duration <seconds>`
- `--food <description>`
- `--bottle-type <type>`
- `--notes <text>`

### `feed log breast`
Quick log breastfeeding.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--side <LEFT|RIGHT>` (required)
- `--duration <minutes>`
- `--notes <text>`

### `feed log bottle`
Quick log bottle feeding.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--amount <number>` (required)
- `--unit <OZ|ML>` - Default: OZ
- `--type <type>` - Bottle type
- `--notes <text>`

### `feed log solids`
Quick log solid food.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--food <description>` (required)
- `--amount <number>`
- `--unit <unit>`
- `--notes <text>`

### `feed update <id>`
Update a feed log.

### `feed delete <id>`
Delete a feed log.

---

## Sleep Commands

### `sleep list`
List sleep logs.

Options:
- `-b, --baby <id>` (required)
- `--start <date>`
- `--end <date>`

### `sleep get <id>`
Get sleep log details.

### `sleep create`
Create a sleep log.

Options:
- `-b, --baby <id>` (required)
- `--type <NAP|NIGHT_SLEEP>` (required)
- `--start <ISO8601>` (required)
- `--end <ISO8601>`
- `--location <location>`
- `--quality <POOR|FAIR|GOOD|EXCELLENT>`

### `sleep start`
Start a sleep session.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--type <NAP|NIGHT_SLEEP>` (required)
- `--location <location>`

### `sleep end`
End an ongoing sleep session.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--quality <POOR|FAIR|GOOD|EXCELLENT>`

### `sleep update <id>`
Update a sleep log.

### `sleep delete <id>`
Delete a sleep log.

---

## Diaper Commands

### `diaper list`
List diaper logs.

Options:
- `-b, --baby <id>` (required)
- `--start <date>`
- `--end <date>`

### `diaper get <id>`
Get diaper log details.

### `diaper create`
Create a diaper log.

Options:
- `-b, --baby <id>` (required)
- `--type <WET|DIRTY|BOTH>` (required)
- `--time <ISO8601>`
- `--condition <description>`
- `--color <color>`
- `--blowout`

### `diaper log wet`
Quick log wet diaper.

Options:
- `-b, --baby <id>` - Uses default if not specified

### `diaper log dirty`
Quick log dirty diaper.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--color <color>`
- `--condition <description>`

### `diaper log both`
Quick log wet and dirty diaper.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--color <color>`
- `--condition <description>`
- `--blowout`

### `diaper update <id>`
Update a diaper log.

### `diaper delete <id>`
Delete a diaper log.

---

## Medicine Commands

### `medicine list`
List medicines.

Options:
- `--active` - Show only active medicines

### `medicine get <id>`
Get medicine details.

### `medicine create`
Create a new medicine.

Options:
- `--name <name>` (required)
- `--dose-size <number>`
- `--unit <unit>`
- `--min-time <HH:MM>`
- `--notes <text>`

### `medicine update <id>`
Update a medicine.

### `medicine delete <id>`
Delete a medicine.

---

## Medicine Log Commands

### `medicine-log list`
List medicine logs.

Options:
- `-b, --baby <id>` (required)
- `--medicine <id>` - Filter by medicine
- `--start <date>`
- `--end <date>`

### `medicine-log get <id>`
Get medicine log details.

### `medicine-log create`
Create a medicine log.

Options:
- `-b, --baby <id>` (required)
- `--medicine <id>` (required)
- `--dose <amount>` (required)
- `--time <ISO8601>`
- `--unit <unit>`
- `--notes <text>`

### `medicine-log log`
Quick log medicine administration.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--medicine <id>` (required)
- `--dose <amount>` (required)
- `--unit <unit>`
- `--notes <text>`

### `medicine-log update <id>`
Update a medicine log.

### `medicine-log delete <id>`
Delete a medicine log.

---

## Pump Commands

### `pump list`
List pump logs.

Options:
- `-b, --baby <id>` (required)
- `--start <date>`
- `--end <date>`

### `pump get <id>`
Get pump log details.

### `pump create`
Create a pump log.

Options:
- `-b, --baby <id>` (required)
- `--start <ISO8601>` (required)
- `--end <ISO8601>`
- `--left <amount>`
- `--right <amount>`
- `--unit <OZ|ML>`
- `--notes <text>`

### `pump start`
Start a pump session.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--notes <text>`

### `pump end`
End an ongoing pump session.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--left <amount>` (required)
- `--right <amount>` (required)
- `--unit <OZ|ML>`
- `--notes <text>`

### `pump log`
Quick log a completed pump session.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--left <amount>` (required)
- `--right <amount>` (required)
- `--unit <OZ|ML>`
- `--duration <minutes>`
- `--notes <text>`

### `pump update <id>`
Update a pump log.

### `pump delete <id>`
Delete a pump log.

---

## Bath Commands

### `bath list`
List bath logs.

Options:
- `-b, --baby <id>` (required)
- `--start <date>`
- `--end <date>`

### `bath get <id>`
Get bath log details.

### `bath create`
Create a bath log.

Options:
- `-b, --baby <id>` (required)
- `--time <ISO8601>`
- `--soap` / `--no-soap`
- `--shampoo` / `--no-shampoo`
- `--notes <text>`

### `bath log`
Quick log a bath.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--soap` / `--no-soap`
- `--shampoo` / `--no-shampoo`
- `--notes <text>`

### `bath update <id>`
Update a bath log.

### `bath delete <id>`
Delete a bath log.

---

## Measurement Commands

### `measurement list`
List measurements.

Options:
- `-b, --baby <id>` (required)
- `--type <HEIGHT|WEIGHT|HEAD_CIRCUMFERENCE|TEMPERATURE>`

### `measurement get <id>`
Get measurement details.

### `measurement create`
Create a measurement.

Options:
- `-b, --baby <id>` (required)
- `--type <type>` (required)
- `--value <number>` (required)
- `--unit <unit>` (required)
- `--date <YYYY-MM-DD>`
- `--notes <text>`

### `measurement log height`
Quick log height.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--value <number>` (required)
- `--unit <IN|CM>` - Default: IN
- `--date <YYYY-MM-DD>`
- `--notes <text>`

### `measurement log weight`
Quick log weight.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--value <number>` (required)
- `--unit <LB|KG>` - Default: LB
- `--date <YYYY-MM-DD>`
- `--notes <text>`

### `measurement log head`
Quick log head circumference.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--value <number>` (required)
- `--unit <IN|CM>` - Default: IN
- `--date <YYYY-MM-DD>`
- `--notes <text>`

### `measurement log temp`
Quick log temperature.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--value <number>` (required)
- `--unit <F|C>` - Default: F
- `--date <YYYY-MM-DD>`
- `--notes <text>`

### `measurement update <id>`
Update a measurement.

### `measurement delete <id>`
Delete a measurement.

---

## Milestone Commands

### `milestone list`
List milestones.

Options:
- `-b, --baby <id>` (required)
- `--category <MOTOR|COGNITIVE|SOCIAL|LANGUAGE|CUSTOM>`

### `milestone get <id>`
Get milestone details.

### `milestone create`
Create a milestone.

Options:
- `-b, --baby <id>` (required)
- `--title <title>` (required)
- `--category <category>` (required)
- `--date <YYYY-MM-DD>`
- `--description <text>`

### `milestone update <id>`
Update a milestone.

### `milestone delete <id>`
Delete a milestone.

---

## Note Commands

### `note list`
List notes.

Options:
- `-b, --baby <id>` (required)
- `--start <date>`
- `--end <date>`

### `note get <id>`
Get note details.

### `note create`
Create a note.

Options:
- `-b, --baby <id>` (required)
- `--content <text>` (required)
- `--time <ISO8601>`
- `--category <category>`

### `note add <content>`
Quick add a note.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--category <category>`

### `note update <id>`
Update a note.

### `note delete <id>`
Delete a note.

---

## Timeline Command

### `timeline`
View combined activity timeline.

Options:
- `-b, --baby <id>` - Uses default if not specified
- `--limit <n>` - Number of results (default: 20)
- `--start <date>`
- `--end <date>`

---

## Caretaker Commands

### `caretaker list`
List all caretakers.

### `caretaker get <id>`
Get caretaker details.

### `caretaker create`
Create a new caretaker.

Options:
- `--name <name>` (required)
- `--login-id <id>` (required) - 2-digit identifier
- `--pin <pin>` (required)
- `--type <type>` - parent, nanny, grandparent, etc.
- `--role <USER|ADMIN>` - Default: USER

### `caretaker update <id>`
Update a caretaker.

Options:
- `--name <name>`
- `--type <type>`
- `--pin <pin>`
- `--inactive <true|false>`

### `caretaker delete <id>`
Delete a caretaker.

---

## Contact Commands

### `contact list`
List all contacts.

Options:
- `--role <role>` - Filter by role

### `contact get <id>`
Get contact details.

### `contact create`
Create a new contact.

Options:
- `--name <name>` (required)
- `--role <role>` (required)
- `--phone <phone>`
- `--email <email>`
- `--address <address>`
- `--notes <text>`

### `contact update <id>`
Update a contact.

### `contact delete <id>`
Delete a contact.

---

## Calendar Commands

### `calendar list`
List calendar events.

Options:
- `-b, --baby <id>` - Filter by baby
- `--start <date>`
- `--end <date>`

### `calendar get <id>`
Get calendar event details.

### `calendar create`
Create a calendar event.

Options:
- `--title <title>` (required)
- `--type <APPOINTMENT|REMINDER|CUSTOM>` (required)
- `--start <ISO8601>` (required)
- `--end <ISO8601>`
- `--description <text>`
- `--location <location>`
- `--all-day`
- `--color <color>`

### `calendar update <id>`
Update a calendar event.

### `calendar delete <id>`
Delete a calendar event.

---

## Settings Commands

### `settings get`
Get current settings.

### `settings set`
Update settings.

Options:
- `--family-name <name>`
- `--bottle-unit <OZ|ML>`
- `--solids-unit <unit>`
- `--height-unit <IN|CM>`
- `--weight-unit <LB|KG>`
- `--temp-unit <F|C>`

---

## Family Commands

### `family get`
Get family information.

### `family update`
Update family information.

Options:
- `--name <name>`
- `--slug <slug>`

---

## Units Command

### `units`
List available units.

Options:
- `--activity <type>` - Filter by activity type (feed, pump, measurement)
