import type { Task, TeamMember } from "@/lib/types";

export function getMemberById(
  members: TeamMember[],
  id: string,
): TeamMember | undefined {
  return members.find((m) => m.id === id);
}

export function formatMemberNames(
  memberIds: string[],
  members: TeamMember[],
): string {
  const names = memberIds
    .map((id) => getMemberById(members, id)?.name)
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) return "Unassigned";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

export function isTaskAssignee(task: Task, memberId: string): boolean {
  return task.assigneeIds.includes(memberId);
}
