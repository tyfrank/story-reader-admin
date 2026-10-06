const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('lib/authorApplications.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exportsObject={};let calls=[],failure=false,badShape=false;
vm.runInNewContext(code,{exports:exportsObject,process:{env:{NEXT_PUBLIC_API_URL:'https://fixture.example/api\n'}},fetch:async url=>{calls.push(url);return{ok:!failure,status:401,json:async()=>badShape?{}:{applications:[{id:String(calls.length),status:'ACCEPTED',createdAt:'2026-10-06',writingExperience:'Beginner',publishedWorks:'Writing sample',motivation:'Goals',expectedFrequency:'Weekly',currentPlatforms:'@fixture'}],totalPages:2}};}});
(async()=>{
 const rows=await exportsObject.fetchApplications('synthetic');assert.equal(rows.length,2);assert.ok(calls[0].startsWith('https://fixture.example/api/author-applications/all?'));assert.ok(calls[1].includes('page=2'));assert.equal(rows[0].status,'APPROVED');assert.equal(rows[0].writingSample,'Writing sample');assert.equal(rows[0].experience,'Beginner');assert.equal(rows[0].submittedAt,'2026-10-06');assert.equal(rows[0].socialMedia,'@fixture');assert.equal(rows[0].motivation,'Goals');
 calls=[];await exportsObject.fetchApplications('synthetic',5);assert.equal(calls.length,1);
 failure=true;await assert.rejects(exportsObject.fetchApplications('synthetic'),/sign in again/);
 failure=false;badShape=true;await assert.rejects(exportsObject.fetchApplications('synthetic'),/could not be read/);
 console.log('PASS: admin URL whitespace/API normalization, pagination, backend field/status mapping, recent limit, visible authentication/malformed response errors');
})().catch(e=>{console.error(e);process.exitCode=1;});
