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

export interface WeeklyReportMember {
  member: TeamMember;
  days: WeeklyReportDay[];
  totalLogs: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  departmentName: string;
  members: WeeklyReportMember[];
  totalLogs: number;
  activeMembers: number;
  activeDays: number;
}

export function buildWeeklyReport(
  logs: DailyLog[],
  members: TeamMember[],
  department: Department,
  weekStart: Date,
): WeeklyReport {
  const weekDates = getWeekDateStrings(weekStart);
  const weekStartStr = weekDates[0];
  const weekEndStr = weekDates[6];
  const weekSet = new Set(weekDates);

  const weekLogs = logs.filter(
    (log) =>
      log.departmentId === department.id && weekSet.has(log.date),
  );

  const deptMembers = members.filter(
    (m) => m.departmentId === department.id && !m.isAdmin,
  );

  const membersWithLogs = new Map<string, Map<string, DailyLog[]>>();

  for (const log of weekLogs) {
    let byDate = membersWithLogs.get(log.memberId);
    if (!byDate) {
      byDate = new Map();
      membersWithLogs.set(log.memberId, byDate);
    }
    const dayLogs = byDate.get(log.date) ?? [];
    dayLogs.push(log);
    byDate.set(log.date, dayLogs);
  }

  const reportMembers: WeeklyReportMember[] = deptMembers
    .map((member) => {
      const byDate = membersWithLogs.get(member.id);
      const days: WeeklyReportDay[] = weekDates.map((date) => ({
        date,
        label: formatDayLabel(date),
        logs: (byDate?.get(date) ?? []).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      }));

      const totalLogs = days.reduce((sum, day) => sum + day.logs.length, 0);

      return { member, days, totalLogs };
    })
    .sort((a, b) => {
      if (b.totalLogs !== a.totalLogs) return b.totalLogs - a.totalLogs;
      return a.member.name.localeCompare(b.member.name);
    });

  const activeDays = weekDates.filter((date) =>
    weekLogs.some((log) => log.date === date),
  ).length;

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    weekLabel: formatWeekRangeLabel(weekStart),
    departmentName: department.name,
    members: reportMembers,
    totalLogs: weekLogs.length,
    activeMembers: reportMembers.filter((m) => m.totalLogs > 0).length,
    activeDays,
  };
}

export function formatWeeklyReportText(report: WeeklyReport): string {
  const lines: string[] = [
    `Weekly Report — ${report.departmentName}`,
    report.weekLabel,
    "",
    `Summary: ${report.totalLogs} log${report.totalLogs === 1 ? "" : "s"} from ${report.activeMembers} team member${report.activeMembers === 1 ? "" : "s"} across ${report.activeDays} day${report.activeDays === 1 ? "" : "s"}.`,
    "",
  ];

  for (const { member, days, totalLogs } of report.members) {
    if (totalLogs === 0) continue;

    lines.push(`${member.name} (${member.role}) — ${totalLogs} log${totalLogs === 1 ? "" : "s"}`);

    for (const day of days) {
      if (day.logs.length === 0) continue;
      lines.push(`  ${day.label}`);
      for (const log of day.logs) {
        const task = log.taskTitle ? ` [${log.taskTitle}]` : "";
        lines.push(`    • ${log.summary}${task}`);
      }
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
