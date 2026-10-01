import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Search, CheckCircle2, FlaskConical, Trophy } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { CATEGORIES, COMMANDS, findCommand, type CommandCategory } from '@data/commands';
import { CommandDetail } from './CommandDetail';
import styles from './DictionaryView.module.css';

/** Git コマンドの一覧・検索と解説。成功させたことのあるコマンドには「習得済み」の印が付く */
export const DictionaryView = observer(() => {
  const { progress } = appModel;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CommandCategory | 'all'>('all');
  const selected = findCommand(appModel.dictionaryCommand) ?? COMMANDS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMANDS.filter(
      (c) =>
        (category === 'all' || c.category === category) &&
        (!q || c.name.includes(q) || c.summary.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const learnedCount = COMMANDS.filter((c) => progress.learned.has(c.name)).length;

  return (
    <main className={styles.dictionary}>
      <aside className={styles.sidebar}>
        <div className={styles.collection}>
          <Trophy size={18} />
          <div>
            <b>
              {learnedCount} / {COMMANDS.length}
            </b>
            <span>コマンドを習得</span>
          </div>
          <div className={styles.collectionBar}>
            <i style={{ width: `${(learnedCount / COMMANDS.length) * 100}%` }} />
          </div>
        </div>

        <label className={styles.search}>
          <Search size={15} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="コマンドや説明で検索…" spellCheck={false} />
        </label>

        <div className={styles.chips}>
          <button className={category === 'all' ? styles.chipActive : styles.chip} onClick={() => setCategory('all')}>
            すべて
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={category === c.id ? styles.chipActive : styles.chip}
              style={category === c.id ? { background: c.color, borderColor: c.color } : { color: c.color }}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <ul className={styles.list}>
          {filtered.map((c) => {
            const color = CATEGORIES.find((x) => x.id === c.category)!.color;
            const learned = progress.learned.has(c.name);
            return (
              <li key={c.name}>
                <button
                  className={c.name === selected.name ? `${styles.item} ${styles.selected}` : styles.item}
                  onClick={() => appModel.openDictionary(c.name)}
                >
                  <span className={styles.dot} style={{ background: color }} />
                  <span className={styles.itemText}>
                    <code>git {c.name}</code>
                    <small>{c.summary}</small>
                  </span>
                  {learned && <CheckCircle2 size={16} className={styles.learned} aria-label="習得済み" />}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && <li className={styles.empty}>見つかりませんでした</li>}
        </ul>
      </aside>

      <section className={styles.content}>
        <div className={styles.contentInner}>
          {progress.learned.has(selected.name) && (
            <div className={styles.learnedBanner}>
              <CheckCircle2 size={15} /> 習得済み！ 実際に使ったことのあるコマンドです
            </div>
          )}
          <CommandDetail command={selected} onSelectRelated={(name) => appModel.openDictionary(name)} />
          <button className={`btn ${styles.tryButton}`} onClick={() => appModel.navigate('sandbox')}>
            <FlaskConical size={15} /> フリー練習で試してみる
          </button>
        </div>
      </section>
    </main>
  );
});
