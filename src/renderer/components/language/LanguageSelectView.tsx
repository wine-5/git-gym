import { observer } from 'mobx-react-lite';
import { appModel } from '@models/AppModel';
import { LANGUAGES } from '@data/languages';
import styles from './LanguageSelectView.module.css';
import { t } from '@i18n/t';

export const LanguageSelectView = observer(() => (
  <main className={styles.screen}>
    <div className={styles.inner}>
      <h1>{t('langSelect.title')}</h1>
      <p className={styles.lead}>
        {t('langSelect.lead1')}
        <br />
        {t('langSelect.lead2')}
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
