import ts from 'typescript';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,'.');
const program=ts.createProgram(parsed.fileNames,parsed.options);
const checker=program.getTypeChecker();
const entry=program.getSourceFile(resolve('packages/react/src/index.ts'));
const exports=checker.getExportsOfModule(checker.getSymbolAtLocation(entry));
const api={};
for(const symbol of exports){
  const decl=symbol.valueDeclaration??symbol.declarations?.[0];
  if(!decl)continue;
  const type=checker.getTypeOfSymbolAtLocation(symbol,decl);
  const signature=type.getCallSignatures()[0];
  if(!signature?.parameters[0])continue;
  const props=checker.getTypeOfSymbolAtLocation(signature.parameters[0],decl);
  const rows=props.getProperties().filter(p=>p.declarations?.some(d=>d.getSourceFile().fileName.includes('/packages/react/src/'))).map(p=>({name:p.name,optional:!!(p.flags&ts.SymbolFlags.Optional),type:checker.typeToString(checker.getTypeOfSymbolAtLocation(p,decl),decl,ts.TypeFormatFlags.NoTruncation).replace(/import\("[^"]+"\)\./g,''),description:ts.displayPartsToString(p.getDocumentationComment(checker))}));
  api[symbol.name]={source:decl.getSourceFile().fileName.split('/').pop(),props:rows};
}
writeFileSync('apps/docs/src/api.generated.json',JSON.stringify(api,null,2)+'\n');
process.stdout.write(`Generated API metadata for ${Object.keys(api).length} public functions.\n`);
