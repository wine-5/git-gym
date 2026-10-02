import { CHAPTERS } from '@data/lessons';
import { WORLDS } from '@data/stages';
import { CATEGORIES, COMMANDS } from '@data/commands';
import { currentLocale, type Locale } from '../locale';
import type { ContentOverlay } from '../types';
import lessonsEn from './lessons.en';
import lessonsZh from './lessons.zh';
import lessonsKo from './lessons.ko';
import stagesEn from './stages.en';
import stagesZh from './stages.zh';
import stagesKo from './stages.ko';
import commandsEn from './commands.en';
import commandsZh from './commands.zh';
import commandsKo from './commands.ko';

const OVERLAYS: Record<Exclude<Locale, 'ja'>, ContentOverlay> = {
  en: { ...lessonsEn, ...stagesEn, ...commandsEn },
  zh: { ...lessonsZh, ...stagesZh, ...commandsZh },
  ko: { ...lessonsKo, ...stagesKo, ...commandsKo },
};

/** 今の言語の翻訳（日本語のときは undefined＝元のデータを使う） */
function overlay(): ContentOverlay | undefined {
  const locale = currentLocale();
  return locale === 'ja' ? undefined : OVERLAYS[locale];
}

/**
 * obj[key] を「今の言語の訳があればそれ、無ければ元の日本語」を返す getter に置き換える。
 * 表示言語は observable なので、observer の中で読めば言語を変えたときに描き直される
 */
function localize<T extends object, K extends keyof T>(obj: T, key: K, pick: (o: ContentOverlay) => T[K] | undefined): void {
  const original = obj[key];
  Object.defineProperty(obj, key, {
    get: () => {
      const o = overlay();
      return (o && pick(o)) ?? original;
    },
    enumerable: true,
    configurable: true,
  });
}

let applied = false;

/** レッスン・ステージ・コマンド辞典のデータを、表示言語に合わせて切り替わるようにする（起動時に1回） */
export function applyContentOverlays(): void {
  if (applied) return;
  applied = true;

  for (const chapter of CHAPTERS) {
    localize(chapter, 'title', (o) => o.chapters?.[chapter.id]?.title);
    localize(chapter, 'summary', (o) => o.chapters?.[chapter.id]?.summary);
    localize(chapter, 'commands', (o) => o.chapters?.[chapter.id]?.commands);
    for (const lesson of chapter.lessons) {
      const text = (o: ContentOverlay) => o.lessons?.[lesson.id];
      localize(lesson, 'title', (o) => text(o)?.title);
      localize(lesson, 'description', (o) => text(o)?.description);
      localize(lesson, 'hints', (o) => text(o)?.hints);
      lesson.checks.forEach((check, i) => localize(check, 'label', (o) => text(o)?.checks?.[i]));
    }
  }

  for (const world of WORLDS) {
    localize(world, 'title', (o) => o.worlds?.[world.id]?.title);
    for (const stage of world.stages) {
      const text = (o: ContentOverlay) => o.stages?.[stage.id];
      localize(stage, 'title', (o) => text(o)?.title);
      localize(stage, 'description', (o) => text(o)?.mission);
      localize(stage, 'hints', (o) => text(o)?.hints);
      stage.checks.forEach((check) => localize(check, 'label', (o) => text(o)?.mission));
    }
  }

  for (const category of CATEGORIES) localize(category, 'label', (o) => o.categories?.[category.id]);

  for (const command of COMMANDS) {
    const text = (o: ContentOverlay) => o.commands?.[command.name];
    localize(command, 'summary', (o) => text(o)?.summary);
    localize(command, 'description', (o) => text(o)?.description);
    localize(command, 'caution', (o) => text(o)?.caution);
    localize(command, 'sourcetree', (o) => text(o)?.sourcetree);
    command.examples.forEach((example, i) => localize(example, 'description', (o) => text(o)?.examples?.[i]));
    command.options.forEach((option, i) => localize(option, 'description', (o) => text(o)?.options?.[i]));
  }
}
