import type { ContentOverlay } from '../types';

const overlay: ContentOverlay = {
  worlds: {
    basics: { title: '기록의 기초' },
    branch: { title: '브랜치의 숲' },
    remote: { title: '원격의 바다' },
    undo: { title: '되돌리기의 탑' },
  },
  stages: {
    's1-1': {
      title: '시작하기',
      mission: '이 폴더를 Git 저장소로 만들자',
      hints: ['저장소를 만드는 명령어예요', '`git init`'],
    },
    's1-2': {
      title: '상태 보기',
      mission: '지금 상태를 확인하자',
      hints: ['헷갈리면 일단 이것부터!', '`git status`'],
    },
    's1-3': {
      title: '하나 올리기',
      mission: '`{featureFile}` 만 스테이징하자',
      hints: ['스테이징은 add 로 해요', '`git add {featureFile}`'],
    },
    's1-4': {
      title: '한꺼번에 올리기',
      mission: '나머지 파일도 한꺼번에 스테이징하자',
      hints: ['"지금 폴더 전체"는 . 으로 나타낼 수 있어요', '`git add .`'],
    },
    's1-5': {
      title: '기록하기',
      mission: '메시지를 붙여서 커밋하자',
      hints: ['-m 뒤에 메시지를 써요', '`git commit -m "첫 커밋"`'],
    },
    's1-6': {
      title: '돌아보기',
      mission: '히스토리를 한 줄씩 표시하자',
      hints: ['log 에 옵션을 붙여요', '`git log --oneline`'],
    },
    's1-7': {
      title: '비교하기',
      mission: '무엇을 바꿨는지 확인해 보자',
      hints: ['차이를 보는 명령어예요', '`git diff`'],
    },
    's1-8': {
      title: '한 번에 기록',
      mission: 'add 와 commit 을 한 번에 해 버리자',
      hints: ['commit 에 -a 를 붙이면 변경한 파일을 자동으로 add 해요', '`git commit -am "변경 기록"`'],
    },
    's2-1': {
      title: '가지 세기',
      mission: '브랜치 목록을 보자',
      hints: ['브랜치를 다루는 명령어예요', '`git branch`'],
    },
    's2-2': {
      title: '가지 만들기',
      mission: '`feature/a` 브랜치를 만들자',
      hints: ['branch 뒤에 이름을 붙여요', '`git branch feature/a`'],
    },
    's2-3': {
      title: '가지에 타기',
      mission: '`feature/a` 브랜치로 전환하자',
      hints: ['전환은 switch 예요', '`git switch feature/a`'],
    },
    's2-4': {
      title: '만들고 타기',
      mission: '`feature/b` 를 만들고 바로 전환하자',
      hints: ['switch 에 -c 를 붙이면 만들기도 돼요', '`git switch -c feature/b`'],
    },
    's2-5': {
      title: '가지 합치기',
      mission: '`feature/a` 를 main 에 병합하자',
      hints: ['지금은 main 에 있어요. 가져올 브랜치를 지정해요', '`git merge feature/a`'],
    },
    's2-6': {
      title: '가지 정리',
      mission: '병합이 끝난 `feature/a` 를 지우자',
      hints: ['branch 에 -d 를 붙이면 지울 수 있어요', '`git branch -d feature/a`'],
    },
    's3-1': {
      title: '상대 알기',
      mission: '연결된 원격 저장소를 확인하자',
      hints: ['remote 에 -v 를 붙이면 URL 도 나와요', '`git remote -v`'],
    },
    's3-2': {
      title: '보내기',
      mission: '로컬 커밋을 원격 저장소로 보내자',
      hints: ['보내는 건 push 예요', '`git push`'],
    },
    's3-3': {
      title: '받기',
      mission: '팀원의 변경을 가져오자',
      hints: ['가져와서 합치는 건 pull 이에요', '`git pull`'],
    },
    's3-4': {
      title: '엿보기',
      mission: '합치지 않고 원격 저장소의 정보만 가져오자',
      hints: ['가져오기만 하는 건 fetch 예요', '`git fetch`'],
    },
    's3-5': {
      title: '가지 보내기',
      mission: '`feature/c` 브랜치를 원격 저장소로 보내자',
      hints: ['처음 보내는 브랜치는 -u origin 을 붙여요', '`git push -u origin feature/c`'],
    },
    's4-1': {
      title: '원래대로',
      mission: '`{featureFile}` 의 변경을 취소하자',
      hints: ['파일을 원래대로 되돌리는 건 restore 예요', '`git restore {featureFile}`'],
    },
    's4-2': {
      title: '내리기',
      mission: '`{featureFile}` 을 스테이징에서 내리자 (변경은 남겨 둔다)',
      hints: ['restore 에 --staged 를 붙여요', '`git restore --staged {featureFile}`'],
    },
    's4-3': {
      title: '다시 말하기',
      mission: '직전 커밋의 메시지 "typo" 를 고치자',
      hints: ['직전 커밋은 --amend 로 다시 할 수 있어요', '`git commit --amend -m "점프 추가"`'],
    },
    's4-4': {
      title: '상쇄하기',
      mission: '최신 커밋을 되돌리는 커밋을 만들자',
      hints: ['히스토리를 남긴 채 취소하는 건 revert 예요', '`git revert HEAD`'],
    },
    's4-5': {
      title: '넣어 두기',
      mission: '작업 중인 변경을 잠시 넣어 두자',
      hints: ['임시 보관은 stash 예요', '`git stash`'],
    },
    's4-6': {
      title: '꺼내기',
      mission: '넣어 둔 변경을 꺼내자',
      hints: ['stash 에 pop 을 붙여요', '`git stash pop`'],
    },
  },
};

export default overlay;
