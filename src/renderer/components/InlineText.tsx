/** `code` 記法と改行だけを解釈して表示する */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line.split(/(`[^`]+`)/).map((part, j) =>
            part.startsWith('`') && part.endsWith('`') ? (
              <code key={j} className="inline-code">
                {part.slice(1, -1)}
              </code>
            ) : (
              part
            ),
          )}
        </span>
      ))}
    </>
  );
}
