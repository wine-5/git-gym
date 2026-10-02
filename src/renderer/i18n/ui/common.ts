import type { UiDictionary } from '../types';

/** 複数の画面で使う文言と、言語の切り替えまわり */
const dict: UiDictionary = {
  ja: {
    'settings.language': '表示言語 / Language',
    'settings.languageNote': 'アプリの画面・レッスン・コマンド辞典の言語です（Git のコマンドや出力は英語のままです）',
  },
  en: {
    'settings.language': 'Language / 表示言語',
    'settings.languageNote': 'Language for screens, lessons and the command dictionary (Git commands and their output stay in English)',
  },
  zh: {
    'settings.language': '显示语言 / Language',
    'settings.languageNote': '应用界面、课程和命令词典的语言（Git 命令及其输出保持英文）',
  },
  ko: {
    'settings.language': '표시 언어 / Language',
    'settings.languageNote': '앱 화면, 레슨, 명령어 사전의 언어입니다 (Git 명령어와 출력은 영어 그대로입니다)',
  },
};

export default dict;
