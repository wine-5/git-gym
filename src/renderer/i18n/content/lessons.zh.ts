import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  chapters: {
    basics: {
      title: '第一步',
      summary: '记录变更的基本流程。理解 add 和 commit 的含义。',
    },
    branch: {
      title: '分支',
      summary: '让工作分叉，并行开发。还会学习如何解决冲突。',
    },
    remote: {
      title: '远程仓库',
      summary: '和团队共享代码。体验 push 和 pull 的流程。',
    },
    undo: {
      title: '撤销',
      summary: '失败了也没关系。学习如何撤销变更和历史。',
    },
    advanced: {
      title: '进阶',
      summary: '让提交历史保持整洁的技巧。',
    },
    team: {
      title: '团队开发',
      summary: '队友已经先 push 了！实战综合练习。',
      commands: ['综合练习'],
    },
  },
  lessons: {
    '1-1': {
      title: '创建仓库',
      description:
        '这个文件夹里有游戏代码，但还没有用 Git 管理。\n' +
        '首先用 `git init` 创建一个用来记录变更的“仓库”吧。',
      checks: ['用 `git init` 创建仓库', '用 `ls -a` 确认已生成 `.git` 文件夹'],
      hints: [
        '创建仓库的命令是 `git init`。',
        '以 `.` 开头的文件和文件夹平时是隐藏的。用 `ls -a` 可以全部显示。',
        '之后所有变更的记录都会保存在 `.git` 文件夹里。',
      ],
    },
    '1-2': {
      title: '查看状态',
      description:
        '使用 Git 时最常输入的命令就是 `git status`。\n' +
        '它会告诉你现在哪些文件被修改了、哪些还没有记录。拿不准的时候，先敲 `git status`！',
      checks: ['用 `git status` 查看状态', '用 `git status -s` 看看简短的显示'],
      hints: [
        '输入 `git status` 试试。红色的文件是“Git 还没有记录的文件”。',
        '加上 `-s` 会变成每个文件一行的简短显示。`??` 表示“还没有被跟踪”。',
      ],
    },
    '1-3': {
      title: '放入暂存区',
      description:
        '在提交（记录）之前，要先选出“要放进下一次记录的文件”，把它们放入暂存区。\n' +
        '先只把 `{featureFile}` 放进去，然后再把其余文件一起放进去。也看看右下角的“文件位置”吧。',
      checks: ['只把 `{featureFile}` 放入暂存区', '把其余文件也一起放入暂存区', '用 `git status` 确认已放入暂存区'],
      hints: [
        '放入单个文件用 `git add {featureFile}`。',
        '`git add .` 可以把文件夹内的变更一起放入暂存区（`.` 表示“当前所在的文件夹”）。',
        '放入暂存区的文件在 `git status` 中会变成绿色。',
      ],
    },
    '1-4': {
      title: '第一次提交',
      description:
        '终于要把暂存区里的文件记录（提交）下来了。\n' +
        '每次提交都必须附上写明“做了什么”的提交信息。右上角的提交图应该会多出一个圆点。',
      checks: ['附上提交信息进行提交', '用 `git log` 确认提交已被记录'],
      hints: [
        '像 `git commit -m "第一次提交"` 这样，在 `-m` 后面写提交信息。',
        '提交信息要写得让以后的人也能看懂“做了什么”。',
        '用 `git log` 可以查看记录列表。',
      ],
    },
    '1-5': {
      title: '查看历史',
      description:
        '这个仓库里已经有几个提交了。\n' +
        '用 `git log` 看看是谁、在什么时候、做了什么吧。',
      checks: ['用 `git log` 查看历史', '用 `git log --oneline` 每行显示一个提交', '用 `git show` 查看最新提交的内容'],
      hints: [
        '`git log` 按从新到旧的顺序显示。',
        '加上 `--oneline` 会变成每个提交一行的紧凑显示。',
        '用 `git show` 可以看到最新提交改了哪些地方。',
      ],
    },
    '1-6': {
      title: '查看差异',
      description:
        '`{featureFile}` 里有还没提交的变更。\n' +
        '提交之前先用 `git diff` 确认“改了什么”，是非常重要的习惯。',
      checks: [
        '用 `git diff` 查看变更内容',
        '把 `{featureFile}` 放入暂存区',
        '用 `git diff --staged` 查看暂存区的内容',
        '提交',
      ],
      hints: [
        '以 `+` 开头的绿色行是新增，以 `-` 开头的红色行是删除。',
        '放入暂存区后，`git diff` 就不会再显示了。已放入的部分可以用 `git diff --staged` 查看。',
        '最后用 `git commit -m "提交信息"` 提交吧。',
      ],
    },
    '2-1': {
      title: '分支是什么？',
      description:
        '分支就是“工作的分叉”。不用破坏主线 `main`，就能在另一个分支上尝试新功能。\n' +
        '先看看分支列表，再创建一个新分支吧。',
      checks: ['用 `git branch` 查看分支列表', '创建 `feature/title` 分支', '再执行一次 `git branch`，确认分支增加了'],
      hints: [
        '只输入 `git branch` 会显示列表。带 `*` 的就是当前所在的分支。',
        '用 `git branch feature/title` 可以创建新分支（只是创建，不会切换过去）。',
        '分支名要能看出“在做什么工作”。`feature/〜` 是新功能常用的名字。',
      ],
    },
    '2-2': {
      title: '切换分支',
      description:
        '已经准备好了 `feature/sound` 分支。\n' +
        '在分支之间来回切换，看看提交图里的 `HEAD`（当前位置）是怎么移动的。',
      checks: ['切换到 `feature/sound`', '回到 `main`', '创建新分支 `feature/menu` 并直接切换过去'],
      hints: [
        '用 `git switch feature/sound` 可以切换。',
        '用 `git switch main` 回到主线。',
        '`git switch -c feature/menu` 可以一步完成“创建并切换”。',
      ],
    },
    '2-3': {
      title: '创建分支并添加新功能',
      description:
        '直接修改 main 分支是很危险的。\n' +
        '新建 `feature/jump` 分支并切换过去，在那里给 `{featureFile}` 加上跳跃处理，然后提交吧。',
      checks: ['创建 `feature/jump` 分支', '切换到 `feature/jump`', '编辑 `{featureFile}` 并提交'],
      hints: [
        '提交变更之前，需要先放入暂存区。回想一下该用哪个命令吧。',
        '用 `git add {featureFile}` 可以放入暂存区。',
        '用 `git commit -m "添加跳跃"` 就能提交。',
      ],
    },
    '2-4': {
      title: '合并分支',
      description:
        '`feature/jump` 分支上的跳跃功能完成了。\n' +
        '把它合并到主线 `main`，然后清理掉用完的分支吧。',
      checks: [
        '用 `git log --oneline --all` 查看所有分支的历史',
        '把 `feature/jump` 合并到 `main`',
        '删除用完的 `feature/jump` 分支',
      ],
      hints: [
        '合并要在“接收变更的一方”的分支上执行。现在你在 `main` 上。',
        '用 `git merge feature/jump` 可以合并。',
        '已合并的分支可以用 `git branch -d feature/jump` 删除。',
      ],
    },
    '2-5': {
      title: '解决冲突',
      description:
        '`main` 和 `feature/hp` 都修改了 `{hpFile}` 的同一行（HP 初始值），而且改法不同。\n' +
        '合并时 Git 无法决定用哪一个，就会产生“冲突”。在编辑器里修好它，完成合并吧。',
      checks: [
        '用 `git merge feature/hp` 试着合并',
        '在编辑器里删掉 `<<<<<<<` 〜 `>>>>>>>` 并修好，然后 `git add`',
        '提交以完成合并',
      ],
      hints: [
        '从 `<<<<<<< HEAD` 到 `=======` 是当前分支（main）的内容，从 `=======` 到 `>>>>>>>` 是要合并进来的分支的内容。',
        '决定用哪个值，连同 `<<<<<<<` `=======` `>>>>>>>` 这几行一起删掉，只留下正确的一行。',
        '改好后执行 `git add {hpFile}`，最后用 `git commit` 完成合并（提交信息会自动填好）。',
      ],
    },
    '3-1': {
      title: '复制仓库（clone）',
      description:
        '团队的仓库放在“远程仓库”（像 GitHub 这样的共享位置）上。先把它复制（clone）到本地吧。\n' +
        '本应用在 `{remoteUrl}` 准备了练习用的远程仓库。最后的 `.` 表示“复制到当前文件夹”。',
      checks: [
        '用 `git clone {remoteUrl} .` 复制',
        '用 `git remote -v` 确认复制来源（origin）',
        '用 `git log --oneline` 确认历史也一起复制过来了',
      ],
      hints: [
        '输入 `git clone {remoteUrl} .` 吧。如果是真正的 GitHub，URL 会是 https://github.com/... 这样的形式。',
        '复制来源会自动以 `origin` 这个名字登记。可以用 `git remote -v` 确认。',
        'clone 之后，不仅是文件，之前的所有历史也都会来到本地。',
      ],
    },
    '3-2': {
      title: '推送变更（push）',
      description:
        '只在本地提交，团队里的其他人是收不到的。\n' +
        '编辑 `{featureFile}` 并提交，然后用 `git push` 推送到远程仓库。看看提交图里的 `origin/main` 是怎么追上来的。',
      checks: ['编辑 `{featureFile}` 并提交', '用 `git push` 推送到远程仓库', '用 `git status` 确认显示“up to date”'],
      hints: [
        '先像平时一样 `git add` → `git commit -m "..."`。',
        '提交后用 `git push` 推送。`origin/main` 表示远程仓库上 main 的位置。',
        '如果 `git status` 显示 `Your branch is up to date with \'origin/main\'`，就说明推送成功了。',
      ],
    },
    '3-3': {
      title: '拉取队友的变更（pull）',
      description:
        '队友更新了 README 并 push 了。你的本地还没有这个变更。\n' +
        '用 `git pull` 拉取下来，更新到最新状态吧。',
      checks: ['用 `git pull` 拉取', '用 `git log --oneline` 确认队友的提交', '用 `cat README.md` 确认文件内容'],
      hints: [
        '`git pull` 是把“从远程仓库获取（fetch）并合并（merge）”一起完成的命令。',
        '用 `git log --oneline` 应该能看到多了队友的提交。',
        '编辑器里的 README.md 也已经自动变成新的内容了。',
      ],
    },
    '3-4': {
      title: '只获取不合并（fetch）',
      description:
        '队友又 push 了。这次不要马上合并，先用 `git fetch` 看看“改了什么”，再合并进来。\n' +
        '想谨慎推进的时候，这个方法很方便。',
      checks: [
        '用 `git fetch` 只获取远程仓库的信息',
        '用 `git log --oneline --all` 看到 `origin/main` 领先了',
        '用 `git merge origin/main` 合并进来',
      ],
      hints: [
        '`git fetch` 只是获取远程仓库的最新信息，不会改变本地的文件。',
        '在提交图里应该能看到 `origin/main` 在 `main` 的上方。',
        '确认之后用 `git merge origin/main` 合并（pull = fetch + merge）。',
      ],
    },
    '3-5': {
      title: '推送分支',
      description:
        '团队开发中，一般不直接 push 到 main，而是 push 自己的分支，请别人审查。\n' +
        '在 `feature/score` 分支上工作，然后推送到远程仓库吧。',
      checks: [
        '创建 `feature/score` 分支并提交',
        '用 `git push -u origin feature/score` 推送',
        '用 `git branch -a` 也确认一下远程分支',
      ],
      hints: [
        '用 `git switch -c feature/score` 创建并切换，然后编辑并提交。',
        '第一次推送新分支时要加上 `-u`（设置跟踪）。之后只用 `git push` 就能推送。',
        '如果 `git branch -a` 里出现 `remotes/origin/feature/score`，就成功了。',
      ],
    },
    '4-1': {
      title: '撤销变更（restore）',
      description:
        '你不小心把 `{hpFile}` 弄坏了（HP 变成了 0……）。而且还误把 README.md 放入了暂存区。\n' +
        '用 `git restore` 分别撤销文件的变更和暂存吧。',
      checks: ['撤销 `{hpFile}` 的变更，恢复到最后一次提交的状态', '把 README.md 移出暂存区（保留变更）'],
      hints: [
        '`git status` 里用英文写着该怎么撤销的提示。',
        '用 `git restore {hpFile}` 可以把文件恢复到最后一次提交的状态（变更会丢失，要小心！）。',
        '用 `git restore --staged README.md` 可以保留变更，只把它移出暂存区。',
      ],
    },
    '4-2': {
      title: '重做上一次提交（reset）',
      description:
        '上一次提交的信息不小心写成了“typo”。还没有 push，所以可以重做。\n' +
        '用 `git reset --soft HEAD~1` 只撤销提交，再用正确的信息重新提交吧。',
      checks: ['用 `git reset --soft HEAD~1` 撤销上一次提交（变更留在暂存区）', '用清楚易懂的信息重新提交'],
      hints: [
        '`HEAD~1` 表示“当前提交的前一个”。',
        '加上 `--soft`，只会撤销提交，变更会留在暂存区。',
        '接着用 `git commit -m "添加跳跃高度"` 重新提交吧。（用 `git commit --amend -m "..."` 也能修改）',
      ],
    },
    '4-3': {
      title: '抵消已推送的提交（revert）',
      description:
        '把 HP 变成 0 的有 bug 的提交已经 push 出去了。\n' +
        '不要删除大家已经共享的历史，而是用 `git revert` 新建一个“抵消提交”来修复吧。',
      checks: ['用 `git revert HEAD` 抵消有 bug 的提交', '用 `git push` 把抵消提交共享给团队'],
      hints: [
        '先用 `git log --oneline` 确认哪个提交有 bug。这次是最新的那个提交。',
        '用 `git revert HEAD` 会新建一个与最新提交相反的变更的提交（提交信息会自动填好）。',
        '和 reset 不同，它不会删除历史，所以即使已经 push 也很安全。最后执行 `git push` 吧。',
      ],
    },
    '4-4': {
      title: '暂时收起工作（stash）',
      description:
        '正在编辑 `{featureFile}` 的时候，突然要去做别的急事。可是现在还不想提交……\n' +
        '用 `git stash` 把工作暂时收起来，之后再取出来吧。',
      checks: ['用 `git stash` 收起正在进行的变更', '用 `git stash list` 确认收起的变更', '用 `git stash pop` 取出来，继续工作'],
      hints: [
        '执行 `git stash` 后，变更看起来像消失了，其实是被好好地收起来了。也看看编辑器里的内容吧。',
        '用 `git stash list` 可以查看收起的变更列表。',
        '用 `git stash pop` 可以取出收起的变更，恢复原样。',
      ],
    },
    '4-5': {
      title: '找回消失的提交（reflog）',
      description:
        '糟糕！用 `git reset --hard` 把两个重要的提交弄没了。\n' +
        '不过别担心。Git 留有 HEAD 移动的记录（reflog）。从那里把它们找回来吧。',
      checks: ['用 `git reflog` 查看 HEAD 的移动记录', '回到消失的提交'],
      hints: [
        '消失的提交不会出现在 `git log` 里。用 `git reflog` 吧。',
        'reflog 里的 `HEAD@{1}` 就是“reset 之前”的位置。',
        '用 `git reset --hard HEAD@{1}` 就能回到那个位置。',
      ],
    },
    '4-6': {
      title: '总结：把失败全部收拾好',
      description:
        '情况一团糟！`{mainFile}` 里有不需要的变更，而已经 push 的最新提交里还有 bug。\n' +
        '用这一章学到的命令，把它们全部收拾干净吧。',
      checks: ['撤销 `{mainFile}` 中不需要的变更', '抵消有 bug 的提交', '共享给团队'],
      hints: [
        '先用 `git status` 和 `git log --oneline` 确认情况。',
        '丢弃正在进行的变更用 `git restore`，抵消已 push 的提交用 `git revert`。',
        '最后用 `git push` 推送就完成了。',
      ],
    },
    '5-1': {
      title: '更换基础（rebase）',
      description:
        '在你在 `feature/menu` 上工作的时候，`main` 已经往前推进了。\n' +
        '用 `git rebase main` 把自己的提交移到最新的 `main` 之上，让历史变成一条直线。注意看提交图形状的变化！',
      checks: ['用 `git log --oneline --graph --all` 确认分叉', '把 `feature/menu` 移到最新的 `main` 之上'],
      hints: [
        '你现在在 `feature/menu` 上。直接输入 `git rebase main` 吧。',
        'rebase 是“先把自己的提交取下来，再重新接到对方分支的最前端”的操作。因为不会产生合并提交，历史会是一条直线。',
        '注意：对已经 push 的分支执行 rebase，会和团队的历史对不上。只在自己独用的分支上使用吧。',
      ],
    },
    '5-2': {
      title: '只拿一个提交（cherry-pick）',
      description:
        '`feature/experiment` 分支上有一个实验中的提交，还有一个“修复 HP 计算 bug”（HP の計算のバグを修正）的提交。\n' +
        '想先只把 bug 修复合并到 `main`！用 `git cherry-pick` 只把那个提交拿过来吧。',
      checks: ['用 `git log --oneline feature/experiment` 找到想要的提交', '只把修复 bug 的提交合并到 `main`'],
      hints: [
        '用 `git log --oneline feature/experiment` 可以看到每个提交左边的短 ID（哈希值）。',
        '用 `git cherry-pick <哈希值>` 可以只把那个提交的变更拿到当前分支。',
        '选择“HP の計算のバグを修正”（修复 HP 计算 bug）的哈希值。不要把实验的提交也拿过来！',
      ],
    },
    '5-3': {
      title: '打上标记（tag）',
      description:
        '游戏的 1.0 版本完成了！\n' +
        '给当前提交打上 `v1.0` 标签（书签），以后随时都能查看这个状态。',
      checks: ['用 `git tag v1.0` 打标签', '用 `git tag` 查看标签列表', '用 `git show v1.0` 查看打了标签的提交'],
      hints: [
        '用 `git tag v1.0` 会在当前提交上打上标记。提交图里也会显示标签。',
        '只输入 `git tag` 会显示列表。',
        '标签名可以代替提交的哈希值使用。用 `git show v1.0` 看看内容吧。',
      ],
    },
    '5-4': {
      title: '总结：用整洁的历史发布',
      description:
        '`feature/menu` 的工作完成了。可是 `main` 已经往前推进了。\n' +
        '先用 rebase 让历史变成一条直线，再合并到 `main`（这会是不产生合并提交的快进合并），然后打上 `v2.0` 标签吧。',
      checks: ['把 `feature/menu` 移到最新的 `main` 之上', '把 `feature/menu` 合并到 `main`（不产生合并提交）', '打上 `v2.0` 标签'],
      hints: [
        '首先在 `feature/menu` 上执行 `git rebase main`。',
        '然后 `git switch main`，再 `git merge feature/menu`。因为是一条直线，所以会是“Fast-forward”。',
        '最后执行 `git tag v2.0`。',
      ],
    },
    '6-1': {
      title: '练习1：日常的开发流程',
      description:
        '靠自己的力量，从头到尾完成一遍团队开发的基本流程吧。\n' +
        '① 拉取最新的 `main` → ② 创建 `feature/item` 分支 → ③ 编辑 `{featureFile}` 并提交 → ④ push 分支',
      checks: ['拉取最新的 `main`', '在 `feature/item` 分支上编辑 `{featureFile}` 并提交', '把 `feature/item` push 到远程仓库'],
      hints: [
        '基本做法是先用 `git pull` 把 main 更新到最新再开始。',
        '`git switch -c feature/item` → 编辑 → `git add` → `git commit -m "..."`',
        '第一次 push 用 `git push -u origin feature/item`。',
      ],
    },
    '6-2': {
      title: '练习2：push 被拒绝了！',
      description:
        '你修改了 `{featureFile}` 并提交了。马上 `git push`……结果被拒绝了。\n' +
        '原来是队友先 push 了。别慌，先把队友的变更拉取下来，再重新推送吧。',
      checks: ['试着 `git push`（会被拒绝）', '用 `git pull` 拉取队友的变更', '再执行一次 `git push`，让远程仓库包含双方的变更'],
      hints: [
        '出现 `[rejected]` 表示“远程仓库里有你不知道的变更”。',
        '用 `git pull` 拉取。因为改的是不同的文件，会自动合并（提交信息会自动填好）。',
        '拉取完成后，再执行一次 `git push`。',
      ],
    },
    '6-3': {
      title: '练习3：和队友发生冲突',
      description:
        '你把 `{hpFile}` 里的 HP 初始值改成了 120，队友改成了 150 并先 push 了。因为是同一行，会发生冲突。\n' +
        '执行 pull，解决冲突，改成团队商量好的“130”，然后 push 吧。',
      checks: ['执行 `git pull` 引发冲突', '把 HP 改成 130 解决冲突，并提交合并', '用 `git push` 和团队保持一致'],
      hints: [
        '执行 `git pull` 后会出现 CONFLICT。看看编辑器里用颜色区分的部分吧。',
        '把 `<<<<<<<` 到 `>>>>>>>` 之间的内容改写成只有 HP 为 130 的那一行。',
        '改好后 `git add {hpFile}` → `git commit` → `git push`。',
      ],
    },
  },
};

export default overlay;
