import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  chapters: {
    basics: {
      title: 'First Steps',
      summary: 'The basic flow of recording changes. Learn what add and commit really mean.',
    },
    branch: {
      title: 'Branches',
      summary: 'Split your work into branches and develop in parallel. Learn how to fix conflicts, too.',
    },
    remote: {
      title: 'Remotes',
      summary: 'Share code with your team. Try out the push and pull workflow.',
    },
    undo: {
      title: 'Undoing',
      summary: 'Mistakes are OK. Learn how to undo changes and history.',
    },
    advanced: {
      title: 'Advanced',
      summary: 'Techniques for keeping your history clean.',
    },
    team: {
      title: 'Team Development',
      summary: 'A teammate pushed first! Hands-on review exercises.',
      commands: ['Review exercises'],
    },
  },
  lessons: {
    '1-1': {
      title: 'Create a repository',
      description:
        'This folder contains game code, but it is not managed by Git yet.\n' +
        'First, run `git init` to create a "repository" that will record your changes.',
      checks: ['Create a repository with `git init`', 'Check that the `.git` folder was created with `ls -a`'],
      hints: [
        'The command to create a repository is `git init`.',
        'Files and folders starting with `.` are normally hidden. `ls -a` shows everything.',
        'Every change you record from now on is stored inside the `.git` folder.',
      ],
    },
    '1-2': {
      title: 'Check the status',
      description:
        'The command you will type most often is `git status`.\n' +
        'It tells you which files have changed and what has not been recorded yet. When in doubt, run `git status`!',
      checks: ['Check the status with `git status`', 'Try the short format with `git status -s`'],
      hints: [
        'Type `git status`. Red files are files that Git has not recorded yet.',
        'Adding `-s` gives a short, one-line-per-file view. `??` means "not tracked yet".',
      ],
    },
    '1-3': {
      title: 'Stage your files',
      description:
        'Before committing (recording), you choose which files go into the next record by putting them on the stage.\n' +
        'First stage only `{featureFile}`, then stage the rest all at once. Take a look at "Where files are" in the bottom right, too.',
      checks: [
        'Stage only `{featureFile}`',
        'Stage all the remaining files at once',
        'Check with `git status` that they are staged',
      ],
      hints: [
        'To stage a single file, use `git add {featureFile}`.',
        '`git add .` stages every change in the folder (`.` means "the current folder").',
        'Staged files turn green in `git status`.',
      ],
    },
    '1-4': {
      title: 'Your first commit',
      description:
        'Now it is time to record (commit) the staged files.\n' +
        'Every commit needs a message describing what you did. You should see a new dot appear in the commit graph at the top right.',
      checks: ['Commit with a message', 'Check with `git log` that the commit was recorded'],
      hints: [
        'Write the message after `-m`, like `git commit -m "First commit"`.',
        'Write messages so that you can tell later what you did.',
        '`git log` shows the list of records.',
      ],
    },
    '1-5': {
      title: 'Read the history',
      description:
        'This repository already has a few commits.\n' +
        'Use `git log` to find out who did what, and when.',
      checks: [
        'View the history with `git log`',
        'Show one commit per line with `git log --oneline`',
        'See the contents of the latest commit with `git show`',
      ],
      hints: [
        '`git log` shows the newest commits first.',
        'Adding `--oneline` gives a compact view with one commit per line.',
        '`git show` shows what changed in the latest commit.',
      ],
    },
    '1-6': {
      title: 'Look at the diff',
      description:
        '`{featureFile}` has changes that have not been committed yet.\n' +
        'Checking "what you changed" with `git diff` before committing is a very important habit.',
      checks: [
        'View the changes with `git diff`',
        'Stage `{featureFile}`',
        'View what is staged with `git diff --staged`',
        'Commit',
      ],
      hints: [
        'Green lines starting with `+` are additions; red lines starting with `-` are deletions.',
        'Once staged, changes no longer appear in `git diff`. Use `git diff --staged` to see them.',
        'Finally, commit with `git commit -m "message"`.',
      ],
    },
    '2-1': {
      title: 'What is a branch?',
      description:
        'A branch is a "fork" in your work. You can try new features on a separate branch without breaking `main`, the main line.\n' +
        'First, look at the list of branches, then create a new one.',
      checks: [
        'List branches with `git branch`',
        'Create the `feature/title` branch',
        'Run `git branch` again to check that it was added',
      ],
      hints: [
        'Typing just `git branch` shows the list. The one marked with `*` is your current branch.',
        '`git branch feature/title` creates a new branch (it only creates it; you do not move to it).',
        'Name branches after the work they contain. `feature/...` is a common name for new features.',
      ],
    },
    '2-2': {
      title: 'Switch branches',
      description:
        'The `feature/sound` branch is already set up.\n' +
        'Switch back and forth between branches and watch `HEAD` (where you are now) move in the commit graph.',
      checks: [
        'Switch to `feature/sound`',
        'Go back to `main`',
        'Create a new branch `feature/menu` and switch to it right away',
      ],
      hints: [
        'You can switch with `git switch feature/sound`.',
        '`git switch main` takes you back to the main line.',
        '`git switch -c feature/menu` creates and switches in one step.',
      ],
    },
    '2-3': {
      title: 'Add a feature on a new branch',
      description:
        'Editing the main branch directly is risky.\n' +
        'Create a new `feature/jump` branch, switch to it, add jump logic to `{featureFile}` there, and commit.',
      checks: [
        'Create the `feature/jump` branch',
        'Switch to `feature/jump`',
        'Edit `{featureFile}` and commit',
      ],
      hints: [
        'Before committing, you need to stage your changes. Try to remember which command does that.',
        'You can stage it with `git add {featureFile}`.',
        'You can commit with `git commit -m "Add jump"`.',
      ],
    },
    '2-4': {
      title: 'Merge a branch',
      description:
        'The jump feature on the `feature/jump` branch is finished.\n' +
        'Bring it into `main` (merge it), then clean up the branch you no longer need.',
      checks: [
        'View the history of all branches with `git log --oneline --all`',
        'Merge `feature/jump` into `main`',
        'Delete the `feature/jump` branch you no longer need',
      ],
      hints: [
        'Run a merge while you are on the branch that receives the changes. You are on `main` now.',
        'You can merge with `git merge feature/jump`.',
        'A merged branch can be deleted with `git branch -d feature/jump`.',
      ],
    },
    '2-5': {
      title: 'Resolve a conflict',
      description:
        'The same line in `{hpFile}` (the starting HP) was changed differently on both `main` and `feature/hp`.\n' +
        'When you merge, Git cannot decide which one to keep, so you get a "conflict". Fix it in the editor and finish the merge.',
      checks: [
        'Try merging with `git merge feature/hp`',
        'Fix the file in the editor by removing `<<<<<<<` ... `>>>>>>>`, then `git add` it',
        'Commit to finish the merge',
      ],
      hints: [
        'From `<<<<<<< HEAD` to `=======` is your current branch (main = ours); from `=======` to `>>>>>>>` is the branch you are merging in (theirs).',
        'Decide which value to keep, delete the `<<<<<<<` `=======` `>>>>>>>` lines too, and leave only the one correct line.',
        'After fixing, run `git add {hpFile}`, then finish the merge with `git commit` (the message is filled in for you).',
      ],
    },
    '3-1': {
      title: 'Copy a repository (clone)',
      description:
        'Your team\'s repository lives on a "remote" (a shared place like GitHub). First, make a copy of it on your machine (clone).\n' +
        'This app provides a practice remote at `{remoteUrl}`. The `.` at the end means "into the current folder".',
      checks: [
        'Clone it with `git clone {remoteUrl} .`',
        'Check where it was cloned from (origin) with `git remote -v`',
        'Check with `git log --oneline` that the history came along too',
      ],
      hints: [
        'Type `git clone {remoteUrl} .`. On real GitHub, the URL looks like https://github.com/...',
        'The source is automatically registered under the name `origin`. You can check it with `git remote -v`.',
        'Cloning brings not only the files but also the entire history to your machine.',
      ],
    },
    '3-2': {
      title: 'Send your changes (push)',
      description:
        'Committing locally does not share your work with the team.\n' +
        'Edit `{featureFile}`, commit, and send it to the remote with `git push`. Watch `origin/main` catch up in the commit graph.',
      checks: [
        'Edit `{featureFile}` and commit',
        'Send it to the remote with `git push`',
        'Check with `git status` that it says "up to date"',
      ],
      hints: [
        'Start as usual: `git add` → `git commit -m "..."`.',
        'After committing, send it with `git push`. `origin/main` shows where main is on the remote.',
        'If `git status` shows `Your branch is up to date with \'origin/main\'`, your push worked.',
      ],
    },
    '3-3': {
      title: 'Get your teammate\'s changes (pull)',
      description:
        'A teammate updated the README and pushed it. You do not have that change yet.\n' +
        'Use `git pull` to bring it in and get up to date.',
      checks: [
        'Pull the changes with `git pull`',
        'Check your teammate\'s commit with `git log --oneline`',
        'Check the contents with `cat README.md`',
      ],
      hints: [
        '`git pull` does "download from the remote (fetch) and combine (merge)" in one go.',
        '`git log --oneline` should show your teammate\'s new commit.',
        'README.md in the editor has also been updated automatically.',
      ],
    },
    '3-4': {
      title: 'Just download for now (fetch)',
      description:
        'Your teammate pushed again. This time, instead of merging right away, first use `git fetch` to see what changed, then bring it in.\n' +
        'This is handy when you want to proceed carefully.',
      checks: [
        'Download just the remote information with `git fetch`',
        'See that `origin/main` is ahead with `git log --oneline --all`',
        'Bring it in with `git merge origin/main`',
      ],
      hints: [
        '`git fetch` only downloads the latest info from the remote. It does not change your local files.',
        'In the commit graph, you should see `origin/main` above `main`.',
        'Once you have checked, bring it in with `git merge origin/main` (pull = fetch + merge).',
      ],
    },
    '3-5': {
      title: 'Push a branch',
      description:
        'In team development, you usually do not push directly to main. Instead, you push your own branch for others to review.\n' +
        'Work on a `feature/score` branch and send it to the remote.',
      checks: [
        'Create the `feature/score` branch and commit',
        'Send it with `git push -u origin feature/score`',
        'Check the remote branches too with `git branch -a`',
      ],
      hints: [
        'Create and switch with `git switch -c feature/score`, then edit and commit.',
        'The first time you push a new branch, add `-u` (to set up tracking). After that, just `git push` is enough.',
        'If `git branch -a` shows `remotes/origin/feature/score`, you did it.',
      ],
    },
    '4-1': {
      title: 'Undo changes (restore)',
      description:
        'You accidentally broke `{hpFile}` (HP is now 0...). On top of that, you staged README.md by mistake.\n' +
        'Use `git restore` to undo the file change and the staging separately.',
      checks: [
        'Undo the changes to `{hpFile}` and go back to the last commit',
        'Unstage README.md (keep the changes)',
      ],
      hints: [
        '`git status` gives you hints (in English) on how to undo things.',
        '`git restore {hpFile}` returns the file to the last commit (your changes are lost, so be careful!).',
        '`git restore --staged README.md` unstages it while keeping the changes.',
      ],
    },
    '4-2': {
      title: 'Redo the last commit (reset)',
      description:
        'You made the last commit with the message "typo" by mistake. You have not pushed yet, so you can redo it.\n' +
        'Use `git reset --soft HEAD~1` to undo just the commit, then commit again with a proper message.',
      checks: [
        'Undo the last commit with `git reset --soft HEAD~1` (the changes stay staged)',
        'Commit again with a clear message',
      ],
      hints: [
        '`HEAD~1` means "one commit before the current one".',
        'With `--soft`, only the commit is undone and the changes stay staged.',
        'Then commit again with `git commit -m "Add jump height"`. (`git commit --amend -m "..."` also works.)',
      ],
    },
    '4-3': {
      title: 'Cancel out a pushed commit (revert)',
      description:
        'You already pushed a buggy commit that sets HP to 0.\n' +
        'Without erasing history everyone already shares, fix it with `git revert`, which creates a new commit that cancels it out.',
      checks: [
        'Cancel out the buggy commit with `git revert HEAD`',
        'Share the revert with your team using `git push`',
      ],
      hints: [
        'Use `git log --oneline` to find the buggy commit. This time it is the newest one.',
        '`git revert HEAD` creates a new commit that applies the opposite of the latest commit (the message is filled in for you).',
        'Unlike reset, it does not erase history, so it is safe even after pushing. Finish with `git push`.',
      ],
    },
    '4-4': {
      title: 'Put work aside for now (stash)',
      description:
        'You are in the middle of editing `{featureFile}` when something urgent comes up. But you do not want to commit yet...\n' +
        'Use `git stash` to put your work away temporarily and take it back out later.',
      checks: [
        'Put away your in-progress changes with `git stash`',
        'Check the stashed changes with `git stash list`',
        'Take them back out with `git stash pop` and continue working',
      ],
      hints: [
        'After `git stash`, your changes look like they disappeared, but they are safely stored. Check the editor too.',
        '`git stash list` shows the list of stashed changes.',
        '`git stash pop` takes the stashed changes back out and restores them.',
      ],
    },
    '4-5': {
      title: 'Recover lost commits (reflog)',
      description:
        'Oops! You erased two important commits with `git reset --hard`.\n' +
        'Don\'t worry. Git keeps a record of where HEAD has moved (the reflog). Let\'s recover them from there.',
      checks: ['View the record of HEAD movements with `git reflog`', 'Go back to the lost commit'],
      hints: [
        'Lost commits do not show up in `git log`. Use `git reflog` instead.',
        'In the reflog, `HEAD@{1}` is the position right before the reset.',
        '`git reset --hard HEAD@{1}` takes you back to that position.',
      ],
    },
    '4-6': {
      title: 'Wrap-up: clean up every mistake',
      description:
        'What a mess! `{mainFile}` has unwanted changes, and the latest commit you already pushed has a bug.\n' +
        'Use the commands from this chapter to clean everything up.',
      checks: ['Undo the unwanted changes in `{mainFile}`', 'Cancel out the buggy commit', 'Share it with your team'],
      hints: [
        'Start by checking the situation with `git status` and `git log --oneline`.',
        'Discard in-progress changes with `git restore`; cancel out a pushed commit with `git revert`.',
        'Finish by sending it with `git push`.',
      ],
    },
    '5-1': {
      title: 'Move your base (rebase)',
      description:
        'While you were working on `feature/menu`, `main` moved ahead.\n' +
        'Use `git rebase main` to move your commits on top of the latest `main` and make the history a straight line. Watch how the graph changes shape!',
      checks: [
        'Check the fork in the history with `git log --oneline --graph --all`',
        'Move `feature/menu` on top of the latest `main`',
      ],
      hints: [
        'You are on `feature/menu`. Just type `git rebase main`.',
        'Rebase "takes your commits off and reattaches them to the tip of the other branch". No merge commit is created, so the history stays straight.',
        'Note: rebasing a branch you already pushed puts it out of sync with your team\'s history. Use it only on branches that are yours alone.',
      ],
    },
    '5-2': {
      title: 'Grab just one commit (cherry-pick)',
      description:
        'The `feature/experiment` branch has an experimental commit and a commit "Fix HP calculation bug".\n' +
        'You want only the bug fix in `main` right away! Use `git cherry-pick` to bring over just that commit.',
      checks: [
        'Find the commit you want with `git log --oneline feature/experiment`',
        'Bring only the bug-fix commit into `main`',
      ],
      hints: [
        '`git log --oneline feature/experiment` shows a short ID (hash) to the left of each commit.',
        '`git cherry-pick <hash>` brings just that commit\'s changes into your current branch.',
        'Pick the hash of "Fix HP calculation bug". Don\'t bring over the experimental commit!',
      ],
    },
    '5-3': {
      title: 'Add a marker (tag)',
      description:
        'Version 1.0 of the game is done!\n' +
        'Put a `v1.0` tag (a bookmark) on the current commit so you can come back to this state anytime.',
      checks: [
        'Add a tag with `git tag v1.0`',
        'List tags with `git tag`',
        'View the tagged commit with `git show v1.0`',
      ],
      hints: [
        '`git tag v1.0` puts a marker on the current commit. The tag also appears in the graph.',
        'Typing just `git tag` shows the list.',
        'You can use a tag name instead of a commit hash. Try `git show v1.0` to see what is inside.',
      ],
    },
    '5-4': {
      title: 'Wrap-up: release with a clean history',
      description:
        'Your work on `feature/menu` is done, but `main` has moved ahead.\n' +
        'Straighten the history with rebase, bring it into `main` (this becomes a fast-forward merge with no merge commit), and add a `v2.0` tag.',
      checks: [
        'Move `feature/menu` on top of the latest `main`',
        'Bring `feature/menu` into `main` (no merge commit)',
        'Add the `v2.0` tag',
      ],
      hints: [
        'First, run `git rebase main` on `feature/menu`.',
        'Next, `git switch main`, then `git merge feature/menu`. Since the history is straight, it will be a "Fast-forward".',
        'Finally, `git tag v2.0`.',
      ],
    },
    '6-1': {
      title: 'Exercise 1: The everyday workflow',
      description:
        'Try the basic team workflow from start to finish on your own.\n' +
        '① Get the latest `main` → ② Create a `feature/item` branch → ③ Edit `{featureFile}` and commit → ④ Push the branch',
      checks: [
        'Get the latest `main`',
        'Edit `{featureFile}` on the `feature/item` branch and commit',
        'Push `feature/item` to the remote',
      ],
      hints: [
        'The basic rule is to start by updating main with `git pull`.',
        '`git switch -c feature/item` → edit → `git add` → `git commit -m "..."`',
        'For the first push, use `git push -u origin feature/item`.',
      ],
    },
    '6-2': {
      title: 'Exercise 2: Your push was rejected!',
      description:
        'You fixed `{featureFile}` and committed. You run `git push` right away... and it gets rejected.\n' +
        'It turns out a teammate pushed first. Stay calm, bring in their changes, then push again.',
      checks: [
        'Try `git push` (it gets rejected)',
        'Bring in your teammate\'s changes with `git pull`',
        'Run `git push` again so the remote has both changes',
      ],
      hints: [
        'If you see `[rejected]`, it means "the remote has changes you do not have".',
        'Bring them in with `git pull`. Since you changed different files, they merge automatically (the message is filled in for you).',
        'Once that is done, run `git push` again.',
      ],
    },
    '6-3': {
      title: 'Exercise 3: A conflict with a teammate',
      description:
        'You changed the starting HP in `{hpFile}` to 120, and a teammate changed it to 150 and pushed first. It is the same line, so there will be a conflict.\n' +
        'Pull, fix the conflict, set it to "130" as the team agreed, then push.',
      checks: [
        'Run `git pull` and trigger the conflict',
        'Set HP to 130 to resolve the conflict, and commit the merge',
        'Sync with your team using `git push`',
      ],
      hints: [
        'When you run `git pull`, you will see CONFLICT. Look at the color-coded section in the editor.',
        'Rewrite everything from `<<<<<<<` to `>>>>>>>` so that only one line with HP 130 remains.',
        'After fixing, run `git add {hpFile}` → `git commit` → `git push`.',
      ],
    },
  },
};

export default overlay;
