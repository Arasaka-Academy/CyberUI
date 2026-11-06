import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { verifyConsumerContracts } from './verify-consumer-contracts.mjs';
import { spawnSync } from 'node:child_process';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import ts from 'typescript';
const root=fileURLToPath(new URL('../', import.meta.url));
const engines={chromium,firefox,webkit};
const requestedBrowsers=[...new Set((process.env.CYBERUI_TEST_BROWSERS??'chromium').split(',').map(name=>name.trim()))];
for(const name of requestedBrowsers)if(!Object.hasOwn(engines,name))throw new Error(`Unsupported consumer browser: ${name}`);
const artifactRoot=resolve(process.env.CYBERUI_ARTIFACTS_DIR ?? join(root,'artifacts'));
const artifacts=join(artifactRoot,'packages');mkdirSync(artifacts,{recursive:true});
const packageVersion=JSON.parse(readFileSync(join(root,'packages/react/package.json'),'utf8')).version;
const tokensVersion=JSON.parse(readFileSync(join(root,'packages/tokens/package.json'),'utf8')).version;
function run(args,cwd){const result=spawnSync('pnpm',args,{cwd,encoding:'utf8',timeout:180000});if(result.status!==0)throw new Error(`${args.join(' ')}\n${result.stdout}\n${result.stderr}`);return result.stdout;}
for(const name of ['tokens','react']){
  const dir=join(root,'packages',name);if(!existsSync(join(dir,'dist/index.d.ts')))throw new Error(`${name}: build must emit dist/index.d.ts before packing`);
  run(['pack','--pack-destination',artifacts],dir);
}
const consumer=mkdtempSync(join(tmpdir(),'cyberui-independent-consumer-'));
writeFileSync(join(consumer,'package.json'),JSON.stringify({name:'cyberui-independent-example',private:true,type:'module',dependencies:{'@cyberui/tokens':`file:${artifacts}/cyberui-tokens-${tokensVersion}.tgz`,'@cyberui/react':`file:${artifacts}/cyberui-react-${packageVersion}.tgz`,react:'^19.2.0','react-dom':'^19.2.0'},devDependencies:{vite:'^7.1.7',typescript:'~5.9.3','@types/react':'^19.2.0','@types/react-dom':'^19.2.0'}}));
writeFileSync(join(consumer,'pnpm-workspace.yaml'),`allowBuilds:\n  esbuild: true\noverrides:\n  '@cyberui/tokens': ${JSON.stringify(`file:${artifacts}/cyberui-tokens-${tokensVersion}.tgz`)}\n`);
writeFileSync(join(consumer,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2022',lib:['ES2022','DOM','DOM.Iterable'],module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,skipLibCheck:true,noEmit:true,types:['vite/client']},include:['*.tsx']}));
writeFileSync(join(consumer,'index.html'),'<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Independent CyberUI consumer</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
writeFileSync(join(consumer,'main.tsx'),`import { useRef, useState } from 'react';
import {createRoot} from 'react-dom/client';
import {PackedContracts} from './contracts';
import {CyberUIProvider,Button,Dialog,Input,Textarea,Select,Progress,Chart} from '@cyberui/react';
import {createTheme} from '@cyberui/tokens';
import '@cyberui/react/styles.css';import '@cyberui/react/fonts.css';
const theme=createTheme('neon','dark');
function Example(){const ref=useRef<HTMLInputElement>(null);const [value,setValue]=useState('');return <CyberUIProvider scheme="neon" mode="dark"><h1>Independent CyberUI</h1><Input label="Handle" ref={ref} value={value} onChange={e=>setValue(e.target.value)}/><Textarea label="Notes" defaultValue="Shared form styles"/><Button onPress={()=>ref.current?.focus()}>Focus input</Button><Select label="Theme" options={[{id:'neon',label:'Neon'},{id:'mono',label:'Mono'}]} defaultValue="neon"/><Progress label="Decrypted" value={42} variant="heartbeat"/><Dialog title="Settings" trigger={<Button>Open settings</Button>}><Input label="Name"/></Dialog><Chart label="Reading" data={[{label:'Mon',value:20},{label:'Tue',value:30}]}/><code>{theme.accent}</code><PackedContracts/></CyberUIProvider>};
createRoot(document.getElementById('root')!).render(<Example/>);
`);
writeFileSync(join(consumer,'contracts.tsx'),readFileSync(join(root,'tests/fixtures/packed-contracts.tsx'),'utf8'));
// Compile every copyable documentation example against the installed package.
const source=ts.createSourceFile('examples.tsx',readFileSync(join(root,'apps/docs/src/ComponentDemo.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let exampleBodies;
for(const statement of source.statements)if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)if(declaration.name.getText(source)==='exampleBodies')exampleBodies=declaration.initializer;
const snippets=exampleBodies.properties.map(p=>({name:p.name.getText(source),body:p.initializer.text}));
const names=Array.from(new Set(snippets.flatMap(s=>Array.from(s.body.matchAll(/<([A-Z][A-Za-z]+)/g),m=>m[1]))));
writeFileSync(join(consumer,'examples.tsx'),`import {${names.join(',')}} from '@cyberui/react';\n`+snippets.map(s=>`export function Example${s.name}(){return (${s.body});}`).join('\n'));
process.stdout.write(`Installing packed artifacts in ${consumer}\n`);
run(['install',...(process.env.CYBERUI_CONSUMER_OFFLINE==='0'?[]:['--offline']),'--registry','https://registry.npmmirror.com'],consumer);
expect(existsSync(join(consumer,'node_modules/tailwindcss'))).toBe(false);
expect(readFileSync(join(consumer,'node_modules/@cyberui/react/dist/cyberui.css'),'utf8')).not.toMatch(/@(apply|reference)\b/);
run(['exec','tsc','--noEmit'],consumer);run(['exec','vite','build'],consumer);
const {preview}=await import(pathToFileURL(join(consumer,'node_modules/vite/dist/node/index.js')).href);
const server=await preview({root:consumer,preview:{host:'127.0.0.1',port:0}});
const address=server.httpServer.address();const url=`http://127.0.0.1:${address.port}`;
const browserResults=[];
try{
 for(const name of requestedBrowsers){
  const browser=await engines[name].launch();
  try{
  const page=await browser.newPage({viewport:{width:1000,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole('heading',{name:'Independent CyberUI'})).toBeVisible();await expect(page.locator('[data-cyberui]').first()).toHaveCSS('background-color','rgb(30, 21, 23)');
  await expect(page.getByRole('textbox',{name:'Notes',exact:true})).toHaveCSS('padding-top','10px');
  await expect(page.getByRole('textbox',{name:'Notes',exact:true})).toHaveCSS('padding-right','13px');
  await page.getByRole('button',{name:'Focus input',exact:true}).click();await expect(page.getByRole('textbox',{name:'Handle',exact:true})).toBeFocused();
  await page.getByRole('textbox',{name:'Handle',exact:true}).fill('NOVA_8');await expect(page.getByRole('textbox',{name:'Handle',exact:true})).toHaveValue('NOVA_8');
  await page.getByRole('button',{name:'Open settings',exact:true}).click();await expect(page.getByRole('dialog',{name:'Settings'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Open settings',exact:true})).toBeFocused();
  await expect(page.getByRole('progressbar',{name:'Decrypted'})).toHaveAttribute('aria-valuenow','42');expect(errors).toEqual([]);expect(await page.evaluate(()=>document.fonts.check('16px Oxanium'))).toBe(true);
  await verifyConsumerContracts(page);
  expect(errors).toEqual([]);
  mkdirSync(join(artifactRoot,'screenshots'),{recursive:true});await page.screenshot({path:join(artifactRoot,`screenshots/independent-consumer-${name}.png`)});
  browserResults.push({name,version:browser.version(),status:'passed'});
  process.stdout.write(`PASS: ${name} ${browser.version()} packed component contracts.\n`);
  }finally{await browser.close();}
 }
  writeFileSync(join(artifactRoot,'consumer-result.json'),JSON.stringify({status:'passed',packageVersion,browsers:browserResults,examplesTypechecked:snippets.length,consumerDirectory:consumer,tailwindRequired:false,checks:['packed artifacts installed outside workspace','Tailwind absent and CSS fully compiled','all copyable examples typechecked','Vite production build','real browser styled components','shared textarea padding','input ref and controlled value','dialog Escape and focus restoration','font loading','dropped files match native FormData','controlled and disabled uploads','native form reset and disabled selection','stale asynchronous confirmation','Unicode keyboard deletion','body portals escape clipped hosts','portal themes and nested focus update','portal cleanup','no page errors']},null,2)+'\n');
  process.stdout.write(`PASS: packed ESM, declarations, styles, fonts, ${snippets.length} examples, production build and browser interactions.\n`);
}finally{await new Promise(resolve=>server.httpServer.close(resolve));}
