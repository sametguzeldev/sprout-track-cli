# Sprout-Track CLI

Command-line interface for [Sprout-Track](https://github.com/Oak-and-Sprout/sprout-track) baby tracking application.

## Installation

```bash
npm install -g sprout-track-cli
```

Or with npx:

```bash
npx sprout-track-cli <command>
```

## Quick Start

1. **Configure your server:**
   ```bash
   sprout-track config set-server https://your-instance.com
   ```

2. **Authenticate:**
   ```bash
   # PIN authentication
   sprout-track auth login --pin 123456 --family my-family

   # Account authentication
   sprout-track auth login --email user@example.com
   ```

3. **Set a default baby (optional):**
   ```bash
   sprout-track baby list
   sprout-track baby select <baby-id>
   ```

4. **Start logging activities:**
   ```bash
   # Quick log a bottle feed
   sprout-track feed log bottle --amount 4

   # Log a diaper change
   sprout-track diaper log wet

   # Start a nap
   sprout-track sleep start --type NAP

   # View timeline
   sprout-track timeline
   ```

## Commands

### Configuration

```bash
sprout-track config set-server <url>   # Set server URL
sprout-track config set-output <fmt>   # Set default output (json/table/plain)
sprout-track config show               # Show current config
sprout-track config reset              # Reset to defaults
```

### Authentication

```bash
sprout-track auth login                # Interactive login
sprout-track auth logout               # Clear credentials
sprout-track auth status               # Check auth status
sprout-track auth whoami               # Show current user
sprout-track auth refresh              # Refresh token
```

### Baby Management

```bash
sprout-track baby list [--active]
sprout-track baby get <id>
sprout-track baby create --first-name <name> --birth-date <YYYY-MM-DD>
sprout-track baby update <id> [options]
sprout-track baby delete <id>
sprout-track baby select <id>          # Set as default baby
```

### Feed Logging

```bash
sprout-track feed list -b <baby-id>
sprout-track feed log breast --side LEFT [--duration 15]
sprout-track feed log bottle --amount 4 [--unit OZ]
sprout-track feed log solids --food "carrots"
sprout-track feed create -b <id> --type BOTTLE --amount 4
```

### Sleep Logging

```bash
sprout-track sleep list -b <baby-id>
sprout-track sleep start --type NAP [--location crib]
sprout-track sleep end [--quality GOOD]
sprout-track sleep create -b <id> --type NIGHT_SLEEP --start <ISO8601>
```

### Diaper Logging

```bash
sprout-track diaper list -b <baby-id>
sprout-track diaper log wet
sprout-track diaper log dirty [--color yellow]
sprout-track diaper log both [--blowout]
```

### Measurements

```bash
sprout-track measurement list -b <baby-id> [--type WEIGHT]
sprout-track measurement log weight --value 12.5 [--unit LB]
sprout-track measurement log height --value 24 [--unit IN]
sprout-track measurement log temp --value 98.6 [--unit F]
```

### Other Activities

```bash
# Bath
sprout-track bath log [--soap] [--shampoo]

# Pump
sprout-track pump start
sprout-track pump end --left 3 --right 2.5

# Medicine
sprout-track medicine list
sprout-track medicine-log log --medicine <id> --dose 5

# Notes
sprout-track note add "First smile today!"

# Milestones
sprout-track milestone create --title "First steps" --category MOTOR
```

### Timeline

```bash
sprout-track timeline [-b <baby-id>] [--limit 20]
```

### Management

```bash
# Caretakers
sprout-track caretaker list
sprout-track caretaker create --name "Grandma" --login-id 02 --pin 1234

# Contacts
sprout-track contact list
sprout-track contact create --name "Dr. Smith" --role pediatrician

# Calendar
sprout-track calendar list
sprout-track calendar create --title "Doctor visit" --type APPOINTMENT --start <ISO8601>

# Settings
sprout-track settings get
sprout-track settings set --bottle-unit ML --weight-unit KG
```

## Global Options

All commands support:

```bash
--output <format>    # json, table, or plain (default: table)
--help               # Show command help
```

## Output Formats

- **table** (default): Formatted tables for terminal display
- **json**: JSON output for programmatic use
- **plain**: Tab-separated values for piping

Example:
```bash
sprout-track baby list --output json | jq '.[0].id'
```

## Configuration File

Config is stored at `~/.config/sprout-track/config.json` (Linux/macOS) or `%APPDATA%\sprout-track\config.json` (Windows).

```json
{
  "server": "https://your-instance.com",
  "token": "...",
  "familySlug": "my-family",
  "defaultBabyId": "abc-123",
  "outputFormat": "table"
}
```

## For AI Agents

See [docs/AI_AGENT_GUIDE.md](docs/AI_AGENT_GUIDE.md) for comprehensive documentation designed for AI agent integration.

## Development

```bash
# Clone and install
git clone https://github.com/Oak-and-Sprout/sprout-track-cli
cd sprout-track-cli
npm install

# Build
npm run build

# Link for local testing
npm link

# Run tests
npm test
```

## License

MIT License - see [LICENSE](LICENSE) for details.
