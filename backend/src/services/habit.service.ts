import { supabaseAdmin } from '../configs/supabaseAdmin';
import type {
  CreateHabitInput,
  Habit,
  HabitLog,
  HabitWithStats,
  UpdateHabitInput,
} from '../types/habit';

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function todayDateString(): string {
  return toDateString(new Date());
}

/** Returns the YYYY-MM-DD for `daysAgo` days before today (UTC). */
function dateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return toDateString(d);
}

/** First and last day (YYYY-MM-DD) of the given month. month is 1-indexed. */
function monthRange(year: number, month: number): { from: string; to: string; daysInMonth: number } {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  return { from, to, daysInMonth };
}

/**
 * Current streak = number of consecutive most-recent days (for daily habits)
 * or consecutive most-recent weeks (for weekly habits) with a completed log,
 * counting backward from today/this week. Breaks on the first gap.
 *
 * This is intentionally simple for Phase 3: daily streaks count consecutive
 * calendar days; weekly streaks count consecutive ISO weeks with at least
 * one completed log in them. Computed on the fly, never stored.
 */
function computeStreak(logs: HabitLog[], frequency: Habit['frequency']): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.completed_date)
  );

  if (frequency === 'daily') {
    let streak = 0;
    let cursor = 0;
    // Allow today to be "not yet logged" without breaking the streak —
    // start checking from today, but don't require today specifically.
    while (true) {
      const dateStr = dateDaysAgo(cursor);
      if (completedDates.has(dateStr)) {
        streak += 1;
        cursor += 1;
      } else if (cursor === 0) {
        // Today not logged yet — skip it and check yesterday onward.
        cursor += 1;
        continue;
      } else {
        break;
      }
    }
    return streak;
  }

  // Weekly: walk backward week by week (Mon-Sun), counting consecutive
  // weeks containing at least one completed log.
  let streak = 0;
  let weekStart = startOfWeek(new Date());
  for (let i = 0; i < 104; i++) {
    // cap at 2 years back to avoid unbounded loop
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    const hasCompletionThisWeek = [...completedDates].some((d) => {
      const date = new Date(`${d}T00:00:00Z`);
      return date >= weekStart && date <= weekEnd;
    });

    if (hasCompletionThisWeek) {
      streak += 1;
    } else if (i === 0) {
      // Current week not logged yet — don't break, just don't count it.
    } else {
      break;
    }

    weekStart = new Date(weekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  }
  return streak;
}

function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

/**
 * Completion rate over the last 30 days: completed days / expected days.
 * For daily habits, expected = 30. For weekly habits, expected = number
 * of distinct weeks touched in the window (so a habit only ~2 weeks old
 * isn't penalized for weeks before it existed).
 */
function computeCompletionRate(
  logs: HabitLog[],
  frequency: Habit['frequency'],
  createdAt: string
): number {
  const windowStart = dateDaysAgo(29);
  const createdDate = createdAt.slice(0, 10);
  const effectiveStart = createdDate > windowStart ? createdDate : windowStart;

  const completedInWindow = logs.filter(
    (l) => l.completed && l.completed_date >= effectiveStart && l.completed_date <= todayDateString()
  );

  if (frequency === 'daily') {
    const start = new Date(`${effectiveStart}T00:00:00Z`);
    const end = new Date(`${todayDateString()}T00:00:00Z`);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    if (totalDays <= 0) return 0;
    return Math.round((completedInWindow.length / totalDays) * 100);
  }

  // Weekly: count distinct weeks in the window, and distinct weeks with
  // at least one completion.
  const weeksInWindow = new Set<string>();
  const weeksCompleted = new Set<string>();
  const cursor = new Date(`${effectiveStart}T00:00:00Z`);
  const end = new Date(`${todayDateString()}T00:00:00Z`);
  while (cursor <= end) {
    weeksInWindow.add(toDateString(startOfWeek(cursor)));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  for (const log of completedInWindow) {
    weeksCompleted.add(toDateString(startOfWeek(new Date(`${log.completed_date}T00:00:00Z`))));
  }

  if (weeksInWindow.size === 0) return 0;
  return Math.round((weeksCompleted.size / weeksInWindow.size) * 100);
}

export async function listHabitsWithStats(
  userId: string,
  year: number,
  month: number
): Promise<HabitWithStats[]> {
  const { data: habits, error: habitsError } = await supabaseAdmin
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (habitsError) {
    throw new Error(`Failed to list habits: ${habitsError.message}`);
  }
  if (!habits || habits.length === 0) return [];

  const habitIds = habits.map((h) => h.id);
  const { from: monthStart, to: monthEnd } = monthRange(year, month);
  // Streak and completion-rate are always "as of today," regardless of
  // which month's grid is being viewed — so the log fetch must always
  // reach today, plus 35 days of lookback for streak continuity, and
  // also cover the requested month (which may be in the past).
  const lookback = new Date(`${monthStart}T00:00:00Z`);
  lookback.setUTCDate(lookback.getUTCDate() - 35);
  const fetchFrom = toDateString(lookback);
  const fetchTo = monthEnd > todayDateString() ? monthEnd : todayDateString();

  const { data: logs, error: logsError } = await supabaseAdmin
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitIds)
    .gte('completed_date', fetchFrom)
    .lte('completed_date', fetchTo);

  if (logsError) {
    throw new Error(`Failed to list habit logs: ${logsError.message}`);
  }

  const logsByHabit = new Map<string, HabitLog[]>();
  for (const log of logs ?? []) {
    const list = logsByHabit.get(log.habit_id) ?? [];
    list.push(log);
    logsByHabit.set(log.habit_id, list);
  }

  return habits.map((habit) => {
    const allLogsForHabit = logsByHabit.get(habit.id) ?? [];
    const monthLogs = allLogsForHabit.filter(
      (l) => l.completed_date >= monthStart && l.completed_date <= monthEnd
    );
    return {
      ...habit,
      logs: monthLogs,
      currentStreak: computeStreak(allLogsForHabit, habit.frequency),
      completionRate: computeCompletionRate(allLogsForHabit, habit.frequency, habit.created_at),
    };
  });
}

export interface MonthlyOverview {
  month: number; // 1-12
  completionRate: number; // 0-100, rounded; null-equivalent handled as 0
  hasStarted: boolean; // false if no habits existed yet / no logs possible this month
}

export interface YearlyOverview {
  year: number;
  yearlyAverage: number; // average of completionRate across started months only
  months: MonthlyOverview[];
}

/**
 * Aggregate completion rate across all of a user's habits, for every month
 * of `year`. A month counts as "started" if at least one habit existed by
 * the end of that month and the month isn't entirely in the future.
 * Future months are 0%/not-started rather than skewing the average down.
 */
export async function getYearlyOverview(userId: string, year: number): Promise<YearlyOverview> {
  const { data: habits, error: habitsError } = await supabaseAdmin
    .from('habits')
    .select('id, frequency, created_at')
    .eq('user_id', userId);

  if (habitsError) {
    throw new Error(`Failed to load habits for yearly overview: ${habitsError.message}`);
  }

  if (!habits || habits.length === 0) {
    return {
      year,
      yearlyAverage: 0,
      months: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        completionRate: 0,
        hasStarted: false,
      })),
    };
  }

  const habitIds = habits.map((h) => h.id);
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('habit_logs')
    .select('habit_id, completed_date, completed')
    .in('habit_id', habitIds)
    .gte('completed_date', `${year}-01-01`)
    .lte('completed_date', `${year}-12-31`);

  if (logsError) {
    throw new Error(`Failed to load habit logs for yearly overview: ${logsError.message}`);
  }

  const logsByHabit = new Map<string, HabitLog[]>();
  for (const log of (logs ?? []) as HabitLog[]) {
    const list = logsByHabit.get(log.habit_id) ?? [];
    list.push(log);
    logsByHabit.set(log.habit_id, list);
  }

  const today = todayDateString();
  const months: MonthlyOverview[] = [];

  for (let month = 1; month <= 12; month++) {
    const { from, to } = monthRange(year, month);

    if (from > today) {
      months.push({ month, completionRate: 0, hasStarted: false });
      continue;
    }

    // Clip "to" at today if this is the current month, so an in-progress
    // month isn't penalized for its remaining, not-yet-happened days.
    const effectiveTo = to > today ? today : to;

    const activeHabits = habits.filter((h) => h.created_at.slice(0, 10) <= effectiveTo);

    if (activeHabits.length === 0) {
      months.push({ month, completionRate: 0, hasStarted: false });
      continue;
    }

    let totalExpected = 0;
    let totalCompleted = 0;

    for (const habit of activeHabits) {
      const habitLogs = logsByHabit.get(habit.id) ?? [];
      const habitStart = habit.created_at.slice(0, 10) > from ? habit.created_at.slice(0, 10) : from;

      if (habit.frequency === 'daily') {
        const expectedDays =
          Math.floor(
            (new Date(`${effectiveTo}T00:00:00Z`).getTime() - new Date(`${habitStart}T00:00:00Z`).getTime()) /
              86_400_000
          ) + 1;
        const completedDays = habitLogs.filter(
          (l) => l.completed && l.completed_date >= habitStart && l.completed_date <= effectiveTo
        ).length;
        totalExpected += Math.max(0, expectedDays);
        totalCompleted += completedDays;
      } else {
        // Weekly: expected = distinct weeks touched by [habitStart, effectiveTo]
        const weeksInRange = new Set<string>();
        const weeksCompleted = new Set<string>();
        const cursor = new Date(`${habitStart}T00:00:00Z`);
        const end = new Date(`${effectiveTo}T00:00:00Z`);
        while (cursor <= end) {
          weeksInRange.add(toDateString(startOfWeek(cursor)));
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        for (const log of habitLogs) {
          if (log.completed && log.completed_date >= habitStart && log.completed_date <= effectiveTo) {
            weeksCompleted.add(toDateString(startOfWeek(new Date(`${log.completed_date}T00:00:00Z`))));
          }
        }
        totalExpected += weeksInRange.size;
        totalCompleted += weeksCompleted.size;
      }
    }

    const rate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
    months.push({ month, completionRate: rate, hasStarted: true });
  }

  const startedMonths = months.filter((m) => m.hasStarted);
  const yearlyAverage =
    startedMonths.length > 0
      ? Math.round(startedMonths.reduce((sum, m) => sum + m.completionRate, 0) / startedMonths.length)
      : 0;

  return { year, yearlyAverage, months };
}

export async function createHabit(userId: string, input: CreateHabitInput): Promise<Habit> {
  const { data, error } = await supabaseAdmin
    .from('habits')
    .insert({ user_id: userId, title: input.title, frequency: input.frequency })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create habit: ${error.message}`);
  }

  return data;
}

export async function updateHabit(
  userId: string,
  habitId: string,
  input: UpdateHabitInput
): Promise<Habit | null> {
  const { data, error } = await supabaseAdmin
    .from('habits')
    .update(input)
    .eq('user_id', userId)
    .eq('id', habitId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to update habit: ${error.message}`);
  }

  return data;
}

export async function deleteHabit(userId: string, habitId: string): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from('habits')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('id', habitId);

  if (error) {
    throw new Error(`Failed to delete habit: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

/**
 * Verifies a habit belongs to userId before allowing log mutations.
 * habit_logs has no user_id column, so ownership must be checked via
 * the parent habits row (RLS also enforces this, but checking here lets
 * us return a clean 404 instead of relying solely on the DB error).
 */
async function assertHabitOwnership(userId: string, habitId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify habit ownership: ${error.message}`);
  }

  return data !== null;
}

/**
 * Upserts a log entry for the given habit/date. Used to toggle a day on
 * (completed: true) or off (completed: false) in the weekly tracker.
 */
export async function setHabitLog(
  userId: string,
  habitId: string,
  date: string,
  completed: boolean
): Promise<HabitLog | null> {
  const owns = await assertHabitOwnership(userId, habitId);
  if (!owns) return null;

  const { data, error } = await supabaseAdmin
    .from('habit_logs')
    .upsert(
      { habit_id: habitId, completed_date: date, completed },
      { onConflict: 'habit_id,completed_date' }
    )
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to set habit log: ${error.message}`);
  }

  return data;
}
