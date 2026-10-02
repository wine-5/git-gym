import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  categories: {
    basics: 'Basics',
    history: 'History',
    branch: 'Branches',
    remote: 'Remotes',
    undo: 'Undo',
    advanced: 'Advanced',
  },
  commands: {
    init: {
      summary: 'Turn the current folder into a Git repository',
      description:
        'Creates a hidden `.git` folder inside the folder so you can start recording changes. You use it once, at the very start of each project.',
      examples: ['Start using Git in the current folder'],
      options: ['Set the name of the first branch (e.g. -b main)'],
      sourcetree: '"New..." → "Create Local Repository"',
    },
    status: {
      summary: 'Check the current state (changes, staging, branch)',
      description:
        'Shows which files changed, what is on the stage, and which branch you are on. When in doubt, run `git status` first. You can run it as often as you like — it never breaks anything.',
      examples: ['Show the full status', 'Show one short line per file (?? = untracked, M = modified)'],
      options: ['Use the short format'],
      sourcetree: 'The "File Status" view on the left',
    },
    add: {
      summary: 'Put changes on the stage (include them in the next commit)',
      description:
        'A commit records "whatever is on the stage". add is how you choose which changes to record and put them on the stage. Think of it as lining people up before taking a photo.',
      examples: ['Stage just one file', 'Stage all changes in the current folder and below'],
      options: ['Everything in the current folder and below', 'All changes, including deleted files'],
      sourcetree: '"Stage" the file (tick its checkbox)',
    },
    commit: {
      summary: 'Record the staged changes in the history',
      description:
        'Saves the staged changes as one "commit". Each commit gets a message describing what you did. It is a save point you can look back at or return to later.',
      examples: [
        'Commit with a message',
        'Add changes to tracked files and commit them in one step',
        'Redo the previous commit',
      ],
      options: [
        'Set the commit message',
        'Automatically add changes to tracked files (new files are not included)',
        'Redo the previous commit (only before pushing)',
      ],
      caution:
        'Write messages that explain what you did, so you can understand them later. Just "fix" doesn\'t tell anyone what was fixed.',
      sourcetree: 'The "Commit" button at the top → write a message and click "Commit"',
    },
    log: {
      summary: 'View the commit history',
      description: 'Shows past commits, newest first. You can see who did what, and when.',
      examples: [
        'One line per commit',
        'Draw how all branches fork as a graph',
        'View the history of a specific branch',
      ],
      options: [
        'Short, one-line format',
        'Draw branches and merges as lines',
        'Show all branches',
        'Show only the given number of newest commits',
      ],
      sourcetree: 'The "History" view on the left',
    },
    diff: {
      summary: 'See what you changed (the diff)',
      description:
        'Shows which lines you added or removed in each file. `+` means added and `-` means removed. Getting into the habit of checking before you commit cuts down on careless mistakes.',
      examples: [
        'See changes that are not staged yet',
        'See changes that are staged',
        'See the differences between two branches',
      ],
      options: ['Show staged changes'],
      sourcetree: 'The diff shown at the bottom right when you select a file',
    },
    show: {
      summary: 'Look inside a single commit',
      description:
        'Shows a commit\'s message and what changed in it. With no argument, it shows the latest commit.',
      examples: ['View the latest commit', 'View a tagged commit'],
      options: [],
      sourcetree: 'Select a commit in "History"',
    },
    branch: {
      summary: 'List, create, or delete branches',
      description:
        'A branch is a fork in your work. It lets you try new features without breaking the main line (main). `git branch` alone lists branches; adding a name creates one (without moving to it).',
      examples: [
        'List branches (* marks the current one)',
        'Create a new branch',
        'Also show remote branches',
        'Delete a branch that has been merged',
      ],
      options: [
        'Show remote branches too',
        'Delete a branch (merged branches only)',
        'Force delete, even if not merged (careful)',
      ],
      sourcetree: 'The "Branch" button at the top / the branch list on the left',
    },
    switch: {
      summary: 'Switch branches',
      description:
        'Moves you to the branch you want to work on. Your files are also swapped to match that branch.',
      examples: ['Move to main', 'Create a branch and move to it right away'],
      options: ['Create a new branch and switch to it'],
      caution:
        'If you have uncommitted changes, you may not be able to switch. Commit or stash them first.',
      sourcetree: 'Double-click a branch in the branch list on the left',
    },
    checkout: {
      summary: '(Old style) Switch branches and more',
      description:
        'A long-standing command that can both switch branches and restore files. Nowadays it is better to use `switch` (switching) and `restore` (restoring), which split those jobs apart.',
      examples: ['Same as git switch -c'],
      options: ['Create a new branch and switch to it'],
      sourcetree: 'Double-click a branch in the branch list on the left',
    },
    merge: {
      summary: 'Bring in changes from another branch',
      description:
        'Combines the changes from the given branch into the branch you are on. If the same lines were changed differently on each side, you get a "conflict" that you must fix by hand.',
      examples: ['Merge feature/jump into the current branch', 'Stop a merge with conflicts and go back'],
      options: ['Abort the merge', 'Always create a merge commit, even if a fast-forward is possible'],
      caution: 'If a conflict happens, fix the <<<<<<< ... >>>>>>> parts, then add → commit to finish the merge.',
      sourcetree: 'The "Merge" button at the top',
    },
    clone: {
      summary: 'Copy a remote repository to your computer',
      description:
        'Copies a repository from GitHub or elsewhere to your computer, along with its whole history. The source is automatically registered under the name `origin`.',
      examples: ['Clone into a "game" folder', 'Clone into the current (empty) folder'],
      options: [],
      sourcetree: '"New..." → "Clone from URL"',
    },
    remote: {
      summary: 'Check or register remotes (where you share)',
      description:
        'Shows which remotes you are connected to, or registers a new one. The name `origin` is normally used.',
      examples: ['Show registered remotes and their URLs', 'Register a remote named origin'],
      options: ['Show URLs too'],
      sourcetree: '"Settings" → "Remotes"',
    },
    push: {
      summary: 'Send your local commits to the remote',
      description:
        'Sends your commits to GitHub or elsewhere to share them with your team. If the remote has changes you don\'t have, the push is rejected — pull first.',
      examples: ['Push the current branch', 'Push a new branch for the first time'],
      options: ['Link to the remote branch (from then on, just git push is enough)'],
      caution: '`--force` can wipe out other people\'s changes. Avoid using it when working in a team.',
      sourcetree: 'The "Push" button at the top',
    },
    pull: {
      summary: 'Fetch remote changes and merge them in',
      description:
        'Does `git fetch` (download) and `git merge` (combine) in one step. The basic rule: pull to get up to date before you start working.',
      examples: ['Bring the current branch up to date'],
      options: ['Use rebase instead of merge to bring changes in'],
      sourcetree: 'The "Pull" button at the top',
    },
    fetch: {
      summary: 'Just download remote info (without merging)',
      description:
        'Downloads what changed on the remote, but does not touch your local files or branches. Use it when you want to check before bringing changes in.',
      examples: ['Get the latest info from origin', 'After fetching, check the difference from origin/main'],
      options: [],
      sourcetree: 'The "Fetch" button at the top',
    },
    restore: {
      summary: 'Discard file changes or unstage them',
      description:
        'Puts uncommitted changes back to how they were at the last commit. With `--staged`, it removes changes from the stage but keeps them.',
      examples: ['Throw away changes and go back', 'Unstage (the changes are kept)'],
      options: ['Remove from the stage'],
      caution: 'restore without `--staged` deletes your changes. They can\'t be recovered, so be careful!',
      sourcetree: 'Right-click a file → "Discard" / "Unstage"',
    },
    reset: {
      summary: 'Move the branch back to an earlier commit',
      description:
        'Use it when you want to undo commits and start over. `--soft` keeps the changes on the stage; `--hard` deletes the changes too.',
      examples: ['Undo just the last commit (changes are kept)', 'Go back to a position you found with reflog'],
      options: [
        'Undo only the commit; keep the changes on the stage',
        'Delete all changes too (careful)',
        'The commit just before the current one',
      ],
      caution:
        'Resetting commits you have already pushed makes your history differ from the team\'s. After pushing, use revert instead.',
      sourcetree: 'Right-click a commit in "History" → "Reset current branch to this commit"',
    },
    revert: {
      summary: 'Make a new commit that cancels out a commit',
      description:
        'Adds a new commit with the opposite changes of the given commit. Since it doesn\'t erase history, it can safely undo commits that were already pushed.',
      examples: ['Cancel out the latest commit'],
      options: [],
      sourcetree: 'Right-click a commit in "History" → "Reverse commit..."',
    },
    stash: {
      summary: 'Temporarily put away work in progress',
      description:
        'Puts unfinished changes you don\'t want to commit into a drawer for a while, leaving a clean state. Take them out later to continue.',
      examples: ['Put changes away', 'List stashed changes', 'Take out the most recently stashed changes'],
      options: [],
      sourcetree: 'The "Stash" button at the top',
    },
    reflog: {
      summary: 'See where HEAD has moved (to rescue lost commits)',
      description:
        'Even commits that seem to vanish after a reset stay recorded in the reflog for a while. It is your last friend when things go wrong.',
      examples: ['See the record of HEAD movements', 'Go back to the previous position'],
      options: [],
      sourcetree: '(SourceTree has no direct view for this. It is a command-line-only feature.)',
    },
    rebase: {
      summary: 'Move your commits on top of another commit',
      description:
        'Moves the base of your branch onto the latest main so the history is a straight line. No extra merge commits are created, so the history is easier to read.',
      examples: ['Move the current branch onto the tip of main', 'Stop the rebase and go back'],
      options: ['Abort the rebase', 'Continue after fixing conflicts'],
      caution: 'Avoid rebasing branches you have already pushed. Use it only on branches that are yours alone.',
      sourcetree: 'Right-click a branch → "Rebase..."',
    },
    'cherry-pick': {
      summary: 'Bring just one specific commit into the current branch',
      description:
        'Takes only the one commit you need from another branch. Handy when, for example, you want just a bug fix first.',
      examples: ["Apply that commit's changes to the current branch"],
      options: [],
      sourcetree: 'Right-click a commit in "History" → "Cherry Pick"',
    },
    tag: {
      summary: 'Give a commit a name (a bookmark)',
      description:
        'Gives an important commit, such as a released version, a name like `v1.0`. You can use it instead of the hash, which is handy.',
      examples: ['Tag the current commit', 'List tags', 'Send a tag to the remote'],
      options: ['Create a tag with a description'],
      sourcetree: 'The "Tag" button at the top',
    },
    config: {
      summary: 'View or change Git settings (name, email, etc.)',
      description:
        'Sets things like the name and email address recorded in your commits. Do it once when you start using a new PC.',
      examples: ['The name recorded in commits', 'Email address', 'List the current settings'],
      options: ['Apply to every repository on this PC'],
      caution:
        'Settings made inside this app are saved to a practice config file (your PC\'s real settings are not changed).',
      sourcetree: '"Tools" → "Options" ("Preferences" on Mac)',
    },
  },
};

export default overlay;
