import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'dx12zh:learning:v2';

export type ChapterProgress = {
  read: boolean;
  activities: string[];
  conceptPassed: boolean;
  practiceDone: boolean;
};

export type ProgressState = {
  version: 2;
  chapters: Record<string, ChapterProgress>;
  lastVisited: { route: string; sectionId?: string } | null;
};

type ProgressContextValue = {
  state: ProgressState;
  chapter: (chapterId: string) => ChapterProgress;
  markRead: (chapterId: string) => void;
  markActivity: (chapterId: string, activityId: string) => void;
  unmarkActivity: (chapterId: string, activityId: string) => void;
  markConceptPassed: (chapterId: string) => void;
  markPracticeDone: (chapterId: string) => void;
  setLastVisited: (route: string, sectionId?: string) => void;
  replaceProgress: (state: ProgressState) => void;
  clearProgress: () => void;
};

const emptyChapter = (): ChapterProgress => ({ read: false, activities: [], conceptPassed: false, practiceDone: false });
const emptyProgress = (): ProgressState => ({ version: 2, chapters: {}, lastVisited: null });
const ProgressContext = createContext<ProgressContextValue | null>(null);

export function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ProgressState>;
  if (candidate.version !== 2 || !candidate.chapters || typeof candidate.chapters !== 'object' || Array.isArray(candidate.chapters)) return false;
  const validChapters = Object.values(candidate.chapters).every((chapter) => Boolean(chapter)
    && typeof chapter.read === 'boolean'
    && Array.isArray(chapter.activities)
    && chapter.activities.every((activity) => typeof activity === 'string')
    && typeof chapter.conceptPassed === 'boolean'
    && typeof chapter.practiceDone === 'boolean');
  const last = candidate.lastVisited;
  const validLast = last === null || (Boolean(last) && typeof last === 'object'
    && typeof last.route === 'string'
    && (last.sectionId === undefined || typeof last.sectionId === 'string'));
  return validChapters && validLast;
}

function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isProgressState(parsed)) return parsed;
    }
  } catch {
    // A blocked or malformed local storage entry should not prevent reading.
  }

  const migrated = emptyProgress();
  for (let number = 1; number <= 23; number += 1) {
    const chapterId = `ch${String(number).padStart(2, '0')}`;
    try {
      const oldValue = window.localStorage.getItem(`dx12zh-done-${chapterId}.html`);
      if (oldValue === '1') migrated.chapters[chapterId] = { ...emptyChapter(), read: true };
    } catch {
      return migrated;
    }
  }
  return migrated;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(loadProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Learning remains usable if storage is unavailable or full.
    }
  }, [state]);

  const updateChapter = useCallback((chapterId: string, update: (current: ChapterProgress) => ChapterProgress) => {
    setState((current) => ({
      ...current,
      chapters: { ...current.chapters, [chapterId]: update(current.chapters[chapterId] ?? emptyChapter()) },
    }));
  }, []);

  const markRead = useCallback((chapterId: string) => updateChapter(chapterId, (current) => ({ ...current, read: true })), [updateChapter]);
  const markActivity = useCallback((chapterId: string, activityId: string) => updateChapter(chapterId, (current) => ({
    ...current,
    activities: current.activities.includes(activityId) ? current.activities : [...current.activities, activityId],
  })), [updateChapter]);
  const unmarkActivity = useCallback((chapterId: string, activityId: string) => updateChapter(chapterId, (current) => ({
    ...current,
    activities: current.activities.filter((item) => item !== activityId),
  })), [updateChapter]);
  const markConceptPassed = useCallback((chapterId: string) => updateChapter(chapterId, (current) => ({ ...current, conceptPassed: true })), [updateChapter]);
  const markPracticeDone = useCallback((chapterId: string) => updateChapter(chapterId, (current) => ({ ...current, practiceDone: true })), [updateChapter]);
  const setLastVisited = useCallback((route: string, sectionId?: string) => {
    setState((current) => ({ ...current, lastVisited: { route, ...(sectionId ? { sectionId } : {}) } }));
  }, []);
  const replaceProgress = useCallback((next: ProgressState) => setState(next), []);
  const clearProgress = useCallback(() => setState(emptyProgress()), []);

  const value = useMemo<ProgressContextValue>(() => ({
    state,
    chapter: (chapterId) => state.chapters[chapterId] ?? emptyChapter(),
    markRead,
    markActivity,
    unmarkActivity,
    markConceptPassed,
    markPracticeDone,
    setLastVisited,
    replaceProgress,
    clearProgress,
  }), [state, markRead, markActivity, unmarkActivity, markConceptPassed, markPracticeDone, setLastVisited, replaceProgress, clearProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}

export function downloadProgress(state: ProgressState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dx12zh-learning-progress.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
