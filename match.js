const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'checkers.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
const engine=js.slice(js.indexOf('// ── Движок шашек ──'), js.indexOf('// ── Игровой цикл ──'));
const E=new Function(engine+'\nreturn {getMacroMoves,applyMacro,checkEnd,minimaxPick,bestForWhite,cloneBoard};')();

function setup(){
  const b=Array.from({length:8},()=>new Array(8).fill(0));
  for(let r=0;r<3;r++)for(let c=0;c<8;c++)if((r+c)%2===1)b[r][c]=-1;
  for(let r=5;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2===1)b[r][c]=1;
  return b;
}
// Матч: белые = bestForWhite (подсказчик), чёрные = minimaxPick (соперник).
// Равные бюджеты. Симметрия логики => счёт должен быть примерно равным.
const BUDGET=parseInt(process.argv[2]||'60');
const GAMES=parseInt(process.argv[3]||'20');
let w=0,b=0,d=0;
for(let g=0;g<GAMES;g++){
  const board=setup();let pl=1,mv=0,end=0;
  while(mv++<300){
    const macros=E.getMacroMoves(board,pl);
    if(!macros.length){end=-pl;break;}
    const m=pl===1?E.bestForWhite(board,BUDGET):E.minimaxPick(board,macros,BUDGET);
    E.applyMacro(board,m);
    end=E.checkEnd(board);if(end!==0)break;
    pl=-pl;
  }
  if(end===1)w++;else if(end===-1)b++;else d++;
}
console.log('Матч движков ('+GAMES+' партий, бюджет '+BUDGET+'мс/ход):');
console.log('Белые (подсказка): '+w+' | Чёрные (соперник): '+b+' | затяжные (300+ ходов): '+d);
