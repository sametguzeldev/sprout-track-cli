# Sprout-Track CLI Examples

Real-world usage examples for common scenarios.

## Getting Started

### First-time Setup

```bash
# 1. Configure your server
sprout-track config set-server https://sprout-track.example.com

# 2. Login with PIN (common for self-hosted)
sprout-track auth login --pin 123456 --family smith-family

# 3. Check you're authenticated
sprout-track auth status

# 4. List babies and select default
sprout-track baby list
sprout-track baby select abc123-def456-...
```

### Using Account Authentication (SAAS)

```bash
sprout-track auth login --email parent@example.com --password mypassword
```

---

## Daily Activity Logging

### Morning Routine

```bash
# Baby woke up - end night sleep
sprout-track sleep end --quality GOOD

# Morning diaper change
sprout-track diaper log wet

# Morning bottle
sprout-track feed log bottle --amount 6 --type "breast milk"

# Morning weight check
sprout-track measurement log weight --value 15.2
```

### Feeding Examples

```bash
# Breastfeeding - left side, 15 minutes
sprout-track feed log breast --side LEFT --duration 15

# Breastfeeding - right side, 12 minutes
sprout-track feed log breast --side RIGHT --duration 12

# Bottle feeding - 4 oz formula
sprout-track feed log bottle --amount 4 --type formula

# Bottle feeding - 5 oz breast milk
sprout-track feed log bottle --amount 5 --type "breast milk"

# Solid food introduction
sprout-track feed log solids --food "pureed carrots" --amount 2 --unit TBSP

# Mixed meal
sprout-track feed log solids --food "oatmeal with banana"
```

### Sleep Logging

```bash
# Start a nap
sprout-track sleep start --type NAP --location crib

# ... time passes ...

# End the nap
sprout-track sleep end --quality GOOD

# Start night sleep
sprout-track sleep start --type NIGHT_SLEEP

# Log a completed nap retroactively
sprout-track sleep create -b <baby-id> \
  --type NAP \
  --start 2024-01-15T13:00:00 \
  --end 2024-01-15T14:30:00 \
  --quality EXCELLENT
```

### Diaper Changes

```bash
# Wet diaper
sprout-track diaper log wet

# Dirty diaper with details
sprout-track diaper log dirty --color yellow --condition normal

# Both wet and dirty
sprout-track diaper log both

# Blowout! (happens to everyone)
sprout-track diaper log both --blowout --color mustard
```

---

## Pumping Workflow

### Start/End Session

```bash
# Start pumping
sprout-track pump start

# ... pump for 15-20 minutes ...

# End and record amounts
sprout-track pump end --left 3.5 --right 3 --unit OZ
```

### Quick Log (after the fact)

```bash
# Log a completed session
sprout-track pump log --left 4 --right 3.5 --duration 20
```

---

## Health Tracking

### Regular Measurements

```bash
# Weekly weight check
sprout-track measurement log weight --value 16.5 --unit LB

# Monthly height
sprout-track measurement log height --value 24.5 --unit IN

# Head circumference at doctor visit
sprout-track measurement log head --value 16 --unit IN

# Temperature when baby seems warm
sprout-track measurement log temp --value 99.1 --unit F
```

### Medicine Administration

```bash
# First, create the medicine (one time)
sprout-track medicine create \
  --name "Infant Tylenol" \
  --dose-size 1.25 \
  --unit ML \
  --min-time 04:00

# Log when given
sprout-track medicine-log log \
  --medicine <medicine-id> \
  --dose 1.25 \
  --unit ML \
  --notes "for teething"
```

---

## Milestones & Notes

### Recording Milestones

```bash
# Motor milestone
sprout-track milestone create \
  --title "First time rolling over" \
  --category MOTOR \
  --description "Rolled from tummy to back during tummy time"

# Social milestone
sprout-track milestone create \
  --title "First social smile" \
  --category SOCIAL

# Language milestone
sprout-track milestone create \
  --title "First word - mama" \
  --category LANGUAGE \
  --date 2024-06-15
```

### Quick Notes

```bash
# Quick note about the day
sprout-track note add "Very fussy today, might be teething"

# Categorized note
sprout-track note add "Doctor confirmed ear infection" --category health
```

---

## Viewing Data

### Timeline

```bash
# Recent activities
sprout-track timeline --limit 10

# Today's activities
sprout-track timeline --start $(date -I)T00:00:00

# Specific date range
sprout-track timeline \
  --start 2024-01-15T00:00:00 \
  --end 2024-01-16T00:00:00
```

### Activity-Specific Lists

```bash
# All feeds today
sprout-track feed list -b <baby-id> --start $(date -I)T00:00:00

# Recent diapers
sprout-track diaper list -b <baby-id> --start $(date -I)T00:00:00

# All weights
sprout-track measurement list -b <baby-id> --type WEIGHT

# All milestones
sprout-track milestone list -b <baby-id>
```

---

## Managing Multiple Babies (Twins, etc.)

```bash
# List all babies
sprout-track baby list

# Log for specific baby (no default set)
sprout-track feed log bottle -b <baby1-id> --amount 4
sprout-track feed log bottle -b <baby2-id> --amount 3.5

# Or switch defaults
sprout-track baby select <baby1-id>
sprout-track feed log bottle --amount 4
sprout-track diaper log wet

sprout-track baby select <baby2-id>
sprout-track feed log bottle --amount 3.5
sprout-track diaper log wet
```

---

## Calendar & Appointments

```bash
# Doctor appointment
sprout-track calendar create \
  --title "4-month checkup" \
  --type APPOINTMENT \
  --start 2024-02-15T10:00:00 \
  --location "Dr. Smith's Office"

# Reminder
sprout-track calendar create \
  --title "Start solids discussion" \
  --type REMINDER \
  --start 2024-03-01T00:00:00 \
  --all-day

# View upcoming
sprout-track calendar list --start $(date -I)T00:00:00
```

---

## Scripting & Automation

### JSON Output for Scripts

```bash
# Get baby ID programmatically
BABY_ID=$(sprout-track baby list --output json | jq -r '.[0].id')

# Check last feed
LAST_FEED=$(sprout-track feed last -b $BABY_ID --output json)
echo "Last fed at: $(echo $LAST_FEED | jq -r '.time')"

# Count today's diapers
TODAY=$(date -I)
DIAPERS=$(sprout-track diaper list -b $BABY_ID --start ${TODAY}T00:00:00 --output json | jq 'length')
echo "Diapers today: $DIAPERS"
```

### Daily Summary Script

```bash
#!/bin/bash
BABY_ID="your-baby-id"
TODAY=$(date -I)

echo "=== Daily Summary for $(date) ==="
echo

# Feeds
echo "Feeds:"
sprout-track feed list -b $BABY_ID --start ${TODAY}T00:00:00 --output json | \
  jq -r '.[] | "  \(.time | split("T")[1] | split(".")[0]) - \(.type) \(.amount // "") \(.unitAbbr // "")"'

echo

# Diapers
echo "Diapers:"
sprout-track diaper list -b $BABY_ID --start ${TODAY}T00:00:00 --output json | \
  jq -r '.[] | "  \(.time | split("T")[1] | split(".")[0]) - \(.type)"'

echo

# Sleep
echo "Sleep:"
sprout-track sleep list -b $BABY_ID --start ${TODAY}T00:00:00 --output json | \
  jq -r '.[] | "  \(.startTime | split("T")[1] | split(".")[0]) - \(.type) (\(.duration // "ongoing") min)"'
```

---

## Caretaker Management

### Adding a New Caretaker

```bash
# Add grandma as a caretaker
sprout-track caretaker create \
  --name "Grandma Sue" \
  --login-id 02 \
  --pin 5678 \
  --type grandparent

# Add the nanny with admin rights
sprout-track caretaker create \
  --name "Sarah" \
  --login-id 03 \
  --pin 9012 \
  --type nanny \
  --role ADMIN
```

### Managing Contacts

```bash
# Add pediatrician
sprout-track contact create \
  --name "Dr. Johnson" \
  --role pediatrician \
  --phone "555-123-4567" \
  --email "drj@pediatrics.com" \
  --address "123 Medical Way"

# Add daycare
sprout-track contact create \
  --name "Sunshine Daycare" \
  --role daycare \
  --phone "555-987-6543"
```

---

## Troubleshooting Commands

### Check Auth Status

```bash
sprout-track auth status
sprout-track auth whoami
```

### View Config

```bash
sprout-track config show
sprout-track config path
```

### Refresh Token

```bash
sprout-track auth refresh
```

### Reset Everything

```bash
sprout-track auth logout
sprout-track config reset -y
```
