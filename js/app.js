/* ============ 慢山行 · app ============ */
(function(){
"use strict";
const $=(s,c)=> (c||document).querySelector(s);
const $$=(s,c)=> Array.from((c||document).querySelectorAll(s));
const DAYS = DAYS1.concat(DAYS2);
const starsHtml=n=>{let s="";for(let i=0;i<5;i++)s+= i<n?"★":"☆";return s;};
const store={
  get(k){try{return JSON.parse(localStorage.getItem("manshan."+k))||{}}catch(e){return{}}},
  set(k,v){try{localStorage.setItem("manshan."+k,JSON.stringify(v))}catch(e){}}
};

/* ---------- hero ---------- */
requestAnimationFrame(()=>setTimeout(()=>document.body.classList.add("loaded"),80));

/* ---------- static lists ---------- */
function marklist(arr){return '<ul class="marklist">'+arr.map(x=>"<li>"+x+"</li>").join("")+"</ul>";}
function renderBody(body){
  return body.map(b=>{
    let h="";
    if(b.pre)h+='<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:8px">'+b.pre+"</p>";
    if(b.p)h+='<p style="font-size:13.8px;color:var(--ink-2);margin-bottom:10px">'+b.p+"</p>";
    if(b.li)h+=marklist(b.li);
    if(b.post)h+='<p style="font-size:13px;color:var(--cinnabar);margin-top:10px">'+b.post+"</p>";
    return h;
  }).join("");
}
function tblHtml(t,extraCls,numCols){
  const nums=numCols||[];
  let h='<table class="tbl '+(extraCls||"")+'"><thead><tr>'+t.head.map(x=>"<th>"+x+"</th>").join("")+"</tr></thead><tbody>";
  t.rows.forEach(r=>{
    const hl=r[r.length-1]===1;const cells=hl?r.slice(0,-1):r;
    h+='<tr'+(hl?' class="hl"':"")+">"+cells.map((c,i)=>'<td'+(nums.indexOf(i)>-1?' class="num"':"")+">"+(i===0?"<b>"+c+"</b>":c)+"</td>").join("")+"</tr>";
  });
  return h+"</tbody></table>";
}

$("#plist").innerHTML=PRINCIPLES.map((p,i)=>
 '<div class="card exp rv" data-exp style="--d:'+(i%3*0.08)+'s"><button class="exp-head" aria-expanded="false"><span class="ptitle"><b>'+String(i+1).padStart(2,"0")+'</b>'+p[0]+'</span><span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit pbody"><p>'+p[1]+"</p></div></div></div></div>").join("");
$("#stoploss").innerHTML=STOPLOSS.map(x=>"<li>"+x+"</li>").join("");
$("#fnlist").innerHTML=HOTEL_FN.map((f,i)=>'<div class="fn-item"><span class="fn-num">'+String(i+1).padStart(2,"0")+'</span><div><h4>'+f[0]+"</h4><p>"+f[1]+"</p></div></div>").join("");

/* hotel confirm checks → persistent checklist */
function chkHtml(id,txt,small,metaHtml){
  return '<label class="chk"><input type="checkbox" data-id="'+id+'"><span class="box"></span><span class="txt">'+txt+(small?"<small>"+small+"</small>":"")+"</span>"+(metaHtml||"")+"</label>";
}
const hotelState=store.get("hotel");
$("#hotelChecks").innerHTML=HOTEL_CHECKS.map((c,i)=>chkHtml("h"+i,c.replace(/；$/,""),null)).join("");
Array.from(document.querySelectorAll("#hotelChecks input")).forEach(inp=>{const k=inp.dataset.id;if(hotelState[k])inp.checked=true;});

/* ---------- overview ---------- */
function isTravelDay(dateStr){ // "08.06"
  const t=new Date();if(t.getFullYear()!==2026)return false;
  const[m,d]=dateStr.split(".").map(Number);
  return t.getMonth()+1===m&&t.getDate()===d;
}
$("#ovlist").innerHTML=DAYS.map(day=>{
  const today=isTravelDay(day.date);
  return '<div class="card exp daycard rv" data-exp><button class="exp-head" aria-expanded="false"><span class="ov-date"><span class="dn">D'+day.n+'</span><span class="dd"><b>'+day.date.replace(".","月")+"日 "+day.week+"</b>"+day.title+"</span></span>"+(today?'<span class="today-badge">今日</span>':"")+'<span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit"><dl class="ov-detail"><dt>主场景</dt><dd>'+day.scene+"</dd><dt>强度</dt><dd><span class='stars'>"+starsHtml(day.level)+"</span></dd><dt>关键词</dt><dd>"+day.keywords+"</dd><dt>核心取舍</dt><dd>"+day.trade+"</dd><dt>备用方案</dt><dd>"+day.fallback+'</dd></dl><a class="goto-day" href="#day-'+day.n+'">展开当日时间轴 ↓</a></div></div></div></div>';
}).join("");

/* ---------- days ---------- */
function tlHtml(list){
  return '<div class="tl">'+list.map((it,i)=>
    '<div class="tl-item exp" data-exp style="--i:'+i+'"><div class="card"><button class="exp-head tl-head" aria-expanded="false"><span class="tl-time">'+it.t+'</span><span class="tl-title">'+it.h+'</span><span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit"><div class="tl-grid">'+
    it.d.map(f=>'<div class="tl-f '+(f[0]==="安排"?"f-do":f[0]==="交通"?"f-go":f[0]==="备注"?"f-tip":"f-see")+'"><dt>'+f[0]+"</dt><dd>"+f[1]+"</dd></div>").join("")+
    "</div></div></div></div></div></div>").join("")+"</div>";
}
function wearCard(w){
  return '<div class="card exp rv" data-exp><button class="exp-head" aria-expanded="false"><span class="mini-h">'+w.title+'</span><span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit">'+marklist(w.items)+"</div></div></div></div>";
}
function extraCard(ex){
  const xt={culture:["xt-culture","文化"],photo:["xt-photo","摄影"],food:["xt-food","餐饮"],plan:["xt-plan","安排"],money:["xt-money","支出"]}[ex.k];
  let inner="";
  if(ex.table)inner='<div class="tblwrap budget-t">'+tblHtml(ex.table,null,[1])+"</div>";
  else inner=renderBody(ex.body);
  return '<div class="card exp rv" data-exp><button class="exp-head" aria-expanded="false"><span class="xtype '+xt[0]+'">'+xt[1]+'</span><span class="mini-h">'+ex.title+'</span><span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit">'+inner+"</div></div></div></div>";
}
function dayHtml(day){
  let h='<div class="day-block" id="day-'+day.n+'">';
  h+='<div class="day-head rv"><div class="dh-bg" style="background-image:url(\''+day.img+'\')" data-bg></div><div class="dh-kick"><span class="seal-mini">'+day.seal+'</span>DAY '+day.n+" ・ "+day.date.replace("."," 月 ")+" 日 ・ "+day.week+(isTravelDay(day.date)?' &nbsp;·&nbsp; 今日':'')+'</div><h3>'+day.title+'</h3><div class="dh-meta"><span class="stars">'+starsHtml(day.level)+'</span><span>主场景 · '+day.scene+"</span></div><p class='dh-goal'>"+day.goal+"</p></div>";
  if(day.plansNote)h+='<div class="note rv">'+day.plansNote+"</div>";
  if(day.precheck)h+='<div class="sub-label rv">'+day.precheck.title+' —— 全部满足才出发</div><div class="card rv" style="padding:14px 18px">'+marklist(day.precheck.items)+"</div>";
  if(day.traffic)h+='<div class="sub-label rv">交通选择</div><div class="card rv" style="padding:16px 18px;font-size:13.5px;color:var(--ink-2)">'+day.traffic+"</div>";
  if(day.wear)h+='<div class="sub-label rv">'+day.wear.title+"</div>"+wearCard(day.wear);
  if(day.plans){
    h+='<div class="sub-label rv">两套方案</div><div class="abtabs rv">'+day.plans.map((p,i)=>'<button class="abtab'+(i===0?" on":"")+'" data-ab="'+p.id+'"><b>'+p.name+"</b><span>"+p.tag+"</span></button>").join("")+"</div>";
    day.plans.forEach((p,i)=>{
      h+='<div class="ab-pane'+(i===0?" on":"")+'" data-abpane="'+p.id+'">';
      if(p.condition)h+='<div class="card rv" style="padding:14px 18px;margin-bottom:16px"><div style="font-size:12px;letter-spacing:.2em;color:var(--pine);margin-bottom:8px">启动条件 · 全部满足才出发</div>'+marklist(p.condition)+"</div>";
      if(p.wear)h+='<div class="card rv" style="padding:14px 18px;margin-bottom:16px;font-size:13.5px;color:var(--ink-2)"><b style="color:var(--ink)">穿搭：</b>'+p.wear+"</div>";
      h+=tlHtml(p.timeline);
      h+='<div class="d-extra">'+(p.extras||[]).map(extraCard).join("")+"</div></div>";
    });
    h+=(day.extras||[]).map(extraCard).join("");
  }else{
    h+='<div class="sub-label rv">时间轴 · 点击展开每一段</div>';
    h+=tlHtml(day.timeline);
    h+='<div class="d-extra">'+(day.extras||[]).map(extraCard).join("")+"</div>";
  }
  if(day.stoploss)h+='<div class="note rv" style="margin-top:20px">'+day.stoploss+"</div>";
  h+="</div>";
  return h;
}
$("#days").innerHTML=DAYS.map(dayHtml).join("");

/* ---------- culture flips ---------- */
$("#cultureCards").innerHTML=CULTURE.map((c,i)=>
 '<div class="flip rv" tabindex="0" role="button" aria-label="翻转查看'+c.place+'文化线索"><div class="flip-inner"><div class="flip-face flip-front"><div class="ff-top"><span class="ff-idx">'+String(i+1).padStart(2,"0")+' · 文化线索</span><span class="ff-hint">点击翻转</span></div><div class="ff-place">'+c.place+'</div><div class="ff-tag">'+c.tag+'</div><div class="ff-line">'+c.front+'</div><span class="ff-deco">'+c.deco+'</span></div><div class="flip-face flip-back '+c.back.alt+'"><div class="fb-title">'+c.back.title+'</div><ul class="fb-list">'+c.back.items.map(x=>"<li>"+x+"</li>").join("")+'</ul><div style="margin-top:auto;padding-top:14px;font-size:11.5px;letter-spacing:.1em;border-top:1px dashed rgba(243,236,221,.35);opacity:.85">'+c.back.foot+"</div></div></div></div>").join("");

/* ---------- photo ---------- */
function segHtml(items,name){
  return '<div class="seg" data-seg="'+name+'"><span class="seg-thumb"></span>'+items.map((x,i)=>'<button'+(i===0?' class="on"':"")+">"+x+"</button>").join("")+"</div>";
}
$("#photoMount").innerHTML=segHtml(PHOTO.map(p=>p.place),"photo")+
 PHOTO.map((p,i)=>'<div class="photo-pane'+(i===0?" on":"")+'" data-segpane="photo"><div class="photo-grid">'+
   p.scenes.map(s=>'<div class="pcard flip" tabindex="0" role="button"><div class="flip-inner"><div class="flip-face flip-front"><div class="pc-scene">'+s[0]+'</div><div class="pc-kw">'+s[1]+'</div><div class="pc-flip-hint">翻面看拍法 ↻</div></div><div class="flip-face flip-back"><div class="pc-note">拍法</div><div class="pc-tip">'+s[2]+'</div><div class="pc-back-foot">'+s[0]+"</div></div></div></div>").join("")+
 "</div></div>").join("");

/* ---------- food ---------- */
function dishCard(d){
  const st=d.stars?'<span class="stars">'+starsHtml(d.stars)+"</span>":"";
  let inner="";
  if(d.fit)inner+='<span class="dish-fit">'+d.fit+"</span>";
  if(d.desc)inner+="<p>"+d.desc+"</p>";
  (d.lists||[]).forEach(l=>{inner+="<h5>"+l[0]+"</h5>"+marklist(l[1]);});
  if(d.shop)inner+='<div class="note" style="margin-top:12px">'+d.shop+"</div>";
  if(d.postNote)inner+='<p style="font-size:13px;color:var(--cinnabar);margin-top:12px">'+d.postNote+"</p>";
  return '<div class="card exp dish" data-exp><button class="exp-head dish-head" aria-expanded="false"><span class="dish-name">'+d.name+"</span>"+st+'<span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit">'+inner+"</div></div></div></div>";
}
function marketPane(){
  return '<div class="card rv" style="padding:18px;margin-bottom:12px"><p style="font-size:13.5px;color:var(--ink-2);margin-bottom:12px">'+MARKET.intro+'</p><div style="font-size:12px;letter-spacing:.2em;color:var(--cinnabar);margin-bottom:8px">推荐顺序</div>'+marketOl(MARKET.route)+'</div><div class="card rv" style="padding:18px"><div style="font-size:12px;letter-spacing:.2em;color:var(--cinnabar);margin-bottom:8px">不建议购买</div>'+marklist(MARKET.ban)+"</div>";
}
function marketOl(arr){
  return '<ol style="list-style:none;counter-reset:m">'+arr.map(x=>'<li style="counter-increment:m;position:relative;padding-left:34px;margin-bottom:9px;font-size:13.5px;color:var(--ink-2)"><span style="position:absolute;left:0;top:1px;font-family:var(--disp);color:var(--cinnabar);font-size:15px;font-weight:600">'+arr.indexOf(x)+".</span>"+x+"</li>").join("")+"</ol>";
}
$("#foodMount").innerHTML=segHtml(FOOD.map(f=>f.label),"food")+
 FOOD.map((f,i)=>'<div class="food-pane'+(i===0?" on":"")+'" data-segpane="food">'+
   (f.special==="market"?marketPane():f.special==="mealtbl"?'<div class="card" style="padding:14px"><div class="tblwrap">'+tblHtml(MEALTBL,"meal-tbl")+'</div></div><div class="note">餐厅可能停业、换址、换主厨或出现长时间排队；所有店铺名称仅作搜索候选，出发前查看地图平台最近 1—3 个月评价。</div>':f.items.map(dishCard).join(""))+
 "</div>").join("");

/* ---------- backups ---------- */
$("#backupList").innerHTML=BACKUPS.map(b=>{
  let inner='<div class="bk-tags"><span class="bk-tag">'+b.pos+'</span><span class="bk-tag blue">'+b.dur+'</span><span class="bk-tag red">适合替换：'+b.suit+"</span>"+(b.ban?'<span class="bk-tag">不叠加：'+b.ban+"</span>":"")+"</div>";
  b.blocks.forEach(bl=>{
    inner+="<h5>"+bl[0]+"</h5>";
    inner+= Array.isArray(bl[1])?marklist(bl[1]):'<p style="font-size:13.5px;color:var(--ink-2)">'+bl[1].replace(/\.$/,"。")+"</p>";
  });
  return '<div class="card exp bk rv" data-exp><button class="exp-head" aria-expanded="false"><span class="bk-name">'+b.name+'</span><span class="bk-stars">'+starsHtml(b.stars)+'</span><span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit">'+inner+"</div></div></div></div>";
}).join("");
$("#decisionTbl").innerHTML=tblHtml(DECISIONS);

/* ---------- practical ---------- */
$("#cityTrans").innerHTML=CITY_TRANS.map(x=>"<li>"+x+"</li>").join("");
$("#wearLJ").innerHTML='<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:10px">'+WEAR_LJ.intro+"</p>"+marklist(WEAR_LJ.items)+'<div class="note">'+WEAR_LJ.warn+"</div>";
$("#wearXGRL").innerHTML='<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:10px">'+WEAR_XGRL.intro+'</p><div class="layers">'+WEAR_XGRL.layers.map((l,i)=>'<div class="layer"><b>'+(i+1)+"</b>"+l+"</div>").join("")+'</div><div class="note">'+WEAR_XGRL.warn+"</div>";
$("#altitudeRules").innerHTML=ALTITUDE.map(x=>"<li>"+x+"</li>").join("");
$("#rainRules").innerHTML=RAIN.map(x=>"<li>"+x+"</li>").join("");
$("#budgetTbl").innerHTML=tblHtml(BUDGET,null,[1]);

/* booking checklist */
const bookState=store.get("booking");
const LVL=["必须","强烈建议","可选"];
$("#bookingWrap").innerHTML=BOOKING.map((b,i)=>
  chkHtml("b"+i,b[0],"最晚处理："+b[1]+" ｜ 核验："+b[3],'<span class="chk-meta lvl-'+["must","rec","opt"][b[2]]+'">'+LVL[b[2]]+"</span>")).join("")+
 '<div style="padding:10px 2px 4px"><div class="chk-prog"><i id="bookProg"></i></div><div style="font-size:11px;color:var(--ink-3);letter-spacing:.1em" id="bookCount"></div></div>';
Array.from(document.querySelectorAll("#bookingWrap input")).forEach(inp=>{if(bookState[inp.dataset.id])inp.checked=true;});

/* pack checklist */
const packState=store.get("pack");
$("#packWrap").innerHTML=PACK.map((g,gi)=>
  '<div class="card exp rv'+(gi===0?" open":"")+'" data-exp style="margin-bottom:12px"><button class="exp-head" aria-expanded="'+(gi===0) +'"><span class="ptitle"><b>'+String(gi+1).padStart(2,"0")+'</b>'+g[0]+'</span><span style="font-size:11px;color:var(--ink-3)" data-gcount></span><span class="chev"></span></button><div class="exp-body"><div class="exp-in"><div class="exp-pad fadeit"><div class="chk-prog"><i data-gprog></i></div>'+g[1].map((it,ii)=>chkHtml("g"+gi+"i"+ii,it)).join("")+"</div></div></div></div>").join("");
Array.from(document.querySelectorAll("#packWrap input")).forEach(inp=>{if(packState[inp.dataset.id])inp.checked=true;});

/* ---------- flip cards: size to real content (front & back) ---------- */
function sizeFlips(){
  $$(".flip").forEach(f=>{
    const inner=f.querySelector(".flip-inner");if(!inner)return;
    if(!inner.getClientRects().length)return; /* inside hidden pane: size later */
    const faces=$$(".flip-face",inner);
    let max=0;
    faces.forEach(fa=>{
      faces.forEach(o=>{if(o!==fa){o.style.position="absolute";o.style.visibility="hidden";}});
      fa.style.position="relative";
      const h=fa.getBoundingClientRect().height;
      if(h>max)max=h;
    });
    faces.forEach(o=>{o.style.position="";o.style.visibility="";});
    if(max>0)f.style.height=Math.ceil(max)+"px";
  });
}
sizeFlips();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(sizeFlips);
addEventListener("load",sizeFlips);

/* ---------- interactions ---------- */
document.addEventListener("click",e=>{
  const head=e.target.closest(".exp-head");
  if(head){
    const exp=head.closest(".exp");
    const open=exp.classList.toggle("open");
    head.setAttribute("aria-expanded",open);
    return;
  }
  const flip=e.target.closest(".flip");
  if(flip){flip.classList.toggle("flipped");return;}
  const ab=e.target.closest(".abtab");
  if(ab){
    const wrap=ab.closest(".day-block")||document;
    $$(".abtab",wrap).forEach(b=>b.classList.toggle("on",b===ab));
    $$("[data-abpane]",wrap).forEach(p=>p.classList.toggle("on",p.dataset.abpane===ab.dataset.ab));
    requestAnimationFrame(sizeFlips);
  }
});
document.addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("flip")){
    e.preventDefault();e.target.classList.toggle("flipped");
  }
});

/* segmented controls */
function placeThumb(seg){
  const on=seg.querySelector("button.on");const th=seg.querySelector(".seg-thumb");
  if(!on||!th)return;
  th.style.width=on.offsetWidth+"px";
  th.style.transform="translateX("+on.offsetLeft+"px)";
}
function initSegs(scope){
  $$("[data-seg]",scope).forEach(seg=>{
    placeThumb(seg);
    seg.addEventListener("click",e=>{
      const btn=e.target.closest("button");if(!btn)return;
      $$("button",seg).forEach(b=>b.classList.toggle("on",b===btn));
      placeThumb(seg);
      const name=seg.dataset.seg;
      $$('[data-segpane="'+name+'"]').forEach((p,i)=>p.classList.toggle("on",$$("button",seg).indexOf(btn)===i));
      requestAnimationFrame(sizeFlips);
    });
  });
}
initSegs(document);
window.addEventListener("resize",()=>$("[data-seg]")&&$$("[data-seg]").forEach(placeThumb));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>$$("[data-seg]").forEach(placeThumb));

/* checklist persistence + progress */
function refreshProgress(){
  // booking
  const bins=Array.from(document.querySelectorAll("#bookingWrap input"));
  const bdone=bins.filter(i=>i.checked).length;
  const bp=$("#bookProg"),bc=$("#bookCount");
  if(bp)bp.style.width=(bdone/bins.length*100)+"%";
  if(bc)bc.textContent="已确认 "+bdone+" / "+bins.length;
  // pack groups
  $$("#packWrap [data-exp]").forEach(card=>{
    const ins=$$("input",card);const done=ins.filter(i=>i.checked).length;
    const prog=$("[data-gprog]",card);if(prog)prog.style.width=(done/ins.length*100)+"%";
    const cnt=$("[data-gcount]",card);if(cnt)cnt.textContent=done+"/"+ins.length;
  });
}
document.addEventListener("change",e=>{
  const inp=e.target.closest("input[type=checkbox]");if(!inp)return;
  const wrap=inp.closest("#hotelChecks,#bookingWrap,#packWrap");
  const key=wrap.id==="hotelChecks"?"hotel":wrap.id==="bookingWrap"?"booking":"pack";
  const st=store.get(key);st[inp.dataset.id]=inp.checked;store.set(key,st);
  refreshProgress();
});
refreshProgress();

/* ---------- scroll effects ---------- */
const io=new IntersectionObserver(es=>es.forEach(en=>{
  if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}
}),{threshold:.12,rootMargin:"0px 0px -6% 0px"});
$$(".rv, .tl").forEach(el=>io.observe(el));
$$(".rv").forEach((el,i)=>{if(el.style.getPropertyValue("--d")===""&&!el.style.getPropertyValue("--d"))el.style.setProperty("--d",((i%3)*0.07)+"s");});

/* scrollspy */
const navLinks=$$(".snav a");
const spyTargets=navLinks.map(a=>$(a.getAttribute("href")));
const spy=new IntersectionObserver(es=>{
  es.forEach(en=>{
    if(en.isIntersecting){
      const idx=spyTargets.indexOf(en.target);
      navLinks.forEach((l,i)=>l.classList.toggle("on",i===idx));
      const link=navLinks[idx];
      link.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
    }
  });
},{rootMargin:"-38% 0px -55% 0px"});
spyTargets.forEach(t=>t&&spy.observe(t));

/* progress bar + fab + hero parallax */
const prog=$("#progress"),fab=$("#fab");
const heroEl=$(".hero"),heroMedia=$("#heroMedia"),heroBodyEl=$(".hero-body"),snavEl=$("#snav");
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
let heroH=heroEl.offsetHeight;
addEventListener("resize",()=>{heroH=heroEl.offsetHeight;sizeFlips();},{passive:true});
let rt;addEventListener("orientationchange",()=>{clearTimeout(rt);rt=setTimeout(sizeFlips,260);});
let tick=false;
function onScroll(){
  if(tick)return;tick=true;
  requestAnimationFrame(()=>{
    const h=document.documentElement;
    const sy=h.scrollTop;
    const max=h.scrollHeight-innerHeight;
    prog.style.width=(max>0?(sy/max*100):0)+"%";
    fab.classList.toggle("show",sy>innerHeight*1.2);
    snavEl.classList.toggle("scrolled",sy>heroH-64);
    if(!reduceMotion&&sy<heroH){
      heroMedia.style.transform="translate3d(0,"+Math.min(sy*.24,heroH*.14).toFixed(1)+"px,0)";
      heroBodyEl.style.opacity=Math.max(0,1-sy/(heroH*.72)).toFixed(3);
      heroBodyEl.style.transform="translate3d(0,"+(sy*.16).toFixed(1)+"px,0)";
    }
    tick=false;
  });
}
addEventListener("scroll",onScroll,{passive:true});
fab.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));

/* smooth anchor with sticky offset */
document.addEventListener("click",e=>{
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  const t=$(a.getAttribute("href"));
  if(t){e.preventDefault();t.scrollIntoView({behavior:"smooth",block:"start"});}
});

/* image fallback: if an asset fails to load, leave gradient bg */
$$("[data-bg]").forEach(el=>{
  const im=new Image();
  im.onerror=()=>{el.style.backgroundImage="none";};
  im.src=el.style.backgroundImage.slice(5,-2).replace(/'/g,"");
});

/* ---------- search ---------- */
const SECTION_NAMES={xinfa:"心法",zong:"总览",hotel:"主场",decide:"关键决定",trip:"行程",culture:"文化",photo:"摄影",food:"美食",backup:"备选景点",pract:"实务",money:"预算",lists:"清单"};
function sectionOf(el){
  const s=el.closest("section.sec");
  const base=s?(SECTION_NAMES[s.id]||"手册"):"手册";
  if(s&&s.id==="trip"){const db=el.closest(".day-block");if(db)return base+" · DAY "+db.id.replace("day-","");}
  return base;
}
function titleOf(el){
  if(el.classList.contains("tl-item"))return((el.querySelector(".tl-time")||{}).textContent||"")+" "+((el.querySelector(".tl-title")||{}).textContent||"");
  if(el.classList.contains("daycard")){const b=el.querySelector(".dd b");const dd=el.querySelector(".dd");const t=dd?(dd.textContent.replace(b?b.textContent:"","")).trim():"";return(b?b.textContent+" ":"")+t;}
  if(el.classList.contains("day-head")){const db=el.closest(".day-block");return"DAY "+((db||{}).id||"").replace("day-","")+" "+((el.querySelector("h3")||{}).textContent||"");}
  if(el.classList.contains("dish")||el.classList.contains("bk"))return(((el.querySelector(".dish-name,.bk-name")||{}).textContent||"")).trim();
  if(el.classList.contains("flip"))return(((el.querySelector(".ff-place,.pc-scene")||{}).textContent||"")).trim()||"卡片";
  if(el.classList.contains("fn-item"))return((el.querySelector("h4")||{}).textContent||"").trim();
  if(el.classList.contains("chk"))return(((el.querySelector(".txt")||{}).textContent||"")).trim();
  if(el.tagName==="TABLE")return(((el.closest(".card")||{}).querySelector(".spec-title,.ptitle,.mini-h")||{}).textContent||"数据表").trim();
  if(el.classList.contains("dec")||el.classList.contains("spec"))return(((el.querySelector(".ptitle,.spec-title")||{}).textContent||"")).trim();
  return(el.textContent||"").trim().slice(0,20);
}
const SEARCH_SELS=[".day-head",".tl-item",".daycard",".flip",".dish",".bk",".fn-item",".chk",".dec",".spec",".note",".mantra",".pquote",".decision-note","table.tbl"];
const searchIndex=[];
document.querySelectorAll(SEARCH_SELS.join(",")).forEach(el=>{
  if(el.closest(".search-ov,.snav"))return;
  const text=(el.innerText||"").replace(/\s+/g," ").trim();
  if(text.length<3)return;
  searchIndex.push({el:el,text:text,lower:text.toLowerCase(),title:titleOf(el),where:sectionOf(el)});
});
const searchOv=$("#searchOv"),searchInput=$("#searchInput"),searchResults=$("#searchResults"),
      searchHint=$("#searchHint"),searchCount=$("#searchCount"),searchClear=$("#searchClear");
let lastResults=[];
function escapeHtml(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function highlight(s,tokens){
  let h=escapeHtml(s);
  tokens.forEach(tk=>{
    const re=new RegExp(tk.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi");
    h=h.replace(re,m=>"<mark>"+escapeHtml(m)+"</mark>");
  });
  return h;
}
function doSearch(q){
  q=q.trim();
  searchClear.classList.toggle("show",q.length>0);
  if(!q){searchHint.style.display="";searchCount.classList.remove("show");searchResults.innerHTML="";return;}
  const tokens=q.toLowerCase().split(/\s+/).filter(Boolean);
  const scored=[];
  for(const it of searchIndex){
    let ok=true,score=0;
    for(const tk of tokens){
      const i=it.lower.indexOf(tk);
      if(i<0){ok=false;break;}
      score+=((it.title||"").toLowerCase().indexOf(tk)>-1?4:0)+Math.min(it.lower.split(tk).length-1,4);
    }
    if(ok)scored.push({it:it,score:score});
  }
  scored.sort((a,b)=>b.score-a.score);
  lastResults=scored.slice(0,30);
  searchHint.style.display="none";
  searchCount.textContent=scored.length+" 处匹配"+(scored.length>30?" · 显示前 30":"")+" · 点击直达";
  searchCount.classList.add("show");
  if(!lastResults.length){
    searchResults.innerHTML='<div class="so-empty"><b>没有找到「'+escapeHtml(q)+'」</b>换个关键词试试，比如「腊排骨」「转经筒」「玉湖村」</div>';
    return;
  }
  searchResults.innerHTML=lastResults.map((r,i)=>{
    const idx=r.it.lower.indexOf(tokens[0]);
    const from=Math.max(0,idx-16),cut=idx+tokens[0].length+34>r.it.text.length;
    const snip=(from>0?"…":"")+r.it.text.slice(from,idx+tokens[0].length+40)+(cut?"":"…");
    return '<button class="sr-item" data-i="'+i+'" style="--d:'+(Math.min(i,8)*0.05)+'s"><span class="sr-where"><i></i>'+escapeHtml(r.it.where)+'</span><span class="sr-title">'+highlight(r.it.title||r.it.text.slice(0,22),tokens)+'</span><span class="sr-snip">'+highlight(snip,tokens)+"</span></button>";
  }).join("");
  const items=$$(".sr-item",searchResults);
  requestAnimationFrame(()=>requestAnimationFrame(()=>items.forEach(b=>b.classList.add("in"))));
}
function activatePaneOf(el){
  const pane=el.closest(".photo-pane,.food-pane,.ab-pane");
  if(!pane)return;
  if(pane.classList.contains("ab-pane")){
    const btn=document.querySelector('.abtab[data-ab="'+pane.dataset.abpane+'"]');if(btn)btn.click();
  }else if(!pane.classList.contains("on")){
    const name=pane.dataset.segpane;
    const panes=$$('[data-segpane="'+name+'"]');
    const seg=document.querySelector('.seg[data-seg="'+name+'"]');
    const btn=seg&&seg.querySelectorAll("button")[panes.indexOf(pane)];
    if(btn)btn.click();
  }
}
function jumpTo(entry){
  closeSearch();
  const el=entry.it.el;
  let p=el;
  while(p&&p!==document.body){
    if(p.classList){
      if(p.classList.contains("exp")&&!p.classList.contains("open")){
        p.classList.add("open");
        const h=p.querySelector(".exp-head");if(h)h.setAttribute("aria-expanded","true");
      }
      if(p.classList.contains("rv"))p.classList.add("in");
    }
    p=p.parentElement;
  }
  activatePaneOf(el);
  sizeFlips();
  setTimeout(()=>{
    el.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(()=>{
      const card=el.classList.contains("card")?el:(el.querySelector(":scope>.card")||el);
      card.classList.remove("flash");
      void card.offsetWidth;
      card.classList.add("flash");
      card.addEventListener("animationend",()=>card.classList.remove("flash"),{once:true});
    },420);
  },90);
}
function openSearch(){
  searchOv.classList.add("open");
  document.documentElement.style.overflow="hidden";
  setTimeout(()=>searchInput.focus(),380);
}
function closeSearch(){
  searchOv.classList.remove("open");
  document.documentElement.style.overflow="";
  searchInput.blur();
}
$("#searchBtn").addEventListener("click",openSearch);
$("#searchClose").addEventListener("click",closeSearch);
searchClear.addEventListener("click",()=>{searchInput.value="";doSearch("");searchInput.focus();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&searchOv.classList.contains("open"))closeSearch();});
let sT;searchInput.addEventListener("input",()=>{clearTimeout(sT);sT=setTimeout(()=>doSearch(searchInput.value),130);});
searchResults.addEventListener("click",e=>{
  const b=e.target.closest(".sr-item");
  if(b&&lastResults[+b.dataset.i])jumpTo(lastResults[+b.dataset.i]);
});
$$(".so-chips button").forEach(b=>b.addEventListener("click",()=>{searchInput.value=b.textContent;doSearch(b.textContent);}));
})();
