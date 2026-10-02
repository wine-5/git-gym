import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  categories: {
    basics: '基础',
    history: '查看历史',
    branch: '分支',
    remote: '远程',
    undo: '撤销',
    advanced: '进阶',
  },
  commands: {
    init: {
      summary: '把当前文件夹变成 Git 仓库',
      description:
        '在文件夹里创建一个名为 `.git` 的隐藏文件夹，从此可以开始记录改动。每个项目只需在最开始执行一次。',
      examples: ['在当前文件夹开始使用 Git'],
      options: ['指定第一个分支的名称（例如 -b main）'],
      sourcetree: '“New...” →“Create Local Repository”（新建本地仓库）',
    },
    status: {
      summary: '查看当前状态（改动、暂存、分支）',
      description:
        '显示哪些文件被修改了、哪些已经暂存、现在在哪个分支上。拿不准的时候先执行 `git status`。执行多少次都不会弄坏任何东西。',
      examples: ['显示详细信息', '每个文件只显示一行（?? 表示未跟踪，M 表示已修改）'],
      options: ['使用简短格式'],
      sourcetree: '左侧的“File Status”（文件状态）视图',
    },
    add: {
      summary: '把改动放进暂存区（加入下一次提交）',
      description:
        '提交记录的是“暂存区里的内容”。add 就是挑选想要记录的改动并放进暂存区。可以想象成拍照前让要入镜的人先站好队。',
      examples: ['只暂存一个文件', '暂存当前文件夹及其子文件夹中的所有改动'],
      options: ['当前文件夹及其下的全部内容', '包括删除在内的所有改动'],
      sourcetree: '对文件执行“Stage”（勾选复选框）',
    },
    commit: {
      summary: '把暂存区的内容记录到历史中',
      description:
        '把暂存区里的改动保存为一个“提交（commit）”。每个提交都要附上“做了什么”的说明。它就像存档点，以后可以回看，也可以退回去。',
      examples: ['附上说明进行提交', '把已跟踪文件的改动一起 add 并提交', '重新制作上一次提交'],
      options: ['指定提交说明', '自动 add 已跟踪文件的改动（新文件不包括在内）', '重做上一次提交（仅限 push 之前）'],
      caution: '提交说明要写清楚“做了什么”，方便以后回看。只写“修改”的话，没人知道改了什么。',
      sourcetree: '点击上方的“Commit”按钮 → 填写说明后点击“Commit”',
    },
    log: {
      summary: '查看提交历史',
      description: '按从新到旧的顺序显示以往的提交。可以看出谁在什么时候做了什么。',
      examples: ['每个提交显示为一行', '用图形显示所有分支的分叉情况', '查看指定分支的历史'],
      options: ['每个提交一行，简短显示', '用线条显示分叉', '显示所有分支', '只显示最新的指定数量的提交'],
      sourcetree: '左侧的“History”（历史）视图',
    },
    diff: {
      summary: '查看改动内容（差异）',
      description:
        '显示文件中新增或删除了哪些行。`+` 表示新增，`-` 表示删除。养成提交前先检查的习惯，可以减少粗心的错误。',
      examples: ['查看尚未暂存的改动', '查看已暂存的改动', '查看两个分支之间的差异'],
      options: ['显示已暂存的改动'],
      sourcetree: '选中文件后右下方显示的差异',
    },
    show: {
      summary: '查看某一个提交的内容',
      description: '显示提交的说明以及该提交中改动的内容。不指定参数时显示最新的提交。',
      examples: ['查看最新的提交', '查看打了标签的提交'],
      options: [],
      sourcetree: '在“History”中选中一个提交',
    },
    branch: {
      summary: '查看、创建、删除分支',
      description:
        '分支就是工作的分叉。可以在不破坏主线（main）的情况下尝试新功能。只输入 `git branch` 会显示列表，加上名称则会创建分支（但不会切换过去）。',
      examples: ['分支列表（* 表示当前所在分支）', '创建新分支', '同时显示远程分支', '删除已合并的分支'],
      options: ['同时显示远程分支', '删除分支（仅限已合并的）', '即使未合并也强制删除（注意）'],
      sourcetree: '上方的“Branch”按钮 / 左侧的分支列表',
    },
    switch: {
      summary: '切换分支',
      description: '移动到要工作的分支。文件内容也会替换成该分支的状态。',
      examples: ['切换到 main', '创建分支并直接切换过去'],
      options: ['创建新分支并切换过去'],
      caution: '如果有尚未提交的改动，可能无法切换。请先提交或 stash。',
      sourcetree: '在左侧分支列表中双击分支',
    },
    checkout: {
      summary: '（旧写法）切换分支等',
      description:
        '历史悠久的命令，既能切换分支也能恢复文件。现在更推荐使用分工明确的 `switch`（切换）和 `restore`（恢复）。',
      examples: ['与 git switch -c 相同'],
      options: ['创建新分支并切换过去'],
      sourcetree: '在左侧分支列表中双击分支',
    },
    merge: {
      summary: '合并另一个分支的改动',
      description:
        '把指定分支的改动合并到当前分支。如果双方分别修改了同一行，就会发生“冲突（conflict）”，需要手动修正。',
      examples: ['把 feature/jump 合并到当前分支', '放弃发生冲突的合并并恢复原状'],
      options: ['中止合并', '即使可以快进也一定创建合并提交'],
      caution: '发生冲突时，修改 <<<<<<< ~ >>>>>>> 部分，然后 add → commit 即可完成合并。',
      sourcetree: '上方的“Merge”按钮',
    },
    clone: {
      summary: '把远程仓库复制到本地',
      description: '把 GitHub 等处的仓库连同历史完整复制到本地。复制来源会自动以 `origin` 这个名字登记。',
      examples: ['复制到 game 文件夹', '复制到当前（空的）文件夹'],
      options: [],
      sourcetree: '“New...” →“Clone from URL”（从 URL 克隆）',
    },
    remote: {
      summary: '查看、登记远程（共享目标）',
      description: '查看连接了哪些远程仓库，或者登记新的远程。通常使用 `origin` 这个名字。',
      examples: ['显示已登记的远程及其 URL', '以 origin 为名登记远程'],
      options: ['同时显示 URL'],
      sourcetree: '“Settings” →“Remotes”（远程）',
    },
    push: {
      summary: '把本地的提交推送到远程',
      description: '把自己的提交发送到 GitHub 等处，与团队共享。如果远程有你本地没有的改动，推送会被拒绝，所以要先 pull。',
      examples: ['推送当前分支', '第一次推送新分支'],
      options: ['与远程分支关联（以后只需 git push 即可推送）'],
      caution: '`--force` 可能会抹掉别人的改动。团队协作时请不要使用。',
      sourcetree: '上方的“Push”按钮',
    },
    pull: {
      summary: '获取远程的改动并合并进来',
      description: '一次完成 `git fetch`（获取）和 `git merge`（合并）。开始工作前先 pull 到最新，这是基本习惯。',
      examples: ['把当前分支更新到最新'],
      options: ['用 rebase 代替 merge 来合并'],
      sourcetree: '上方的“Pull”按钮',
    },
    fetch: {
      summary: '只获取远程的信息（不合并）',
      description: '获取远程有哪些变化，但不会改动本地的文件和分支。适合想先确认再合并的时候使用。',
      examples: ['获取 origin 的最新信息', 'fetch 之后，确认与 origin/main 的差异'],
      options: [],
      sourcetree: '上方的“Fetch”按钮',
    },
    restore: {
      summary: '撤销文件的改动，或从暂存区移出',
      description: '把尚未提交的改动恢复到上一次提交时的状态。加上 `--staged` 时，会保留改动，只把它从暂存区移出。',
      examples: ['丢弃改动，恢复原状', '从暂存区移出（改动会保留）'],
      options: ['从暂存区移出'],
      caution: '不加 `--staged` 的 restore 会删除改动，而且无法恢复，请注意！',
      sourcetree: '右键点击文件 →“Discard”（丢弃）/“Unstage”（取消暂存）',
    },
    reset: {
      summary: '把分支的位置退回到过去的提交',
      description: '想撤销提交重新来过时使用。`--soft` 会把改动保留在暂存区，`--hard` 会连改动一起删除。',
      examples: ['只撤销上一次提交（改动会保留）', '回到用 reflog 找到的位置'],
      options: ['只撤销提交，改动保留在暂存区', '连改动也全部删除（注意）', '当前提交的前一个提交'],
      caution: 'reset 已经 push 的提交，会让你的历史和团队的历史不一致。push 之后请使用 revert。',
      sourcetree: '在“History”中右键点击提交 →“Reset current branch to this commit”（将当前分支重置到此提交）',
    },
    revert: {
      summary: '创建一个抵消某个提交的新提交',
      description: '把与指定提交相反的改动作为一个新提交添加进来。因为不会删除历史，所以已经 push 的提交也可以安全地撤销。',
      examples: ['抵消最新的提交'],
      options: [],
      sourcetree: '在“History”中右键点击提交 →“Reverse commit...”（撤销提交）',
    },
    stash: {
      summary: '暂时收起正在进行的改动',
      description: '把还不想提交的半成品改动先收进抽屉里，让工作区恢复干净。之后可以再取出来继续。',
      examples: ['收起改动', '查看收起的改动列表', '取出最后收起的改动'],
      options: [],
      sourcetree: '上方的“Stash”按钮',
    },
    reflog: {
      summary: '查看 HEAD 的移动记录（用来找回丢失的提交）',
      description: '就算是因为 reset 等操作看起来消失了的提交，在 reflog 里也会保留一段时间的记录。它是遇到麻烦时最后的救星。',
      examples: ['查看 HEAD 的移动记录', '回到上一个位置'],
      options: [],
      sourcetree: '（SourceTree 没有直接对应的界面，这是命令行特有的功能）',
    },
    rebase: {
      summary: '把自己的提交移到另一个提交之上',
      description: '把分支的基础移到最新的 main 上，让历史变成一条直线。不会增加合并提交，历史更容易阅读。',
      examples: ['把当前分支移到 main 的最前端', '放弃 rebase 并恢复原状'],
      options: ['中止 rebase', '解决冲突后继续'],
      caution: '避免 rebase 已经 push 的分支。只在自己专用的分支上使用。',
      sourcetree: '右键点击分支 →“Rebase...”（变基）',
    },
    'cherry-pick': {
      summary: '只把特定的提交拿到当前分支',
      description: '从其他分支的提交中，只挑选需要的一个合并进来。比如想先合入某个 bug 修复时很方便。',
      examples: ['把该提交的改动应用到当前分支'],
      options: [],
      sourcetree: '在“History”中右键点击提交 →“Cherry Pick”（遴选）',
    },
    tag: {
      summary: '给提交起个名字（书签）',
      description: '给发布版本等重要的提交起一个像 `v1.0` 这样的名字。可以代替哈希值使用，非常方便。',
      examples: ['给当前提交打标签', '标签列表', '把标签推送到远程'],
      options: ['创建带说明的标签'],
      sourcetree: '上方的“Tag”按钮',
    },
    config: {
      summary: '查看、修改 Git 的设置（名字、邮箱等）',
      description: '设置会记录在提交中的名字和邮箱地址等。在新电脑上最开始设置一次即可。',
      examples: ['记录在提交中的名字', '邮箱地址', '列出当前的设置'],
      options: ['应用到这台电脑上的所有仓库'],
      caution: '在本应用中进行的设置会保存到练习用的配置文件中（不会改变电脑本身的设置）。',
      sourcetree: '“Tools” →“Options”（Mac 上是“Preferences”）',
    },
  },
};

export default overlay;
