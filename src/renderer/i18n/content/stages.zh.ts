import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  worlds: {
    basics: { title: '记录的基础' },
    branch: { title: '分支森林' },
    remote: { title: '远程之海' },
    undo: { title: '重来之塔' },
  },
  stages: {
    's1-1': {
      title: '开始',
      mission: '把这个文件夹变成 Git 仓库',
      hints: ['这是创建仓库的命令', '`git init`'],
    },
    's1-2': {
      title: '看看状态',
      mission: '确认一下当前的状态',
      hints: ['拿不准时先用这个！', '`git status`'],
    },
    's1-3': {
      title: '放上一个',
      mission: '只把 `{featureFile}` 加入暂存区',
      hints: ['加入暂存区用 add', '`git add {featureFile}`'],
    },
    's1-4': {
      title: '一起放上',
      mission: '把剩下的文件也一起加入暂存区',
      hints: ['“当前文件夹的全部”可以用 . 表示', '`git add .`'],
    },
    's1-5': {
      title: '记下来',
      mission: '附上说明进行提交',
      hints: ['在 -m 后面写提交说明', '`git commit -m "第一次提交"`'],
    },
    's1-6': {
      title: '回顾',
      mission: '每条提交一行地显示历史',
      hints: ['给 log 加上选项', '`git log --oneline`'],
    },
    's1-7': {
      title: '比一比',
      mission: '看看你改了什么',
      hints: ['这是查看差异的命令', '`git diff`'],
    },
    's1-8': {
      title: '一口气记录',
      mission: '一次完成 add 和 commit',
      hints: ['给 commit 加上 -a，会自动 add 已修改的文件', '`git commit -am "记录修改"`'],
    },
    's2-1': {
      title: '数数分支',
      mission: '查看分支列表',
      hints: ['这是操作分支的命令', '`git branch`'],
    },
    's2-2': {
      title: '长出分支',
      mission: '创建 `feature/a` 分支',
      hints: ['在 branch 后面写上名字', '`git branch feature/a`'],
    },
    's2-3': {
      title: '跳上分支',
      mission: '切换到 `feature/a` 分支',
      hints: ['切换用 switch', '`git switch feature/a`'],
    },
    's2-4': {
      title: '创建并跳上',
      mission: '创建 `feature/b` 并直接切换过去',
      hints: ['给 switch 加上 -c 还能顺便创建', '`git switch -c feature/b`'],
    },
    's2-5': {
      title: '合并分支',
      mission: '把 `feature/a` 合并到 main',
      hints: ['你现在在 main 上。指定要合并进来的分支', '`git merge feature/a`'],
    },
    's2-6': {
      title: '收拾分支',
      mission: '删除已经合并的 `feature/a`',
      hints: ['给 branch 加上 -d 就能删除', '`git branch -d feature/a`'],
    },
    's3-1': {
      title: '认识对方',
      mission: '确认已连接的远程仓库',
      hints: ['给 remote 加上 -v 还会显示 URL', '`git remote -v`'],
    },
    's3-2': {
      title: '发送',
      mission: '把本地的提交发送到远程仓库',
      hints: ['发送用 push', '`git push`'],
    },
    's3-3': {
      title: '接收',
      mission: '拉取队友的修改',
      hints: ['获取并合并用 pull', '`git pull`'],
    },
    's3-4': {
      title: '偷看一眼',
      mission: '不合并，只获取远程仓库的信息',
      hints: ['只获取不合并用 fetch', '`git fetch`'],
    },
    's3-5': {
      title: '发送分支',
      mission: '把 `feature/c` 分支推送到远程仓库',
      hints: ['第一次推送的分支要加上 -u origin', '`git push -u origin feature/c`'],
    },
    's4-1': {
      title: '恢复原样',
      mission: '撤销 `{featureFile}` 的修改',
      hints: ['恢复文件用 restore', '`git restore {featureFile}`'],
    },
    's4-2': {
      title: '撤下来',
      mission: '把 `{featureFile}` 从暂存区撤下（保留修改）',
      hints: ['给 restore 加上 --staged', '`git restore --staged {featureFile}`'],
    },
    's4-3': {
      title: '重新说',
      mission: '修改上一次提交的说明“typo”',
      hints: ['上一次提交可以用 --amend 重做', '`git commit --amend -m "添加跳跃"`'],
    },
    's4-4': {
      title: '抵消',
      mission: '创建一个抵消最新提交的提交',
      hints: ['保留历史并撤销用 revert', '`git revert HEAD`'],
    },
    's4-5': {
      title: '收起来',
      mission: '把正在进行的修改暂时收起来',
      hints: ['临时保存用 stash', '`git stash`'],
    },
    's4-6': {
      title: '拿出来',
      mission: '把收起来的修改拿出来',
      hints: ['给 stash 加上 pop', '`git stash pop`'],
    },
  },
};

export default overlay;
