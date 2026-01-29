#!/usr/bin/env node

import { Command } from 'commander';
import { registerConfigCommands } from './commands/config.js';
import { registerAuthCommands } from './commands/auth.js';
import { registerBabyCommands } from './commands/baby.js';
import { registerFeedCommands } from './commands/feed.js';
import { registerSleepCommands } from './commands/sleep.js';
import { registerDiaperCommands } from './commands/diaper.js';
import { registerMedicineCommands } from './commands/medicine.js';
import { registerMedicineLogCommands } from './commands/medicine-log.js';
import { registerPumpCommands } from './commands/pump.js';
import { registerBathCommands } from './commands/bath.js';
import { registerMeasurementCommands } from './commands/measurement.js';
import { registerMilestoneCommands } from './commands/milestone.js';
import { registerNoteCommands } from './commands/note.js';
import { registerTimelineCommands } from './commands/timeline.js';
import { registerCaretakerCommands } from './commands/caretaker.js';
import { registerContactCommands } from './commands/contact.js';
import { registerCalendarCommands } from './commands/calendar.js';
import { registerSettingsCommands } from './commands/settings.js';
import { registerFamilyCommands } from './commands/family.js';
import { registerUnitsCommands } from './commands/units.js';
import { error } from './output/index.js';
import { formatError } from './utils/errors.js';
import { enableVerbose } from './utils/logger.js';

const program = new Command();

program
  .name('sprout-track')
  .description('Command-line interface for Sprout-Track baby tracking')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose debug output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.verbose) {
      enableVerbose();
    }
  });

// Register all command groups
registerConfigCommands(program);
registerAuthCommands(program);
registerBabyCommands(program);
registerFeedCommands(program);
registerSleepCommands(program);
registerDiaperCommands(program);
registerMedicineCommands(program);
registerMedicineLogCommands(program);
registerPumpCommands(program);
registerBathCommands(program);
registerMeasurementCommands(program);
registerMilestoneCommands(program);
registerNoteCommands(program);
registerTimelineCommands(program);
registerCaretakerCommands(program);
registerContactCommands(program);
registerCalendarCommands(program);
registerSettingsCommands(program);
registerFamilyCommands(program);
registerUnitsCommands(program);

// Global error handling
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  if (err.code === 'commander.missingArgument' ||
      err.code === 'commander.missingMandatoryOptionValue' ||
      err.code === 'commander.unknownCommand') {
    // Commander already prints help for these
    process.exit(1);
  }
  throw err;
});

// Parse and execute
try {
  program.parse(process.argv);
} catch (err) {
  error(formatError(err));
  process.exit(1);
}
