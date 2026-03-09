import { create } from 'zustand';
import type {
  CourseElement,
  EditorCardInfo,
  EditorHeroInfo,
  EditorMode,
  EditorPanel,
  EditorTopic,
  ElementType,
} from '../types/course-editor.types';
import {
  DEFAULT_CARD_INFO,
  DEFAULT_HERO_INFO,
  ELEMENT_TYPE_TO_LESSON_TYPE,
} from '../types/course-editor.types';

// ── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Serialize element content to a string the backend `content` field expects */
function elementToContent(el: CourseElement): string {
  switch (el.type) {
    case 'TEXT':
      return el.content ?? '';
    case 'IMAGE':
      return el.imageUrl ? `![${el.altText ?? ''}](${el.imageUrl})` : '';
    case 'VIDEO':
      return el.videoUrl ?? '';
    case 'CODE':
      return el.code
        ? `\`\`\`${el.language ?? 'bash'}\n${el.code}\n\`\`\``
        : '';
    case 'QUIZ':
      return JSON.stringify(el.questions ?? []);
    default:
      return '';
  }
}

// ── Store Interface ──────────────────────────────────────────────────────────

interface CourseEditorStore {
  // —— State
  mode: EditorMode;
  courseId?: string;
  cardInfo: EditorCardInfo;
  heroInfo: EditorHeroInfo;
  topics: EditorTopic[];
  activePanel: EditorPanel;
  selectedTopicId: string | null;
  isDirty: boolean;
  isSaving: boolean;

  // —— Init
  initNew: () => void;
  initFromJSON: (json: any) => void;
  initFromDB: (course: any) => void;

  // —— Card / Hero
  setCardInfo: (updates: Partial<EditorCardInfo>) => void;
  setHeroInfo: (updates: Partial<EditorHeroInfo>) => void;

  // —— Topics
  addTopic: () => void;
  deleteTopic: (id: string) => void;
  updateTopic: (
    id: string,
    updates: Partial<Omit<EditorTopic, 'id' | 'elements'>>,
  ) => void;
  moveTopic: (fromIndex: number, toIndex: number) => void;
  selectTopic: (id: string | null) => void;

  // —— Elements
  addElement: (topicId: string, type: ElementType) => void;
  updateElement: (
    topicId: string,
    elementId: string,
    updates: Partial<CourseElement>,
  ) => void;
  deleteElement: (topicId: string, elementId: string) => void;
  moveElement: (topicId: string, fromIndex: number, toIndex: number) => void;

  // —— Navigation
  setActivePanel: (panel: EditorPanel) => void;

  // —— Serialization
  /** Converts topics to PUT /curriculum payload */
  toCurriculumPayload: () => object;
  /** Converts all data to legacy JSON file format (for import/export) */
  toJSON: () => object;

  // —— Save state
  markSaving: (saving: boolean) => void;
  markClean: () => void;
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useCourseEditorStore = create<CourseEditorStore>((set, get) => ({
  mode: 'new',
  courseId: undefined,
  cardInfo: { ...DEFAULT_CARD_INFO },
  heroInfo: { ...DEFAULT_HERO_INFO },
  topics: [],
  activePanel: 'card',
  selectedTopicId: null,
  isDirty: false,
  isSaving: false,

  // ── Init from scratch ──────────────────────────────────────────────
  initNew: () =>
    set({
      mode: 'new',
      courseId: undefined,
      cardInfo: { ...DEFAULT_CARD_INFO },
      heroInfo: { ...DEFAULT_HERO_INFO },
      topics: [],
      selectedTopicId: null,
      activePanel: 'card',
      isDirty: false,
    }),

  // ── Init from legacy JSON file ──────────────────────────────────────
  initFromJSON: (json: any) => {
    const ld = json.landingData ?? {};
    const rawTopics: any[] = Array.isArray(json.topics) ? json.topics : [];

    const cardInfo: EditorCardInfo = {
      ...DEFAULT_CARD_INFO,
      title: ld.title?.en ?? '',
      ar_title: ld.title?.ar ?? '',
      slug: ld.slug ?? '',
      thumbnail: ld.thumbnail ?? '',
      color: ld.color ?? DEFAULT_CARD_INFO.color,
      access: ld.access ?? 'FREE',
      category: ld.category ?? '',
      tags: ld.tags ?? [],
      skills: ld.skills ?? [],
    };

    const heroInfo: EditorHeroInfo = {
      ...DEFAULT_HERO_INFO,
      description: ld.description?.en ?? '',
      ar_description: ld.description?.ar ?? '',
      longDescription: ld.longDescription?.en ?? '',
      ar_longDescription: ld.longDescription?.ar ?? '',
      difficulty: ld.difficulty?.en ?? 'beginner',
      estimatedHours: ld.estimatedHours ?? 0,
      instructorId: ld.instructorId ?? '',
    };

    const topics: EditorTopic[] = rawTopics.map((t: any, idx: number) => ({
      id: t.id ?? uid(),
      title: t.title?.en ?? t.title ?? '',
      ar_title: t.title?.ar ?? '',
      description: t.description?.en ?? '',
      ar_description: t.description?.ar ?? '',
      order: idx + 1,
      elements: (t.elements ?? []).map((el: any, eIdx: number) => ({
        id: el.id ?? uid(),
        type: (el.type?.toUpperCase() === 'VIDEO'
          ? 'VIDEO'
          : el.type?.toUpperCase() === 'QUIZ'
            ? 'QUIZ'
            : 'TEXT') as ElementType,
        title: el.title?.en ?? el.title ?? '',
        ar_title: el.title?.ar ?? '',
        order: el.order ?? eIdx + 1,
        content: el.content,
        videoUrl: el.videoUrl,
        videoDuration: el.duration,
      })),
    }));

    set({
      mode: 'import',
      courseId: undefined,
      cardInfo,
      heroInfo,
      topics,
      selectedTopicId: null,
      activePanel: 'card',
      isDirty: false,
    });
  },

  // ── Init from DB course object (GET /admin/courses/:id response) ───────
  initFromDB: (course: any) => {
    const cardInfo: EditorCardInfo = {
      title: course.title ?? '',
      ar_title: course.ar_title ?? '',
      slug: course.slug ?? '',
      thumbnail: course.thumbnail ?? '',
      color: course.color ?? DEFAULT_CARD_INFO.color,
      access: course.access ?? 'FREE',
      category: course.category ?? '',
      contentType: course.contentType ?? 'COURSE',
      tags: course.tags ?? [],
      skills: course.skills ?? [],
      isNew: course.isNew ?? false,
      isFeatured: course.isFeatured ?? false,
    };

    const heroInfo: EditorHeroInfo = {
      description: course.description ?? '',
      ar_description: course.ar_description ?? '',
      longDescription: course.longDescription ?? '',
      ar_longDescription: course.ar_longDescription ?? '',
      difficulty: course.difficulty ?? 'beginner',
      estimatedHours: course.estimatedHours ?? 0,
      instructorId: course.instructorId ?? course.instructor?.id ?? '',
      whatYouLearn: course.topics ?? [],
      ar_whatYouLearn: [],
      requirements: course.prerequisites ?? [],
      ar_requirements: [],
    };

    // Map DB sections+lessons → editor topics+elements
    const topics: EditorTopic[] = (course.sections ?? []).map(
      (section: any, sIdx: number) => ({
        id: section.id ?? uid(),
        title: section.title ?? '',
        ar_title: section.ar_title ?? '',
        description: section.description ?? '',
        ar_description: '',
        order: section.order ?? sIdx + 1,
        elements: (section.lessons ?? []).map((lesson: any, lIdx: number) => ({
          id: lesson.id ?? uid(),
          type: (lesson.type === 'VIDEO'
            ? 'VIDEO'
            : lesson.type === 'QUIZ'
              ? 'QUIZ'
              : 'TEXT') as ElementType,
          title: lesson.title ?? '',
          ar_title: lesson.ar_title ?? '',
          order: lesson.order ?? lIdx + 1,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          videoDuration: lesson.duration,
        })),
      }),
    );

    set({
      mode: 'edit',
      courseId: course.id,
      cardInfo,
      heroInfo,
      topics,
      selectedTopicId: null,
      activePanel: 'card',
      isDirty: false,
    });
  },

  // ── Card / Hero setters ─────────────────────────────────────────────
  setCardInfo: (updates) =>
    set((s) => ({ cardInfo: { ...s.cardInfo, ...updates }, isDirty: true })),

  setHeroInfo: (updates) =>
    set((s) => ({ heroInfo: { ...s.heroInfo, ...updates }, isDirty: true })),

  // ── Topics ────────────────────────────────────────────────────────────
  addTopic: () =>
    set((s) => {
      const newTopic: EditorTopic = {
        id: uid(),
        title: `Topic ${s.topics.length + 1}`,
        ar_title: '',
        description: '',
        ar_description: '',
        order: s.topics.length + 1,
        elements: [],
      };
      return {
        topics: [...s.topics, newTopic],
        selectedTopicId: newTopic.id,
        activePanel: 'curriculum',
        isDirty: true,
      };
    }),

  deleteTopic: (id) =>
    set((s) => ({
      topics: s.topics
        .filter((t) => t.id !== id)
        .map((t, i) => ({ ...t, order: i + 1 })),
      selectedTopicId: s.selectedTopicId === id ? null : s.selectedTopicId,
      isDirty: true,
    })),

  updateTopic: (id, updates) =>
    set((s) => ({
      topics: s.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      isDirty: true,
    })),

  moveTopic: (fromIndex, toIndex) =>
    set((s) => {
      const arr = [...s.topics];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return {
        topics: arr.map((t, i) => ({ ...t, order: i + 1 })),
        isDirty: true,
      };
    }),

  selectTopic: (id) => set({ selectedTopicId: id }),

  // ── Elements ───────────────────────────────────────────────────────────
  addElement: (topicId, type) =>
    set((s) => ({
      topics: s.topics.map((t) => {
        if (t.id !== topicId) return t;
        const newEl: CourseElement = {
          id: uid(),
          type,
          title: '',
          ar_title: '',
          order: t.elements.length + 1,
          ...(type === 'QUIZ' && { questions: [] }),
        };
        return { ...t, elements: [...t.elements, newEl] };
      }),
      isDirty: true,
    })),

  updateElement: (topicId, elementId, updates) =>
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id !== topicId
          ? t
          : {
              ...t,
              elements: t.elements.map((el) =>
                el.id === elementId ? { ...el, ...updates } : el,
              ),
            },
      ),
      isDirty: true,
    })),

  deleteElement: (topicId, elementId) =>
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id !== topicId
          ? t
          : {
              ...t,
              elements: t.elements
                .filter((el) => el.id !== elementId)
                .map((el, i) => ({ ...el, order: i + 1 })),
            },
      ),
      isDirty: true,
    })),

  moveElement: (topicId, fromIndex, toIndex) =>
    set((s) => ({
      topics: s.topics.map((t) => {
        if (t.id !== topicId) return t;
        const arr = [...t.elements];
        const [moved] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, moved);
        return {
          ...t,
          elements: arr.map((el, i) => ({ ...el, order: i + 1 })),
        };
      }),
      isDirty: true,
    })),

  // ── Navigation ──────────────────────────────────────────────────────────
  setActivePanel: (panel) => set({ activePanel: panel }),

  // ── Serialization ─────────────────────────────────────────────────────────
  toCurriculumPayload: () => {
    const { topics } = get();
    return topics.map((t) => ({
      title: t.title,
      ar_title: t.ar_title,
      description: t.description,
      ar_description: t.ar_description,
      elements: t.elements.map((el) => ({
        title: el.title,
        ar_title: el.ar_title,
        type: ELEMENT_TYPE_TO_LESSON_TYPE[el.type],
        content: elementToContent(el),
        videoUrl: el.type === 'VIDEO' ? el.videoUrl : undefined,
        duration: el.videoDuration,
        order: el.order,
      })),
    }));
  },

  /** Legacy JSON format compatible with importJson backend endpoint */
  toJSON: () => {
    const { cardInfo, heroInfo, topics } = get();
    return {
      landingData: {
        title: { en: cardInfo.title, ar: cardInfo.ar_title },
        description: { en: heroInfo.description, ar: heroInfo.ar_description },
        longDescription: {
          en: heroInfo.longDescription,
          ar: heroInfo.ar_longDescription,
        },
        difficulty: { en: heroInfo.difficulty, ar: heroInfo.difficulty },
        estimatedHours: heroInfo.estimatedHours,
        thumbnail: cardInfo.thumbnail,
        color: cardInfo.color,
        access: cardInfo.access,
        category: cardInfo.category,
        tags: cardInfo.tags,
        skills: cardInfo.skills,
      },
      topics: topics.map((t) => ({
        id: t.id,
        title: { en: t.title, ar: t.ar_title },
        description: { en: t.description, ar: t.ar_description },
        elements: t.elements.map((el) => ({
          id: el.id,
          title: { en: el.title, ar: el.ar_title },
          type: ELEMENT_TYPE_TO_LESSON_TYPE[el.type].toLowerCase(),
          content: elementToContent(el),
          videoUrl: el.type === 'VIDEO' ? el.videoUrl : undefined,
          duration: el.videoDuration,
          order: el.order,
        })),
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalTopics: topics.length,
        totalElements: topics.reduce((a, t) => a + t.elements.length, 0),
      },
    };
  },

  // ── Save state ─────────────────────────────────────────────────────────
  markSaving: (saving) => set({ isSaving: saving }),
  markClean: () => set({ isDirty: false }),
}));
