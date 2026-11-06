import { useRef, useState, type CSSProperties } from 'react';
import { Button, CyberUIProvider, Dialog, FileUpload, Input } from '@cyberui/react';

export function PackedContracts() {
  const input = useRef<HTMLInputElement>(null);
  const [received, setReceived] = useState('');
  const [controlled, setControlled] = useState<File[]>([]);
  const [updated, setUpdated] = useState(false);
  const [mounted, setMounted] = useState(true);
  return <section aria-label="Release contracts">
    <form data-testid="upload-form">
      <FileUpload label="Document" name="document" accept=".txt" ref={input} onChange={() => setReceived((new FormData(input.current!.form!).get('document') as File).name)}/>
      <output data-testid="received-document">{received}</output>
      <FileUpload label="Attachments" name="attachments" accept=".txt" multiple/>
      <FileUpload label="Controlled document" name="controlled" value={controlled} onChange={setControlled}/>
      <Button onPress={() => setControlled([])}>Clear controlled document</Button>
      <FileUpload label="Disabled document" name="disabled" isDisabled/>
    </form>
    <Button onPress={() => setMounted(value => !value)}>Toggle clipped provider</Button>
    <div data-testid="clipped-host" style={{ transform: 'translateZ(0)', overflow: 'hidden', width: 320, height: 180 }}>
      {mounted && <CyberUIProvider scheme={updated ? 'mono' : 'neon'} mode={updated ? 'dark' : 'light'} locale={updated ? 'en' : 'zh-CN'} customColors={{ accent: updated ? '#6145A3' : '#176B5B' }} style={{ '--cyber-font-body': 'monospace', '--cyber-space-md': updated ? '15px' : '12px' } as CSSProperties}>
        <Dialog title="Clipped settings" trigger={<Button>Open clipped settings</Button>}>
          <Input label="Portal input" autoFocus/>
          <Button onPress={() => setUpdated(value => !value)}>Update portal theme</Button>
          <Dialog title="Nested settings" trigger={<Button>Open nested settings</Button>}><Input label="Nested input"/></Dialog>
        </Dialog>
      </CyberUIProvider>}
    </div>
  </section>;
}
