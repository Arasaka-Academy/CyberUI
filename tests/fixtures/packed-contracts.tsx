import { useRef, useState, type CSSProperties } from 'react';
import { AlertDialog, Button, CyberUIProvider, DatePicker, Dialog, FileUpload, Input, MultiSelect, Select, VirtualKeyboard } from '@cyberui/react';

export function PackedContracts() {
  const input = useRef<HTMLInputElement>(null);
  const [received, setReceived] = useState('');
  const [controlled, setControlled] = useState<File[]>([]);
  const [updated, setUpdated] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [keyboard, setKeyboard] = useState('Name 👩🏽‍💻');
  return <section aria-label="Release contracts">
    <form data-testid="calendar-form">
      <DatePicker label="Local schedule" name="schedule" includeTime defaultValue="2026-11-11T12:00" />
      <Button type="reset">Reset schedule</Button>
    </form>
    <form data-testid="upload-form">
      <FileUpload label="Document" name="document" accept=".txt" ref={input} onChange={() => setReceived((new FormData(input.current!.form!).get('document') as File).name)}/>
      <output data-testid="received-document">{received}</output>
      <FileUpload label="Attachments" name="attachments" accept=".txt" multiple/>
      <FileUpload label="Controlled document" name="controlled" value={controlled} onChange={setControlled}/>
      <Button onPress={() => setControlled([])}>Clear controlled document</Button>
      <FileUpload label="Disabled document" name="disabled" isDisabled/>
      <MultiSelect label="Default roles" description="Permissions for this account" name="roles" defaultValue={['reader']} options={[{ id: 'reader', label: 'Reader' }]}/>
      <Select label="Allowed role" name="allowed-role" defaultValue="reader" options={[{ id: 'reader', label: 'Reader' }, { id: 'admin', label: 'Admin', disabled: true }, { id: 'reviewer', label: 'Reviewer' }]}/>
      <Button type="reset">Reset upload form</Button>
    </form>
    <AlertDialog title="Async confirmation" trigger={<Button>Open async confirmation</Button>} confirmLabel="Run operation" onConfirm={async () => {
      const response = await fetch('/confirmation-operation');
      if (!response.ok) throw new Error('Confirmation failed');
    }}>Complete the controlled operation.</AlertDialog>
    <section aria-label="Unicode keyboard"><output data-testid="keyboard-value">{keyboard}</output><VirtualKeyboard value={keyboard} onChange={setKeyboard}/></section>
    <Button onPress={() => setMounted(value => !value)}>Toggle clipped provider</Button>
    <div data-testid="clipped-host" style={{ transform: 'translateZ(0)', overflow: 'hidden', width: 320, height: 180 }}>
      {mounted && <CyberUIProvider scheme={updated ? 'mono' : 'neon'} mode={updated ? 'dark' : 'light'} locale={updated ? 'en' : 'zh-CN'} customColors={{ accent: updated ? '#6145A3' : '#176B5B' }} style={{ '--cyber-font-body': 'monospace', '--cyber-space-md': updated ? '15px' : '12px' } as CSSProperties}>
        <Dialog title="Clipped settings" trigger={<Button>Open clipped settings</Button>}>
          <Input label="Portal input" autoFocus/>
          <DatePicker label="Dialog date" defaultValue="2026-11-11" />
          <Button onPress={() => setUpdated(value => !value)}>Update portal theme</Button>
          <Dialog title="Nested settings" trigger={<Button>Open nested settings</Button>}><Input label="Nested input"/></Dialog>
        </Dialog>
      </CyberUIProvider>}
    </div>
  </section>;
}
