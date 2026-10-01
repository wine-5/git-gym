export type CommandCategory = 'basics' | 'history' | 'branch' | 'remote' | 'undo' | 'advanced';

export interface CommandOption {
  flag: string;
  description: string;
}

export interface CommandExample {
  command: string;
  description: string;
}

export interface GitCommand {
  /** `git` を除いた名前（例: commit） */
  name: string;
  category: CommandCategory;
  /** 一言で */
  summary: string;
  /** もう少し詳しく（初心者向けのたとえ話も含む） */
  description: string;
  usage: string[];
  examples: CommandExample[];
  options: CommandOption[];
  /** 気をつけること */
  caution?: string;
  /** 関連するコマンド */
  related: string[];
  /** SourceTree でいうとどの操作か（設定で表示を ON にしたときだけ出す） */
  sourcetree?: string;
}

export const CATEGORIES: { id: CommandCategory; label: string; color: string }[] = [
  { id: 'basics', label: '基本', color: '#4cc38a' },
  { id: 'history', label: '履歴を見る', color: '#5aa9ff' },
  { id: 'branch', label: 'ブランチ', color: '#f05033' },
  { id: 'remote', label: 'リモート', color: '#b48cff' },
  { id: 'undo', label: '取り消し', color: '#e8c46a' },
  { id: 'advanced', label: '応用', color: '#ff8fab' },
];

export const COMMANDS: GitCommand[] = [
  {
    name: 'init',
    category: 'basics',
    summary: '今いるフォルダを Git のリポジトリにする',
    description:
      'フォルダの中に `.git` という隠しフォルダを作り、変更の記録を始められる状態にします。プロジェクトごとに最初に1回だけ使います。',
    usage: ['git init'],
    examples: [{ command: 'git init', description: '今のフォルダで Git を使い始める' }],
    options: [{ flag: '-b <名前>', description: '最初のブランチ名を決める（例: -b main）' }],
    related: ['status', 'clone'],
    sourcetree: '「新規」→「ローカルリポジトリを作成」',
  },
  {
    name: 'status',
    category: 'basics',
    summary: '今の状態（変更・ステージ・ブランチ）を確認する',
    description:
      'どのファイルが変更されたか、何がステージに乗っているか、今どのブランチにいるかを表示します。迷ったらまず `git status`。何度打っても何も壊れません。',
    usage: ['git status'],
    examples: [
      { command: 'git status', description: '詳しく表示する' },
      { command: 'git status -s', description: '1行ずつ短く表示する（?? は未追跡、M は変更）' },
    ],
    options: [{ flag: '-s, --short', description: '短い表示にする' }],
    related: ['add', 'diff'],
    sourcetree: '左の「ファイルステータス」画面',
  },
  {
    name: 'add',
    category: 'basics',
    summary: '変更をステージに乗せる（次のコミットに入れる）',
    description:
      'コミットは「ステージに乗っているもの」を記録します。add は記録したい変更を選んでステージに乗せる操作です。写真を撮る前に、写る人を並ばせるイメージです。',
    usage: ['git add <ファイル>', 'git add .'],
    examples: [
      { command: 'git add Player.cs', description: '1つのファイルだけ乗せる' },
      { command: 'git add .', description: '今のフォルダ以下の変更をまとめて乗せる' },
    ],
    options: [
      { flag: '.', description: '今いるフォルダ以下すべて' },
      { flag: '-A', description: '削除も含めてすべての変更' },
    ],
    related: ['commit', 'restore'],
    sourcetree: 'ファイルの「ステージに移動」（チェックを付ける）',
  },
  {
    name: 'commit',
    category: 'basics',
    summary: 'ステージの内容を履歴として記録する',
    description:
      'ステージに乗っている変更を1つの「コミット」として保存します。コミットには「何をしたか」のメッセージを付けます。後から見返したり、元に戻したりできるセーブポイントです。',
    usage: ['git commit -m "<メッセージ>"'],
    examples: [
      { command: 'git commit -m "ジャンプ機能を追加"', description: 'メッセージを付けてコミット' },
      { command: 'git commit -am "HP を調整"', description: '追跡中のファイルの変更を add してまとめてコミット' },
      { command: 'git commit --amend -m "正しいメッセージ"', description: '直前のコミットを作り直す' },
    ],
    options: [
      { flag: '-m "<メッセージ>"', description: 'メッセージを指定する' },
      { flag: '-a', description: '追跡中のファイルの変更を自動で add する（新しいファイルは対象外）' },
      { flag: '--amend', description: '直前のコミットをやり直す（push 前だけ）' },
    ],
    caution: 'メッセージは「何をしたか」が後から分かるように書きましょう。「修正」だけだと何の修正か分かりません。',
    related: ['add', 'log'],
    sourcetree: '上の「コミット」ボタン → メッセージを書いて「コミット」',
  },
  {
    name: 'log',
    category: 'history',
    summary: 'コミットの履歴を見る',
    description: 'これまでのコミットを新しい順に表示します。誰が・いつ・何をしたかが分かります。',
    usage: ['git log', 'git log --oneline'],
    examples: [
      { command: 'git log --oneline', description: '1コミット1行で表示' },
      { command: 'git log --oneline --graph --all', description: '全ブランチの枝分かれを図で表示' },
      { command: 'git log --oneline feature/menu', description: '指定したブランチの履歴を見る' },
    ],
    options: [
      { flag: '--oneline', description: '1行ずつ短く表示' },
      { flag: '--graph', description: '枝分かれを線で表示' },
      { flag: '--all', description: 'すべてのブランチを表示' },
      { flag: '-n <数>', description: '新しいものから指定した数だけ表示' },
    ],
    related: ['show', 'reflog'],
    sourcetree: '左の「履歴」画面',
  },
  {
    name: 'diff',
    category: 'history',
    summary: '変更した内容（差分）を見る',
    description:
      'ファイルのどの行を追加・削除したかを表示します。`+` が追加、`-` が削除です。コミット前に確認する習慣をつけると、うっかりミスが減ります。',
    usage: ['git diff', 'git diff --staged'],
    examples: [
      { command: 'git diff', description: 'まだステージに乗せていない変更を見る' },
      { command: 'git diff --staged', description: 'ステージに乗せた変更を見る' },
      { command: 'git diff main feature/menu', description: '2つのブランチの違いを見る' },
    ],
    options: [{ flag: '--staged（--cached）', description: 'ステージに乗った変更を表示' }],
    related: ['status', 'add'],
    sourcetree: 'ファイルを選ぶと右下に出る差分',
  },
  {
    name: 'show',
    category: 'history',
    summary: '1つのコミットの中身を見る',
    description: 'コミットのメッセージと、そのコミットで変わった内容を表示します。何も指定しないと最新のコミットです。',
    usage: ['git show', 'git show <コミット>'],
    examples: [
      { command: 'git show', description: '最新のコミットを見る' },
      { command: 'git show v1.0', description: 'タグを付けたコミットを見る' },
    ],
    options: [],
    related: ['log'],
    sourcetree: '「履歴」でコミットを選ぶ',
  },
  {
    name: 'branch',
    category: 'branch',
    summary: 'ブランチの一覧を見る・作る・消す',
    description:
      'ブランチは作業の枝分かれです。本流（main）を壊さずに新しい機能を試せます。`git branch` だけで一覧、名前を付けると作成（移動はしない）です。',
    usage: ['git branch', 'git branch <名前>', 'git branch -d <名前>'],
    examples: [
      { command: 'git branch', description: 'ブランチの一覧（* が今いるブランチ）' },
      { command: 'git branch feature/title', description: '新しいブランチを作る' },
      { command: 'git branch -a', description: 'リモートのブランチも表示' },
      { command: 'git branch -d feature/title', description: 'マージ済みのブランチを消す' },
    ],
    options: [
      { flag: '-a', description: 'リモートのブランチも含めて表示' },
      { flag: '-d', description: 'ブランチを消す（マージ済みのみ）' },
      { flag: '-D', description: 'マージしていなくても強制的に消す（注意）' },
    ],
    related: ['switch', 'merge'],
    sourcetree: '上の「ブランチ」ボタン / 左のブランチ一覧',
  },
  {
    name: 'switch',
    category: 'branch',
    summary: 'ブランチを切り替える',
    description: '作業するブランチを移動します。ファイルの中身も、そのブランチの状態に入れ替わります。',
    usage: ['git switch <ブランチ>', 'git switch -c <新しいブランチ>'],
    examples: [
      { command: 'git switch main', description: 'main に移動' },
      { command: 'git switch -c feature/menu', description: 'ブランチを作ってそのまま移動' },
    ],
    options: [{ flag: '-c', description: '新しいブランチを作って切り替える' }],
    caution: 'まだコミットしていない変更があると切り替えられないことがあります。先にコミットするか stash しましょう。',
    related: ['branch', 'checkout', 'stash'],
    sourcetree: '左のブランチ一覧でブランチをダブルクリック',
  },
  {
    name: 'checkout',
    category: 'branch',
    summary: '（古い書き方）ブランチの切り替えなど',
    description:
      '昔からあるコマンドで、ブランチの切り替えとファイルの復元の両方ができます。今は役割を分けた `switch`（切り替え）と `restore`（復元）を使うのがおすすめです。',
    usage: ['git checkout <ブランチ>', 'git checkout -b <新しいブランチ>'],
    examples: [{ command: 'git checkout -b feature/menu', description: 'git switch -c と同じ' }],
    options: [{ flag: '-b', description: '新しいブランチを作って切り替える' }],
    related: ['switch', 'restore'],
    sourcetree: '左のブランチ一覧でブランチをダブルクリック',
  },
  {
    name: 'merge',
    category: 'branch',
    summary: '別のブランチの変更を取り込む',
    description:
      '指定したブランチの変更を、今いるブランチに合体させます。同じ行を別々に変えていると「コンフリクト（衝突）」になり、手で直す必要があります。',
    usage: ['git merge <ブランチ>'],
    examples: [
      { command: 'git merge feature/jump', description: 'feature/jump を今のブランチに取り込む' },
      { command: 'git merge --abort', description: 'コンフリクト中のマージをやめて元に戻す' },
    ],
    options: [
      { flag: '--abort', description: 'マージを中止する' },
      { flag: '--no-ff', description: '早送りできても必ずマージコミットを作る' },
    ],
    caution: 'コンフリクトしたら、<<<<<<< 〜 >>>>>>> の部分を直して add → commit でマージ完了です。',
    related: ['branch', 'rebase', 'pull'],
    sourcetree: '上の「マージ」ボタン',
  },
  {
    name: 'clone',
    category: 'remote',
    summary: 'リモートのリポジトリを手元に複製する',
    description: 'GitHub などにあるリポジトリを、履歴ごと丸ごと手元にコピーします。複製元は自動で `origin` という名前で登録されます。',
    usage: ['git clone <URL>', 'git clone <URL> <フォルダ>'],
    examples: [
      { command: 'git clone https://github.com/user/game.git', description: 'game フォルダに複製' },
      { command: 'git clone <URL> .', description: '今いる（空の）フォルダに複製' },
    ],
    options: [],
    related: ['remote', 'pull'],
    sourcetree: '「新規」→「URL からクローン」',
  },
  {
    name: 'remote',
    category: 'remote',
    summary: 'リモート（共有先）を確認・登録する',
    description: 'どのリモートとつながっているかを確認したり、新しく登録したりします。ふつうは `origin` という名前が使われます。',
    usage: ['git remote -v', 'git remote add <名前> <URL>'],
    examples: [
      { command: 'git remote -v', description: '登録されているリモートと URL を表示' },
      { command: 'git remote add origin <URL>', description: 'origin という名前で登録' },
    ],
    options: [{ flag: '-v', description: 'URL も表示する' }],
    related: ['clone', 'push'],
    sourcetree: '「設定」→「リモート」',
  },
  {
    name: 'push',
    category: 'remote',
    summary: '手元のコミットをリモートに送る',
    description: '自分のコミットを GitHub などに送って、チームと共有します。リモートに自分の知らない変更があると断られるので、先に pull します。',
    usage: ['git push', 'git push -u origin <ブランチ>'],
    examples: [
      { command: 'git push', description: '今のブランチを送る' },
      { command: 'git push -u origin feature/score', description: '新しいブランチを初めて送る' },
    ],
    options: [{ flag: '-u', description: 'リモートのブランチと結び付ける（次から git push だけで送れる）' }],
    caution: '`--force` は他の人の変更を消してしまうことがあります。チームでは使わないようにしましょう。',
    related: ['pull', 'fetch'],
    sourcetree: '上の「プッシュ」ボタン',
  },
  {
    name: 'pull',
    category: 'remote',
    summary: 'リモートの変更を取ってきて取り込む',
    description: '`git fetch`（取ってくる）と `git merge`（取り込む）をまとめて行います。作業を始める前に pull して最新にするのが基本です。',
    usage: ['git pull'],
    examples: [{ command: 'git pull', description: '今のブランチを最新にする' }],
    options: [{ flag: '--rebase', description: 'merge の代わりに rebase で取り込む' }],
    related: ['fetch', 'merge', 'push'],
    sourcetree: '上の「プル」ボタン',
  },
  {
    name: 'fetch',
    category: 'remote',
    summary: 'リモートの情報を取ってくるだけ（取り込まない）',
    description: 'リモートで何が変わったかを取ってきますが、手元のファイルやブランチは変えません。確認してから取り込みたいときに使います。',
    usage: ['git fetch'],
    examples: [
      { command: 'git fetch', description: 'origin の最新情報を取ってくる' },
      { command: 'git log --oneline --all', description: 'fetch のあと、origin/main との差を確かめる' },
    ],
    options: [],
    related: ['pull', 'merge'],
    sourcetree: '上の「フェッチ」ボタン',
  },
  {
    name: 'restore',
    category: 'undo',
    summary: 'ファイルの変更を取り消す・ステージから下ろす',
    description: 'まだコミットしていない変更を、最後のコミットの状態に戻します。`--staged` を付けると、変更は残したままステージから下ろします。',
    usage: ['git restore <ファイル>', 'git restore --staged <ファイル>'],
    examples: [
      { command: 'git restore Player.cs', description: '変更を捨てて元に戻す' },
      { command: 'git restore --staged README.md', description: 'ステージから下ろす（変更は残る）' },
    ],
    options: [{ flag: '--staged', description: 'ステージから下ろす' }],
    caution: '`--staged` を付けない restore は変更を消します。元には戻せないので注意！',
    related: ['add', 'reset'],
    sourcetree: 'ファイルを右クリック →「破棄」/「ステージから外す」',
  },
  {
    name: 'reset',
    category: 'undo',
    summary: 'ブランチの位置を過去のコミットに戻す',
    description:
      'コミットを取り消してやり直したいときに使います。`--soft` は変更をステージに残し、`--hard` は変更ごと消します。',
    usage: ['git reset --soft HEAD~1', 'git reset --hard <コミット>'],
    examples: [
      { command: 'git reset --soft HEAD~1', description: '直前のコミットだけ取り消す（変更は残る）' },
      { command: 'git reset --hard HEAD@{1}', description: 'reflog で見つけた位置まで戻る' },
    ],
    options: [
      { flag: '--soft', description: 'コミットだけ取り消し、変更はステージに残す' },
      { flag: '--hard', description: '変更もすべて消して戻す（注意）' },
      { flag: 'HEAD~1', description: '今の1つ前のコミット' },
    ],
    caution: 'push 済みのコミットを reset すると、チームの履歴とずれてしまいます。push 後は revert を使いましょう。',
    related: ['revert', 'reflog'],
    sourcetree: '「履歴」でコミットを右クリック →「このコミットまで現在のブランチを戻す」',
  },
  {
    name: 'revert',
    category: 'undo',
    summary: 'コミットを打ち消す新しいコミットを作る',
    description: '指定したコミットと逆の変更を、新しいコミットとして追加します。履歴を消さないので、push 済みのコミットも安全に取り消せます。',
    usage: ['git revert <コミット>'],
    examples: [{ command: 'git revert HEAD', description: '最新のコミットを打ち消す' }],
    options: [],
    related: ['reset'],
    sourcetree: '「履歴」でコミットを右クリック →「コミットを打ち消し」',
  },
  {
    name: 'stash',
    category: 'undo',
    summary: '作業中の変更を一時的にしまう',
    description: 'コミットしたくない作業途中の変更を、いったん引き出しにしまってきれいな状態にします。あとで取り出して続きができます。',
    usage: ['git stash', 'git stash pop'],
    examples: [
      { command: 'git stash', description: '変更をしまう' },
      { command: 'git stash list', description: 'しまった変更の一覧' },
      { command: 'git stash pop', description: '最後にしまった変更を取り出す' },
    ],
    options: [],
    related: ['switch'],
    sourcetree: '上の「スタッシュ」ボタン',
  },
  {
    name: 'reflog',
    category: 'undo',
    summary: 'HEAD が動いた記録を見る（消えたコミットの救出に）',
    description: 'reset などで消えたように見えるコミットも、reflog にはしばらく記録が残っています。困ったときの最後の味方です。',
    usage: ['git reflog'],
    examples: [
      { command: 'git reflog', description: 'HEAD の移動の記録を見る' },
      { command: 'git reset --hard HEAD@{1}', description: '1つ前の位置まで戻る' },
    ],
    options: [],
    related: ['reset', 'log'],
    sourcetree: '（SourceTree には直接の画面はありません。コマンドならではの機能です）',
  },
  {
    name: 'rebase',
    category: 'advanced',
    summary: '自分のコミットを別のコミットの上に付け替える',
    description: 'ブランチの土台を最新の main に付け替えて、履歴を一直線にします。マージコミットが増えないので履歴が読みやすくなります。',
    usage: ['git rebase <ブランチ>'],
    examples: [
      { command: 'git rebase main', description: '今のブランチを main の先端に付け替える' },
      { command: 'git rebase --abort', description: 'rebase をやめて元に戻す' },
    ],
    options: [
      { flag: '--abort', description: 'rebase を中止する' },
      { flag: '--continue', description: 'コンフリクトを直したあとに続ける' },
    ],
    caution: 'push 済みのブランチを rebase するのは避けましょう。自分だけのブランチで使います。',
    related: ['merge', 'cherry-pick'],
    sourcetree: 'ブランチを右クリック →「リベース」',
  },
  {
    name: 'cherry-pick',
    category: 'advanced',
    summary: '特定のコミットだけを今のブランチに持ってくる',
    description: '別のブランチにあるコミットのうち、必要な1つだけを取り込みます。バグ修正だけ先に入れたいときなどに便利です。',
    usage: ['git cherry-pick <コミット>'],
    examples: [{ command: 'git cherry-pick a1b2c3d', description: 'そのコミットの変更を今のブランチに適用' }],
    options: [],
    related: ['rebase', 'log'],
    sourcetree: '「履歴」でコミットを右クリック →「チェリーピック」',
  },
  {
    name: 'tag',
    category: 'advanced',
    summary: 'コミットに名前（しおり）を付ける',
    description: 'リリースしたバージョンなど、大事なコミットに `v1.0` のような名前を付けます。ハッシュの代わりに使えて便利です。',
    usage: ['git tag', 'git tag <名前>'],
    examples: [
      { command: 'git tag v1.0', description: '今のコミットにタグを付ける' },
      { command: 'git tag', description: 'タグの一覧' },
      { command: 'git push origin v1.0', description: 'タグをリモートに送る' },
    ],
    options: [{ flag: '-a -m "<説明>"', description: '説明付きのタグを作る' }],
    related: ['show'],
    sourcetree: '上の「タグ」ボタン',
  },
  {
    name: 'config',
    category: 'basics',
    summary: 'Git の設定（名前・メールなど）を見る・変える',
    description: 'コミットに記録される名前やメールアドレスなどを設定します。新しい PC で最初に1回設定します。',
    usage: ['git config --global user.name "<名前>"'],
    examples: [
      { command: 'git config --global user.name "Taro"', description: 'コミットに記録される名前' },
      { command: 'git config --global user.email "taro@example.com"', description: 'メールアドレス' },
      { command: 'git config --list', description: '今の設定を一覧で見る' },
    ],
    options: [{ flag: '--global', description: 'この PC の全リポジトリに適用' }],
    caution: 'このアプリの中での設定は、練習用の設定ファイルに保存されます（PC 本来の設定は変わりません）。',
    related: ['init'],
    sourcetree: '「ツール」→「オプション」（Mac は「環境設定」）',
  },
];

export function findCommand(name: string): GitCommand | undefined {
  return COMMANDS.find((c) => c.name === name);
}
