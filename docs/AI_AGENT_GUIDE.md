# Sprout-Track CLI - AI Agent Guide

This guide is designed for AI agents that need to interact with Sprout-Track via the CLI. It provides structured information about commands, data formats, and best practices.

## Overview

Sprout-Track CLI is a command-line tool for interacting with self-hosted Sprout-Track baby tracking instances. It supports all core functionality including activity logging, baby management, and family settings.

## Setup for AI Agents

### Initial Configuration

```bash
# 1. Configure server endpoint
sprout-track config set-server https://your-instance.com

# 2. Authenticate (PIN-based)
sprout-track auth login --pin <pin> --family <family-slug> [--login-id <id>]

# 3. Or authenticate with account
sprout-track auth login --email <email> --password <password>

# 4. Verify authentication
sprout-track auth status --output json
```

### Recommended Settings for AI Agents

```bash
# Use JSON output by default for easier parsing
sprout-track config set-output json

# Set default baby to reduce command verbosity
sprout-track baby select <baby-id>

# Check cached settings to know default units
sprout-track settings cached --output json
```

### Default Units

The CLI caches the server's default unit preferences after login. Commands automatically use these defaults:

| Setting | Used By | Examples |
|---------|---------|----------|
| `defaultBottleUnit` | `feed log bottle` | OZ, ML |
| `defaultSolidsUnit` | `feed log solids` | TBSP, G |
| `defaultHeightUnit` | `measurement log height/head` | IN, CM |
| `defaultWeightUnit` | `measurement log weight` | LB, KG, G |
| `defaultTempUnit` | `measurement log temp` | F, C |

To refresh cached settings:
```bash
sprout-track settings refresh
```

To override the default unit in any command:
```bash
sprout-track feed log bottle --amount 120 --unit ML
```

## Command Patterns

### Standard CRUD Operations

Most resources follow this pattern:

```bash
sprout-track <resource> list [options]     # List all
sprout-track <resource> get <id>           # Get single
sprout-track <resource> create [options]   # Create new
sprout-track <resource> update <id> [opts] # Update existing
sprout-track <resource> delete <id> [-y]   # Delete (use -y to skip confirmation)
```

### Quick Log Pattern

Activity logs support quick logging:

```bash
sprout-track <activity> log <type> [options]
```

Examples:
- `sprout-track feed log bottle --amount 4`
- `sprout-track diaper log wet`
- `sprout-track bath log --soap`

### Start/End Pattern

Some activities support session tracking:

```bash
sprout-track sleep start --type NAP
sprout-track sleep end

sprout-track pump start
sprout-track pump end --left 3 --right 2
```

## Data Types and Enums

### Gender
- `MALE`
- `FEMALE`

### Sleep Type
- `NAP`
- `NIGHT_SLEEP`

### Sleep Quality
- `POOR`
- `FAIR`
- `GOOD`
- `EXCELLENT`

### Feed Type
- `BREAST`
- `BOTTLE`
- `SOLIDS`

### Breast Side
- `LEFT`
- `RIGHT`

### Diaper Type
- `WET`
- `DIRTY`
- `BOTH`

### Milestone Category
- `MOTOR`
- `COGNITIVE`
- `SOCIAL`
- `LANGUAGE`
- `CUSTOM`

### Measurement Type
- `HEIGHT`
- `WEIGHT`
- `HEAD_CIRCUMFERENCE`
- `TEMPERATURE`

### Calendar Event Type
- `APPOINTMENT`
- `CARETAKER_SCHEDULE`
- `REMINDER`
- `CUSTOM`

## Date/Time Formats

All date/time values use **ISO 8601** format:
- Full datetime: `2024-01-15T14:30:00Z` or `2024-01-15T14:30:00-05:00`
- Date only: `2024-01-15`
- Special value: `now` (current time)

## Output Parsing

### JSON Mode (Recommended for AI)

```bash
sprout-track baby list --output json
```

Returns:
```json
[
  {
    "id": "abc-123",
    "firstName": "Emma",
    "lastName": "Smith",
    "birthDate": "2024-01-15T00:00:00.000Z",
    "gender": "FEMALE",
    "inactive": false
  }
]
```

### Error Handling

Errors are output to stderr. Check exit code:
- `0`: Success
- `1`: Error

Error output format:
```
✗ Error message here
```

## Complete Command Reference

### Authentication

```bash
# PIN authentication
sprout-track auth login --pin <pin> [--family <slug>] [--login-id <id>]

# Account authentication
sprout-track auth login --email <email> --password <password>

# Check status
sprout-track auth status --output json

# Get current user info
sprout-track auth whoami --output json

# Refresh token
sprout-track auth refresh

# Logout
sprout-track auth logout
```

### Baby Management

```bash
# List babies
sprout-track baby list [--active] --output json

# Get baby details
sprout-track baby get <id> --output json

# Create baby
sprout-track baby create \
  --first-name <name> \
  --birth-date <YYYY-MM-DD> \
  [--last-name <name>] \
  [--gender <MALE|FEMALE>] \
  --output json

# Update baby
sprout-track baby update <id> \
  [--first-name <name>] \
  [--last-name <name>] \
  [--inactive <true|false>] \
  --output json

# Delete baby
sprout-track baby delete <id> -y

# Set default baby
sprout-track baby select <id>
```

### Feed Logging

```bash
# List feeds
sprout-track feed list \
  -b <baby-id> \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  [--type <BREAST|BOTTLE|SOLIDS>] \
  --output json

# Quick log breast
sprout-track feed log breast \
  [-b <baby-id>] \
  --side <LEFT|RIGHT> \
  [--duration <minutes>] \
  [--notes <text>] \
  --output json

# Quick log bottle
sprout-track feed log bottle \
  [-b <baby-id>] \
  --amount <number> \
  [--unit <OZ|ML>] \
  [--type <formula|breast milk>] \
  --output json

# Quick log solids
sprout-track feed log solids \
  [-b <baby-id>] \
  --food <description> \
  [--amount <number>] \
  --output json

# Create with full options
sprout-track feed create \
  -b <baby-id> \
  --type <BREAST|BOTTLE|SOLIDS> \
  [--time <ISO8601>] \
  [--amount <number>] \
  [--unit <unit>] \
  [--side <LEFT|RIGHT>] \
  [--food <description>] \
  [--notes <text>] \
  --output json
```

### Sleep Logging

```bash
# List sleep logs
sprout-track sleep list \
  -b <baby-id> \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  --output json

# Start sleep session
sprout-track sleep start \
  [-b <baby-id>] \
  --type <NAP|NIGHT_SLEEP> \
  [--location <location>] \
  --output json

# End sleep session
sprout-track sleep end \
  [-b <baby-id>] \
  [--quality <POOR|FAIR|GOOD|EXCELLENT>] \
  --output json

# Create completed sleep log
sprout-track sleep create \
  -b <baby-id> \
  --type <NAP|NIGHT_SLEEP> \
  --start <ISO8601> \
  --end <ISO8601> \
  [--quality <quality>] \
  --output json
```

### Diaper Logging

```bash
# List diaper logs
sprout-track diaper list \
  -b <baby-id> \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  --output json

# Quick log wet
sprout-track diaper log wet [-b <baby-id>] --output json

# Quick log dirty
sprout-track diaper log dirty \
  [-b <baby-id>] \
  [--color <color>] \
  [--condition <description>] \
  --output json

# Quick log both
sprout-track diaper log both \
  [-b <baby-id>] \
  [--blowout] \
  --output json

# Create with full options
sprout-track diaper create \
  -b <baby-id> \
  --type <WET|DIRTY|BOTH> \
  [--time <ISO8601>] \
  [--color <color>] \
  [--condition <description>] \
  [--blowout] \
  --output json
```

### Pump Logging

```bash
# List pump logs
sprout-track pump list \
  -b <baby-id> \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  --output json

# Start pump session
sprout-track pump start [-b <baby-id>] --output json

# End pump session with amounts
sprout-track pump end \
  [-b <baby-id>] \
  --left <amount> \
  --right <amount> \
  [--unit <OZ|ML>] \
  --output json

# Quick log completed session
sprout-track pump log \
  [-b <baby-id>] \
  --left <amount> \
  --right <amount> \
  [--unit <OZ|ML>] \
  [--duration <minutes>] \
  --output json
```

### Bath Logging

```bash
# List baths
sprout-track bath list \
  -b <baby-id> \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  --output json

# Quick log bath
sprout-track bath log \
  [-b <baby-id>] \
  [--soap] \
  [--no-soap] \
  [--shampoo] \
  [--no-shampoo] \
  [--notes <text>] \
  --output json
```

### Measurement Logging

```bash
# List measurements
sprout-track measurement list \
  -b <baby-id> \
  [--type <HEIGHT|WEIGHT|HEAD_CIRCUMFERENCE|TEMPERATURE>] \
  --output json

# Log height
sprout-track measurement log height \
  [-b <baby-id>] \
  --value <number> \
  [--unit <IN|CM>] \
  [--date <YYYY-MM-DD>] \
  --output json

# Log weight
sprout-track measurement log weight \
  [-b <baby-id>] \
  --value <number> \
  [--unit <LB|KG>] \
  [--date <YYYY-MM-DD>] \
  --output json

# Log temperature
sprout-track measurement log temp \
  [-b <baby-id>] \
  --value <number> \
  [--unit <F|C>] \
  --output json

# Log head circumference
sprout-track measurement log head \
  [-b <baby-id>] \
  --value <number> \
  [--unit <IN|CM>] \
  --output json
```

### Medicine Management

```bash
# List medicines
sprout-track medicine list [--active] --output json

# Create medicine
sprout-track medicine create \
  --name <name> \
  [--dose-size <number>] \
  [--unit <unit>] \
  [--min-time <HH:MM>] \
  [--notes <text>] \
  --output json

# Log medicine administration
sprout-track medicine-log log \
  [-b <baby-id>] \
  --medicine <medicine-id> \
  --dose <amount> \
  [--unit <unit>] \
  [--notes <text>] \
  --output json
```

### Notes

```bash
# List notes
sprout-track note list \
  -b <baby-id> \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  --output json

# Quick add note
sprout-track note add "<content>" \
  [-b <baby-id>] \
  [--category <category>] \
  --output json
```

### Milestones

```bash
# List milestones
sprout-track milestone list \
  -b <baby-id> \
  [--category <MOTOR|COGNITIVE|SOCIAL|LANGUAGE|CUSTOM>] \
  --output json

# Create milestone
sprout-track milestone create \
  -b <baby-id> \
  --title <title> \
  --category <category> \
  [--date <YYYY-MM-DD>] \
  [--description <text>] \
  --output json
```

### Timeline

```bash
# Get activity timeline
sprout-track timeline \
  [-b <baby-id>] \
  [--limit <number>] \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  --output json
```

### Caretaker Management

```bash
# List caretakers
sprout-track caretaker list --output json

# Create caretaker
sprout-track caretaker create \
  --name <name> \
  --login-id <2-digit-id> \
  --pin <pin> \
  [--type <parent|nanny|grandparent|etc>] \
  [--role <USER|ADMIN>] \
  --output json
```

### Contact Management

```bash
# List contacts
sprout-track contact list [--role <role>] --output json

# Create contact
sprout-track contact create \
  --name <name> \
  --role <role> \
  [--phone <phone>] \
  [--email <email>] \
  [--address <address>] \
  [--notes <text>] \
  --output json
```

### Calendar Events

```bash
# List events
sprout-track calendar list \
  [-b <baby-id>] \
  [--start <ISO8601>] \
  [--end <ISO8601>] \
  --output json

# Create event
sprout-track calendar create \
  --title <title> \
  --type <APPOINTMENT|REMINDER|CUSTOM> \
  --start <ISO8601> \
  [--end <ISO8601>] \
  [--description <text>] \
  [--location <location>] \
  [--all-day] \
  --output json
```

### Settings

```bash
# Get settings
sprout-track settings get --output json

# Update settings
sprout-track settings set \
  [--family-name <name>] \
  [--bottle-unit <OZ|ML>] \
  [--weight-unit <LB|KG>] \
  [--height-unit <IN|CM>] \
  [--temp-unit <F|C>] \
  --output json
```

### Family

```bash
# Get family info
sprout-track family get --output json

# Update family
sprout-track family update \
  [--name <name>] \
  [--slug <slug>] \
  --output json
```

### Units

```bash
# List available units
sprout-track units [--activity <feed|pump|measurement>] --output json
```

## Best Practices for AI Agents

1. **Always use `--output json`** for reliable parsing
2. **Set a default baby** with `baby select` to reduce command verbosity
3. **Use `-y` flag** on delete operations to skip confirmations
4. **Check exit codes** to detect errors
5. **Use ISO 8601 dates** for all time values
6. **Refresh tokens** periodically with `auth refresh`
7. **Validate input** using the enums specified above

## Error Handling

Common error scenarios:

| Error | Cause | Solution |
|-------|-------|----------|
| "Server not configured" | No server URL | Run `config set-server` |
| "Authentication required" | No token | Run `auth login` |
| "Token expired" | Token too old | Run `auth login` or `auth refresh` |
| "Baby ID required" | No default baby | Use `-b <id>` or `baby select` |
| "Resource not found" | Invalid ID | Verify ID with list command |

## Example Workflows

### Morning Routine Logging

```bash
# Wake up - end night sleep
sprout-track sleep end --quality GOOD

# Morning diaper
sprout-track diaper log wet

# Morning feed
sprout-track feed log bottle --amount 4

# Check timeline
sprout-track timeline --limit 5 --output json
```

### Daily Summary

```bash
# Get today's feeds
sprout-track feed list -b <id> --start $(date -I)T00:00:00 --output json

# Get today's diapers
sprout-track diaper list -b <id> --start $(date -I)T00:00:00 --output json

# Get today's sleep
sprout-track sleep list -b <id> --start $(date -I)T00:00:00 --output json
```
