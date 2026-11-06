const $ = id => document.getElementById(id);
const official='https://www.bubun-kyousei.jp/';
const art=name=>name+'.webp';
const scenes = [
 {name:'cover', place:'今日のアルバム', kind:'message', line:'今日の写真、送るね〜！', alt:'カフェで顔を寄せた私と美咲と友達の集合写真'},
 {name:'home', place:'帰宅後、ソファで', kind:'spoken', line:'きたきた。どれどれ？', alt:'帰宅してソファで写真を開く私'},
 {name:'zoom', place:'集合写真を拡大', kind:'thought', line:'あ、やっぱりここの前歯、<br>重なって見えるな……', alt:'手元のスマホに映った3人の顔'},
 {name:'friend', place:'写真の中の美咲', kind:'thought', line:'あれ、美咲。前は口元を隠してたのに、<br>今日は歯を見せて笑ってる。', alt:'窓辺でやわらかく笑っている美咲'},
 {name:'chat', place:'美咲のトークを開く', kind:'thought', line:'最近いいことあったのかな。<br>もしかして、彼氏できた？', alt:'美咲にメッセージを送ろうとスマホを手にする私'}
];
$('fullPhotos').append($('casePhotos').content.cloneNode(true));
$('fullFacts').append($('caseFacts').content.cloneNode(true));
const dialogue=[
 ['私','ねえ','彼氏できた？👀'],['美咲','え、待ってｗ','どこ情報？笑'],['私','今日の写真見てた','めっちゃいい顔してるからさ'],['美咲','彼氏はまだでーす笑','でもいい感じの人はいる🤭'],['私','いるんじゃん！','どこで？ アプリ？'],['美咲','そそ！','週末また会うんだ〜','着てく服もう決めた笑'],['私','うかれてるな〜ｗ','写真ぜんぶ笑顔だし'],['美咲','それはある笑','でもね','前って写真で口閉じてたじゃん？'],['私','あ、たしかに'],['美咲','実は前歯の部分矯正してたんだ','私、前は歯見せるのちょっと苦手で','今は前より気楽に笑えるかも'],['私','部分矯正ってあるんだ！'],['美咲','そうそう！','私の写真じゃないけど、医院のサイトに載ってた例、送るね〜'],['画像','医院の参考症例'],['私','写真ありがと！','私もさっき自分の前歯、拡大してた笑','ね、美咲にちょっと聞いていい？']
];
const branches = {
 cost: [
  ['私','ぶっちゃけ、全部でいくらかかった？'],
  ['美咲','そこ気になるよね笑','私の場合は全部で30万くらいだったよ〜','でも歯並びによって違うみたい！'],
  ['私','教えてくれてありがと〜','一気に払うのはちょっと勇気いるな笑'],
  ['美咲','わかる、私も最初そこ聞いたもん笑','分けて払う方法もあるよ〜'],
  ['私','あ、それも聞いていいんだ','私なら全部でいくらか、聞いてみよ'],
  ['案内','最低治療費は税込23万1,000円〜（税抜21万円〜）。初診料等は別途です。個別総額・分割条件は医院でご確認ください。']
 ],
 time: [
  ['私','美咲は何か月くらい装置つけてた？'],
  ['美咲','私は3か月くらいだったよ！','これも人によるよ〜'],
  ['私','えっ、あの頃つけてたの？','全然気づかなかった笑'],
  ['美咲','言ってなかったもんね笑','私、今も別の装置を使ってるよ','外したあと、歯並びが元に戻るのを抑えるやつ☺️'],
  ['私','そっか！ 外した日でおしまいだと思ってた'],
  ['美咲','私も最初そう思ってた笑','どんなのをどれくらい使うかは人によるから','そこも一緒に聞いとくといいかも'],
  ['私','うん、メモしとこ。聞けてよかった〜'],
  ['案内','医院掲載の治療期間の目安は約3〜6か月。掲載症例には8〜12か月の例もあります。適否・期間は診察と検査で個別に判断します。']
 ]
};
const flatten=groups=>groups.flatMap(([who,...lines])=>lines.map(line=>({who,line})));
const base=flatten(dialogue);let queue=base,shown=0,branch=null,mode='comic',timer,paused=false,origin,lastCard=0;
function switchMode(value){
 clearTimeout(timer);mode=value;document.documentElement.className=value;
 $('stage').hidden=value!=='comic';$('thread').hidden=value!=='chat';$('article').hidden=value!=='reading';
}
function showCard(i){switchMode('comic');lastCard=i;document.querySelectorAll('.card')[i].scrollIntoView({block:'start'});}
$('stage').innerHTML=scenes.map(({name,place,kind,line,alt},i)=>'<section class="card" style="--photo:url('+art(name)+')"><div class="mast"><b>その笑顔、なんかあった？</b><span>創作漫画</span></div><div class="photo comic-panel ' + kind + '"><div class="speech"><strong>'+line+'</strong></div><img src="'+art(name)+'" alt="'+alt+'"></div><div class="foot"><small>0'+(i+1)+' / 05　'+place+'</small><div class="cardnav"><button '+(!i?'disabled':'')+' data-to="'+(i-1)+'" aria-label="前のコマ">←</button><button class="onward" data-to="'+(i+1)+'">'+(i===4?'美咲とのトークを開く':'次のコマへ　↓')+'</button></div><div class="links"><button data-start>最初から</button><span>上にスワイプ ↑</span><button data-read>記事へ ↗</button></div></div></section>').join('')+'<section id="gate" class="card"><button id="open">美咲とのトークを開く →</button></section>';
$('stage').onclick=e=>{let b=e.target.closest('button');if(!b)return;let card=b.closest('.card');lastCard=[...$('stage').children].indexOf(card);if(b.hasAttribute('data-start'))restart();else if(b.hasAttribute('data-read'))readArticle();else if(b.id==='open'||Number(b.dataset.to)===5)enterChat();else showCard(Number(b.dataset.to))};
new IntersectionObserver(entries=>{if(mode==='comic'&&entries.some(e=>e.isIntersecting&&e.intersectionRatio>.65))enterChat()},{root:document,threshold:.66}).observe($('gate'));
function enterChat(){switchMode('chat');lastCard=4;paintHistory();window.scrollTo(0,document.documentElement.scrollHeight);schedule()}
function restart(){asked.clear();branch=null;shown=0;queue=base;paused=false;showCard(0)}
function appendMessage({who,line},n){
 let row=document.createElement('div');if(who==='画像'){
  row.className='row attachment';
  row.innerHTML='<img class="avatar" src="'+art('friend')+'" alt="美咲"><div class="case-card"><button class="case-thumb" data-case aria-label="医院掲載の参考症例を拡大">'+$('casePhotos').innerHTML+'<small>写真をタップして拡大 ↗</small></button><div class="case-facts">'+$('caseFacts').innerHTML+'</div></div>';
 }else if(who==='案内'){row.className='notice';row.innerHTML='<b>医院の掲載情報</b><br>'+line}else{
 const mine=who==='私',time='21:'+String(8+Math.floor(n/5)).padStart(2,'0');
 row.className='row '+(mine?'me':'');const bubble='<span class="bubble">'+line+'</span>',stamp='<span class="time">'+(mine?'既読<br>':'')+time+'</span>';
 row.innerHTML=mine?stamp+bubble:'<img class="avatar" src="'+art('friend')+'" alt="美咲">'+bubble+stamp}
 $('messages').append(row)
}
const asked = new Map();
const topics = { cost: '費用', time: '期間' };
function controls(){
 let done=shown>=queue.length;
 const choices = $('choices'), actions = $('actions');
 choices.replaceChildren();
 if (!done) {
  actions.innerHTML='<button id="pause">'+(paused?'再開':'一時停止')+'</button><button id="one">次の発言</button><button class="primary" id="fast">すぐ読む ↓</button>';
  return;
 }
 actions.replaceChildren();
 if (!asked.size) {
  choices.innerHTML='<strong class="tap-tip">気になる方をタップ</strong><button data-branch="cost">結構お金かかる？　›</button><button data-branch="time">何か月で終わる？　›</button>';
  return;
 }
 const remaining = Object.keys(topics).find(key=>!asked.has(key));
 if (remaining) {
  choices.innerHTML='<button data-branch="'+remaining+'">もう一つ質問する（'+topics[remaining]+'）　›</button>';
 } else {
  for (const key of asked.keys()) {
   const button = document.createElement('button');
   button.dataset.review = key;
   button.textContent = topics[key]+'の回答を見返す';
   actions.append(button);
  }
 }
 actions.insertAdjacentHTML('beforeend','<button class="primary" id="continue">トークを終えて続きを読む　↓</button>');
}
function paintHistory(){$('messages').replaceChildren();queue.slice(0,shown).forEach(appendMessage);controls()}
function advance(all=false){
 clearTimeout(timer);if(mode!=='chat'||shown>=queue.length)return;
 const follow=all||document.documentElement.scrollHeight-innerHeight-scrollY<110;
 do{appendMessage(queue[shown],shown);shown++}while(all&&shown<queue.length);
 controls();if(follow)window.scrollTo(0,document.documentElement.scrollHeight);schedule()
}
function schedule(){clearTimeout(timer);if(mode!=='chat'||paused||document.hidden||$('caseViewer').open||shown>=queue.length)return;
 const len=shown?queue[shown-1].line.length:4;timer=setTimeout(()=>advance(),Math.min(4900,650+len*75))}
document.addEventListener('visibilitychange',schedule);
$('caseViewer').addEventListener('close',schedule);
$('thread').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-case')){clearTimeout(timer);$('caseViewer').showModal();return}
 if(b.dataset.review){
  const row=$('messages').children[asked.get(b.dataset.review)];
  row.scrollIntoView({block:'start'});
  return;
 }
 if(b.dataset.branch){
  const key=b.dataset.branch;
  if(asked.has(key)||shown!==queue.length)return;
  asked.set(key,queue.length);
  branch=key;
  queue=queue.concat(flatten(branches[key]));
  paused=false;
  advance();
  return;
 }
 switch(b.id){case 'leave':showCard(4);break;case 'chatReset':restart();break;case 'continue':readArticle();break;case 'pause':paused=!paused;controls();schedule();break;case 'one':advance();break;case 'fast':advance(true);break;}
};
$('readingPhotos').append($('casePhotos').content.cloneNode(true));
$('readingFacts').append($('caseFacts').content.cloneNode(true));
function readArticle(){
 origin=mode;
 switchMode('reading');
 $('resume').textContent=origin==='chat'?'← トークに戻る':'← 漫画に戻る';
 $('resume').onclick=()=>origin==='chat'?enterChat():showCard(lastCard);
 $('again').onclick=restart;window.scrollTo(0,0)
}
switchMode('comic');

// A wheel burst pages once. Touch pans keep the browser's native snap physics.
let wheelDirection = 0;
let wheelDistance = 0;
let wheelPaged = false;
let wheelTime = -Infinity;
$('stage').addEventListener('wheel', event => {
 if (mode !== 'comic' || event.ctrlKey || !event.cancelable ||
     Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
 const card = event.target.closest('.card');
 if (!card || card.offsetHeight > document.documentElement.clientHeight + 2) return;
 const direction = Math.sign(event.deltaY);
 const now = performance.now();
 if (now - wheelTime > 220 || direction !== wheelDirection) {
  wheelDistance = 0;
  wheelPaged = false;
 }
 wheelTime = now;
 wheelDirection = direction;
 event.preventDefault();
 if (wheelPaged) return;
 const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
 wheelDistance += Math.abs(event.deltaY) * unit;
 if (wheelDistance < 28) return;
 wheelPaged = true;
 const cards = Array.from($('stage').children);
 const nearest = cards.reduce((best, item) =>
  Math.abs(item.getBoundingClientRect().top) < Math.abs(best.getBoundingClientRect().top) ? item : best);
 const target = Math.max(0, cards.indexOf(nearest) + direction);
 if (target >= scenes.length) enterChat();
 else showCard(target);
}, { passive: false });
