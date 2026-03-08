// src/core/types/curriculumCourses.types.ts — copied from cyberlabs-frontend
export type TranslatedText = { en: string; ar?: string | null };

export type ElementType =
  | 'title'
  | 'subtitle'
  | 'text'
  | 'image'
  | 'video'
  | 'list'
  | 'orderedList'
  | 'code'
  | 'terminal'
  | 'note'
  | 'table'
  | 'hr'
  | 'button';

export interface BaseElement {
  id?: string | number;
  type: ElementType;
}

export interface TitleElement extends BaseElement {
  type: 'title';
  value: TranslatedText;
}
export interface SubtitleElement extends BaseElement {
  type: 'subtitle';
  value: TranslatedText;
}
export interface TextElement extends BaseElement {
  type: 'text';
  value: TranslatedText;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  imageUrl?: string;
  srcKey?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  alt?: TranslatedText;
}
export interface VideoElement extends BaseElement {
  type: 'video';
  url: string;
  title?: TranslatedText;
}

export type I18nArray = { en: string[]; ar: string[] };
export interface ListElement extends BaseElement {
  type: 'list';
  title?: TranslatedText;
  items: TranslatedText[] | I18nArray;
}
export interface OrderedListItem {
  subtitle: TranslatedText;
  text: TranslatedText;
  example?: TranslatedText;
  image?: {
    srcKey?: string;
    imageUrl?: string;
    size?: 'small' | 'medium' | 'large';
  };
}
export interface OrderedListElement extends BaseElement {
  type: 'orderedList';
  title?: TranslatedText;
  items: OrderedListItem[];
}
export interface CodeElement extends BaseElement {
  type: 'code';
  value?: string;
  code?: string;
  language?: string;
}
export interface TerminalElement extends BaseElement {
  type: 'terminal';
  value: string;
  label?: TranslatedText;
}
export type NoteVariant = 'info' | 'warning' | 'danger' | 'success';
export interface NoteElement extends BaseElement {
  type: 'note';
  noteType?: NoteVariant;
  value: TranslatedText;
  link?: string;
  isLab?: boolean;
}
export interface TableElement extends BaseElement {
  type: 'table';
  title?: TranslatedText;
  headers: TranslatedText[] | I18nArray;
  rows: (TranslatedText[] | I18nArray)[];
}
export interface HrElement extends BaseElement {
  type: 'hr';
}
export interface ButtonElement extends BaseElement {
  type: 'button';
  label: TranslatedText;
  href: string;
  newTab?: boolean;
}

export type CourseElement =
  | TitleElement
  | SubtitleElement
  | TextElement
  | ImageElement
  | VideoElement
  | ListElement
  | OrderedListElement
  | CodeElement
  | TerminalElement
  | NoteElement
  | TableElement
  | HrElement
  | ButtonElement;
