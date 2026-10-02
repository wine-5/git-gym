import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  worlds: {
    basics: { title: 'Recording Basics' },
    branch: { title: 'Branch Forest' },
    remote: { title: 'Remote Sea' },
    undo: { title: 'Tower of Do-Overs' },
  },
  stages: {
    's1-1': {
      title: 'Get Started',
      mission: 'Turn this folder into a Git repository',
      hints: ['This command creates a repository', '`git init`'],
    },
    's1-2': {
      title: 'Look Around',
      mission: 'Check the current state',
      hints: ['When in doubt, try this first!', '`git status`'],
    },
    's1-3': {
      title: 'Stage One',
      mission: 'Stage only `{featureFile}`',
      hints: ['Staging is done with add', '`git add {featureFile}`'],
    },
    's1-4': {
      title: 'Stage Them All',
      mission: 'Stage all the remaining files at once',
      hints: ['"Everything in this folder" can be written as .', '`git add .`'],
    },
    's1-5': {
      title: 'Save It',
      mission: 'Commit with a message',
      hints: ['Write the message after -m', '`git commit -m "First commit"`'],
    },
    's1-6': {
      title: 'Look Back',
      mission: 'Show the history one line per commit',
      hints: ['Add an option to log', '`git log --oneline`'],
    },
    's1-7': {
      title: 'Compare',
      mission: 'See what you changed',
      hints: ['This command shows the differences', '`git diff`'],
    },
    's1-8': {
      title: 'Save in One Go',
      mission: 'Do add and commit in a single step',
      hints: ['Adding -a to commit automatically adds the files you changed', '`git commit -am "Save changes"`'],
    },
    's2-1': {
      title: 'Count the Branches',
      mission: 'List the branches',
      hints: ['This command handles branches', '`git branch`'],
    },
    's2-2': {
      title: 'Grow a Branch',
      mission: 'Create a `feature/a` branch',
      hints: ['Put a name after branch', '`git branch feature/a`'],
    },
    's2-3': {
      title: 'Hop On',
      mission: 'Switch to the `feature/a` branch',
      hints: ['Switching is done with switch', '`git switch feature/a`'],
    },
    's2-4': {
      title: 'Create and Hop',
      mission: 'Create `feature/b` and switch to it right away',
      hints: ['Adding -c to switch also creates the branch', '`git switch -c feature/b`'],
    },
    's2-5': {
      title: 'Join the Branches',
      mission: 'Merge `feature/a` into main',
      hints: ['You are on main now. Name the branch you want to bring in', '`git merge feature/a`'],
    },
    's2-6': {
      title: 'Tidy Up',
      mission: 'Delete the already-merged `feature/a`',
      hints: ['Adding -d to branch deletes it', '`git branch -d feature/a`'],
    },
    's3-1': {
      title: 'Meet the Remote',
      mission: 'Check which remotes are connected',
      hints: ['Adding -v to remote also shows the URLs', '`git remote -v`'],
    },
    's3-2': {
      title: 'Send',
      mission: 'Send your local commits to the remote',
      hints: ['Sending is push', '`git push`'],
    },
    's3-3': {
      title: 'Receive',
      mission: "Bring in your teammate's changes",
      hints: ['Fetching and merging in one go is pull', '`git pull`'],
    },
    's3-4': {
      title: 'Peek',
      mission: 'Get the remote info only, without merging it in',
      hints: ['Just fetching is fetch', '`git fetch`'],
    },
    's3-5': {
      title: 'Send a Branch',
      mission: 'Send the `feature/c` branch to the remote',
      hints: ['The first time you push a branch, add -u origin', '`git push -u origin feature/c`'],
    },
    's4-1': {
      title: 'Back to Normal',
      mission: 'Discard the changes to `{featureFile}`',
      hints: ['Restoring a file is done with restore', '`git restore {featureFile}`'],
    },
    's4-2': {
      title: 'Unstage',
      mission: 'Unstage `{featureFile}` (keep the changes)',
      hints: ['Add --staged to restore', '`git restore --staged {featureFile}`'],
    },
    's4-3': {
      title: 'Say It Again',
      mission: 'Fix the message "typo" on the last commit',
      hints: ['You can redo the last commit with --amend', '`git commit --amend -m "Add jump"`'],
    },
    's4-4': {
      title: 'Cancel Out',
      mission: 'Make a commit that cancels out the latest commit',
      hints: ['Undoing while keeping the history is revert', '`git revert HEAD`'],
    },
    's4-5': {
      title: 'Stash It',
      mission: 'Put your work-in-progress changes away for now',
      hints: ['Setting changes aside temporarily is stash', '`git stash`'],
    },
    's4-6': {
      title: 'Take It Out',
      mission: 'Bring back the changes you put away',
      hints: ['Add pop to stash', '`git stash pop`'],
    },
  },
};

export default overlay;
