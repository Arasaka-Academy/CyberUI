import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CyberUIProvider, Select, NumberInput, FileUpload, ColorPicker, TreeView, CommandPalette, Button, Panel } from './index';

describe('reusable component contracts',()=>{
  it('exposes compound-control roots, editable inputs and trigger refs without leaking controlled values',async()=>{
    const user=userEvent.setup();const root=createRef<HTMLDivElement>();const input=createRef<HTMLInputElement>();const trigger=createRef<HTMLButtonElement>();const changed=vi.fn();
    render(<CyberUIProvider><form aria-label="Settings"><NumberInput label="Goal" ref={root} inputRef={input} name="goal" defaultValue={30} data-testid="goal-root"/><Select label="Theme" id="theme-control" buttonRef={trigger} value="neon" onChange={changed} options={[{id:'neon',label:'Neon'},{id:'mono',label:'Mono'}]}/></form></CyberUIProvider>);
    expect(root.current).toBe(screen.getByTestId('goal-root'));expect(input.current).toHaveValue('30');expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('goal')).toBe('30');
    await user.click(trigger.current!);await user.click(screen.getByRole('option',{name:'Mono'}));
    expect(changed).toHaveBeenCalledWith('mono');expect(trigger.current).toHaveTextContent('Neon');expect(document.getElementById('theme-control')).toContainElement(trigger.current);
  });
  it('rejects an unsupported upload and recovers on the next valid selection',async()=>{
    const user=userEvent.setup({applyAccept:false});const changed=vi.fn();const input=createRef<HTMLInputElement>();
    render(<CyberUIProvider><FileUpload label="Import" ref={input} name="books" accept=".epub" onChange={changed}/></CyberUIProvider>);
    await user.upload(input.current!,new File(['bad'],'notes.exe',{type:'application/octet-stream'}));expect(screen.getByRole('alert')).toHaveTextContent('Unsupported file type');expect(changed).not.toHaveBeenCalled();
    await user.upload(input.current!,new File(['book'],'archive.epub',{type:'application/epub+zip'}));expect(screen.queryByRole('alert')).not.toBeInTheDocument();expect(changed.mock.calls[0][0][0].name).toBe('archive.epub');expect(input.current?.files?.[0].name).toBe('archive.epub');
  });
  it('restores a controlled color after invalid editing and reflects external updates after blur',async()=>{
    const user=userEvent.setup();const changed=vi.fn();
    const {rerender}=render(<CyberUIProvider><ColorPicker label="Accent" value="#E0574B" onChange={changed}/></CyberUIProvider>);
    const hex=screen.getByRole('textbox',{name:'Accent HEX'});await user.clear(hex);await user.type(hex,'bad');expect(hex).toHaveAttribute('aria-invalid','true');await user.tab();expect(hex).toHaveValue('#E0574B');
    await user.clear(hex);await user.type(hex,'#123456');await user.tab();expect(changed).toHaveBeenLastCalledWith('#123456');
    rerender(<CyberUIProvider><ColorPicker label="Accent" value="#93E4EA" onChange={changed}/></CyberUIProvider>);expect(hex).toHaveValue('#93E4EA');
  });
  it('navigates tree nodes by keyboard and keeps disabled commands unavailable',async()=>{
    const user=userEvent.setup();const change=vi.fn();const action=vi.fn();const root=createRef<HTMLElement>();
    render(<CyberUIProvider><Panel ref={root} id="archive-panel"><TreeView label="Archive" defaultExpanded={['books']} items={[{id:'books',label:'Books',children:[{id:'neuro',label:'Neuromancer'}]}]} onChange={change}/><CommandPalette trigger={<Button>Commands</Button>} items={[{id:'blocked',label:'Delete all',disabled:true},{id:'read',label:'Read file'}]} onAction={action}/></Panel></CyberUIProvider>);
    expect(root.current?.id).toBe('archive-panel');await user.tab();await user.keyboard('{ArrowDown}{Enter}');expect(change).toHaveBeenLastCalledWith('neuro');
    await user.click(screen.getByRole('button',{name:'Commands'}));const dialog=screen.getByRole('dialog');expect(within(dialog).getByRole('option',{name:'Delete all'})).toHaveAttribute('aria-disabled','true');await user.click(within(dialog).getByRole('option',{name:'Delete all'}));expect(action).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('option',{name:'Read file'}));expect(action).toHaveBeenCalledWith('read');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
