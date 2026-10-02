import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  chapters: {
    basics: {
      title: '첫걸음',
      summary: '변경을 기록하는 기본 흐름. add와 commit의 의미를 이해해 봅시다.',
    },
    branch: {
      title: '브랜치',
      summary: '작업을 갈라서 병렬로 개발해요. 충돌을 해결하는 방법도 배웁니다.',
    },
    remote: {
      title: '원격 저장소',
      summary: '팀과 코드를 공유해요. push와 pull의 흐름을 체험해 봅시다.',
    },
    undo: {
      title: '되돌리기',
      summary: '실수해도 괜찮아요. 변경이나 히스토리를 되돌리는 방법.',
    },
    advanced: {
      title: '응용',
      summary: '히스토리를 깔끔하게 정리하는 테크닉.',
    },
    team: {
      title: '팀 개발',
      summary: '팀원이 먼저 push했다! 실전 종합 연습.',
      commands: ['종합 연습'],
    },
  },
  lessons: {
    '1-1': {
      title: '저장소를 만들어 보자',
      description:
        '이 폴더에는 게임 코드가 있지만, 아직 Git으로 관리되고 있지 않아요.\n' +
        '먼저 `git init`으로 변경을 기록해 나갈 "저장소(리포지토리)"를 만들어 봅시다.',
      checks: ['`git init`으로 저장소를 만든다', '`ls -a`로 `.git` 폴더가 생긴 것을 확인한다'],
      hints: [
        '저장소를 만드는 명령어는 `git init`입니다.',
        '`.`으로 시작하는 파일이나 폴더는 평소에 숨겨져 있어요. `ls -a`로 전부 볼 수 있습니다.',
        '앞으로의 모든 변경 기록은 `.git` 폴더 안에 저장됩니다.',
      ],
    },
    '1-2': {
      title: '상태를 확인해 보자',
      description:
        'Git을 쓸 때 가장 자주 입력하는 명령어가 `git status`입니다.\n' +
        '지금 어떤 파일이 변경되었고, 무엇이 아직 기록되지 않았는지 알려 줘요. 헷갈리면 일단 `git status`!',
      checks: ['`git status`로 상태를 본다', '`git status -s`로 짧은 표시도 봐 본다'],
      hints: [
        '`git status`를 입력해 봅시다. 빨간 파일은 "Git이 아직 기록하지 않은 파일"입니다.',
        '`-s`를 붙이면 한 줄씩 짧게 표시돼요. `??`는 "아직 추적하지 않음"이라는 뜻입니다.',
      ],
    },
    '1-3': {
      title: '스테이징 영역에 올리자',
      description:
        '커밋(기록)하기 전에 "다음 기록에 넣을 파일"을 골라 스테이징 영역에 올립니다.\n' +
        '먼저 `{featureFile}`만 올리고, 그다음 나머지도 한꺼번에 올려 봅시다. 오른쪽 아래의 "파일 위치"도 살펴보세요.',
      checks: [
        '`{featureFile}`만 스테이징 영역에 올린다',
        '나머지 파일도 한꺼번에 스테이징 영역에 올린다',
        '`git status`로 스테이징 영역에 올라간 것을 확인한다',
      ],
      hints: [
        '파일 하나를 올리려면 `git add {featureFile}`입니다.',
        '`git add .`으로 폴더 안의 변경을 한꺼번에 올릴 수 있어요(`.`은 "지금 있는 폴더"라는 뜻).',
        '스테이징 영역에 올라간 파일은 `git status`에서 초록색이 됩니다.',
      ],
    },
    '1-4': {
      title: '첫 커밋',
      description:
        '스테이징 영역에 올린 파일을 드디어 기록(커밋)합니다.\n' +
        '커밋에는 "무엇을 했는지" 적은 메시지를 꼭 붙여요. 오른쪽 위의 커밋 그래프에 동그라미가 하나 늘어날 거예요.',
      checks: ['메시지를 붙여서 커밋한다', '`git log`로 커밋이 기록된 것을 확인한다'],
      hints: [
        '`git commit -m "첫 커밋"`처럼 `-m` 뒤에 메시지를 씁니다.',
        '메시지는 나중에 봐도 "무엇을 했는지" 알 수 있게 씁시다.',
        '`git log`로 기록 목록을 볼 수 있어요.',
      ],
    },
    '1-5': {
      title: '히스토리를 보자',
      description:
        '이 저장소에는 이미 몇 개의 커밋이 있어요.\n' +
        '`git log`를 사용해서 누가 언제 무엇을 했는지 읽어 봅시다.',
      checks: [
        '`git log`로 히스토리를 본다',
        '`git log --oneline`으로 한 줄씩 표시한다',
        '`git show`로 최신 커밋의 내용을 본다',
      ],
      hints: [
        '`git log`는 최신순으로 표시됩니다.',
        '`--oneline`을 붙이면 커밋 하나당 한 줄의 간결한 표시가 돼요.',
        '`git show`로 최신 커밋에서 어디가 바뀌었는지 볼 수 있습니다.',
      ],
    },
    '1-6': {
      title: '차이를 보자',
      description:
        '`{featureFile}`에 아직 커밋하지 않은 변경이 있어요.\n' +
        '커밋하기 전에 `git diff`로 "무엇을 바꿨는지" 확인하는 건 아주 중요한 습관입니다.',
      checks: [
        '`git diff`로 변경 내용을 본다',
        '`{featureFile}`을 스테이징 영역에 올린다',
        '`git diff --staged`로 스테이징 영역의 내용을 본다',
        '커밋한다',
      ],
      hints: [
        '`+`로 시작하는 초록 줄이 추가, `-`로 시작하는 빨간 줄이 삭제입니다.',
        '스테이징 영역에 올리면 `git diff`에는 나오지 않아요. 올린 부분은 `git diff --staged`로 볼 수 있습니다.',
        '마지막으로 `git commit -m "메시지"`로 커밋합시다.',
      ],
    },
    '2-1': {
      title: '브랜치가 뭐야?',
      description:
        '브랜치는 "작업의 갈림길"입니다. 본류인 `main`을 망가뜨리지 않고, 다른 가지에서 새 기능을 시험해 볼 수 있어요.\n' +
        '먼저 브랜치 목록을 보고, 새 브랜치를 하나 만들어 봅시다.',
      checks: [
        '`git branch`로 브랜치 목록을 본다',
        '`feature/title` 브랜치를 만든다',
        '다시 `git branch`로 늘어난 것을 확인한다',
      ],
      hints: [
        '`git branch`만 입력하면 목록이 나와요. `*`가 붙은 것이 지금 있는 브랜치입니다.',
        '`git branch feature/title`로 새 브랜치를 만들 수 있어요(만들기만 하고 이동은 하지 않습니다).',
        '브랜치 이름은 "무슨 작업인지" 알 수 있게 지읍시다. `feature/〜`는 새 기능에 자주 쓰는 이름이에요.',
      ],
    },
    '2-2': {
      title: '브랜치를 전환해 보자',
      description:
        '`feature/sound` 브랜치가 이미 준비되어 있어요.\n' +
        '브랜치를 오가면서 커밋 그래프의 `HEAD`(지금 있는 위치)가 움직이는 것을 봐 봅시다.',
      checks: [
        '`feature/sound`로 전환한다',
        '`main`으로 돌아간다',
        '새 브랜치 `feature/menu`를 만들고 바로 전환한다',
      ],
      hints: [
        '`git switch feature/sound`로 전환할 수 있어요.',
        '`git switch main`으로 본류에 돌아갑니다.',
        '`git switch -c feature/menu`는 "만들고 전환하기"를 한 번에 할 수 있어요.',
      ],
    },
    '2-3': {
      title: '브랜치를 만들고 새 기능을 추가하자',
      description:
        'main 브랜치를 직접 건드리는 건 위험해요.\n' +
        '새로 `feature/jump` 브랜치를 만들어 전환하고, 거기서 `{featureFile}`에 점프 처리를 추가해 커밋합시다.',
      checks: ['`feature/jump` 브랜치를 만든다', '`feature/jump`로 전환한다', '`{featureFile}`을 편집해서 커밋한다'],
      hints: [
        '변경을 커밋하기 전에 먼저 스테이징 영역에 올려야 해요. 어떤 명령어를 쓰는지 떠올려 봅시다.',
        '`git add {featureFile}`로 스테이징 영역에 올릴 수 있어요.',
        '`git commit -m "점프 추가"`로 커밋할 수 있습니다.',
      ],
    },
    '2-4': {
      title: '브랜치를 병합(머지)하자',
      description:
        '`feature/jump` 브랜치에서 점프 기능이 완성되었어요.\n' +
        '본류인 `main`에 가져오고(병합하고), 다 쓴 브랜치를 정리합시다.',
      checks: [
        '`git log --oneline --all`로 모든 브랜치의 히스토리를 본다',
        '`main`에 `feature/jump`를 병합한다',
        '다 쓴 `feature/jump` 브랜치를 삭제한다',
      ],
      hints: [
        '병합은 "가져오는 쪽" 브랜치에 있는 상태에서 실행합니다. 지금은 `main`에 있어요.',
        '`git merge feature/jump`로 병합할 수 있어요.',
        '병합이 끝난 브랜치는 `git branch -d feature/jump`로 삭제할 수 있습니다.',
      ],
    },
    '2-5': {
      title: '충돌을 해결하자',
      description:
        '`main`과 `feature/hp` 양쪽에서 `{hpFile}`의 같은 줄(HP 초깃값)이 서로 다르게 변경되었어요.\n' +
        '병합하면 Git이 어느 쪽을 고를지 정하지 못해 "충돌(컨플릭트)"이 됩니다. 에디터에서 고치고 병합을 완료합시다.',
      checks: [
        '`git merge feature/hp`로 병합해 본다',
        '에디터에서 `<<<<<<<` 〜 `>>>>>>>`를 지워서 고치고 `git add`한다',
        '커밋해서 병합을 완료한다',
      ],
      hints: [
        '`<<<<<<< HEAD`부터 `=======`까지가 지금 브랜치(main = Ours), `=======`부터 `>>>>>>>`까지가 가져오려는 브랜치(Theirs)의 내용입니다.',
        '어느 값으로 할지 정하고, `<<<<<<<` `=======` `>>>>>>>` 줄까지 포함해서 지운 뒤 올바른 한 줄만 남깁니다.',
        '고쳤으면 `git add {hpFile}`, 마지막으로 `git commit`하면 병합 완료예요(메시지는 자동으로 들어갑니다).',
      ],
    },
    '3-1': {
      title: '저장소를 복제하자 (clone)',
      description:
        '팀의 저장소가 "원격 저장소"(GitHub 같은 공유 장소)에 있어요. 먼저 내 컴퓨터로 복제(clone)합시다.\n' +
        '이 앱에서는 연습용 원격 저장소를 `{remoteUrl}`에 준비해 두었어요. 마지막의 `.`은 "지금 있는 폴더에"라는 뜻입니다.',
      checks: [
        '`git clone {remoteUrl} .`로 복제한다',
        '`git remote -v`로 복제 원본(origin)을 확인한다',
        '`git log --oneline`으로 히스토리도 함께 온 것을 확인한다',
      ],
      hints: [
        '`git clone {remoteUrl} .`을 입력합시다. 실제 GitHub라면 URL은 https://github.com/... 형태가 됩니다.',
        '복제 원본은 자동으로 `origin`이라는 이름으로 등록돼요. `git remote -v`로 확인할 수 있습니다.',
        'clone하면 파일뿐 아니라 지금까지의 히스토리도 모두 내 컴퓨터로 옵니다.',
      ],
    },
    '3-2': {
      title: '변경을 보내자 (push)',
      description:
        '내 컴퓨터에서 커밋만 해서는 팀원들에게 전달되지 않아요.\n' +
        '`{featureFile}`을 편집해서 커밋하고, `git push`로 원격 저장소에 보냅시다. 커밋 그래프의 `origin/main`이 따라오는 걸 보세요.',
      checks: [
        '`{featureFile}`을 편집해서 커밋한다',
        '`git push`로 원격 저장소에 보낸다',
        '`git status`로 "up to date"가 된 것을 확인한다',
      ],
      hints: [
        '먼저 평소처럼 `git add` → `git commit -m "..."`입니다.',
        '커밋했으면 `git push`로 보냅니다. `origin/main`은 원격 저장소의 main 위치를 나타내요.',
        '`git status`에 `Your branch is up to date with \'origin/main\'`이 나오면 잘 보내진 거예요.',
      ],
    },
    '3-3': {
      title: '팀원의 변경을 가져오자 (pull)',
      description:
        '팀원이 README를 업데이트해서 push했어요. 내 컴퓨터에는 아직 그 변경이 없습니다.\n' +
        '`git pull`로 가져와서 최신 상태로 만듭시다.',
      checks: [
        '`git pull`로 가져온다',
        '`git log --oneline`으로 팀원의 커밋을 확인한다',
        '`cat README.md`로 내용도 확인한다',
      ],
      hints: [
        '`git pull`은 "원격 저장소에서 가져오고(fetch), 합치기(merge)"를 한 번에 하는 명령어입니다.',
        '`git log --oneline`에 팀원의 커밋이 늘어나 있을 거예요.',
        '에디터의 README.md도 자동으로 새 내용으로 바뀌어 있어요.',
      ],
    },
    '3-4': {
      title: '가져오기만 하자 (fetch)',
      description:
        '팀원이 또 push했어요. 이번에는 바로 합치지 말고, 먼저 `git fetch`로 "무엇이 바뀌었는지" 보고 나서 가져옵니다.\n' +
        '신중하게 진행하고 싶을 때 편리한 방법이에요.',
      checks: [
        '`git fetch`로 원격 저장소의 정보만 가져온다',
        '`git log --oneline --all`로 `origin/main`이 앞서 있는 것을 본다',
        '`git merge origin/main`으로 합친다',
      ],
      hints: [
        '`git fetch`는 원격 저장소의 최신 정보를 가져오기만 하고, 내 파일은 바꾸지 않아요.',
        '커밋 그래프에서 `origin/main`이 `main`보다 위에 있는 게 보일 거예요.',
        '확인했으면 `git merge origin/main`으로 합칩니다(pull = fetch + merge입니다).',
      ],
    },
    '3-5': {
      title: '브랜치를 보내자',
      description:
        '팀 개발에서는 main에 직접 push하지 않고, 내 브랜치를 push해서 리뷰를 받아요.\n' +
        '`feature/score` 브랜치에서 작업하고 원격 저장소에 보냅시다.',
      checks: [
        '`feature/score` 브랜치를 만들고 커밋한다',
        '`git push -u origin feature/score`로 보낸다',
        '`git branch -a`로 원격 브랜치도 확인한다',
      ],
      hints: [
        '`git switch -c feature/score`로 만들고 전환한 뒤, 편집해서 커밋합시다.',
        '새 브랜치를 처음 보낼 때는 `-u`(추적 설정)를 붙여요. 다음부터는 `git push`만으로 보낼 수 있습니다.',
        '`git branch -a`에 `remotes/origin/feature/score`가 나오면 성공이에요.',
      ],
    },
    '4-1': {
      title: '변경을 취소하자 (restore)',
      description:
        '`{hpFile}`을 실수로 망가뜨렸어요(HP가 0으로…). 게다가 README.md를 잘못해서 스테이징 영역에 올려 버렸습니다.\n' +
        '`git restore`로 파일의 변경과 스테이징을 각각 되돌립시다.',
      checks: [
        '`{hpFile}`의 변경을 취소하고 마지막 커밋 상태로 되돌린다',
        'README.md를 스테이징 영역에서 내린다(변경은 남긴다)',
      ],
      hints: [
        '`git status`에 어떻게 취소하면 되는지 영어로 힌트가 적혀 있어요.',
        '`git restore {hpFile}`로 파일을 마지막 커밋 상태로 되돌릴 수 있어요(변경이 사라지니 주의!).',
        '`git restore --staged README.md`로 변경은 남긴 채 스테이징 영역에서 내릴 수 있습니다.',
      ],
    },
    '4-2': {
      title: '직전 커밋을 다시 하자 (reset)',
      description:
        '직전 커밋의 메시지를 "typo"인 채로 남겨 버렸어요. 아직 push하지 않았으니 다시 할 수 있습니다.\n' +
        '`git reset --soft HEAD~1`로 커밋만 취소하고, 올바른 메시지로 다시 커밋합시다.',
      checks: [
        '`git reset --soft HEAD~1`로 직전 커밋을 취소한다(변경은 스테이징 영역에 남는다)',
        '알기 쉬운 메시지로 다시 커밋한다',
      ],
      hints: [
        '`HEAD~1`은 "지금 커밋의 하나 전"이라는 뜻입니다.',
        '`--soft`를 붙이면 커밋만 취소하고 변경은 스테이징 영역에 남아요.',
        '그대로 `git commit -m "점프 높이 추가"`로 다시 커밋합시다. (`git commit --amend -m "..."`로도 고칠 수 있어요)',
      ],
    },
    '4-3': {
      title: 'push한 커밋을 상쇄하자 (revert)',
      description:
        'HP를 0으로 만드는 버그가 든 커밋을 이미 push해 버렸어요.\n' +
        '모두와 공유된 히스토리는 지우지 말고, "상쇄하는 커밋"을 새로 만드는 `git revert`로 고칩시다.',
      checks: ['`git revert HEAD`로 버그 커밋을 상쇄한다', '`git push`로 상쇄한 내용을 팀에 공유한다'],
      hints: [
        '`git log --oneline`으로 어느 커밋이 버그인지 확인합시다. 이번에는 가장 최신 커밋이에요.',
        '`git revert HEAD`로 최신 커밋과 반대되는 변경을 담은 새 커밋이 만들어져요(메시지는 자동으로 들어갑니다).',
        'reset과 달리 히스토리를 지우지 않으니 push한 뒤라도 안전합니다. 마지막으로 `git push`합시다.',
      ],
    },
    '4-4': {
      title: '작업을 잠시 치워 두자 (stash)',
      description:
        '`{featureFile}`을 편집하던 중에 급하게 다른 작업을 하게 됐어요. 그런데 아직 커밋하고 싶지는 않아요…\n' +
        '`git stash`로 작업을 잠시 치워 두고, 나중에 다시 꺼냅시다.',
      checks: [
        '`git stash`로 작업 중인 변경을 치워 둔다',
        '`git stash list`로 치워 둔 변경을 확인한다',
        '`git stash pop`으로 꺼내서 작업으로 돌아간다',
      ],
      hints: [
        '`git stash`를 입력하면 변경이 사라진 것처럼 보이지만, 제대로 보관되어 있어요. 에디터 내용도 확인해 봅시다.',
        '`git stash list`로 치워 둔 변경 목록을 볼 수 있어요.',
        '`git stash pop`으로 치워 둔 변경을 꺼내서 원래대로 되돌릴 수 있습니다.',
      ],
    },
    '4-5': {
      title: '사라진 커밋을 되찾자 (reflog)',
      description:
        '이런! `git reset --hard`로 중요한 커밋 2개를 지워 버렸어요.\n' +
        '하지만 괜찮아요. Git은 HEAD가 움직인 기록(reflog)을 남겨 두고 있어요. 거기서 되찾아 봅시다.',
      checks: ['`git reflog`로 HEAD의 이동 기록을 본다', '사라진 커밋으로 돌아간다'],
      hints: [
        '`git log`에는 사라진 커밋이 나오지 않아요. `git reflog`를 사용합시다.',
        'reflog의 `HEAD@{1}`이 "reset하기 직전"의 위치입니다.',
        '`git reset --hard HEAD@{1}`로 그 위치까지 돌아갈 수 있어요.',
      ],
    },
    '4-6': {
      title: '정리: 실수를 전부 정리하자',
      description:
        '엉망진창인 상황이에요! `{mainFile}`에는 필요 없는 변경이 있고, push한 최신 커밋에는 버그가 있어요.\n' +
        '이 장에서 배운 명령어를 써서 전부 깔끔하게 정리합시다.',
      checks: ['`{mainFile}`의 필요 없는 변경을 취소한다', '버그 커밋을 상쇄한다', '팀에 공유한다'],
      hints: [
        '먼저 `git status`와 `git log --oneline`으로 상황을 확인합시다.',
        '작업 중인 변경을 버리는 건 `git restore`, push한 커밋을 상쇄하는 건 `git revert`입니다.',
        '마지막으로 `git push`로 보내면 완료예요.',
      ],
    },
    '5-1': {
      title: '기반을 옮기자 (rebase)',
      description:
        '`feature/menu`에서 작업하는 동안 `main`이 앞으로 나아갔어요.\n' +
        '`git rebase main`으로 내 커밋을 최신 `main` 위로 옮겨서 히스토리를 일직선으로 만듭시다. 그래프 모양의 변화를 주목!',
      checks: ['`git log --oneline --graph --all`로 갈라진 모습을 확인한다', '`feature/menu`를 최신 `main` 위로 옮긴다'],
      hints: [
        '지금 있는 곳은 `feature/menu`예요. 그대로 `git rebase main`을 입력합시다.',
        'rebase는 "내 커밋을 한 번 떼어 내서 상대 브랜치의 끝에 다시 붙이는" 작업이에요. 병합 커밋이 생기지 않아서 히스토리가 일직선이 됩니다.',
        '주의: 이미 push한 브랜치를 rebase하면 팀의 히스토리와 어긋나 버려요. 나만 쓰는 브랜치에서 사용합시다.',
      ],
    },
    '5-2': {
      title: '하나만 가져오자 (cherry-pick)',
      description:
        '`feature/experiment` 브랜치에는 실험 중인 커밋과 "HP 계산 버그 수정" 커밋이 있어요.\n' +
        '버그 수정만 먼저 `main`에 가져오고 싶어요! `git cherry-pick`으로 그 커밋만 가져옵시다.',
      checks: ['`git log --oneline feature/experiment`로 가져올 커밋을 찾는다', '버그 수정 커밋만 `main`에 가져온다'],
      hints: [
        '`git log --oneline feature/experiment`로 각 커밋 왼쪽에 있는 짧은 ID(해시)를 볼 수 있어요.',
        '`git cherry-pick <해시>`로 그 커밋의 변경만 지금 브랜치로 가져올 수 있습니다.',
        '"HP 계산 버그 수정"의 해시를 고릅시다. 실험 커밋은 가져오지 않도록!',
      ],
    },
    '5-3': {
      title: '표시를 달자 (tag)',
      description:
        '게임 버전 1.0이 완성되었어요!\n' +
        '지금 커밋에 `v1.0`이라는 태그(책갈피)를 달아서, 나중에 언제든 이 상태를 볼 수 있게 합시다.',
      checks: ['`git tag v1.0`으로 태그를 단다', '`git tag`로 태그 목록을 본다', '`git show v1.0`으로 태그가 달린 커밋을 본다'],
      hints: [
        '`git tag v1.0`으로 지금 커밋에 표시가 달려요. 그래프에도 태그가 표시됩니다.',
        '`git tag`만 입력하면 목록이 나와요.',
        '태그 이름은 커밋 해시 대신 쓸 수 있어요. `git show v1.0`으로 내용을 봐 봅시다.',
      ],
    },
    '5-4': {
      title: '정리: 깔끔한 히스토리로 릴리스',
      description:
        '`feature/menu` 작업이 끝났어요. 그런데 `main`이 앞으로 나아가 있어요.\n' +
        'rebase로 히스토리를 일직선으로 만든 뒤 `main`에 가져오고(병합 커밋을 만들지 않는 fast-forward 병합이 됩니다), `v2.0` 태그를 답시다.',
      checks: [
        '`feature/menu`를 최신 `main` 위로 옮긴다',
        '`main`에 `feature/menu`를 가져온다(병합 커밋 없음)',
        '`v2.0` 태그를 단다',
      ],
      hints: [
        '먼저 `feature/menu`에서 `git rebase main`.',
        '다음으로 `git switch main`한 뒤 `git merge feature/menu`. 일직선이라서 "Fast-forward"가 됩니다.',
        '마지막으로 `git tag v2.0`입니다.',
      ],
    },
    '6-1': {
      title: '연습 1: 평소의 개발 흐름',
      description:
        '팀 개발의 기본 흐름을 처음부터 끝까지 스스로 해 봅시다.\n' +
        '① 최신 `main`을 가져온다 → ② `feature/item` 브랜치를 만든다 → ③ `{featureFile}`을 편집해서 커밋 → ④ 브랜치를 push',
      checks: [
        '최신 `main`을 가져온다',
        '`feature/item` 브랜치에서 `{featureFile}`을 편집해서 커밋한다',
        '`feature/item`을 원격 저장소에 push한다',
      ],
      hints: [
        '`git pull`로 main을 최신으로 만든 뒤 시작하는 것이 기본이에요.',
        '`git switch -c feature/item` → 편집 → `git add` → `git commit -m "..."`',
        '처음 push할 때는 `git push -u origin feature/item`입니다.',
      ],
    },
    '6-2': {
      title: '연습 2: push가 거부됐다!',
      description:
        '`{featureFile}`을 고쳐서 커밋했어요. 바로 `git push`…했더니 거부당했습니다.\n' +
        '사실 팀원이 먼저 push했던 거예요. 당황하지 말고 팀원의 변경을 가져온 뒤 다시 보냅시다.',
      checks: [
        '`git push`해 본다(거부된다)',
        '`git pull`로 팀원의 변경을 가져온다',
        '다시 `git push`해서 양쪽 변경을 원격 저장소에 맞춘다',
      ],
      hints: [
        '`[rejected]`가 나오면 "원격 저장소에 내가 모르는 변경이 있다"는 뜻이에요.',
        '`git pull`로 가져옵니다. 서로 다른 파일을 바꿨기 때문에 자동으로 병합돼요(메시지는 자동으로 들어갑니다).',
        '가져왔으면 다시 `git push`합니다.',
      ],
    },
    '6-3': {
      title: '연습 3: 팀원과 충돌',
      description:
        '나는 `{hpFile}`의 HP 초깃값을 120으로, 팀원은 150으로 바꿔서 먼저 push했어요. 같은 줄이라서 충돌이 생깁니다.\n' +
        'pull해서 충돌을 고치고, 팀과 이야기해서 정한 "130"으로 만든 뒤 push합시다.',
      checks: [
        '`git pull`해서 충돌을 일으킨다',
        'HP를 130으로 해서 충돌을 해결하고, 병합을 커밋한다',
        '`git push`로 팀과 맞춘다',
      ],
      hints: [
        '`git pull`하면 CONFLICT가 나와요. 에디터에서 색으로 구분된 부분을 봐 봅시다.',
        '`<<<<<<<`부터 `>>>>>>>`까지를 HP가 130인 한 줄만 남도록 고쳐 씁니다.',
        '고쳤으면 `git add {hpFile}` → `git commit` → `git push`입니다.',
      ],
    },
  },
};

export default overlay;
