import { observer } from 'mobx-react-lite';
import { appModel } from '@models/AppModel';
import { LANGUAGES } from '@data/languages';
import styles from './LanguageSelectView.module.css';

export const LanguageSelectView = observer(() => (
  <main className={styles.screen}>
    <div className={styles.inner}>
      <h1>どの言語で練習しますか？</h1>
      <p className={styles.lead}>
        練習用プロジェクトのコードがこの言語で用意されます。Git のコマンドはどの言語でも同じです。
        <br />
        あとから右下のステータスバーでいつでも変更できます。
      </p>
      <div className={styles.grid}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            className={`${styles.card} ${appModel.language === lang.id ? styles.selected : ''}`}
            onClick={() => appModel.selectLanguage(lang.id)}
          >
            <span className={styles.logo} style={{ background: `${lang.color}1f` }}>
              <img src={lang.icon} alt="" />
            </span>
            <span className={styles.name}>{lang.label}</span>
            <span className={styles.usage}>{lang.usage}</span>
          </button>
        ))}
      </div>
    </div>
  </main>
));
