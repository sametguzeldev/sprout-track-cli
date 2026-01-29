import { Command } from 'commander';
import {
  getCalendarEvents,
  getCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../api/endpoints.js';
import { success, error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate } from '../utils/date.js';
import {
  requireString,
  validateCalendarEventType,
  validateOutputFormat,
} from '../utils/validation.js';
import { formatError } from '../utils/errors.js';
import type { OutputFormat, CalendarEventCreate } from '../types/index.js';

const calendarColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: 38 },
  { key: 'title', header: 'Title', width: 30 },
  { key: 'type', header: 'Type', width: 15 },
  { key: 'startTime', header: 'Start', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'allDay', header: 'All Day', width: 8, formatter: (v) => v ? 'Yes' : 'No' },
];

const calendarFields = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'type', label: 'Type' },
  { key: 'startTime', label: 'Start Time', formatter: (v: unknown) => formatDate(v as string) },
  { key: 'endTime', label: 'End Time', formatter: (v: unknown) => v ? formatDate(v as string) : '-' },
  { key: 'allDay', label: 'All Day', formatter: (v: unknown) => v ? 'Yes' : 'No' },
  { key: 'location', label: 'Location' },
  { key: 'recurring', label: 'Recurring', formatter: (v: unknown) => v ? 'Yes' : 'No' },
  { key: 'recurrencePattern', label: 'Recurrence' },
  { key: 'createdAt', label: 'Created', formatter: (v: unknown) => formatDate(v as string) },
];

export function registerCalendarCommands(program: Command): void {
  const calendar = program
    .command('calendar')
    .description('Manage calendar events');

  calendar
    .command('list')
    .description('List calendar events')
    .option('-b, --baby <id>', 'Filter by baby ID')
    .option('--start <date>', 'Start date (ISO8601 or YYYY-MM-DD)')
    .option('--end <date>', 'End date (ISO8601 or YYYY-MM-DD)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      start?: string;
      end?: string;
      output?: string;
    }) => {
      const spin = spinner('Fetching calendar events...');

      try {
        const params: Record<string, unknown> = {};
        if (opts.baby) params.babyId = opts.baby;
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const events = await getCalendarEvents(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(events, {
          format: format as OutputFormat,
          columns: calendarColumns,
          plainFields: ['id', 'title', 'type', 'startTime'],
        });
      } catch (err) {
        spin.fail('Failed to fetch calendar events');
        error(formatError(err));
        process.exit(1);
      }
    });

  calendar
    .command('get <id>')
    .description('Get calendar event details')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: { output?: string }) => {
      const spin = spinner('Fetching calendar event...');

      try {
        const event = await getCalendarEvent(id);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(event, {
          format: format as OutputFormat,
          fields: calendarFields,
        });
      } catch (err) {
        spin.fail('Failed to fetch calendar event');
        error(formatError(err));
        process.exit(1);
      }
    });

  calendar
    .command('create')
    .description('Create a calendar event')
    .requiredOption('--title <title>', 'Event title')
    .requiredOption('--type <type>', 'Event type (APPOINTMENT, REMINDER, CUSTOM)')
    .requiredOption('--start <time>', 'Start time (ISO8601)')
    .option('--end <time>', 'End time (ISO8601)')
    .option('--description <text>', 'Description')
    .option('--location <location>', 'Location')
    .option('--all-day', 'Mark as all-day event')
    .option('--color <color>', 'Color code')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      title: string;
      type: string;
      start: string;
      end?: string;
      description?: string;
      location?: string;
      allDay?: boolean;
      color?: string;
      output?: string;
    }) => {
      const spin = spinner('Creating calendar event...');

      try {
        const data: CalendarEventCreate = {
          title: requireString(opts.title, 'Title'),
          type: validateCalendarEventType(opts.type),
          startTime: opts.start,
        };

        if (opts.end) data.endTime = opts.end;
        if (opts.description) data.description = opts.description;
        if (opts.location) data.location = opts.location;
        if (opts.allDay) data.allDay = true;
        if (opts.color) data.color = opts.color;

        const event = await createCalendarEvent(data);
        spin.succeed(`Event created: ${event.title}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(event, {
          format: format as OutputFormat,
          fields: calendarFields,
        });
      } catch (err) {
        spin.fail('Failed to create calendar event');
        error(formatError(err));
        process.exit(1);
      }
    });

  calendar
    .command('update <id>')
    .description('Update a calendar event')
    .option('--title <title>', 'Event title')
    .option('--type <type>', 'Event type')
    .option('--start <time>', 'Start time (ISO8601)')
    .option('--end <time>', 'End time (ISO8601)')
    .option('--description <text>', 'Description')
    .option('--location <location>', 'Location')
    .option('--color <color>', 'Color code')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (id: string, opts: {
      title?: string;
      type?: string;
      start?: string;
      end?: string;
      description?: string;
      location?: string;
      color?: string;
      output?: string;
    }) => {
      const spin = spinner('Updating calendar event...');

      try {
        const data: Record<string, unknown> = {};

        if (opts.title) data.title = opts.title;
        if (opts.type) data.type = validateCalendarEventType(opts.type);
        if (opts.start) data.startTime = opts.start;
        if (opts.end) data.endTime = opts.end;
        if (opts.description) data.description = opts.description;
        if (opts.location) data.location = opts.location;
        if (opts.color) data.color = opts.color;

        const event = await updateCalendarEvent(id, data as any);
        spin.succeed(`Event updated: ${event.title}`);

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        output(event, {
          format: format as OutputFormat,
          fields: calendarFields,
        });
      } catch (err) {
        spin.fail('Failed to update calendar event');
        error(formatError(err));
        process.exit(1);
      }
    });

  calendar
    .command('delete <id>')
    .description('Delete a calendar event')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (id: string, opts: { yes?: boolean }) => {
      try {
        if (!opts.yes) {
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this event?',
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        const spin = spinner('Deleting calendar event...');
        await deleteCalendarEvent(id);
        spin.succeed('Event deleted');
      } catch (err) {
        error(formatError(err));
        process.exit(1);
      }
    });
}
