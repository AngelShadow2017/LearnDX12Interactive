import { useRef, useState } from 'react';
import { downloadProgress, isProgressState, useProgress } from '@/progress/ProgressProvider';

export function ProgressBackup() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const { state, replaceProgress, clearProgress } = useProgress();

  async function importFile(file?: File) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isProgressState(parsed)) {
        throw new Error('文件不是兼容的学习进度备份。');
      }
      replaceProgress(parsed);
      setMessage('进度已导入。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '读取失败，请检查 JSON 文件。');
    }
  }

  return (
    <div className="progress-backup">
      <button className="button button--quiet" type="button" onClick={() => downloadProgress(state)}>导出进度</button>
      <button className="button button--quiet" type="button" onClick={() => inputRef.current?.click()}>导入进度</button>
      <button className="button button--quiet" type="button" onClick={() => {
        if (window.confirm('清除本机保存的学习进度？')) { clearProgress(); setMessage('本机进度已清除。'); }
      }}>清除进度</button>
      <input ref={inputRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => { void importFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
      {message && <span className="progress-backup__message" role="status">{message}</span>}
    </div>
  );
}
