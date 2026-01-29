import { Command } from 'commander';
import { getTimeline } from '../api/endpoints.js';
import { getDefaultBabyId } from '../config/store.js';
import { error, spinner, output, type TableColumn } from '../output/index.js';
import { formatDate, formatRelative } from '../utils/date.js';
import { optionalNumber, validateOutputFormat } from '../utils/validation.js';
import { formatError, ValidationError } from '../utils/errors.js';
import type { OutputFormat } from '../types/index.js';

const timelineColumns: TableColumn[] = [
  { key: 'type', header: 'Type', width: 12 },
  { key: 'time', header: 'Time', width: 18, formatter: (v) => formatDate(v as string) },
  { key: 'summary', header: 'Summary', width: 50 },
];

function getBabyId(opts: { baby?: string }): string {
  const babyId = opts.baby || getDefaultBabyId();
  if (!babyId) {
    throw new ValidationError('Baby ID is required. Use --baby <id> or run: sprout-track baby select <id>');
  }
  return babyId;
}

function formatTimelineItem(item: any): { type: string; time: string; summary: string } {
  const type = item.type || 'unknown';
  let time = '';
  let summary = '';

  switch (type) {
    case 'feed':
      time = item.time;
      summary = `${item.type === 'BREAST' ? `Breast (${item.side})` : item.type === 'BOTTLE' ? `Bottle ${item.amount || ''} ${item.unitAbbr || ''}` : `Solids: ${item.food || ''}`}`;
      break;
    case 'sleep':
      time = item.startTime;
      summary = `${item.type} ${item.endTime ? `(${item.duration || '?'} min)` : '(ongoing)'}`;
      break;
    case 'diaper':
      time = item.time;
      summary = `${item.type}${item.blowout ? ' (blowout)' : ''}${item.color ? ` - ${item.color}` : ''}`;
      break;
    case 'bath':
      time = item.time;
      const products = [];
      if (item.soapUsed) products.push('soap');
      if (item.shampooUsed) products.push('shampoo');
      summary = `Bath${products.length ? ` (${products.join(', ')})` : ''}`;
      break;
    case 'note':
      time = item.time;
      summary = item.content?.substring(0, 45) + (item.content?.length > 45 ? '...' : '');
      break;
    case 'medicine':
      time = item.time;
      summary = `Medicine: ${item.doseAmount} ${item.unitAbbr || ''}`;
      break;
    case 'pump':
      time = item.startTime;
      summary = `Pump: ${item.totalAmount || '?'} ${item.unitAbbr || 'oz'} total`;
      break;
    case 'milestone':
      time = item.date;
      summary = `Milestone: ${item.title}`;
      break;
    case 'measurement':
      time = item.date;
      summary = `${item.type}: ${item.value} ${item.unit}`;
      break;
    default:
      time = item.time || item.startTime || item.date || '';
      summary = JSON.stringify(item).substring(0, 45);
  }

  return { type, time, summary };
}

export function registerTimelineCommands(program: Command): void {
  program
    .command('timeline')
    .description('View combined activity timeline')
    .option('-b, --baby <id>', 'Baby ID (uses default if not specified)')
    .option('--limit <n>', 'Limit number of results (default: 20)')
    .option('--start <date>', 'Start date (ISO8601 or YYYY-MM-DD)')
    .option('--end <date>', 'End date (ISO8601 or YYYY-MM-DD)')
    .option('-o, --output <format>', 'Output format (json, table, plain)')
    .action(async (opts: {
      baby?: string;
      limit?: string;
      start?: string;
      end?: string;
      output?: string;
    }) => {
      const spin = spinner('Fetching timeline...');

      try {
        const babyId = getBabyId(opts);
        const params: Record<string, unknown> = { babyId };

        if (opts.limit) params.limit = optionalNumber(opts.limit);
        if (opts.start) params.startDate = opts.start;
        if (opts.end) params.endDate = opts.end;

        const timeline = await getTimeline(params as any);
        spin.stop();

        const format = opts.output ? validateOutputFormat(opts.output) : undefined;

        if (format === 'json') {
          output(timeline as any[], {
            format: 'json',
          });
          return;
        }

        // Format timeline items for display
        const formattedItems = (timeline as any[]).map(item => formatTimelineItem(item));

        output(formattedItems, {
          format: format as OutputFormat,
          columns: timelineColumns,
          plainFields: ['type', 'time', 'summary'],
        });
      } catch (err) {
        spin.fail('Failed to fetch timeline');
        error(formatError(err));
        process.exit(1);
      }
    });
}
