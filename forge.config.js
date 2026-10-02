const fs = require('fs');
const path = require('path');

// Windows 版には MinGit（resources/git）を同梱する。無いとき（Mac でのビルドなど）は含めない
const bundledGit = path.join(__dirname, 'resources', 'git');
const extraResource = fs.existsSync(bundledGit) ? [bundledGit] : [];

module.exports = {
  // 出力先（既定は out）。古い出力が他のアプリに掴まれて消せないときに別の場所へ出せるようにする
  outDir: process.env.GITGYM_OUT_DIR || 'out',
  packagerConfig: {
    name: 'Git Gym',
    executableName: 'git-gym',
    asar: true,
    icon: './assets/icon/icon',
    extraResource,
  },
  makers: [
    {
      // Windows のインストーラー（Setup.exe）。ダブルクリックでインストールしてそのまま起動する
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: 'git_gym',
        setupExe: 'GitGym-Setup.exe',
        setupIcon: './assets/icon/icon.ico',
        iconUrl: 'https://raw.githubusercontent.com/wine-5/git-gym/main/assets/icon/icon.ico',
      },
    },
    {
      // インストール不要で使える zip（Windows / Mac）
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          nodeIntegration: false,
          entryPoints: [
            {
              name: 'main_window',
              html: './src/renderer/index.html',
              js: './src/renderer/root.tsx',
              preload: {
                js: './src/main/preload.ts',
                config: './webpack.preload.config.js',
              },
            },
          ],
        },
        devContentSecurityPolicy:
          "default-src 'self' 'unsafe-inline' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; font-src 'self' data:;",
        // F5 で起動中でも、別のポートでもう1つ起動して確認できるようにする
        port: Number(process.env.GITGYM_DEV_PORT) || 8890,
        loggerPort: Number(process.env.GITGYM_LOGGER_PORT) || 9000,
      },
    },
  ],
};
