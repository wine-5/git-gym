import { autorun } from 'mobx';
import seSuccess from '../assets/sounds/se_success.wav';
import seError from '../assets/sounds/se_error.wav';
import seClick from '../assets/sounds/se_click.wav';
import seMission from '../assets/sounds/se_mission.wav';
import seStageClear from '../assets/sounds/se_stage_clear.wav';
import seStar from '../assets/sounds/se_star.wav';
import bgmHome from '../assets/sounds/bgm_home.wav';
import bgmPractice from '../assets/sounds/bgm_practice.wav';
import type { SettingsModel } from './SettingsModel';

export type SoundEffect = 'success' | 'error' | 'click' | 'mission' | 'stageClear' | 'star';
export type Bgm = 'home' | 'practice';

const SE: Record<SoundEffect, string> = {
  success: seSuccess,
  error: seError,
  click: seClick,
  mission: seMission,
  stageClear: seStageClear,
  star: seStar,
};

const BGM: Record<Bgm, string> = { home: bgmHome, practice: bgmPractice };

/** 効果音と BGM の再生。音量・ミュートは設定に合わせて自動で変わる */
export class SoundManager {
  private bgm: HTMLAudioElement | null = null;
  private current: Bgm | null = null;

  constructor(private readonly settings: SettingsModel) {
    autorun(() => {
      // 設定は必ず先に読む（BGM が無いときに読まずに終わると、変更を追いかけなくなる）
      const volume = this.settings.muted ? 0 : this.settings.bgmVolume;
      if (this.bgm) this.bgm.volume = volume;
    });
  }

  play(effect: SoundEffect): void {
    if (this.settings.muted || this.settings.seVolume === 0) return;
    // 同じ音を重ねて鳴らせるよう、毎回新しく作る（ファイルは小さいのでキャッシュが効く）
    const audio = new Audio(SE[effect]);
    audio.volume = this.settings.seVolume;
    void audio.play().catch(() => undefined);
  }

  /** 流す BGM を切り替える（同じなら何もしない、null で止める） */
  setBgm(next: Bgm | null): void {
    if (next === this.current) return;
    this.current = next;
    this.bgm?.pause();
    this.bgm = null;
    if (!next) return;

    const audio = new Audio(BGM[next]);
    audio.loop = true;
    audio.volume = this.settings.muted ? 0 : this.settings.bgmVolume;
    this.bgm = audio;
    // 自動再生が止められた場合は、最初のクリックで流し始める
    void audio.play().catch(() => {
      const resume = () => {
        if (this.bgm === audio) void audio.play().catch(() => undefined);
      };
      window.addEventListener('pointerdown', resume, { once: true });
    });
  }
}
