import { observer } from 'mobx-react-lite';
import { appModel } from '@models/AppModel';
import { TitleBar } from '@components/layout/TitleBar';
import { StatusBar } from '@components/layout/StatusBar';
import { LanguageSelectView } from '@components/language/LanguageSelectView';
import { HomeView } from '@components/home/HomeView';
import { LessonView } from '@components/lesson/LessonView';
import { DictionaryView } from '@components/dictionary/DictionaryView';
import { SandboxView } from '@components/sandbox/SandboxView';
import { SettingsView } from '@components/settings/SettingsView';
import { StageMapView } from '@components/stages/StageMapView';
import { StageView } from '@components/stages/StageView';
import styles from './App.module.css';

const Screen = observer(() => {
  switch (appModel.screen) {
    case 'language':
      return <LanguageSelectView />;
    case 'home':
      return <HomeView />;
    case 'lesson':
      return <LessonView />;
    case 'stages':
      return <StageMapView />;
    case 'stage':
      return <StageView />;
    case 'sandbox':
      return <SandboxView />;
    case 'dictionary':
      return <DictionaryView />;
    case 'settings':
      return <SettingsView />;
  }
});

export const App = () => (
  <div className={styles.app}>
    <TitleBar />
    <Screen />
    <StatusBar />
  </div>
);
