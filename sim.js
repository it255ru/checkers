const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'checkers.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
const engine=js.slice(js.indexOf('// ── Движок шашек ──'), js.indexOf('let G={'));
const {getCaptures,getAllMoves,applyCapture,applyNormal,removeBeaten,checkEnd}=
  new Function(engine+'\nreturn {getCaptures,getAllMoves,applyCapture,applyNormal,removeBeaten,checkEnd};')();

function setup(){
  const b=Array.from({length:8},()=>new Array(8).fill(0));
  for(let r=0;r<3;r++)for(let c=0;c<8;c++)if((r+c)%2===1)b[r][c]=-1;
  for(let r=5;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2===1)b[r][c]=1;
  return b;
}
function playTurn(b,pl){
  const moves=getAllMoves(b,pl);
  if(!moves.length)return false;
  const m=moves[Math.floor(Math.random()*moves.length)];
  if(!m.cap){applyNormal(b,m);return true;}
  let beaten=[m.cap.r+','+m.cap.c];
  applyCapture(b,m);let pos=m.to,guard=0;
  while(guard++<30){
    const f=getCaptures(b,pos.r,pos.c,beaten);
    if(!f.length)break;
    const n=f[Math.floor(Math.random()*f.length)];
    beaten.push(n.cap.r+','+n.cap.c);applyCapture(b,n);pos=n.to;
  }
  if(guard>=30)throw new Error('бесконечная серия боя!');
  removeBeaten(b,beaten);
  return true;
}
let results={w:0,b:0,long:0};
for(let g=0;g<2000;g++){
  const b=setup();let pl=1,mv=0,end=0;
  while(mv++<400){
    if(!playTurn(b,pl)){end=-pl;break;}
    end=checkEnd(b);if(end!==0)break;
    pl=-pl;
  }
  if(end===1)results.w++;else if(end===-1)results.b++;else results.long++;
}
console.log('2000 случайных партий без ошибок.');
console.log('Белые:',results.w,'| Чёрные:',results.b,'| 400+ ходов (вечный эндшпиль):',results.long);
