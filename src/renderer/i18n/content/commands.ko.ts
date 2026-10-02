import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  categories: {
    basics: '기본',
    history: '이력 보기',
    branch: '브랜치',
    remote: '원격',
    undo: '되돌리기',
    advanced: '응용',
  },
  commands: {
    init: {
      summary: '지금 있는 폴더를 Git 저장소로 만든다',
      description:
        '폴더 안에 `.git` 이라는 숨김 폴더를 만들어, 변경 내용을 기록할 수 있는 상태로 만듭니다. 프로젝트마다 맨 처음에 한 번만 사용합니다.',
      examples: ['지금 폴더에서 Git 사용을 시작한다'],
      options: ['첫 브랜치 이름을 정한다 (예: -b main)'],
      sourcetree: '"New..." → "Create Local Repository" (로컬 저장소 만들기)',
    },
    status: {
      summary: '현재 상태(변경·스테이지·브랜치)를 확인한다',
      description:
        '어떤 파일이 변경되었는지, 무엇이 스테이지에 올라가 있는지, 지금 어느 브랜치에 있는지를 보여 줍니다. 헷갈리면 일단 `git status`. 몇 번을 입력해도 아무것도 망가지지 않습니다.',
      examples: ['자세히 표시한다', '한 줄씩 짧게 표시한다 (?? 는 추적되지 않음, M 은 변경됨)'],
      options: ['짧은 형식으로 표시한다'],
      sourcetree: '왼쪽의 "File Status" (파일 상태) 화면',
    },
    add: {
      summary: '변경 내용을 스테이지에 올린다 (다음 커밋에 넣는다)',
      description:
        '커밋은 "스테이지에 올라가 있는 것"을 기록합니다. add 는 기록하고 싶은 변경을 골라 스테이지에 올리는 작업입니다. 사진을 찍기 전에 찍힐 사람들을 줄 세우는 느낌입니다.',
      examples: ['파일 하나만 올린다', '지금 폴더 아래의 변경을 한꺼번에 올린다'],
      options: ['지금 폴더 아래의 모든 것', '삭제를 포함한 모든 변경'],
      sourcetree: '파일을 "Stage" 한다 (체크박스에 체크)',
    },
    commit: {
      summary: '스테이지의 내용을 이력으로 기록한다',
      description:
        '스테이지에 올라간 변경을 하나의 "커밋"으로 저장합니다. 커밋에는 "무엇을 했는지" 메시지를 붙입니다. 나중에 다시 보거나 되돌아갈 수 있는 세이브 포인트입니다.',
      examples: ['메시지를 붙여서 커밋', '추적 중인 파일의 변경을 add 해서 한꺼번에 커밋', '직전 커밋을 다시 만든다'],
      options: [
        '메시지를 지정한다',
        '추적 중인 파일의 변경을 자동으로 add 한다 (새 파일은 제외)',
        '직전 커밋을 다시 한다 (push 전에만)',
      ],
      caution: '메시지는 "무엇을 했는지" 나중에 알 수 있도록 씁시다. "수정"만 쓰면 무엇을 고쳤는지 알 수 없습니다.',
      sourcetree: '위쪽 "Commit" 버튼 → 메시지를 쓰고 "Commit"',
    },
    log: {
      summary: '커밋 이력을 본다',
      description: '지금까지의 커밋을 최신순으로 보여 줍니다. 누가·언제·무엇을 했는지 알 수 있습니다.',
      examples: ['커밋 하나를 한 줄로 표시', '모든 브랜치의 갈라짐을 그림으로 표시', '지정한 브랜치의 이력을 본다'],
      options: ['한 줄씩 짧게 표시', '갈라짐을 선으로 표시', '모든 브랜치를 표시', '최신 것부터 지정한 개수만 표시'],
      sourcetree: '왼쪽의 "History" (이력) 화면',
    },
    diff: {
      summary: '변경한 내용(차이)을 본다',
      description:
        '파일의 어느 줄을 추가·삭제했는지 보여 줍니다. `+` 가 추가, `-` 가 삭제입니다. 커밋 전에 확인하는 습관을 들이면 실수가 줄어듭니다.',
      examples: ['아직 스테이지에 올리지 않은 변경을 본다', '스테이지에 올린 변경을 본다', '두 브랜치의 차이를 본다'],
      options: ['스테이지에 올라간 변경을 표시'],
      sourcetree: '파일을 선택하면 오른쪽 아래에 나오는 차이',
    },
    show: {
      summary: '커밋 하나의 내용을 본다',
      description: '커밋 메시지와, 그 커밋에서 바뀐 내용을 보여 줍니다. 아무것도 지정하지 않으면 최신 커밋입니다.',
      examples: ['최신 커밋을 본다', '태그를 붙인 커밋을 본다'],
      options: [],
      sourcetree: '"History" 에서 커밋을 선택',
    },
    branch: {
      summary: '브랜치 목록을 보거나 만들거나 지운다',
      description:
        '브랜치는 작업의 갈래입니다. 본류(main)를 망가뜨리지 않고 새 기능을 시험할 수 있습니다. `git branch` 만 입력하면 목록, 이름을 붙이면 생성(이동은 하지 않음)입니다.',
      examples: ['브랜치 목록 (* 가 지금 있는 브랜치)', '새 브랜치를 만든다', '원격 브랜치도 표시', '병합이 끝난 브랜치를 지운다'],
      options: ['원격 브랜치도 포함해서 표시', '브랜치를 지운다 (병합된 것만)', '병합하지 않았어도 강제로 지운다 (주의)'],
      sourcetree: '위쪽 "Branch" 버튼 / 왼쪽 브랜치 목록',
    },
    switch: {
      summary: '브랜치를 전환한다',
      description: '작업할 브랜치로 이동합니다. 파일 내용도 그 브랜치의 상태로 바뀝니다.',
      examples: ['main 으로 이동', '브랜치를 만들고 바로 이동'],
      options: ['새 브랜치를 만들고 전환한다'],
      caution: '아직 커밋하지 않은 변경이 있으면 전환할 수 없을 때가 있습니다. 먼저 커밋하거나 stash 하세요.',
      sourcetree: '왼쪽 브랜치 목록에서 브랜치를 더블클릭',
    },
    checkout: {
      summary: '(옛날 방식) 브랜치 전환 등',
      description:
        '예전부터 있던 명령으로, 브랜치 전환과 파일 복원을 모두 할 수 있습니다. 지금은 역할을 나눈 `switch` (전환)와 `restore` (복원)를 쓰는 것을 추천합니다.',
      examples: ['git switch -c 와 같다'],
      options: ['새 브랜치를 만들고 전환한다'],
      sourcetree: '왼쪽 브랜치 목록에서 브랜치를 더블클릭',
    },
    merge: {
      summary: '다른 브랜치의 변경을 가져와 합친다',
      description:
        '지정한 브랜치의 변경을 지금 있는 브랜치에 합칩니다. 같은 줄을 서로 다르게 바꿨다면 "충돌(컨플릭트)"이 생겨서 직접 고쳐야 합니다.',
      examples: ['feature/jump 를 지금 브랜치에 병합', '충돌 중인 병합을 그만두고 원래대로 되돌린다'],
      options: ['병합을 중단한다', '빨리 감기(fast-forward)가 가능해도 반드시 병합 커밋을 만든다'],
      caution: '충돌이 나면 <<<<<<< ~ >>>>>>> 부분을 고치고 add → commit 하면 병합이 끝납니다.',
      sourcetree: '위쪽 "Merge" 버튼',
    },
    clone: {
      summary: '원격 저장소를 내 컴퓨터에 복제한다',
      description: 'GitHub 등에 있는 저장소를 이력까지 통째로 내 컴퓨터에 복사합니다. 복제 원본은 자동으로 `origin` 이라는 이름으로 등록됩니다.',
      examples: ['game 폴더에 복제', '지금 있는 (빈) 폴더에 복제'],
      options: [],
      sourcetree: '"New..." → "Clone from URL" (URL 에서 복제)',
    },
    remote: {
      summary: '원격(공유 대상)을 확인하거나 등록한다',
      description: '어떤 원격과 연결되어 있는지 확인하거나, 새로 등록합니다. 보통 `origin` 이라는 이름을 씁니다.',
      examples: ['등록된 원격과 URL 을 표시', 'origin 이라는 이름으로 등록'],
      options: ['URL 도 표시한다'],
      sourcetree: '"Settings" → "Remotes" (원격)',
    },
    push: {
      summary: '내 커밋을 원격으로 보낸다',
      description: '내 커밋을 GitHub 등으로 보내 팀과 공유합니다. 원격에 내가 모르는 변경이 있으면 거절되므로, 먼저 pull 합니다.',
      examples: ['지금 브랜치를 보낸다', '새 브랜치를 처음 보낸다'],
      options: ['원격 브랜치와 연결한다 (다음부터는 git push 만으로 보낼 수 있음)'],
      caution: '`--force` 는 다른 사람의 변경을 지워 버릴 수 있습니다. 팀에서는 쓰지 않도록 합시다.',
      sourcetree: '위쪽 "Push" 버튼',
    },
    pull: {
      summary: '원격의 변경을 가져와 합친다',
      description: '`git fetch` (가져오기)와 `git merge` (합치기)를 한 번에 합니다. 작업을 시작하기 전에 pull 해서 최신 상태로 만드는 것이 기본입니다.',
      examples: ['지금 브랜치를 최신으로 만든다'],
      options: ['merge 대신 rebase 로 합친다'],
      sourcetree: '위쪽 "Pull" 버튼',
    },
    fetch: {
      summary: '원격의 정보를 가져오기만 한다 (합치지 않음)',
      description: '원격에서 무엇이 바뀌었는지 가져오지만, 내 파일이나 브랜치는 바꾸지 않습니다. 확인한 뒤에 합치고 싶을 때 씁니다.',
      examples: ['origin 의 최신 정보를 가져온다', 'fetch 후에 origin/main 과의 차이를 확인한다'],
      options: [],
      sourcetree: '위쪽 "Fetch" 버튼',
    },
    restore: {
      summary: '파일의 변경을 취소하거나 스테이지에서 내린다',
      description: '아직 커밋하지 않은 변경을 마지막 커밋 상태로 되돌립니다. `--staged` 를 붙이면 변경은 남긴 채 스테이지에서만 내립니다.',
      examples: ['변경을 버리고 원래대로 되돌린다', '스테이지에서 내린다 (변경은 남음)'],
      options: ['스테이지에서 내린다'],
      caution: '`--staged` 를 붙이지 않은 restore 는 변경을 지웁니다. 되돌릴 수 없으니 주의!',
      sourcetree: '파일을 오른쪽 클릭 → "Discard" (버리기) / "Unstage" (스테이지에서 내리기)',
    },
    reset: {
      summary: '브랜치 위치를 과거 커밋으로 되돌린다',
      description: '커밋을 취소하고 다시 하고 싶을 때 씁니다. `--soft` 는 변경을 스테이지에 남기고, `--hard` 는 변경까지 지웁니다.',
      examples: ['직전 커밋만 취소한다 (변경은 남음)', 'reflog 로 찾은 위치까지 되돌아간다'],
      options: ['커밋만 취소하고 변경은 스테이지에 남긴다', '변경까지 모두 지우고 되돌린다 (주의)', '지금의 바로 전 커밋'],
      caution: '이미 push 한 커밋을 reset 하면 팀의 이력과 어긋나 버립니다. push 후에는 revert 를 씁시다.',
      sourcetree: '"History" 에서 커밋을 오른쪽 클릭 → "Reset current branch to this commit" (현재 브랜치를 이 커밋으로 초기화)',
    },
    revert: {
      summary: '커밋을 상쇄하는 새 커밋을 만든다',
      description: '지정한 커밋과 반대되는 변경을 새 커밋으로 추가합니다. 이력을 지우지 않으므로 이미 push 한 커밋도 안전하게 취소할 수 있습니다.',
      examples: ['최신 커밋을 상쇄한다'],
      options: [],
      sourcetree: '"History" 에서 커밋을 오른쪽 클릭 → "Reverse commit..." (커밋 되돌리기)',
    },
    stash: {
      summary: '작업 중인 변경을 잠시 치워 둔다',
      description: '아직 커밋하고 싶지 않은 작업 중인 변경을 잠시 서랍에 넣어 두고 깨끗한 상태로 만듭니다. 나중에 꺼내서 이어서 할 수 있습니다.',
      examples: ['변경을 치워 둔다', '치워 둔 변경 목록', '마지막으로 치워 둔 변경을 꺼낸다'],
      options: [],
      sourcetree: '위쪽 "Stash" 버튼',
    },
    reflog: {
      summary: 'HEAD 가 움직인 기록을 본다 (사라진 커밋 구출용)',
      description: 'reset 등으로 사라진 것처럼 보이는 커밋도 reflog 에는 한동안 기록이 남아 있습니다. 곤란할 때의 마지막 구원자입니다.',
      examples: ['HEAD 이동 기록을 본다', '하나 전 위치로 되돌아간다'],
      options: [],
      sourcetree: '(SourceTree 에는 직접 대응하는 화면이 없습니다. 명령어만의 기능입니다)',
    },
    rebase: {
      summary: '내 커밋을 다른 커밋 위로 옮겨 붙인다',
      description: '브랜치의 바탕을 최신 main 으로 옮겨서 이력을 일직선으로 만듭니다. 병합 커밋이 늘어나지 않아 이력을 읽기 쉬워집니다.',
      examples: ['지금 브랜치를 main 의 끝으로 옮겨 붙인다', 'rebase 를 그만두고 원래대로 되돌린다'],
      options: ['rebase 를 중단한다', '충돌을 고친 뒤 계속한다'],
      caution: '이미 push 한 브랜치를 rebase 하는 것은 피합시다. 나만 쓰는 브랜치에서 씁니다.',
      sourcetree: '브랜치를 오른쪽 클릭 → "Rebase..." (리베이스)',
    },
    'cherry-pick': {
      summary: '특정 커밋만 지금 브랜치로 가져온다',
      description: '다른 브랜치에 있는 커밋 중 필요한 하나만 가져옵니다. 버그 수정만 먼저 넣고 싶을 때 등에 편리합니다.',
      examples: ['그 커밋의 변경을 지금 브랜치에 적용'],
      options: [],
      sourcetree: '"History" 에서 커밋을 오른쪽 클릭 → "Cherry Pick" (체리픽)',
    },
    tag: {
      summary: '커밋에 이름(책갈피)을 붙인다',
      description: '릴리스한 버전 등 중요한 커밋에 `v1.0` 같은 이름을 붙입니다. 해시 대신 쓸 수 있어 편리합니다.',
      examples: ['지금 커밋에 태그를 붙인다', '태그 목록', '태그를 원격으로 보낸다'],
      options: ['설명이 붙은 태그를 만든다'],
      sourcetree: '위쪽 "Tag" 버튼',
    },
    config: {
      summary: 'Git 설정(이름·이메일 등)을 보거나 바꾼다',
      description: '커밋에 기록되는 이름이나 이메일 주소 등을 설정합니다. 새 PC 에서 처음에 한 번 설정합니다.',
      examples: ['커밋에 기록되는 이름', '이메일 주소', '지금 설정을 목록으로 본다'],
      options: ['이 PC 의 모든 저장소에 적용'],
      caution: '이 앱 안에서 한 설정은 연습용 설정 파일에 저장됩니다 (PC 원래의 설정은 바뀌지 않습니다).',
      sourcetree: '"Tools" → "Options" (Mac 은 "Preferences")',
    },
  },
};

export default overlay;
