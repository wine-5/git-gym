import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { appModel } from '@models/AppModel';
import { findLesson, nextLesson } from '@data/lessons';
import { PracticeLayout } from '../workspace/PracticeLayout';
import { MissionPanel } from './MissionPanel';
import { ClearModal } from './ClearModal';

export const LessonView = observer(() => {
  const found = findLesson(appModel.currentLessonId);
  const session = appModel.lessonSession;
  const runner = appModel.lessonRunner;

  // 実フォルダ（ドキュメント/GitGym/lessons/<id>）を用意してターミナルをつなぐ。開いた時点の状態でも判定する
  useEffect(() => {
    void session?.open().then(() => runner?.evaluate());
  }, [session, runner]);

  if (!found || !session || !runner) return null;

  const next = nextLesson(found.lesson.id);

  return (
    <>
      <PracticeLayout
        session={session}
        left={<MissionPanel chapter={found.chapter} lessonIndex={found.index} runner={runner} />}
      />
      {runner.completed && !runner.celebrated && (
        <ClearModal
          lessonTitle={found.lesson.title}
          nextTitle={next?.title}
          onNext={next ? () => (runner.markCelebrated(), appModel.openLesson(next.id)) : undefined}
          onRetry={() => void appModel.resetLesson()}
          onHome={() => (runner.markCelebrated(), appModel.navigate('home'))}
          onClose={() => runner.markCelebrated()}
        />
      )}
    </>
  );
});
