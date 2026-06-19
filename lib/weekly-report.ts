import type { DailyLog, Department, TeamMember } from "@/lib/types";
import {
  formatDayLabel,
  formatWeekRangeLabel,
  getWeekDateStrings,
  toLocalDateString,
} from "@/lib/week-utils";

export interface WeeklyReportDay {
  date: string;
  label: string;
  logs: DailyLog[];
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  departmentName: string;
  member: TeamMember | null;
  days: WeeklyReportDay[];
  totalLogs: number;
  activeDays: number;
}

export function buildWeeklyReport(
  logs: DailyLog[],
  member: TeamMember | undefined,
  department: Department,
  weekStart: Date,
): WeeklyReport {
  const weekDates = getWeekDateStrings(weekStart);
  const weekStartStr = weekDates[0];
  const weekEndStr = weekDates[6];
  const weekSet = new Set(weekDates);

  const weekLogs = logs.filter(
    (log) =>
      log.departmentId === department.id &&
      log.memberId === member?.id &&
      weekSet.has(log.date),
  );

  const logsByDate = new Map<string, DailyLog[]>();
  for (const log of weekLogs) {
    const dayLogs = logsByDate.get(log.date) ?? [];
    dayLogs.push(log);
    logsByDate.set(log.date, dayLogs);
  }

  const days: WeeklyReportDay[] = weekDates.map((date) => ({
    date,
    label: formatDayLabel(date),
    logs: (logsByDate.get(date) ?? []).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
  }));

  const activeDays = days.filter((day) => day.logs.length > 0).length;

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    weekLabel: formatWeekRangeLabel(weekStart),
    departmentName: department.name,
    member: member ?? null,
    days,
    totalLogs: weekLogs.length,
    activeDays,
  };
}

export function formatWeeklyReportText(report: WeeklyReport): string {
  const memberName = report.member?.name ?? "You";
  const memberRole = report.member?.role;

  const lines: string[] = [
    `My Weekly Report — ${report.departmentName}`,
    report.weekLabel,
    "",
    `${memberName}${memberRole ? ` (${memberRole})` : ""}`,
    `Summary: ${report.totalLogs} log${report.totalLogs === 1 ? "" : "s"} across ${report.activeDays} day${report.activeDays === 1 ? "" : "s"}.`,
    "",
  ];

  for (const day of report.days) {
    if (day.logs.length === 0) continue;
    lines.push(day.label);
    for (const log of day.logs) {
      const task = log.taskTitle ? ` [${log.taskTitle}]` : "";
      lines.push(`  • ${log.summary}${task}`);
    }
    lines.push("");
  }

  if (report.totalLogs === 0) {
    lines.push("No daily logs were posted this week.");
  }

  return lines.join("\n").trim();
}

export function getWeekStartFromString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toWeekStartString(weekStart: Date): string {
  return toLocalDateString(weekStart);
}
