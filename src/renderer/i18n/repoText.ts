import type { SetupStep } from '@shared/setup';
import { currentLocale, type Locale } from './locale';

type Translations = Record<Exclude<Locale, 'ja'>, string>;

/**
 * 練習用リポジトリの中身（コミットメッセージ・README・コードのコメント）に使う文言。
 * レッスンの初期状態は日本語で書いてあるので、作るときに表示言語へ置き換える
 */
const PHRASES: Record<string, Translations> = {
  最初のコミット: { en: 'First commit', zh: '第一次提交', ko: '첫 커밋' },
  'Git の練習用の小さなゲームプロジェクトです。': {
    en: 'A small game project for practicing Git.',
    zh: '用来练习 Git 的小游戏项目。',
    ko: 'Git 연습용 작은 게임 프로젝트입니다.',
  },
  'Player を動かしたり、ダメージを受けたりできます。': {
    en: 'The Player can move around and take damage.',
    zh: 'Player 可以移动，也会受到伤害。',
    ko: 'Player를 움직이거나 데미지를 받을 수 있습니다.',
  },
  'TODO: ジャンプを作る': { en: 'TODO: make the jump', zh: 'TODO: 实现跳跃', ko: 'TODO: 점프 만들기' },
  'TODO コメントを追加': { en: 'Add a TODO comment', zh: '添加 TODO 注释', ko: 'TODO 주석 추가' },
  遊び方: { en: 'How to play', zh: '玩法', ko: '플레이 방법' },
  '矢印キーで移動します。': { en: 'Move with the arrow keys.', zh: '用方向键移动。', ko: '방향키로 이동합니다.' },
  矢印キーで移動: { en: 'Move with the arrow keys', zh: '用方向键移动', ko: '방향키로 이동' },
  スペースキーでジャンプ: { en: 'Jump with the space key', zh: '用空格键跳跃', ko: '스페이스 키로 점프' },
  'README に遊び方を追加': { en: 'Add how to play to README', zh: '在 README 中添加玩法', ko: 'README에 플레이 방법 추가' },
  操作方法: { en: 'Controls', zh: '操作方法', ko: '조작 방법' },
  'README に操作方法を追加': { en: 'Add controls to README', zh: '在 README 中添加操作方法', ko: 'README에 조작 방법 추가' },
  'ジャンプの高さは 3': { en: 'Jump height is 3', zh: '跳跃高度为 3', ko: '점프 높이는 3' },
  ジャンプ機能を追加: { en: 'Add jump feature', zh: '添加跳跃功能', ko: '점프 기능 추가' },
  ジャンプ機能: { en: 'Jump feature', zh: '跳跃功能', ko: '점프 기능' },
  'HP を 150 に増やす': { en: 'Raise HP to 150', zh: '把 HP 提高到 150', ko: 'HP를 150으로 올리기' },
  'HP を 120 に調整': { en: 'Adjust HP to 120', zh: '把 HP 调整为 120', ko: 'HP를 120으로 조정' },
  'README にチームメンバーを追加': { en: 'Add team members to README', zh: '在 README 中添加团队成员', ko: 'README에 팀원 추가' },
  チームメイトの追記: { en: 'Teammate note', zh: '队友的补充', ko: '팀원이 추가함' },
  チームメイト: { en: 'Teammate', zh: '队友', ko: '팀원' },
  チーム: { en: 'Team', zh: '团队', ko: '팀' },
  あなた: { en: 'You', zh: '你', ko: '나' },
  'README にバージョンを追加': { en: 'Add version to README', zh: '在 README 中添加版本', ko: 'README에 버전 추가' },
  'バージョン 1.0 の調整': { en: 'Tweaks for version 1.0', zh: '版本 1.0 的调整', ko: '버전 1.0 조정' },
  バージョン: { en: 'Version', zh: '版本', ko: '버전' },
  'HP の初期値を変更': { en: 'Change the initial HP', zh: '修改 HP 初始值', ko: 'HP 초기값 변경' },
  'メモ：まだ書きかけ': { en: 'Note: still a draft', zh: '备注：还没写完', ko: '메모: 아직 작성 중' },
  '作業中：ダッシュ機能': { en: 'WIP: dash feature', zh: '进行中：冲刺功能', ko: '작업 중: 대시 기능' },
  ダッシュ機能を追加: { en: 'Add dash feature', zh: '添加冲刺功能', ko: '대시 기능 추가' },
  ダッシュ機能: { en: 'Dash feature', zh: '冲刺功能', ko: '대시 기능' },
  要らないテストコード: { en: 'Unneeded test code', zh: '不需要的测试代码', ko: '필요 없는 테스트 코드' },
  メニュー画面を追加: { en: 'Add menu screen', zh: '添加菜单画面', ko: '메뉴 화면 추가' },
  メニュー画面: { en: 'Menu screen', zh: '菜单画面', ko: '메뉴 화면' },
  'README に更新履歴を追加': { en: 'Add changelog to README', zh: '在 README 中添加更新记录', ko: 'README에 변경 이력 추가' },
  更新履歴: { en: 'Changelog', zh: '更新记录', ko: '변경 이력' },
  タイトル画面を改善: { en: 'Improve the title screen', zh: '改进标题画面', ko: '타이틀 화면 개선' },
  'HP がマイナスにならないよう修正': { en: 'Keep HP from going negative', zh: '修正 HP 变成负数的问题', ko: 'HP가 마이너스가 되지 않도록 수정' },
  'HP の計算のバグを修正': { en: 'Fix HP calculation bug', zh: '修复 HP 计算的 bug', ko: 'HP 계산 버그 수정' },
  '実験：空を飛ぶ機能のメモ': { en: 'Experiment: notes on a flying feature', zh: '实验：飞行功能的备忘', ko: '실험: 하늘을 나는 기능 메모' },
  空を飛べるようにしたい: { en: 'I want the player to fly', zh: '想让角色能飞起来', ko: '하늘을 날 수 있게 하고 싶다' },
  実験中: { en: 'Experimenting', zh: '实验中', ko: '실험 중' },
  リリースに向けて調整: { en: 'Tweaks for the release', zh: '为发布做调整', ko: '릴리스를 위한 조정' },
  'README にクレジットを追加': { en: 'Add credits to README', zh: '在 README 中添加致谢', ko: 'README에 크레딧 추가' },
  クレジット: { en: 'Credits', zh: '致谢', ko: '크레딧' },
  ダメージ表示を追加: { en: 'Add damage display', zh: '添加伤害显示', ko: '데미지 표시 추가' },
  'README を更新': { en: 'Update README', zh: '更新 README', ko: 'README 업데이트' },
  新機能を追加: { en: 'Add new feature', zh: '添加新功能', ko: '새 기능 추가' },
  新機能: { en: 'New feature', zh: '新功能', ko: '새 기능' },
  送る変更: { en: 'Change to send', zh: '要推送的修改', ko: '보낼 변경' },
  バグ入りのコミット: { en: 'Commit with a bug', zh: '带 bug 的提交', ko: '버그가 있는 커밋' },
  マイナス: { en: 'negative', zh: '负数', ko: '마이너스' },
  変更: { en: 'Change', zh: '修改', ko: '변경' },
};

/** 長い文言から順に置き換える（「チームメイト」より先に「チーム」を置き換えないため） */
const ORDERED = Object.keys(PHRASES).sort((a, b) => b.length - a.length);

/** 日本語の文言を、今の表示言語の文言にする（訳が無ければそのまま） */
export function repoText(ja: string): string {
  const locale = currentLocale();
  return locale === 'ja' ? ja : (PHRASES[ja]?.[locale] ?? ja);
}

/** その文言のすべての言語の書き方（リポジトリを作ったときの言語に関係なく判定するため） */
export function repoTextVariants(ja: string): string[] {
  return [ja, ...Object.values(PHRASES[ja] ?? {})];
}

/** text の中に、その文言がどれかの言語で含まれているか */
export function includesRepoText(text: string | null | undefined, ja: string): boolean {
  return !!text && repoTextVariants(ja).some((v) => text.includes(v));
}

/** text が、その文言（どれかの言語）とちょうど同じか */
export function isRepoText(text: string | null | undefined, ja: string): boolean {
  return !!text && repoTextVariants(ja).includes(text.trim());
}

/** ファイルの中身に含まれる文言をまとめて置き換える */
function translateContent(content: string): string {
  if (currentLocale() === 'ja') return content;
  return ORDERED.reduce((text, ja) => (text.includes(ja) ? text.split(ja).join(repoText(ja)) : text), content);
}

/** 練習用リポジトリの初期状態を、今の表示言語の文言で作るように直す */
export function localizeSetup(steps: SetupStep[]): SetupStep[] {
  if (currentLocale() === 'ja') return steps;
  return steps.map((step) => {
    switch (step.kind) {
      case 'write':
        return { ...step, content: translateContent(step.content) };
      case 'git':
        // コミットメッセージ（-m の次の引数）だけを置き換える
        return { ...step, args: step.args.map((arg, i) => (i > 0 && /^-\w*m$/.test(step.args[i - 1]) ? translateContent(arg) : arg)) };
      case 'teammate':
        return {
          ...step,
          message: translateContent(step.message),
          files: step.files.map((f) => ({ ...f, content: translateContent(f.content) })),
        };
      default:
        return step;
    }
  });
}
