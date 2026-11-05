import { useEffect, useRef, useState } from 'react';
import { Button, useCyberUI } from '@cyberui/react';

export function CodeBlock({ code, language = 'REACT / TYPESCRIPT', copyLabel }: { code: string; language?: string; copyLabel?: string }) {
  const { t } = useCyberUI();
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { setCopied(false); setFailed(false); clearTimeout(timer.current); }, [code]);
  return <div className="code-block"><div><span>{language}</span><Button size="sm" variant="ghost" icon={copied ? 'check' : 'copy'} aria-label={copyLabel} onPress={async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true); setFailed(false); clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); setFailed(true); }
  }}>{copied ? t('Copied', '已复制') : t('Copy code', '复制代码')}</Button></div><pre tabIndex={0}><code>{code}</code></pre>{failed && <p role="alert">{t('Copy unavailable. Select the code to copy manually.', '暂时无法自动复制，请选中代码后手动复制。')}</p>}</div>;
}
