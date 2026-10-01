import type { GitGymApi } from '@shared/api';

declare global {
  interface Window {
    gitGym: GitGymApi;
  }
}
