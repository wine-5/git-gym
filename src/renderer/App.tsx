import { observer } from 'mobx-react-lite';
import { appModel } from '@models/AppModel';
import { TitleBar } from '@components/layout/TitleBar';
import { StatusBar } from '@components/layout/StatusBar';
import { ComingSoon } from '@components/layout/ComingSoon';
import { LanguageSelectView } from '@components/language/LanguageSelectView';
import { HomeView } from '@components/home/HomeView';
import { LessonView } from '@components/lesson/LessonView';
import styles from './App.module.css';

const Screen = observer(() => {
  switch (appModel.screen) {
    case 'language':
      return <LanguageSelectView />;
    case 'home':
      return <HomeView />;
    case 'lesson':
      return <LessonView />;
    case 'sandbox':
      return <ComingSoon title="フリー練習" />;
    case 'dictionary':
      return <ComingSoon title="コマンド辞典" />;
  }
});

export const App = () => (
  <div className={styles.app}>
    <TitleBar />
    <Screen />
    <StatusBar />
  </div>
);
