/* ========== Mewgenics Codex 应用 ========== */
(function () {
"use strict";
const D = window.CODEX;
const W = window.WIKI_ASSETS || {meta:{assetCount:0,coverage:{}},categories:{},entities:{classes:{},bosses:{},dbs:{}}};
const $ = s => document.querySelector(s);
const dbs = D.dbs;

/* ---------- 数据库定义 ---------- */
const DBDEF = {
  mutations: { label:"突变", icon:"MUT", facet:{k:"c",t:"部位"},
    cols:[["id","ID","cell-id"],["n","名称","cell-name"],["e","效果"],["tag","标签","cell-id"]] },
  disorders: { label:"失调", icon:"DIS",
    cols:[["n","名称","cell-name"],["neg","负面"],["s","一线生机"],["p","分池"]] },
  statuses: { label:"状态效果", icon:"STS", facet:{k:"t",t:"类型"},
    cols:[["n","名称","cell-name"],["e","效果"]] },
  elements: { label:"元素", icon:"ELM",
    cols:[["p","优先级","cell-id"],["n","元素","cell-name"],["e","定位"]] },
  hiddenEl: { label:"隐藏元素", icon:"HID",
    cols:[["n","名称","cell-name"],["e","效果"],["src","主要来源"]] },
  weather: { label:"天气", icon:"WTH",
    cols:[["n","名称","cell-name"],["r","稀有度","cell-id"],["e","效果"]] },
  tiles: { label:"地形", icon:"TIL",
    cols:[["n","名称","cell-name"],["e","效果"]] },
  traps: { label:"陷阱", icon:"TRP",
    cols:[["n","名称","cell-name"],["e","效果"]] },
  pickups: { label:"战场拾取物", icon:"PCK",
    cols:[["n","名称","cell-name"],["e","效果"]] },
  familiars: { label:"召唤物", icon:"FAM", facet:{k:"c",t:"分类"},
    cols:[["n","名称","cell-name"],["e","效果"]] },
  sets: { label:"套装", icon:"SET",
    cols:[["n","套装","cell-name"],["p","组成"],["e","集齐效果"]] },
  consumables: { label:"消耗品", icon:"CON",
    cols:[["n","名称","cell-name"],["u","次数","cell-id"],["e","效果"]] },
  enemies: { label:"敌人", icon:"ENM", facet:{k:"r",t:"区域"},
    cols:[["n","敌人","cell-name"],["e","能力"]] },
  locations: { label:"地点", icon:"LOC",
    cols:[["n","地点","cell-name"],["t","类型","cell-id"],["e","要点"]] },
};

const PAGES = {
  bosses:    { label:"Boss 图鉴", icon:"BOS" },
  world:     { label:"世界观与剧情", icon:"WRD" },
  adventure: { label:"冒险与关卡结构", icon:"MAP" },
  stats:     { label:"属性系统", icon:"STA" },
  breeding:  { label:"繁殖与遗传", icon:"GEN" },
  combat:    { label:"战斗机制", icon:"DMG" },
  builds:    { label:"流派 Build 合集", icon:"BLD" },
  items:     { label:"物品装备详解", icon:"ITM" },
  furniture: { label:"家具与房子", icon:"HSE" },
  food:      { label:"食物系统", icon:"FOD" },
};

const TOOL_ROUTES = {
  __bossprep: "#/boss/0",
  __buildplanner: "#/planner/0",
  __breeding: "#/breeding",
  __combatcalc: "#/calc",
};
const LAST_TOOL_KEY = "mew_last_tool_v1";
const NAV_COLLAPSE_KEY = "mew_nav_collapse_v1";
const TOOL_LEVEL_KEY = "mew_tool_level_v1";
const FAVORITES_KEY = "mew_favorites_v1";
const RECENT_DETAIL_KEY = "mew_recent_detail_v1";
const SEARCH_HISTORY_KEY = "mew_search_history_v1";
const ASSET_GALLERIES = {
  items:{label:"物品图标",icon:"ITM",desc:"武器、护甲、饰品与消耗品"},
  abilities:{label:"技能图标",icon:"ABL",desc:"主动、被动与特殊能力"},
  furniture:{label:"家具图鉴",icon:"HSE",desc:"房屋家具与稀有变体"},
  maps:{label:"地图资源",icon:"MAP",desc:"章节地图与路线节点"},
};

/* ---------- 侧边导航 ---------- */
const NAV = [
  { title:"核心", items:[{k:"__codex",label:"图鉴总览",icon:"DB"},{k:"__classes",label:"职业（14）",icon:"CLS"}] },
  { title:"实战工具", items:[
    {k:"__bossprep",label:"Boss 备战",icon:"PREP"},
    {k:"__buildplanner",label:"Build 配装",icon:"BUILD"},
    {k:"__breeding",label:"繁殖规划",icon:"GEN"},
    {k:"__combatcalc",label:"战斗计算",icon:"DMG"}] },
  { title:"战斗", items:[
    {k:"statuses",icon:"STS"},{k:"elements",icon:"ELM"},{k:"hiddenEl",icon:"HID"},
    {k:"weather",icon:"WTH"},{k:"tiles",icon:"TIL"},{k:"traps",icon:"TRP"},
    {k:"pickups",icon:"PCK"},{k:"familiars",icon:"FAM"}] },
  { title:"装备", items:[{k:"sets",icon:"SET"},{k:"consumables",icon:"CON"},{k:"__assets_items",label:"物品图标",icon:"ITM"}] },
  { title:"世界", items:[{k:"enemies",icon:"ENM"},{k:"__npcs",label:"NPC",icon:"NPC"},{k:"locations",icon:"LOC"}] },
  { title:"素材图库", items:[
    {k:"__assets_abilities",label:"技能图标",icon:"ABL"},
    {k:"__assets_furniture",label:"家具图鉴",icon:"HSE"},
    {k:"__assets_maps",label:"地图资源",icon:"MAP"}] },
  { title:"深度资料", items:[
    {k:"@world",icon:"WRD"},{k:"@adventure",icon:"MAP"},{k:"@stats",icon:"STA"},
    {k:"@breeding",icon:"GEN"},{k:"@combat",icon:"DMG"},
    {k:"@items",icon:"ITM"},{k:"@furniture",icon:"HSE"},{k:"@food",icon:"FOD"}] },
];

function buildSideNav(){
  const nav = $("#sideNav");
  const collapsed = readLocalJson(NAV_COLLAPSE_KEY,{"实战工具":true,"装备":true,"世界":true,"素材图库":true,"深度资料":true});
  nav.innerHTML = NAV.map((g,groupIndex) => {
    const links = g.items.map(it => {
      let label = it.label, key = it.k;
      if(!label){
        if(DBDEF[key]) label = DBDEF[key].label;
        else if(PAGES[key.slice(1)]) label = PAGES[key.slice(1)].label;
      }
      let count = "";
      if(dbs[key]) count = `<span class="count">${dbs[key].length}</span>`;
      else if(key.startsWith("__assets_")){
        const kind=key.slice(9);
        count=`<span class="count">${(W.categories[kind]||[]).length}</span>`;
      }
      return `<button class="side-link" data-key="${key}"><span>${it.icon}</span>${label}${count}</button>`;
    }).join("");
    const isCollapsed=!!collapsed[g.title];
    return `<div class="side-group ${isCollapsed?"collapsed":""}" data-nav-group="${groupIndex}">
      <button class="side-group-title" data-nav-toggle="${groupIndex}" aria-expanded="${String(!isCollapsed)}">${g.title}<span>⌄</span></button>
      <div class="side-group-items">${links}</div>
    </div>`;
  }).join("");
  nav.addEventListener("click", e => {
    const toggle=e.target.closest("[data-nav-toggle]");
    if(toggle){
      const group=NAV[+toggle.dataset.navToggle];
      const container=toggle.closest(".side-group");
      const next=!container.classList.contains("collapsed");
      container.classList.toggle("collapsed",next);
      toggle.setAttribute("aria-expanded",String(!next));
      collapsed[group.title]=next;
      localStorage.setItem(NAV_COLLAPSE_KEY,JSON.stringify(collapsed));
      return;
    }
    const btn = e.target.closest(".side-link");
    if(!btn) return;
    const key = btn.dataset.key;
    if(key === "__codex") location.hash = "#/codex";
    else if(key === "__classes") location.hash = "#/classes";
    else if(key === "__npcs") location.hash = "#/npcs";
    else if(key.startsWith("__assets_")) location.hash = "#/assets/" + key.slice(9);
    else if(TOOL_ROUTES[key]) location.hash = TOOL_ROUTES[key];
    else if(key.startsWith("@")) location.hash = "#/page/" + key.slice(1);
    else location.hash = "#/db/" + key;
    closeMobileNav();
  });
}

/* ---------- 工具 ---------- */
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function attr(s){ return esc(s).replace(/"/g,"&quot;"); }
function highlight(text, q){
  let h = esc(text);
  if(q){
    const qq = q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    h = h.replace(new RegExp(qq,"gi"), m => `<mark>${m}</mark>`);
  }
  return h;
}
function recText(r){ return Object.values(r).join(" ¦ ").toLowerCase(); }
function matchQ(r, q){ return !q || recText(r).includes(q.toLowerCase()); }
function dispName(n){ return n ? n : "（未命名）"; }
const assetIndexes = {};
let assetPathIndex = null;
function assetKey(value){
  return String(value||"").normalize("NFKD")
    .replace(/\([^)]*\)|\[[^\]]*\]|「[^」]*」/g," ")
    .replace(/&/g," and ").replace(/'n'/gi," and ")
    .toLowerCase().replace(/\b(the|consumable|familiar|tile)\b/g," ")
    .replace(/[^a-z0-9]+/g,"");
}
function wikiAssets(kind){
  return Array.isArray(W.categories?.[kind]) ? W.categories[kind] : [];
}
function catalogAsset(kind, name){
  if(!name) return null;
  if(!assetIndexes[kind]){
    const index=new Map();
    wikiAssets(kind).forEach(item=>{
      const key=assetKey(item.n);
      if(!index.has(key)) index.set(key,item);
    });
    assetIndexes[kind]=index;
  }
  return wikiAssets(kind).find(item=>item.n===name) || assetIndexes[kind].get(assetKey(name)) || null;
}
function entityImage(key, record){
  const entityKey=key==="mutations" ? record.id : record.n;
  const direct=W.entities?.dbs?.[key]?.[entityKey];
  if(direct) return direct;
  if(key==="sets"){
    const components=String(record.p||"").split(/\s*[／、]\s*/);
    for(const component of components){
      const clean=component.replace(/（[^）]*）/g,"").trim();
      const asset=catalogAsset("items",clean);
      if(asset) return asset.img;
    }
  }
  const category={
    consumables:"items",enemies:"enemies",familiars:"enemies",
    statuses:"statuses",disorders:"disorders",weather:"weather",
    tiles:"tiles",traps:"traps",pickups:"pickups",
    elements:"elements",hiddenEl:"elements",locations:"maps",npcs:"npcs",
  }[key];
  return category ? catalogAsset(category,record.n)?.img||"" : "";
}
function classImage(record){
  return W.entities?.classes?.[record.n] || catalogAsset("classes",record.n)?.img || "";
}
function bossImage(record){
  return W.entities?.bosses?.[record.n] || catalogAsset("bosses",record.n)?.img || "";
}
function bossArt(record){
  return W.entities?.bossArt?.[record.n] || bossImage(record);
}
function imageTag(src, alt, className="entity-icon"){
  return src ? `<img class="${className}" src="${attr(src)}" alt="${attr(alt)}" loading="lazy" decoding="async">` : "";
}
function assetByPath(path){
  if(!assetPathIndex){
    assetPathIndex=new Map();
    Object.values(W.categories||{}).flat().forEach(item=>assetPathIndex.set(item.img,item));
  }
  return assetPathIndex.get(path)||null;
}
function drawerVisual(src, alt, wide=false){
  if(!src) return "";
  const asset=assetByPath(src);
  return `<figure class="drawer-visual ${wide?"wide":""}">
    ${imageTag(src,alt,"drawer-entity-image")}
    ${asset?`<figcaption><a href="${attr(asset.source)}" target="_blank" rel="noreferrer">查看原始图片</a></figcaption>`:""}
  </figure>`;
}
function slotPreview(kind, value){
  const asset=catalogAsset(kind,value);
  return `<img class="slot-preview ${asset?"":"hidden"}" src="${asset?attr(asset.img):""}" alt="" loading="lazy" decoding="async">`;
}
function syncSlotPreview(input, kind){
  const image=input.closest(".slot-input")?.querySelector(".slot-preview");
  if(!image) return;
  const asset=catalogAsset(kind,input.value);
  image.src=asset?.img||"";
  image.classList.toggle("hidden",!asset);
}

/* ---------- 纸张纹理 ---------- */
function seededRandom(seed){
  let state = seed >>> 0;
  return ()=>{
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function drawPaperTexture(){
  const canvas = $("#paperTexture");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const W=720,H=420, light=document.documentElement.dataset.theme==="light";
  canvas.width=W; canvas.height=H;
  ctx.clearRect(0,0,W,H);
  const rand=seededRandom(686060);
  const fiber=light ? "rgba(38,34,25,.24)" : "rgba(203,186,142,.18)";
  const speck=light ? "rgba(65,53,36,.3)" : "rgba(122,108,77,.22)";
  ctx.strokeStyle=fiber; ctx.lineWidth=1;
  for(let i=0;i<165;i++){
    const x=rand()*W,y=rand()*H,len=4+rand()*32;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+len,y+(rand()-.5)*3); ctx.stroke();
  }
  ctx.fillStyle=speck;
  for(let i=0;i<460;i++){
    const size=rand()>.9?2:1;
    ctx.fillRect(Math.floor(rand()*W),Math.floor(rand()*H),size,size);
  }
}

/* ---------- Markdown 渲染（迷你） ---------- */
function mdInline(s){
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return s;
}
function splitPipe(line){
  line = line.trim();
  if(line.startsWith("|")) line = line.slice(1);
  if(line.endsWith("|")) line = line.slice(0,-1);
  return line.split("|").map(c=>c.trim());
}
function mdRender(src){
  const codes = [];
  src = src.replace(/```[^\n]*\n?([\s\S]*?)```/g, (_,c)=>{ codes.push(c); return `\u0000${codes.length-1}\u0000`; });
  const lines = src.split("\n");
  let html = "", i = 0;
  while(i < lines.length){
    const l = lines[i];
    if(!l.trim()){ i++; continue; }
    let hm = l.match(/^(#{1,4})\s+(.*)$/);
    if(hm){ html += `<h${hm[1].length}>${mdInline(esc(hm[2]))}</h${hm[1].length}>`; i++; continue; }
    if(/^---+$/.test(l.trim())){ html += "<hr>"; i++; continue; }
    // 表格
    if(l.trim().startsWith("|") && i+1<lines.length && /^[\s|:\-]+$/.test(lines[i+1])){
      const hdr = splitPipe(l); i += 2; let body = "";
      while(i<lines.length && lines[i].trim().startsWith("|")){
        body += "<tr>" + splitPipe(lines[i]).map(c=>`<td>${mdInline(esc(c))}</td>`).join("") + "</tr>"; i++;
      }
      html += `<table><thead><tr>${hdr.map(c=>`<th>${mdInline(esc(c))}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
      continue;
    }
    // 引用
    if(l.startsWith(">")){
      const buf = [];
      while(i<lines.length && lines[i].startsWith(">")){ buf.push(lines[i].replace(/^>\s?/,"")); i++; }
      html += `<blockquote>${mdRender(buf.join("\n"))}</blockquote>`;
      continue;
    }
    // 列表
    if(/^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l)){
      const ordered = /^\d+\./.test(l); const items = [];
      while(i<lines.length && (/^[-*]\s+/.test(lines[i]) || /^\d+\.\s+/.test(lines[i]))){
        items.push(lines[i].replace(/^([-*]|\d+\.)\s+/,"")); i++;
      }
      html += (ordered?"<ol>":"<ul>") + items.map(t=>`<li>${mdInline(esc(t))}</li>`).join("") + (ordered?"</ol>":"</ul>");
      continue;
    }
    // 段落
    const buf = [l]; i++;
    while(i<lines.length && lines[i].trim() && !/^(#{1,4}\s|>|\||---+|[-*]\s|\d+\.\s)/.test(lines[i])){ buf.push(lines[i]); i++; }
    html += `<p>${mdInline(esc(buf.join(" ")))}</p>`;
  }
  return html.replace(/\u0000(\d+)\u0000/g, (_,n)=>`<pre><code>${esc(codes[+n])}</code></pre>`);
}

/* ---------- 视图显示控制 ---------- */
const VIEWS = ["view-home","view-db","view-search","view-page","view-learn","view-boss","view-build","view-breed","view-calc"];
function show(id){ VIEWS.forEach(v=>$("#"+v).classList.toggle("hidden", v!==id)); window.scrollTo(0,0); }
function setActive(key){
  document.querySelectorAll(".side-link").forEach(b=>{
    b.classList.toggle("active", b.dataset.key === key);
  });
}
function setMode(mode){
  document.querySelectorAll(".mode-tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  $("#searchbar").style.display = mode==="learn" ? "none" : "";
  document.body.dataset.mode=mode;
  const searching=location.hash.startsWith("#/search");
  document.querySelectorAll("#mobileBottomNav [data-mobile-route]").forEach(button=>{
    const route=button.dataset.mobileRoute;
    button.classList.toggle("active",
      (mode==="companion"&&route==="#/home")||(mode==="codex"&&!searching&&route==="#/codex")||(mode==="learn"&&route==="#/learn/0"));
  });
  $("#mobileBottomNav [data-mobile-search]").classList.toggle("active",searching);
}

/* ---------- 随行首页 / 图鉴总览 ---------- */
function companionTools(){
  const c = D.meta.counts;
  return [
    {k:"__bossprep",icon:"PREP",label:"Boss 备战",desc:"31 个目标的阶段机制、威胁与战前清单",n:c.bosses},
    {k:"__buildplanner",icon:"BUILD",label:"Build 配装",desc:"四猫编队、19 个流派模板与本地保存",n:c.buildPresets},
    {k:"__breeding",icon:"GEN",label:"繁殖规划",desc:"双亲属性、技能阈值与近亲风险评估",n:c.breedingStats},
    {k:"__combatcalc",icon:"DMG",label:"战斗计算",desc:"伤害链、暴击、闪避与护盾结算",n:c.combatModes},
  ];
}
function rememberTool(key){
  localStorage.setItem(LAST_TOOL_KEY,key);
}
function openCodexKey(key){
  if(key.startsWith("@")) location.hash="#/page/"+key.slice(1);
  else if(key==="__classes") location.hash="#/classes";
  else if(key==="__npcs") location.hash="#/npcs";
  else if(key.startsWith("__assets_")) location.hash="#/assets/"+key.slice(9);
  else location.hash="#/db/"+key;
}
function detailEntry(dbk, gi, name){
  return {id:`${dbk}:${gi}`,dbk,gi,n:name};
}
function getLibraryList(key){
  const items=readLocalJson(key,[]);
  return Array.isArray(items) ? items.filter(item=>item&&item.id&&item.dbk&&Number.isInteger(item.gi)) : [];
}
function rememberDetail(entry){
  const recent=getLibraryList(RECENT_DETAIL_KEY).filter(item=>item.id!==entry.id);
  localStorage.setItem(RECENT_DETAIL_KEY,JSON.stringify([entry,...recent].slice(0,6)));
}
function isFavorite(entry){
  return getLibraryList(FAVORITES_KEY).some(item=>item.id===entry.id);
}
function toggleFavorite(entry){
  const favorites=getLibraryList(FAVORITES_KEY);
  const exists=favorites.some(item=>item.id===entry.id);
  const next=exists ? favorites.filter(item=>item.id!==entry.id) : [entry,...favorites].slice(0,12);
  localStorage.setItem(FAVORITES_KEY,JSON.stringify(next));
  return !exists;
}
function libraryItemHtml(item){
  const record=item.dbk==="__classes" ? D.classes[item.gi] : dbs[item.dbk]?.[item.gi];
  const image=record ? (item.dbk==="__classes" ? classImage(record) : entityImage(item.dbk,record)) : "";
  return `<button data-library-db="${item.dbk}" data-library-index="${item.gi}">
    ${imageTag(image,item.n,"library-thumb")||`<span>${item.dbk==="__classes"?"CLS":(DBDEF[item.dbk]?.icon||"REF")}</span>`}
    <strong>${esc(item.n)}</strong>
  </button>`;
}
function libraryShelfHtml(){
  const favorites=getLibraryList(FAVORITES_KEY).slice(0,4);
  const recent=getLibraryList(RECENT_DETAIL_KEY).slice(0,4);
  return `<section class="library-shelf">
    <div class="library-column">
      <div class="library-column-head"><span class="tool-label">收藏速查</span><small>${favorites.length}/12</small></div>
      <div class="library-list">${favorites.length?favorites.map(libraryItemHtml).join(""):'<p>在详情中点亮星标后，会固定在这里。</p>'}</div>
    </div>
    <div class="library-column">
      <div class="library-column-head"><span class="tool-label">最近查看</span><small>${recent.length}/6</small></div>
      <div class="library-list">${recent.length?recent.map(libraryItemHtml).join(""):'<p>打开任意图鉴条目后，会留下最近记录。</p>'}</div>
    </div>
  </section>`;
}
function bindLibraryShelf(){
  $("#view-home").querySelectorAll("[data-library-db]").forEach(button=>{
    button.onclick=()=>{
      const dbk=button.dataset.libraryDb;
      const gi=+button.dataset.libraryIndex;
      if(dbk==="__classes"&&D.classes[gi]) openClassDetail(gi);
      else if(dbs[dbk]?.[gi]) openDetail(dbk,dbs[dbk][gi]);
    };
  });
}
function renderHome(){
  setMode("companion"); setActive(null);
  const tools=companionTools();
  const lastKey=localStorage.getItem(LAST_TOOL_KEY);
  const last=tools.find(item=>item.k===lastKey);
  const quick=[
    {k:"statuses",icon:"STS",label:"状态"},
    {k:"enemies",icon:"ENM",label:"敌人"},
    {k:"elements",icon:"ELM",label:"元素"},
    {k:"__classes",icon:"CLS",label:"职业"},
    {k:"sets",icon:"SET",label:"套装"},
    {k:"locations",icon:"LOC",label:"地点"},
  ];
  $("#view-home").innerHTML = `
    <section class="companion-banner">
      <img src="assets/mewgenics-cats-official.png" alt="Mewgenics 官方猫咪群像" decoding="async" fetchpriority="high">
      <div>
        <span class="hero-kicker">BOON COUNTY FIELD DESK</span>
        <h1>现在要解决什么？</h1>
        <p>${last?`上次使用：${esc(last.label)}`:"选择当前任务，直接进入结论与操作。"}</p>
        ${last?`<button class="btn primary" id="continueTool">继续 ${esc(last.label)}</button>`:""}
      </div>
    </section>
    <div class="section-title">实战任务</div>
    <div class="task-launch-grid">
      ${tools.map((item,index)=>`<button class="task-launch ${item.k===lastKey?"recent":""}" data-k="${item.k}">
        <span class="task-index">0${index+1}</span>
        <span class="task-code">${item.icon}</span>
        <span><strong>${item.label}</strong><small>${item.desc}</small></span>
        <b>${item.n}</b>
      </button>`).join("")}
    </div>
    <div class="companion-lower">
      <section>
        <div class="section-title">常用速查</div>
        <div class="quick-links">
          ${quick.map(item=>`<button data-k="${item.k}"><span>${item.icon}</span>${item.label}</button>`).join("")}
        </div>
      </section>
      <section class="codex-entry">
        <span class="tool-eyebrow">FULL DATABASE</span>
        <strong>浏览完整图鉴</strong>
        <p>按战斗、装备、世界与资料分组浏览。</p>
        <button class="btn" id="openCodex">进入图鉴</button>
      </section>
    </div>
    ${libraryShelfHtml()}`;
  if(last) $("#continueTool").onclick=()=>location.hash=TOOL_ROUTES[last.k];
  $("#view-home").querySelectorAll(".task-launch").forEach(button=>{
    button.onclick=()=>location.hash=TOOL_ROUTES[button.dataset.k];
  });
  $("#view-home").querySelectorAll(".quick-links button").forEach(button=>{
    button.onclick=()=>openCodexKey(button.dataset.k);
  });
  $("#openCodex").onclick=()=>location.hash="#/codex";
  bindLibraryShelf();
  show("view-home");
}
function renderCodexHome(){
  setMode("codex"); setActive("__codex");
  const c=D.meta.counts;
  const cards = [
    {k:"__classes",icon:"CLS",label:"职业详解",desc:"14 职业 + 无项圈，定位/技能/解锁",n:c.classes,img:classImage(D.classes[1])},
    {k:"mutations",icon:"MUT",label:"突变图鉴",desc:"9 部位突变与出生缺陷",n:c.mutations,img:entityImage("mutations",dbs.mutations[9])},
    {k:"disorders",icon:"DIS",label:"疾病失调",desc:"负面效果与一线生机",n:c.disorders,img:entityImage("disorders",dbs.disorders[0])},
    {k:"statuses",icon:"STS",label:"状态效果",desc:"Buff / Debuff / 精英词缀",n:c.statuses,img:entityImage("statuses",dbs.statuses[0])},
    {k:"elements",icon:"ELM",label:"元素与反应",desc:"11 元素交互规则",n:c.elements,img:entityImage("elements",dbs.elements[0])},
    {k:"weather",icon:"WTH",label:"天气",desc:"稀有度、效果、解锁",n:c.weather,img:entityImage("weather",dbs.weather[0])},
    {k:"tiles",icon:"TIL",label:"地形",desc:"移动消耗/伤害/可点燃",n:c.tiles,img:entityImage("tiles",dbs.tiles[0])},
    {k:"familiars",icon:"FAM",label:"召唤物",desc:"全召唤名单",n:c.familiars,img:entityImage("familiars",dbs.familiars[0])},
    {k:"sets",icon:"SET",label:"套装",desc:"组成与集齐效果",n:c.sets,img:entityImage("sets",dbs.sets[0])},
    {k:"consumables",icon:"CON",label:"消耗品",desc:"64 种消耗品",n:c.consumables,img:entityImage("consumables",dbs.consumables[0])},
    {k:"enemies",icon:"ENM",label:"敌人图鉴",desc:"按区域检索",n:"203+",img:entityImage("enemies",dbs.enemies[0])},
    {k:"__npcs",icon:"NPC",label:"NPC",desc:"功能与收猫规则",n:c.npcs,img:entityImage("npcs",dbs.npcs[0])},
    {k:"locations",icon:"LOC",label:"地点",desc:"19 个地点与路线",n:c.locations,img:entityImage("locations",dbs.locations[0])},
    ...Object.entries(ASSET_GALLERIES).map(([kind,item])=>({
      k:"__assets_"+kind,...item,n:wikiAssets(kind).length,img:wikiAssets(kind)[0]?.img||"",
    })),
  ];
  $("#view-home").innerHTML = `
    <header class="codex-home-head">
      <div><span class="tool-eyebrow">REFERENCE LIBRARY</span><h1>图鉴总览</h1><p>从分类进入，或直接使用上方搜索框。</p></div>
      <button class="btn primary" id="focusCodexSearch">搜索全库</button>
    </header>
    <div class="home-grid">
      ${cards.map(c=>`<button class="home-card" data-k="${c.k}">
        <span class="hc-count">${c.n}</span>
        ${c.img?imageTag(c.img,c.label,"hc-image"):`<span class="hc-icon">${c.icon}</span>`}
        <span class="hc-copy"><strong>${c.label}</strong><span>${c.desc}</span></span>
      </button>`).join("")}
    </div>`;
  $("#focusCodexSearch").onclick=()=>$("#globalSearch").focus();
  $("#view-home").querySelectorAll(".home-card").forEach(b=>{
    b.onclick=()=>openCodexKey(b.dataset.k);
  });
  show("view-home");
}

/* ---------- 数据库视图 ---------- */
const pageState = {};
function renderDb(key, q){
  setMode("codex"); setActive(key);
  const def = DBDEF[key];
  const recs0 = dbs[key];
  if(!pageState[key]) pageState[key] = {shown:60, facet:""};
  const st = pageState[key];
  let recs = recs0.filter(r=>matchQ(r,q));
  // facet
  let facetHtml = "";
  if(def.facet){
    const fk = def.facet.k;
    const vals = [...new Set(recs.map(r=>r[fk]).filter(Boolean))];
    vals.sort((a,b)=>recs.filter(r=>r[fk]===b).length - recs.filter(r=>r[fk]===a).length);
    facetHtml = `<div class="facets"><span class="facet-label">${def.facet.t}：</span>
      <button class="chip ${st.facet?"":"active"}" data-f="">全部</button>
      ${vals.map(v=>`<button class="chip ${st.facet===v?"active":""}" data-f="${esc(v)}">${esc(v)}</button>`).join("")}</div>`;
    if(st.facet) recs = recs.filter(r=>r[fk]===st.facet);
  }
  const shown = recs.slice(0, st.shown);
  const heads = def.cols.map(c=>`<th>${c[1]}</th>`).join("");
  const rows = shown.map(r=>{
    const tds = def.cols.map(c=>{
      let v = r[c[0]];
      if(c[0]==="n"){
        v = dispName(v);
        let nameHtml=esc(v);
        if(r.d) nameHtml = `<span class="badge defect">缺陷</span> ${nameHtml}`;
        else if(r.x) nameHtml = `<span class="badge unused">未启用</span> ${nameHtml}`;
        const image=entityImage(key,r);
        v=`<span class="name-with-icon">${imageTag(image,v)}<span>${nameHtml}</span></span>`;
      } else {
        v = highlight(v, q);
      }
      return `<td class="${c[2]||""}">${v==null||v===""?"—":v}</td>`;
    }).join("");
    const gi = recs0.indexOf(r);
    return `<tr data-gi="${gi}">${tds}</tr>`;
  }).join("");

  $("#view-db").innerHTML = `
    <div class="db-header">
      <h2 class="db-title">${def.icon} ${def.label} <span style="font-size:13px;color:var(--text-faint);font-weight:400;">共 ${recs0.length} 条${q?` · 文字筛选命中 ${recs0.filter(r=>matchQ(r,q)).length} 条`:""}</span></h2>
      ${q?`<div class="facets"><span class="facet-label">文字筛选「${esc(q)}」：</span><button class="chip active" id="clearQ">清除筛选</button></div>`:""}
      ${facetHtml}
    </div>
    <div class="result-meta">点击任意行查看完整条目 · 名称支持中英文检索</div>
    <div class="table-wrap"><table class="codex"><thead><tr>${heads}</tr></thead><tbody>${rows}</tbody></table></div>
    ${recs.length>st.shown?`<button class="btn load-more" id="loadMore">加载更多（剩余 ${recs.length-st.shown}）</button>`:""}`;

  $("#view-db").querySelectorAll("tr[data-gi]").forEach(tr=>{
    tr.onclick = ()=>openDetail(key, recs0[+tr.dataset.gi]);
  });
  const lm = $("#loadMore");
  if(lm) lm.onclick = ()=>{ st.shown += 60; renderDb(key,q); };
  if(def.facet){
    $("#view-db").querySelectorAll(".chip[data-f]").forEach(ch=>{
      ch.onclick = ()=>{ st.facet = ch.dataset.f; st.shown = 60; renderDb(key,q); };
    });
  }
  const cq = $("#clearQ");
  if(cq) cq.onclick = ()=>{ location.hash="#/db/"+key; };
  show("view-db");
}

/* ---------- 职业卡片视图 ---------- */
function renderClasses(){
  setMode("codex"); setActive("__classes");
  $("#view-db").innerHTML = `
    <div class="db-header">
      <h2 class="db-title">CLS · 职业（Classes）</h2>
      <p class="db-desc">职业由出发前佩戴的 Class Collar（项圈）指派，Lock In 后不可逆；项圈属性修正不参与遗传。点击卡片查看完整职业攻略。</p>
    </div>
    <div class="card-grid">
      ${D.classes.map((c,i)=>`<button class="item-card" data-i="${i}">
        <div class="ic-top">${imageTag(classImage(c),c.n,"card-entity-icon")}<span class="ic-name">${esc(c.n)}</span></div>
        <div class="ic-meta">
          修正：${esc(c.mod)}<br>解锁：${esc(c.unlock)}
        </div>
        <div class="ic-desc">${esc(c.role)}</div>
      </button>`).join("")}
    </div>`;
  $("#view-db").querySelectorAll(".item-card").forEach(b=>{
    b.onclick = ()=>openClassDetail(+b.dataset.i);
  });
  show("view-db");
}

/* ---------- NPC 卡片视图 ---------- */
function renderNpcs(){
  setMode("codex"); setActive("__npcs");
  $("#view-db").innerHTML = `
    <div class="db-header">
      <h2 class="db-title">NPC · 非玩家角色</h2>
      <p class="db-desc">8 名主要 NPC：除 Steven 外均有「收猫升级」系统。点击卡片查看功能详解。</p>
    </div>
    <div class="card-grid">
      ${dbs.npcs.map((r,i)=>`<button class="item-card" data-i="${i}">
        <div class="ic-top">${imageTag(entityImage("npcs",r),r.n,"card-entity-icon")}<span class="ic-name">${esc(r.n)}</span></div>
        <div class="ic-meta">${esc(r.role)}</div>
        <div class="ic-desc">收取：${esc(r.cats)}<br>解锁条件：${esc(r.cond)}</div>
      </button>`).join("")}
    </div>`;
  $("#view-db").querySelectorAll(".item-card").forEach(b=>{
    b.onclick = ()=>openDetail("npcs", dbs.npcs[+b.dataset.i]);
  });
  show("view-db");
}

/* ---------- Wiki image galleries ---------- */
const assetGalleryState = {};
function openAssetDetail(kind, asset){
  const meta=ASSET_GALLERIES[kind]||{label:"图片资源"};
  const wide=kind==="maps"||kind==="weather";
  const body=`
    <div class="asset-detail-visual ${wide?"wide":""}">
      ${imageTag(asset.img,asset.n,"asset-detail-image")}
    </div>
    <dl class="dl">
      <div class="dl-row"><div class="dl-key">资源分类</div><div class="dl-val">${esc(meta.label)}</div></div>
      <div class="dl-row"><div class="dl-key">原始文件</div><div class="dl-val">${esc(asset.title)}</div></div>
      <div class="dl-row"><div class="dl-key">来源</div><div class="dl-val"><a href="${attr(asset.source)}" target="_blank" rel="noreferrer">Mewgenics Wiki 文件页</a></div></div>
    </dl>
    <p class="asset-license">图片来源于 Mewgenics Wiki；游戏美术版权归 Edmund McMillen、Tyler Glaiel 及其许可方所有。</p>`;
  drawerShell(esc(asset.n),`<span class="badge">${esc(meta.icon)}</span>`,body);
}
function renderAssetGallery(kind, q=""){
  const meta=ASSET_GALLERIES[kind];
  if(!meta){ renderCodexHome(); return; }
  setMode("codex");
  setActive("__assets_"+kind);
  if(!assetGalleryState[kind]) assetGalleryState[kind]={shown:80};
  const state=assetGalleryState[kind];
  const all=wikiAssets(kind);
  const query=q.trim().toLowerCase();
  const filtered=query ? all.filter(item=>(item.n+" "+item.title).toLowerCase().includes(query)) : all;
  const shown=filtered.slice(0,state.shown);
  $("#view-db").innerHTML=`
    <header class="asset-gallery-head">
      <div>
        <span class="tool-eyebrow">WIKI IMAGE ARCHIVE / LOCAL COPY</span>
        <h2>${meta.icon} · ${meta.label}</h2>
        <p>${meta.desc} · ${all.length} 项，本地资源按需加载。</p>
      </div>
      <a class="btn" href="${attr(W.meta?.source||"https://mewgenics.wiki.gg/wiki/House")}" target="_blank" rel="noreferrer">查看来源</a>
    </header>
    <form class="asset-gallery-search" id="assetGallerySearch">
      <input type="search" value="${attr(q)}" placeholder="筛选${esc(meta.label)}" aria-label="筛选${esc(meta.label)}">
      <button class="btn primary" type="submit">筛选</button>
      ${q?'<button class="btn" type="button" id="clearAssetSearch">清除</button>':""}
    </form>
    <div class="result-meta">显示 ${shown.length} / ${filtered.length} 项</div>
    <div class="asset-gallery-grid">
      ${shown.map(item=>`<button class="asset-card" data-asset-index="${all.indexOf(item)}">
        ${imageTag(item.img,item.n,"asset-card-image")}
        <strong>${esc(item.n)}</strong>
        <small>${esc(item.title)}</small>
      </button>`).join("")}
    </div>
    ${filtered.length>state.shown?`<button class="btn load-more" id="loadMoreAssets">加载更多（剩余 ${filtered.length-state.shown}）</button>`:""}`;
  $("#assetGallerySearch").onsubmit=event=>{
    event.preventDefault();
    state.shown=80;
    const value=event.currentTarget.querySelector("input").value.trim();
    location.hash=`#/assets/${kind}${value?"?q="+encodeURIComponent(value):""}`;
    if(!value&&!q) renderAssetGallery(kind,"");
  };
  const clear=$("#clearAssetSearch");
  if(clear) clear.onclick=()=>{ state.shown=80; location.hash="#/assets/"+kind; };
  $("#view-db").querySelectorAll("[data-asset-index]").forEach(button=>{
    button.onclick=()=>openAssetDetail(kind,all[+button.dataset.assetIndex]);
  });
  const more=$("#loadMoreAssets");
  if(more) more.onclick=()=>{ state.shown+=80; renderAssetGallery(kind,q); };
  show("view-db");
}

/* ---------- Boss 备战 ---------- */
const BOSS_CHECK_KEY = "mew_boss_checks_v1";
const bossUi = { filter:"全部", query:"" };

function readLocalJson(key, fallback){
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value == null ? fallback : value;
  } catch (_) {
    return fallback;
  }
}
function getToolLevel(tool){
  const levels = readLocalJson(TOOL_LEVEL_KEY, {});
  return levels[tool] === "advanced" ? "advanced" : "basic";
}
function setToolLevel(tool, level){
  const levels = readLocalJson(TOOL_LEVEL_KEY, {});
  levels[tool] = level === "advanced" ? "advanced" : "basic";
  localStorage.setItem(TOOL_LEVEL_KEY, JSON.stringify(levels));
}
function toolLevelHtml(tool, activeCount){
  const level = getToolLevel(tool);
  return `<section class="tool-level-bar" aria-label="工具复杂度">
    <div>
      <span class="tool-label">操作层级</span>
      <small>${level==="basic"?"保留完成当前任务所需的核心输入":"显示全部规则参数与记录字段"}</small>
    </div>
    <div class="segmented tool-level-switch">
      <button data-tool-level-option="basic" class="${level==="basic"?"active":""}">基础</button>
      <button data-tool-level-option="advanced" class="${level==="advanced"?"active":""}">高级</button>
    </div>
    ${level==="basic"&&activeCount?`<span class="advanced-active">高级条件生效 · ${activeCount} 项</span>`:""}
  </section>`;
}
function bindToolLevel(tool, root, rerender){
  root.querySelectorAll("[data-tool-level-option]").forEach(button=>{
    button.onclick = ()=>{
      setToolLevel(tool, button.dataset.toolLevelOption);
      rerender();
    };
  });
}
function bossChecklist(boss){
  const items = [...boss.tips];
  if(boss.threats.includes("召唤")) items.push("准备至少一种稳定范围伤害或快速清杂手段。");
  if(boss.threats.includes("异常")) items.push("携带 Cleanse、Antidote 或对应状态免疫。");
  if(boss.threats.includes("即死")) items.push("保留位移技能，不让核心猫停在即死技能覆盖区。");
  if(boss.threats.includes("防御")) items.push("准备破盾、持续伤害，或等待防御状态结束。");
  if(boss.kind === "守家") items.push("不要给可能牺牲的守家队携带不可替代装备。");
  return [...new Set(items)].slice(0, 6);
}
function renderBossPrep(index){
  setMode("codex");
  setActive("__bossprep");
  rememberTool("__bossprep");
  const groups = ["全部","教学","Act 1","Act 2","Act 3","守家"];
  const byGroup = boss => bossUi.filter === "全部"
    || boss.act === bossUi.filter
    || boss.kind === bossUi.filter;
  const filtered = D.bosses.filter(byGroup);
  let boss = D.bosses[Math.max(0, Math.min(D.bosses.length - 1, Number(index) || 0))];
  if(!byGroup(boss) && filtered.length) boss = filtered[0];
  const checks = readLocalJson(BOSS_CHECK_KEY, {});
  const checked = checks[boss.slug] || [];
  const checklist = bossChecklist(boss);

  $("#view-boss").innerHTML = `
    <header class="tool-page-head">
      <div>
        <span class="tool-eyebrow">BATTLE DOSSIER / ${D.meta.version}</span>
        <h2>BOS · Boss 备战</h2>
        <p>选择目标，集中查看阶段、危险机制、专属奖励与战前检查项。</p>
      </div>
      <button class="btn" id="bossFullGuide">查看完整 Boss 图鉴</button>
    </header>
    <div class="boss-layout">
      <aside class="boss-picker">
        <div class="boss-filter">
          ${groups.map(group=>`<button class="chip ${bossUi.filter===group?"active":""}" data-boss-filter="${group}">${group}</button>`).join("")}
        </div>
        <label class="tool-search">
          <span>⌕</span>
          <input id="bossSearch" type="search" placeholder="搜索 Boss 或地点" value="${attr(bossUi.query)}">
        </label>
        <div class="boss-list" id="bossList">
          ${filtered.map(item=>`<button class="boss-list-item ${item.id===boss.id?"active":""}" data-boss-id="${item.id}" data-search="${attr((item.n+" "+item.region+" "+item.act).toLowerCase())}">
            ${imageTag(bossImage(item),item.n,"boss-list-icon")}
            <span class="boss-list-main"><strong>${esc(item.n)}</strong><small>${esc(item.region)}</small></span>
            <span class="boss-list-meta">${esc(item.hp)} HP</span>
          </button>`).join("")}
          <div class="boss-list-empty hidden" id="bossListEmpty">没有匹配的 Boss</div>
        </div>
      </aside>
      <article class="boss-dossier">
        <header class="boss-sheet-head">
          <div class="boss-stamp">${bossImage(boss)?imageTag(bossImage(boss),boss.n,"boss-main-icon"):`BOS<br>${String(boss.id + 1).padStart(2,"0")}`}</div>
          <div>
            <span class="tool-eyebrow">${esc(boss.act)} / ${esc(boss.kind)} / ${esc(boss.region)}</span>
            <h2>${esc(boss.n)}</h2>
            <p>${esc(boss.summary || "详细机制见下方档案。")}</p>
          </div>
        </header>
        <figure class="boss-art">
          ${imageTag(bossArt(boss),boss.n,"boss-art-image")}
        </figure>
        <div class="boss-vitals">
          <div><span>HP</span><strong>${esc(boss.hp)}</strong></div>
          <div><span>体型</span><strong>${esc(boss.size)}</strong></div>
          <div><span>类型</span><strong>${esc(boss.type)}</strong></div>
          <div><span>地点</span><strong>${esc(boss.region)}</strong></div>
        </div>
        <div class="boss-threats">
          <span class="tool-label">主要威胁</span>
          ${boss.threats.length ? boss.threats.map(tag=>`<span class="threat-tag">${esc(tag)}</span>`).join("") : '<span class="muted">无特殊标签</span>'}
        </div>
        <section class="prep-sheet">
          <div class="prep-sheet-title">
            <div>
              <span class="tool-eyebrow">READY CHECK</span>
              <h3>战前检查</h3>
            </div>
            <button class="text-btn" id="resetBossChecks">重置</button>
          </div>
          <div class="prep-checks">
            ${checklist.map((item,i)=>`<label class="prep-check ${checked[i]?"done":""}">
              <input type="checkbox" data-check="${i}" ${checked[i]?"checked":""}>
              <span class="check-mark">${checked[i]?"✓":"○"}</span>
              <span>${esc(item)}</span>
            </label>`).join("")}
          </div>
        </section>
        <section class="boss-reward">
          <span class="tool-label">奖励 / 任务物品</span>
          <p>${esc(boss.reward)}</p>
        </section>
        <details class="boss-full">
          <summary>展开完整阶段与技能机制</summary>
          <div class="md">${mdRender(boss.md)}</div>
        </details>
      </article>
    </div>`;

  $("#bossFullGuide").onclick = ()=>location.hash="#/page/bosses";
  $("#view-boss").querySelectorAll("[data-boss-filter]").forEach(button=>{
    button.onclick = ()=>{
      bossUi.filter = button.dataset.bossFilter;
      const first = D.bosses.find(byGroup) || D.bosses[0];
      const nextHash = "#/boss/" + first.id;
      if(location.hash === nextHash) renderBossPrep(first.id);
      else location.hash = nextHash;
    };
  });
  $("#view-boss").querySelectorAll("[data-boss-id]").forEach(button=>{
    button.onclick = ()=>location.hash="#/boss/"+button.dataset.bossId;
  });
  $("#bossSearch").oninput = event=>{
    bossUi.query = event.target.value.trim().toLowerCase();
    let visible = 0;
    $("#bossList").querySelectorAll("[data-search]").forEach(button=>{
      const showItem = !bossUi.query || button.dataset.search.includes(bossUi.query);
      button.classList.toggle("hidden", !showItem);
      if(showItem) visible++;
    });
    $("#bossListEmpty").classList.toggle("hidden", visible > 0);
  };
  $("#bossSearch").dispatchEvent(new Event("input"));
  $("#view-boss").querySelectorAll("[data-check]").forEach(input=>{
    input.onchange = ()=>{
      const latest = readLocalJson(BOSS_CHECK_KEY, {});
      const values = checklist.map((_,i)=>$("#view-boss").querySelector(`[data-check="${i}"]`).checked);
      latest[boss.slug] = values;
      localStorage.setItem(BOSS_CHECK_KEY, JSON.stringify(latest));
      input.closest(".prep-check").classList.toggle("done", input.checked);
      input.nextElementSibling.textContent = input.checked ? "✓" : "○";
    };
  });
  $("#resetBossChecks").onclick = ()=>{
    const latest = readLocalJson(BOSS_CHECK_KEY, {});
    delete latest[boss.slug];
    localStorage.setItem(BOSS_CHECK_KEY, JSON.stringify(latest));
    renderBossPrep(boss.id);
  };
  show("view-boss");
}

/* ---------- Build 配装器 ---------- */
const BUILD_KEY = "mew_build_planner_v1";
const GEAR_LABELS = ["武器","头部","颈部","面部","饰品"];
function blankMember(index){
  return {
    name:`猫 ${index + 1}`, role:"", class:"", preset:"", stats:"",
    active:["","","",""], passive:["",""], gear:["","","","",""],
    coreItems:"", mutations:"", notes:""
  };
}
function normalizeBuildState(value){
  const state = value && typeof value === "object" ? value : {};
  const members = Array.from({length:4}, (_,i)=>({
    ...blankMember(i),
    ...(state.members && state.members[i] ? state.members[i] : {}),
  }));
  members.forEach((member,i)=>{
    member.active = Array.from({length:4},(_,j)=>(member.active||[])[j]||"");
    member.passive = Array.from({length:2},(_,j)=>(member.passive||[])[j]||"");
    member.gear = Array.from({length:5},(_,j)=>(member.gear||[])[j]||"");
    if(!member.name) member.name=`猫 ${i+1}`;
  });
  return { title:state.title || "未命名编队", members };
}
let plannerState = normalizeBuildState(readLocalJson(BUILD_KEY, null));

function savePlanner(){
  localStorage.setItem(BUILD_KEY, JSON.stringify(plannerState));
  const status = $("#plannerSaveStatus");
  if(status) status.textContent = "已自动保存";
}
function classOptions(selected){
  return `<option value="">选择职业</option>` + D.classes.map(item=>
    `<option value="${attr(item.n)}" ${item.n===selected?"selected":""}>${esc(item.n)}</option>`
  ).join("");
}
function buildWarnings(){
  const selected = plannerState.members.filter(member=>member.class);
  const counts = {};
  selected.forEach(member=>counts[member.class]=(counts[member.class]||0)+1);
  const warnings = [];
  if(selected.length < 4) warnings.push(`仍有 ${4-selected.length} 个队伍槽位未选择职业。`);
  const duplicates = Object.entries(counts).filter(([,count])=>count>1).map(([name])=>name);
  if(duplicates.length) warnings.push(`重复职业 ${duplicates.join("、")} 需要 Blank Collar。`);
  if(!selected.some(member=>["Tank","Butcher","Fighter","Monk"].includes(member.class))) warnings.push("缺少稳定前排，Boss 战容易让后排直接承伤。");
  if(!selected.some(member=>["Cleric","Druid","Necromancer","Butcher"].includes(member.class))) warnings.push("缺少续航位，长线章节容错偏低。");
  if(selected.some(member=>member.class==="Jester")) warnings.push("Jester 波动较大，不应作为队伍唯一核心。");
  return warnings;
}
function plannerSummaryHtml(){
  const members = plannerState.members;
  const activeCount = members.reduce((n,m)=>n+m.active.filter(Boolean).length,0);
  const passiveCount = members.reduce((n,m)=>n+m.passive.filter(Boolean).length,0);
  const gearCount = members.reduce((n,m)=>n+m.gear.filter(Boolean).length,0);
  const warnings = buildWarnings();
  return `
    <div class="planner-metrics">
      <div><strong>${members.filter(m=>m.class).length}/4</strong><span>职业</span></div>
      <div><strong>${activeCount}/16</strong><span>主动</span></div>
      <div><strong>${passiveCount}/8</strong><span>被动</span></div>
      <div><strong>${gearCount}/20</strong><span>装备</span></div>
    </div>
    <div class="team-overview">
      ${members.map((member,i)=>`<button data-summary-slot="${i}" class="${member.class?"ready":""}">
        <span>${i+1}</span><strong>${esc(member.name)}</strong><small>${esc(member.class||"未选职业")}</small>
      </button>`).join("")}
    </div>
    <div class="planner-warnings">
      <span class="tool-label">阵容检查</span>
      ${warnings.length ? warnings.map(item=>`<p>! ${esc(item)}</p>`).join("") : "<p class=\"good\">✓ 队伍角色结构完整，可继续细化技能与装备。</p>"}
    </div>`;
}
function refreshPlannerSummary(){
  const container = $("#plannerSummary");
  if(!container) return;
  container.innerHTML = plannerSummaryHtml();
  container.querySelectorAll("[data-summary-slot]").forEach(button=>{
    button.onclick = ()=>location.hash="#/planner/"+button.dataset.summarySlot;
  });
}
function templateValues(value, pattern, length){
  const values = !value || value.trim() === "—" ? [] : value.split(pattern).map(item=>item.trim()).filter(Boolean);
  return Array.from({length},(_,index)=>values[index]||"");
}
function plannerText(){
  const lines = [`${plannerState.title}｜Mewgenics Build`];
  plannerState.members.forEach((member,i)=>{
    lines.push(`\n${i+1}. ${member.name} - ${member.class||"未选职业"}${member.role?`（${member.role}）`:""}`);
    if(member.stats) lines.push(`属性：${member.stats}`);
    const active=member.active.filter(Boolean), passive=member.passive.filter(Boolean), gear=member.gear.filter(Boolean);
    if(active.length) lines.push(`主动：${active.join(" / ")}`);
    if(passive.length) lines.push(`被动：${passive.join(" / ")}`);
    if(gear.length) lines.push(`装备：${gear.join(" / ")}`);
    if(member.coreItems) lines.push(`核心物品：${member.coreItems}`);
    if(member.mutations) lines.push(`突变：${member.mutations}`);
    if(member.notes) lines.push(`备注：${member.notes}`);
  });
  return lines.join("\n");
}
function buildAdvancedCount(member){
  return member.active.filter(Boolean).length
    + member.passive.filter(Boolean).length
    + member.gear.filter(Boolean).length
    + [member.coreItems,member.mutations,member.notes].filter(Boolean).length;
}
function renderBuildPlanner(slot){
  setMode("codex");
  setActive("__buildplanner");
  rememberTool("__buildplanner");
  const index = Math.max(0,Math.min(3,Number(slot)||0));
  const member = plannerState.members[index];
  const toolLevel = getToolLevel("build");
  const classInfo = D.classes.find(item=>item.n===member.class);
  const selectedPreset = D.buildPresets.find(item=>String(item.id)===String(member.preset));
  const abilityNames=[...new Set([...D.catalogs.abilities,...wikiAssets("abilities").map(item=>item.n)])].sort();
  const gearNames=[...new Set([...D.catalogs.gear,...wikiAssets("items").map(item=>item.n)])].sort();
  const abilityOptions = abilityNames.map(item=>`<option value="${attr(item)}"></option>`).join("");
  const gearOptions = gearNames.map(item=>`<option value="${attr(item)}"></option>`).join("");

  $("#view-build").dataset.toolLevel=toolLevel;
  $("#view-build").innerHTML = `
    <header class="tool-page-head">
      <div>
        <span class="tool-eyebrow">SQUAD WORKBENCH / LOCAL SAVE</span>
        <h2>BUILD · 四猫配装器</h2>
        <p>记录职业、技能与装备；应用流派或整队模板后仍可逐项修改。</p>
      </div>
      <div class="tool-actions">
        <span id="plannerSaveStatus">本机自动保存</span>
        <button class="btn" id="copyPlanner">复制方案</button>
        <button class="btn danger" id="resetPlanner">清空</button>
      </div>
    </header>
    ${toolLevelHtml("build",buildAdvancedCount(member))}
    <section class="planner-namebar">
      <label><span>编队名称</span><input id="plannerTitle" value="${attr(plannerState.title)}"></label>
      <label><span>整队模板</span>
        <select id="teamTemplate">
          <option value="">选择四猫模板</option>
          ${D.teamTemplates.map(item=>`<option value="${item.id}">${esc(item.n)} · ${esc(item.applicable)}</option>`).join("")}
        </select>
      </label>
      <button class="btn primary" id="applyTeamTemplate">应用整队模板</button>
    </section>
    <nav class="party-tabs" aria-label="队伍槽位">
      ${plannerState.members.map((item,i)=>`<button class="${i===index?"active":""} ${item.class?"ready":""}" data-party-slot="${i}">
        <span>${String(i+1).padStart(2,"0")}</span>
        <strong>${esc(item.name)}</strong>
        <small>${esc(item.class||"未选职业")}</small>
      </button>`).join("")}
    </nav>
    <div class="planner-layout">
      <section class="build-editor">
        <div class="build-editor-head">
          <div>
            <span class="tool-eyebrow">CAT SLOT ${String(index+1).padStart(2,"0")}</span>
            <h3>${esc(member.name)}</h3>
          </div>
          <button class="text-btn" id="clearMember">清空此猫</button>
        </div>
        <div class="form-grid two">
          <label><span>猫咪名称</span><input id="memberName" value="${attr(member.name)}"></label>
          <label><span>队伍职责</span><input id="memberRole" value="${attr(member.role)}" placeholder="例如：主坦 / 清杂 / 治疗"></label>
          <label><span>职业</span><select id="memberClass">${classOptions(member.class)}</select></label>
          <label><span>流派模板</span>
            <span class="inline-field"><select id="memberPreset">
              <option value="">选择流派</option>
              ${D.buildPresets.map(item=>`<option value="${item.id}" ${String(item.id)===String(member.preset)?"selected":""}>${item.id}. ${esc(item.n)}${item.en?` / ${esc(item.en)}`:""}</option>`).join("")}
            </select><button class="mini-btn" id="applyPreset">应用</button></span>
          </label>
        </div>
        ${classInfo?`<div class="class-strip">
          ${imageTag(classImage(classInfo),classInfo.n,"class-strip-icon")}
          <span>${esc(classInfo.n)}</span>
          <strong>${esc(classInfo.mod)}</strong>
          <small>${esc(classInfo.role)} · ${esc(classInfo.basic)}</small>
        </div>`:""}
        <label class="field-block"><span>属性优先级</span><input id="memberStats" value="${attr(member.stats)}" placeholder="例如：STR 第一、SPD 第二、CON 保底"></label>
        <div class="slot-section advanced-zone">
          <div class="slot-title"><span>主动技能</span><small>最多 4 个</small></div>
          <div class="slot-grid">
            ${member.active.map((value,i)=>`<label class="slot-input"><span>A${i+1}</span><input list="abilityOptions" data-active="${i}" value="${attr(value)}" placeholder="主动技能">${slotPreview("abilities",value)}</label>`).join("")}
          </div>
        </div>
        <div class="slot-section advanced-zone">
          <div class="slot-title"><span>被动技能</span><small>最多 2 个</small></div>
          <div class="slot-grid two">
            ${member.passive.map((value,i)=>`<label class="slot-input"><span>P${i+1}</span><input list="abilityOptions" data-passive="${i}" value="${attr(value)}" placeholder="被动技能">${slotPreview("abilities",value)}</label>`).join("")}
          </div>
        </div>
        <div class="slot-section advanced-zone">
          <div class="slot-title"><span>装备槽</span><small>武器 1 + 护甲 3 + 饰品 1</small></div>
          <div class="gear-grid">
            ${member.gear.map((value,i)=>`<label class="slot-input"><span>${GEAR_LABELS[i]}</span><input list="gearOptions" data-gear="${i}" value="${attr(value)}" placeholder="${GEAR_LABELS[i]}">${slotPreview("items",value)}</label>`).join("")}
          </div>
        </div>
        <div class="form-grid two advanced-zone">
          <label class="field-block"><span>核心物品建议</span><textarea id="memberCoreItems" rows="3">${esc(member.coreItems)}</textarea></label>
          <label class="field-block"><span>突变 / 失调</span><textarea id="memberMutations" rows="3">${esc(member.mutations)}</textarea></label>
        </div>
        <label class="field-block advanced-zone"><span>战术备注</span><textarea id="memberNotes" rows="4">${esc(member.notes)}</textarea></label>
        <datalist id="abilityOptions">${abilityOptions}</datalist>
        <datalist id="gearOptions">${gearOptions}</datalist>
      </section>
      <aside class="planner-summary">
        <span class="tool-eyebrow">SQUAD CHECK</span>
        <h3>编队摘要</h3>
        <div id="plannerSummary">${plannerSummaryHtml()}</div>
        ${selectedPreset?`<div class="preset-brief">
          <span class="tool-label">${esc(selectedPreset.n)} / ${esc(selectedPreset.en)}</span>
          <p>${esc(selectedPreset.logic)}</p>
          <p class="warning">${esc(selectedPreset.weak)}</p>
        </div>`:""}
      </aside>
    </div>`;

  bindToolLevel("build",$("#view-build"),()=>renderBuildPlanner(index));
  $("#view-build").querySelectorAll("[data-party-slot],[data-summary-slot]").forEach(button=>{
    button.onclick = ()=>location.hash="#/planner/"+(button.dataset.partySlot ?? button.dataset.summarySlot);
  });
  const update = (selector, setter, eventName="input")=>{
    const element = $(selector);
    element.addEventListener(eventName, event=>{
      setter(event.target.value);
      savePlanner();
      refreshPlannerSummary();
    });
  };
  update("#plannerTitle", value=>plannerState.title=value);
  update("#memberName", value=>{
    member.name=value;
    const displayName = value || `猫 ${index + 1}`;
    const heading = $("#view-build .build-editor-head h3");
    const tabName = $(`#view-build [data-party-slot="${index}"] strong`);
    if(heading) heading.textContent=displayName;
    if(tabName) tabName.textContent=displayName;
  });
  update("#memberRole", value=>member.role=value);
  update("#memberStats", value=>member.stats=value);
  update("#memberCoreItems", value=>member.coreItems=value);
  update("#memberMutations", value=>member.mutations=value);
  update("#memberNotes", value=>member.notes=value);
  update("#memberClass", value=>{member.class=value; renderBuildPlanner(index);}, "change");
  $("#view-build").querySelectorAll("[data-active]").forEach(input=>input.oninput=()=>{
    member.active[+input.dataset.active]=input.value; syncSlotPreview(input,"abilities"); savePlanner(); refreshPlannerSummary();
  });
  $("#view-build").querySelectorAll("[data-passive]").forEach(input=>input.oninput=()=>{
    member.passive[+input.dataset.passive]=input.value; syncSlotPreview(input,"abilities"); savePlanner(); refreshPlannerSummary();
  });
  $("#view-build").querySelectorAll("[data-gear]").forEach(input=>input.oninput=()=>{
    member.gear[+input.dataset.gear]=input.value; syncSlotPreview(input,"items"); savePlanner(); refreshPlannerSummary();
  });
  $("#applyPreset").onclick = ()=>{
    const preset = D.buildPresets.find(item=>String(item.id)===$("#memberPreset").value);
    if(!preset) return;
    member.preset=String(preset.id);
    if(preset.classes[0]) member.class=preset.classes[0];
    member.stats=preset.stats;
    member.active=Array.from({length:4},(_,i)=>preset.active[i]||"");
    member.passive=Array.from({length:2},(_,i)=>preset.passive[i]||"");
    member.coreItems=preset.items.join(" / ");
    member.mutations=preset.mutations.join(" / ");
    member.notes=`玩法：${preset.logic}\n风险：${preset.weak}`;
    savePlanner();
    renderBuildPlanner(index);
  };
  $("#applyTeamTemplate").onclick = ()=>{
    const template = D.teamTemplates.find(item=>String(item.id)===$("#teamTemplate").value);
    if(!template) return;
    plannerState.title=template.n;
    template.members.forEach((source,i)=>{
      const target=plannerState.members[i];
      target.role=source.position;
      target.class=source.class;
      target.active=templateValues(source.active, /\s*\/\s*/, 4);
      target.passive=templateValues(source.passive, /\s*[、/]\s*/, 2);
      target.coreItems=source.items;
      target.notes=template.notes.join("\n");
    });
    savePlanner();
    renderBuildPlanner(0);
  };
  $("#clearMember").onclick = ()=>{
    plannerState.members[index]=blankMember(index);
    savePlanner();
    renderBuildPlanner(index);
  };
  $("#resetPlanner").onclick = ()=>{
    if(!confirm("清空整套编队？此操作会覆盖当前本地方案。")) return;
    plannerState=normalizeBuildState(null);
    savePlanner();
    renderBuildPlanner(0);
  };
  $("#copyPlanner").onclick = async ()=>{
    try {
      await navigator.clipboard.writeText(plannerText());
      $("#plannerSaveStatus").textContent="已复制到剪贴板";
    } catch (_) {
      $("#plannerSaveStatus").textContent="复制失败，请检查浏览器权限";
    }
  };
  show("view-build");
}

/* ---------- 繁殖规划器 ---------- */
const BREED_KEY = "mew_breeding_planner_v1";

function clampNumber(value, min, max, fallback=0){
  const number = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
}
function fmtNumber(value, digits=1){
  return Number(value).toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/,"$1");
}
function defaultBreedingState(){
  const stats = {};
  D.mechanics.breeding.stats.forEach(stat=>{
    stats[stat.id] = {a:5, b:5, stim:0};
  });
  return {
    parentA:"亲本 A", parentB:"亲本 B", stats,
    skillStim:0, kinship:0, disorderSources:0, health:"normal",
    skillTargets:{"32":"","95":"","196":""}, notes:"",
  };
}
function normalizeBreedingState(value){
  const base = defaultBreedingState();
  if(!value || typeof value !== "object") return base;
  base.parentA = value.parentA || base.parentA;
  base.parentB = value.parentB || base.parentB;
  base.skillStim = clampNumber(value.skillStim,0,999);
  base.kinship = clampNumber(value.kinship,0,100);
  base.disorderSources = clampNumber(value.disorderSources,0,8);
  base.health = ["low","normal","high"].includes(value.health) ? value.health : "normal";
  base.notes = value.notes || "";
  Object.keys(base.skillTargets).forEach(key=>{
    base.skillTargets[key] = value.skillTargets?.[key] || "";
  });
  D.mechanics.breeding.stats.forEach(stat=>{
    const source = value.stats?.[stat.id] || {};
    base.stats[stat.id] = {
      a:clampNumber(source.a,3,7,5),
      b:clampNumber(source.b,3,7,5),
      stim:clampNumber(source.stim,0,999),
    };
  });
  return base;
}
let breedingState = normalizeBreedingState(readLocalJson(BREED_KEY, null));

function breedingMetrics(){
  let expectedTotal = 0;
  let allHighChance = 1;
  const rows = D.mechanics.breeding.stats.map(stat=>{
    const values = breedingState.stats[stat.id];
    const a = clampNumber(values.a,3,7,5);
    const b = clampNumber(values.b,3,7,5);
    const high = Math.max(a,b);
    const low = Math.min(a,b);
    const same = a === b;
    const chance = same ? 1 : (100 + Math.abs(values.stim)) / (200 + Math.abs(values.stim));
    const expected = same ? high : high * chance + low * (1 - chance);
    expectedTotal += expected;
    allHighChance *= chance;
    return {
      ...stat, a, b, high, low, chance, expected,
      source:same ? "双方相同" : (a > b ? breedingState.parentA : breedingState.parentB),
    };
  });
  const defectChance = Math.min(100, breedingState.kinship * D.mechanics.breeding.defectMultiplier);
  const disorderChance = (1 - Math.pow(1 - D.mechanics.breeding.disorderInheritance / 100, breedingState.disorderSources)) * 100;
  return {rows, expectedTotal, allHighChance:allHighChance * 100, defectChance, disorderChance};
}
function breedingRecommendations(metrics){
  const notes = [];
  if(breedingState.kinship > 0) notes.push("引入无血缘种猫，避免近亲继续削弱 Stimulation 并抬高缺陷率。");
  if(breedingState.health === "low") notes.push("先提高房间 Health；低 Health 会增加患病、早衰与育种失败风险。");
  const next = D.mechanics.breeding.skillThresholds.find(item=>breedingState.skillStim < item.value);
  if(next) notes.push(`把 Skill Share Stimulation 再提高 ${next.value - breedingState.skillStim}，锁定${next.n}。`);
  if(breedingState.disorderSources) notes.push("优先替换带可遗传失调的亲本，15% 单项传递风险会随来源数累积。");
  if(metrics.allHighChance < 20) notes.push("七项同时取高值概率偏低，应拆分为多代目标，不要一代追满。");
  if(!notes.length) notes.push("当前配对结构干净；继续保留外血，并按目标技能维护 Stimulation。");
  return notes.slice(0,4);
}
function breedingResultsHtml(){
  const metrics = breedingMetrics();
  const thresholds = D.mechanics.breeding.skillThresholds;
  const recommendations = breedingRecommendations(metrics);
  const kinshipWarning = breedingState.kinship > 0 ? "账面阈值达成后仍可能受近亲衰减" : "无近亲衰减记录";
  return `
    <div class="planner-metrics breed-metrics">
      <div><strong>${fmtNumber(metrics.expectedTotal,1)}</strong><span>期望总属性</span></div>
      <div><strong>${fmtNumber(metrics.allHighChance,1)}%</strong><span>全取高值</span></div>
      <div><strong>${fmtNumber(metrics.defectChance,1)}%</strong><span>出生缺陷</span></div>
      <div><strong>${fmtNumber(metrics.disorderChance,1)}%</strong><span>失调估算</span></div>
    </div>
    <div class="breed-projection">
      <span class="tool-label">属性继承投影</span>
      ${metrics.rows.map(row=>`
        <div class="breed-projection-row">
          <span>${row.n}</span>
          <div><i style="width:${row.chance*100}%"></i></div>
          <strong>${fmtNumber(row.expected,2)}</strong>
          <small>${row.source} ${fmtNumber(row.chance*100,1)}%</small>
        </div>`).join("")}
    </div>
    <div class="skill-roadmap">
      <span class="tool-label">Skill Share / ${kinshipWarning}</span>
      ${thresholds.map(item=>{
        const reached = breedingState.skillStim >= item.value;
        const name = breedingState.skillTargets[String(item.value)] || item.n;
        return `<div class="skill-threshold ${reached?"reached":""}">
          <span>${item.value}</span><strong>${esc(name)}</strong>
          <small>${reached?"已达账面阈值":`还差 ${item.value-breedingState.skillStim}`}</small>
        </div>`;
      }).join("")}
    </div>
    <div class="planner-warnings">
      <span class="tool-label">下一代建议</span>
      ${recommendations.map(item=>`<p>${breedingState.kinship>0?"!":"·"} ${esc(item)}</p>`).join("")}
    </div>
    <p class="calc-caveat">属性投影不含出生时随机重 roll；失调率按每个来源独立 15% 估算。近亲对属性与 Stimulation 的衰减缺少公开精确式，因此仅作风险提示。</p>`;
}
function saveBreeding(){
  localStorage.setItem(BREED_KEY, JSON.stringify(breedingState));
  const status = $("#breedSaveStatus");
  if(status) status.textContent = "已自动保存";
}
function refreshBreedingResults(){
  const report = $("#breedingResults");
  if(report) report.innerHTML = breedingResultsHtml();
  const nameA = $("#breedLabelA"), nameB = $("#breedLabelB");
  if(nameA) nameA.textContent = breedingState.parentA || "亲本 A";
  if(nameB) nameB.textContent = breedingState.parentB || "亲本 B";
}
function breedingPlanText(){
  const metrics = breedingMetrics();
  const lines = [
    `${breedingState.parentA} × ${breedingState.parentB}｜Mewgenics 繁殖规划`,
    `Skill Share Stimulation：${breedingState.skillStim}`,
    `近亲系数：${breedingState.kinship}%｜出生缺陷参考：${fmtNumber(metrics.defectChance,1)}%`,
    "",
  ];
  metrics.rows.forEach(row=>{
    lines.push(`${row.n} ${row.a}/${row.b} → 高值 ${row.high}（${fmtNumber(row.chance*100,1)}%），期望 ${fmtNumber(row.expected,2)}`);
  });
  D.mechanics.breeding.skillThresholds.forEach(item=>{
    const target = breedingState.skillTargets[String(item.value)] || item.n;
    lines.push(`${item.slot} ${target}：${breedingState.skillStim>=item.value?"账面阈值已达":`还差 ${item.value-breedingState.skillStim} Stim`}`);
  });
  if(breedingState.notes) lines.push("", `备注：${breedingState.notes}`);
  return lines.join("\n");
}
function breedingAdvancedCount(){
  const statStim = Object.values(breedingState.stats).filter(item=>Number(item.stim)).length;
  return statStim
    + ["skillStim","kinship","disorderSources"].filter(key=>Number(breedingState[key])).length
    + (breedingState.health!=="normal" ? 1 : 0)
    + Object.values(breedingState.skillTargets).filter(Boolean).length
    + (breedingState.notes ? 1 : 0);
}
function renderBreedingPlanner(){
  setMode("codex");
  setActive("__breeding");
  rememberTool("__breeding");
  const rules = D.mechanics.breeding;
  const toolLevel = getToolLevel("breeding");
  $("#view-breed").dataset.toolLevel=toolLevel;
  $("#view-breed").innerHTML = `
    <header class="tool-page-head">
      <div>
        <span class="tool-eyebrow">GENE LEDGER / LOCAL SAVE</span>
        <h2>GEN · 繁殖规划器</h2>
        <p>比较双亲基础属性，规划 Stimulation 阈值，并提前暴露近亲与失调风险。</p>
      </div>
      <div class="tool-actions">
        <span id="breedSaveStatus">本机自动保存</span>
        <button class="btn" id="copyBreeding">复制规划</button>
        <button class="btn" id="breedingFullGuide">完整繁殖规则</button>
        <button class="btn danger" id="resetBreeding">清空</button>
      </div>
    </header>
    ${toolLevelHtml("breeding",breedingAdvancedCount())}
    <div class="breeding-layout">
      <section class="breeding-workbench">
        <div class="breed-parent-names">
          <label><span>亲本 A</span><input id="parentAName" value="${attr(breedingState.parentA)}"></label>
          <label><span>亲本 B</span><input id="parentBName" value="${attr(breedingState.parentB)}"></label>
        </div>
        <div class="breed-stat-head">
          <span>基础属性</span><span id="breedLabelA">${esc(breedingState.parentA)}</span>
          <span id="breedLabelB">${esc(breedingState.parentB)}</span><span class="advanced-field">定向 Stim</span>
        </div>
        <div class="breed-stat-grid">
          ${rules.stats.map(stat=>{
            const row = breedingState.stats[stat.id];
            return `<div class="breed-stat-row">
              <div><strong>${stat.n}</strong><small>${stat.cn} · ${stat.use}</small></div>
              <input type="number" min="3" max="7" step="1" value="${row.a}" data-breed-stat="${stat.id}" data-breed-side="a" aria-label="${stat.n} 亲本 A">
              <input type="number" min="3" max="7" step="1" value="${row.b}" data-breed-stat="${stat.id}" data-breed-side="b" aria-label="${stat.n} 亲本 B">
              <input class="advanced-field" type="number" min="0" max="999" step="1" value="${row.stim}" data-breed-stat="${stat.id}" data-breed-side="stim" aria-label="${stat.n} Stimulation">
            </div>`;
          }).join("")}
        </div>
        <div class="calc-section advanced-zone">
          <div class="slot-title"><span>房间与血缘</span><small>近亲衰减仅提示，不伪造公式</small></div>
          <div class="form-grid three">
            <label><span>Skill Share Stimulation</span><input id="breedSkillStim" type="number" min="0" max="999" value="${breedingState.skillStim}"></label>
            <label><span>近亲系数 %</span><input id="breedKinship" type="number" min="0" max="100" step="0.1" value="${breedingState.kinship}"></label>
            <label><span>可遗传失调来源数</span><input id="breedDisorders" type="number" min="0" max="8" value="${breedingState.disorderSources}"></label>
            <label><span>房间 Health</span><select id="breedHealth">
              <option value="low" ${breedingState.health==="low"?"selected":""}>低：高风险</option>
              <option value="normal" ${breedingState.health==="normal"?"selected":""}>正常</option>
              <option value="high" ${breedingState.health==="high"?"selected":""}>高：推荐</option>
            </select></label>
          </div>
        </div>
        <div class="calc-section advanced-zone">
          <div class="slot-title"><span>目标遗传技能</span><small>32 / 95 / 196</small></div>
          <div class="form-grid three">
            ${rules.skillThresholds.map(item=>`<label><span>${item.value} · ${item.slot}</span>
              <input data-skill-target="${item.value}" list="abilityOptionsBreed" value="${attr(breedingState.skillTargets[String(item.value)])}" placeholder="${item.n}">
            </label>`).join("")}
          </div>
          <datalist id="abilityOptionsBreed">${D.catalogs.abilities.map(item=>`<option value="${attr(item)}"></option>`).join("")}</datalist>
        </div>
        <label class="field-block advanced-zone"><span>血系备注</span><textarea id="breedNotes" rows="4" placeholder="记录共同祖先、目标突变和下一代去留标准">${esc(breedingState.notes)}</textarea></label>
      </section>
      <aside class="breeding-report">
        <span class="tool-eyebrow">OFFSPRING FORECAST</span>
        <h3>后代预测</h3>
        <div id="breedingResults">${breedingResultsHtml()}</div>
      </aside>
    </div>`;

  bindToolLevel("breeding",$("#view-breed"),renderBreedingPlanner);
  $("#parentAName").oninput = event=>{ breedingState.parentA=event.target.value; saveBreeding(); refreshBreedingResults(); };
  $("#parentBName").oninput = event=>{ breedingState.parentB=event.target.value; saveBreeding(); refreshBreedingResults(); };
  $("#view-breed").querySelectorAll("[data-breed-stat]").forEach(input=>{
    input.oninput = ()=>{
      const row = breedingState.stats[input.dataset.breedStat];
      const side = input.dataset.breedSide;
      row[side] = clampNumber(input.value, side==="stim"?0:3, side==="stim"?999:7, side==="stim"?0:5);
      saveBreeding(); refreshBreedingResults();
    };
  });
  $("#breedSkillStim").oninput = event=>{ breedingState.skillStim=clampNumber(event.target.value,0,999); saveBreeding(); refreshBreedingResults(); };
  $("#breedKinship").oninput = event=>{ breedingState.kinship=clampNumber(event.target.value,0,100); saveBreeding(); refreshBreedingResults(); };
  $("#breedDisorders").oninput = event=>{ breedingState.disorderSources=clampNumber(event.target.value,0,8); saveBreeding(); refreshBreedingResults(); };
  $("#breedHealth").onchange = event=>{ breedingState.health=event.target.value; saveBreeding(); refreshBreedingResults(); };
  $("#view-breed").querySelectorAll("[data-skill-target]").forEach(input=>{
    input.oninput = ()=>{ breedingState.skillTargets[input.dataset.skillTarget]=input.value; saveBreeding(); refreshBreedingResults(); };
  });
  $("#breedNotes").oninput = event=>{ breedingState.notes=event.target.value; saveBreeding(); };
  $("#breedingFullGuide").onclick = ()=>location.hash="#/page/breeding";
  $("#copyBreeding").onclick = async ()=>{
    try {
      await navigator.clipboard.writeText(breedingPlanText());
      $("#breedSaveStatus").textContent="已复制到剪贴板";
    } catch (_) {
      $("#breedSaveStatus").textContent="复制失败，请检查浏览器权限";
    }
  };
  $("#resetBreeding").onclick = ()=>{
    if(!confirm("清空当前繁殖规划？此操作会覆盖本地记录。")) return;
    breedingState=defaultBreedingState();
    saveBreeding();
    renderBreedingPlanner();
  };
  show("view-breed");
}

/* ---------- 战斗计算器 ---------- */
const COMBAT_KEY = "mew_combat_calculator_v1";
function defaultCombatState(){
  return {
    mode:"melee_basic", type:"physical", base:5, str:5, dex:5, luck:5, hits:1,
    flat:0, damageUp:0, magicFlat:0, bruise:0, brace:0, bounty:0,
    critUp:0, critDamageBonus:100, miss:0, dodgeA:0, dodgeB:0, dodgeC:0, dodgeD:0,
    targetHp:20, targetShield:0, backstab:false, marked:false,
    magicWeakness:false, holyShield:false, bypassShield:false,
  };
}
function normalizeCombatState(value){
  const state = {...defaultCombatState(), ...(value && typeof value==="object" ? value : {})};
  if(!D.mechanics.combat.attackModes.some(item=>item.id===state.mode)) state.mode="melee_basic";
  if(!D.mechanics.combat.damageTypes.some(item=>item.id===state.type)) state.type="physical";
  return state;
}
let combatState = normalizeCombatState(readLocalJson(COMBAT_KEY, null));

function combatMath(){
  const mode = D.mechanics.combat.attackModes.find(item=>item.id===combatState.mode);
  const type = combatState.type;
  const physical = type==="physical" || type==="hybrid";
  const magical = type==="magic" || type==="hybrid";
  const bruiseApplies = physical || type==="knockback";
  const stat = mode.stat==="STR" ? clampNumber(combatState.str,-99,999,5)
    : mode.stat==="DEX" ? clampNumber(combatState.dex,-99,999,5) : 5;
  const statBonus = mode.scale==="full" ? stat-5 : mode.scale==="half" ? Math.trunc((stat-5)/2) : 0;
  const basicBonus = mode.basic ? clampNumber(combatState.damageUp,-99,999) : 0;
  const magicBonus = magical ? clampNumber(combatState.magicFlat,-99,999) : 0;
  const manualBonus = clampNumber(combatState.flat,-99,999);
  const steps = [
    {n:"卡面基础", v:clampNumber(combatState.base,0,999)},
    {n:mode.stat==="—"?"无属性缩放":`${mode.stat} 修正`, v:statBonus, signed:true},
  ];
  if(mode.basic) steps.push({n:"Damage Up",v:basicBonus,signed:true});
  if(magical) steps.push({n:"魔法平铺加值",v:magicBonus,signed:true});
  steps.push({n:"其他平铺加值",v:manualBonus,signed:true});
  let damage = Math.max(0, steps.reduce((sum,item)=>sum+item.v,0));
  if(bruiseApplies && combatState.bruise){
    damage += clampNumber(combatState.bruise,0,999);
    steps.push({n:"Bruise",v:damage});
  }
  if(physical && combatState.backstab && damage>0){
    damage += Math.max(1,Math.floor(damage*.25));
    steps.push({n:"背刺 +25%",v:damage});
  }
  const bounty = Math.round(clampNumber(combatState.bounty,0,42));
  for(let i=0;i<bounty;i++) damage=Math.floor(damage*1.25);
  if(bounty) steps.push({n:`Bounty ×${bounty}`,v:damage});
  const beforeBrace = damage;
  if(damage>0) damage=Math.max(1,damage-Math.round(clampNumber(combatState.brace,0,999)));
  if(damage!==beforeBrace) steps.push({n:"Brace 后",v:damage});

  const marked = combatState.marked && physical;
  const magicWeakness = combatState.magicWeakness && magical;
  const forcedCrit = marked || magicWeakness;
  const critChance = forcedCrit ? 1 : physical
    ? clampNumber(2*combatState.luck + Number(combatState.critUp||0),0,100)/100 : 0;
  const critMultiplier = magicWeakness ? 2 : 1 + clampNumber(combatState.critDamageBonus,0,900,100)/100;
  const critDamage = Math.floor(damage*critMultiplier);
  const dodge = 1-["dodgeA","dodgeB","dodgeC","dodgeD"].reduce(
    (remaining,key)=>remaining*(1-clampNumber(combatState[key],0,100)/100),1
  );
  const cannotMiss = marked || magicWeakness || type==="dot";
  const hitChance = cannotMiss ? 1 : (1-clampNumber(combatState.miss,0,100)/100)*(1-dodge);
  const landedExpected = damage*(1-critChance)+critDamage*critChance;
  const hits = Math.max(1,Math.round(clampNumber(combatState.hits,1,99,1)));
  const bypass = combatState.bypassShield || marked || type==="dot";
  const holyBlocks = combatState.holyShield && !bypass;
  const expectedLandedHits = hitChance*hits;
  const holyBlockProbability = holyBlocks ? 1-Math.pow(1-hitChance,hits) : 0;
  const expectedBeforeShield = Math.max(0, landedExpected*(expectedLandedHits-holyBlockProbability));
  const shield = clampNumber(combatState.targetShield,0,9999);
  const expectedShield = bypass ? 0 : Math.min(shield, expectedBeforeShield);
  const expectedHpDamage = Math.max(0,expectedBeforeShield-expectedShield);
  const hp = clampNumber(combatState.targetHp,1,99999,20);
  const effectivePool = hp+(bypass?0:shield);
  const attempts = expectedBeforeShield>0 ? Math.ceil(effectivePool/expectedBeforeShield) : null;
  return {
    mode,type,physical,magical,bruiseApplies,steps,damage,critDamage,critChance,
    critMultiplier,dodge,hitChance,hits,bypass,holyBlocks,expectedBeforeShield,
    expectedShield,expectedHpDamage,hp,shield,attempts,
    remaining:Math.max(0,hp-expectedHpDamage),
  };
}
function combatWarnings(result){
  const warnings = [];
  if(!result.mode.basic && Number(combatState.damageUp)) warnings.push("Damage Up 只提高普攻；当前攻击模式不会计入。");
  if(!result.magical && Number(combatState.magicFlat)) warnings.push("当前不是魔法伤害，魔法平铺加值已忽略。");
  if(!result.bruiseApplies && Number(combatState.bruise)) warnings.push("当前伤害类型不吃 Bruise；其层数已忽略。");
  if(!result.physical && combatState.backstab) warnings.push("只有物理与物魔双伤可以背刺。");
  if(combatState.marked && !result.physical) warnings.push("Marked 只保证物理伤害暴击、命中并绕过护盾。");
  if(combatState.magicWeakness && !result.magical) warnings.push("Magic Weakness 只作用于魔法或物魔双伤。");
  if(result.holyBlocks) warnings.push("Holy Shield 会挡住本轮第一次成功命中，并消耗 1 层。");
  if(!warnings.length) warnings.push("当前条件均已进入结算链。");
  return warnings;
}
function combatResultsHtml(){
  const result = combatMath();
  const warnings = combatWarnings(result);
  const roundsText = !result.attempts ? "当前条件无法造成有效伤害。"
    : result.holyBlocks ? `若每轮都补充 1 层 Holy Shield，约需 ${result.attempts} 轮。`
    : `按当前整轮期望约需 ${result.attempts} 轮清空有效生命。`;
  return `
    <div class="combat-primary">
      <span>预计本轮 HP 伤害</span>
      <strong>${fmtNumber(result.expectedHpDamage,1)}</strong>
      <small>${result.hits} 次尝试 · ${fmtNumber(result.hitChance*100,1)}% 单次命中</small>
    </div>
    <div class="planner-metrics combat-metrics">
      <div><strong>${result.damage}</strong><span>普通命中</span></div>
      <div><strong>${result.critDamage}</strong><span>暴击命中</span></div>
      <div><strong>${fmtNumber(result.critChance*100,1)}%</strong><span>暴击率</span></div>
      <div><strong>${fmtNumber(result.dodge*100,1)}%</strong><span>合并闪避</span></div>
    </div>
    <div class="combat-target">
      <span class="tool-label">目标结算</span>
      <div class="combat-target-bar"><i style="width:${Math.max(0,Math.min(100,result.remaining/result.hp*100))}%"></i></div>
      <p>护盾预计吸收 <strong>${fmtNumber(result.expectedShield,1)}</strong>；HP ${result.hp} → <strong>${fmtNumber(result.remaining,1)}</strong></p>
      <small>${roundsText}</small>
    </div>
    <div class="combat-chain">
      <span class="tool-label">单次命中结算链</span>
      ${result.steps.map(step=>`<div><span>${esc(step.n)}</span><strong>${step.signed&&step.v>=0?"+":""}${step.v}</strong></div>`).join("")}
      <div><span>暴击最后结算</span><strong>×${fmtNumber(result.critMultiplier,2)}</strong></div>
      <div><span>Shield</span><strong>${result.bypass?"绕过":"正常吸收"}</strong></div>
    </div>
    <div class="planner-warnings">
      <span class="tool-label">规则提示</span>
      ${warnings.map(item=>`<p>${item==="当前条件均已进入结算链。"?`✓ ${item}`:`! ${item}`}</p>`).join("")}
    </div>
    <p class="calc-caveat">期望值按命中、独立闪避来源与暴击概率计算。背刺和每层 Bounty 均逐次向下取整；特殊技能的自定义倍率、元素反应与专属脚本需另行加入“其他平铺加值”。</p>`;
}
function saveCombat(){
  localStorage.setItem(COMBAT_KEY,JSON.stringify(combatState));
  const status=$("#combatSaveStatus");
  if(status) status.textContent="已自动保存";
}
function refreshCombatResult(){
  const result=$("#combatResults");
  if(result) result.innerHTML=combatResultsHtml();
  $("#view-calc").querySelectorAll("[data-calc-mode]").forEach(button=>button.classList.toggle("active",button.dataset.calcMode===combatState.mode));
  $("#view-calc").querySelectorAll("[data-damage-type]").forEach(button=>button.classList.toggle("active",button.dataset.damageType===combatState.type));
  const mode=D.mechanics.combat.attackModes.find(item=>item.id===combatState.mode);
  const formula=$("#combatFormula");
  if(formula) formula.textContent=mode.formula;
}
function combatPlanText(){
  const result=combatMath();
  return [
    `Mewgenics 战斗估算｜${result.mode.n} · ${D.mechanics.combat.damageTypes.find(item=>item.id===result.type)?.n}`,
    `单次普通 ${result.damage}｜暴击 ${result.critDamage}｜命中 ${fmtNumber(result.hitChance*100,1)}%｜暴击率 ${fmtNumber(result.critChance*100,1)}%`,
    `${result.hits} 次尝试预计造成 ${fmtNumber(result.expectedBeforeShield,1)} 总伤害`,
    `Shield 吸收 ${fmtNumber(result.expectedShield,1)}｜HP 伤害 ${fmtNumber(result.expectedHpDamage,1)}｜剩余 HP ${fmtNumber(result.remaining,1)}`,
    ...result.steps.map(step=>`${step.n}：${step.v}`),
  ].join("\n");
}
function combatAdvancedCount(){
  const defaults=defaultCombatState();
  const keys=[
    "flat","damageUp","magicFlat","bruise","brace","bounty",
    "luck","critUp","critDamageBonus","miss","dodgeA","dodgeB","dodgeC","dodgeD",
    "backstab","marked","magicWeakness","holyShield","bypassShield",
  ];
  return keys.filter(key=>combatState[key]!==defaults[key]).length;
}
function renderCombatCalculator(){
  setMode("codex");
  setActive("__combatcalc");
  rememberTool("__combatcalc");
  const rules=D.mechanics.combat;
  const toolLevel=getToolLevel("combat");
  const numberField=(label,key,min,max,step=1)=>`<label><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${attr(combatState[key])}" data-calc-field="${key}"></label>`;
  const toggle=(label,key,detail)=>`<label class="calc-toggle"><input type="checkbox" data-calc-toggle="${key}" ${combatState[key]?"checked":""}><span><strong>${label}</strong><small>${detail}</small></span></label>`;
  $("#view-calc").dataset.toolLevel=toolLevel;
  $("#view-calc").innerHTML=`
    <header class="tool-page-head">
      <div>
        <span class="tool-eyebrow">DAMAGE RESOLUTION / EXPECTED VALUE</span>
        <h2>DMG · 战斗计算器</h2>
        <p>按游戏结算顺序拆解伤害、命中、暴击与护盾；特殊技能可用自定义加值补充。</p>
      </div>
      <div class="tool-actions">
        <span id="combatSaveStatus">本机自动保存</span>
        <button class="btn" id="copyCombat">复制结果</button>
        <button class="btn" id="combatFullGuide">完整战斗规则</button>
        <button class="btn danger" id="resetCombat">重置</button>
      </div>
    </header>
    ${toolLevelHtml("combat",combatAdvancedCount())}
    <div class="combat-layout">
      <section class="combat-workbench">
        <div class="calc-section first">
          <div class="slot-title"><span>攻击模式</span><small id="combatFormula"></small></div>
          <div class="segmented calc-mode-switch">
            ${rules.attackModes.map(item=>`<button data-calc-mode="${item.id}" class="${combatState.mode===item.id?"active":""}">${item.n}</button>`).join("")}
          </div>
        </div>
        <div class="calc-section">
          <div class="slot-title"><span>伤害类型</span><small>决定增伤、暴击与护盾规则</small></div>
          <div class="segmented damage-type-switch">
            ${rules.damageTypes.map(item=>`<button data-damage-type="${item.id}" class="${combatState.type===item.id?"active":""}">${item.cn}<small>${item.n}</small></button>`).join("")}
          </div>
        </div>
        <div class="calc-section">
          <div class="slot-title"><span>攻击参数</span><small>所有数值均可直接覆盖</small></div>
          <div class="form-grid four">
            ${numberField("卡面基础伤害","base",0,999)}
            ${numberField("STR","str",-99,999)}
            ${numberField("DEX","dex",-99,999)}
            ${numberField("攻击次数","hits",1,99)}
            ${numberField("目标 HP","targetHp",1,99999)}
            ${numberField("目标 Shield","targetShield",0,9999)}
          </div>
        </div>
        <div class="calc-section advanced-zone">
          <div class="slot-title"><span>额外加值与减伤</span><small>按规则逐层结算</small></div>
          <div class="form-grid four">
            ${numberField("其他平铺加值","flat",-99,999)}
            ${numberField("Damage Up","damageUp",-99,999)}
            ${numberField("魔法平铺加值","magicFlat",-99,999)}
            ${numberField("Bruise 层数","bruise",0,999)}
            ${numberField("Brace 层数","brace",0,999)}
            ${numberField("Bounty 来源数","bounty",0,42)}
          </div>
          <div class="calc-toggle-grid">
            ${toggle("背刺","backstab","物理伤害 +25%，向下取整")}
            ${toggle("Marked","marked","物理必中、必暴击、绕过 Shield")}
            ${toggle("Magic Weakness","magicWeakness","魔法必中并以 2× 暴击")}
            ${toggle("Holy Shield","holyShield","格挡第一次有效命中")}
            ${toggle("穿刺 / 绕盾","bypassShield","手动指定绕过所有 Shield")}
          </div>
        </div>
        <div class="calc-section advanced-zone">
          <div class="slot-title"><span>命中与暴击</span><small>最多 4 个独立闪避来源按乘法合并</small></div>
          <div class="form-grid four">
            ${numberField("LCK","luck",-99,999)}
            ${numberField("Crit Chance Up %","critUp",-999,999)}
            ${numberField("暴击伤害加成 %","critDamageBonus",0,900)}
            ${numberField("未命中率 %","miss",0,100,0.1)}
            ${numberField("闪避来源 A %","dodgeA",0,100,0.1)}
            ${numberField("闪避来源 B %","dodgeB",0,100,0.1)}
            ${numberField("闪避来源 C %","dodgeC",0,100,0.1)}
            ${numberField("闪避来源 D %","dodgeD",0,100,0.1)}
          </div>
        </div>
      </section>
      <aside class="combat-report">
        <span class="tool-eyebrow">DAMAGE TAPE</span>
        <h3>结算结果</h3>
        <div id="combatResults">${combatResultsHtml()}</div>
      </aside>
    </div>`;
  bindToolLevel("combat",$("#view-calc"),renderCombatCalculator);
  refreshCombatResult();
  $("#view-calc").querySelectorAll("[data-calc-mode]").forEach(button=>{
    button.onclick=()=>{ combatState.mode=button.dataset.calcMode; saveCombat(); refreshCombatResult(); };
  });
  $("#view-calc").querySelectorAll("[data-damage-type]").forEach(button=>{
    button.onclick=()=>{ combatState.type=button.dataset.damageType; saveCombat(); refreshCombatResult(); };
  });
  $("#view-calc").querySelectorAll("[data-calc-field]").forEach(input=>{
    input.oninput=()=>{ combatState[input.dataset.calcField]=Number(input.value); saveCombat(); refreshCombatResult(); };
  });
  $("#view-calc").querySelectorAll("[data-calc-toggle]").forEach(input=>{
    input.onchange=()=>{ combatState[input.dataset.calcToggle]=input.checked; saveCombat(); refreshCombatResult(); };
  });
  $("#combatFullGuide").onclick=()=>location.hash="#/page/combat";
  $("#copyCombat").onclick=async ()=>{
    try {
      await navigator.clipboard.writeText(combatPlanText());
      $("#combatSaveStatus").textContent="已复制到剪贴板";
    } catch (_) {
      $("#combatSaveStatus").textContent="复制失败，请检查浏览器权限";
    }
  };
  $("#resetCombat").onclick=()=>{
    if(!confirm("重置战斗计算器？")) return;
    combatState=defaultCombatState();
    saveCombat();
    renderCombatCalculator();
  };
  show("view-calc");
}

/* ---------- 全局搜索 ---------- */
let searchTimer = null;
let suggestionPool = null;
const SEARCH_COMMANDS = [
  {value:"/boss",label:"只查 Boss",scope:"boss"},
  {value:"/item",label:"只查物品与套装",scope:"item"},
  {value:"/build",label:"只查 Build 模板",scope:"build"},
];
const SEARCH_ALIASES = {
  "流血":["bleed","bleeding"],"出血":["bleed","bleeding"],"中毒":["poison"],
  "燃烧":["burn","burning"],"眩晕":["stun"],"冰冻":["freeze","frozen"],
  "治疗":["heal","healing"],"吸血":["lifesteal","life steal"],"护盾":["shield"],
  "闪避":["dodge"],"暴击":["crit","critical"],"召唤":["summon","familiar"],
  "变异":["mutation","突变"],"疾病":["disorder","失调"],"首领":["boss"],
  "消耗品":["consumable"],"套装":["set"],"敌人":["enemy"],"职业":["class"],
  "法师":["mage"],"坦克":["tank"],"猎人":["hunter"],"牧师":["cleric"],
  "小偷":["thief"],"死灵":["necromancer"],"修补匠":["tinkerer"],
  "屠夫":["butcher"],"德鲁伊":["druid"],"灵媒":["psychic"],
  "武僧":["monk"],"小丑":["jester"],"bos":["boss"],"buid":["build"],
  "bulid":["build"],"blead":["bleed"],"posion":["poison"],
  "sheild":["shield"],"critcal":["critical"],"mutaton":["mutation"],
};
function parseSearchQuery(raw){
  const value=raw.trim();
  const command=SEARCH_COMMANDS.find(item=>value===item.value||value.startsWith(item.value+" "));
  const query=command ? value.slice(command.value.length).trim() : value;
  const normalized=query.toLowerCase();
  const terms=[normalized,...(SEARCH_ALIASES[normalized]||[])].filter(Boolean);
  return {
    raw:value,query,terms:[...new Set(terms.map(term=>term.toLowerCase()))],
    scope:command?.scope||"",scopeLabel:command?.label||"",
  };
}
function matchSearchRecord(record, spec){
  if(!spec.terms.length) return true;
  const text=recText(record);
  return spec.terms.some(term=>text.includes(term));
}
function saveSearchHistory(value){
  const history=readLocalJson(SEARCH_HISTORY_KEY,[]);
  const next=[value,...(Array.isArray(history)?history:[]).filter(item=>item!==value)].slice(0,6);
  localStorage.setItem(SEARCH_HISTORY_KEY,JSON.stringify(next));
}
function getSuggestionPool(){
  if(suggestionPool) return suggestionPool;
  const items = [
    ...D.classes.map(item=>({value:item.n,label:item.n,meta:"职业"})),
    ...D.bosses.map(item=>({value:item.n,label:item.n,meta:"Boss"})),
    ...D.buildPresets.map(item=>({value:item.n,label:item.n,meta:"Build"})),
  ];
  Object.keys(DBDEF).forEach(key=>{
    dbs[key].forEach(item=>{
      if(item.n) items.push({value:item.n,label:item.n,meta:DBDEF[key].label});
    });
  });
  Object.entries(ASSET_GALLERIES).forEach(([kind,meta])=>{
    wikiAssets(kind).forEach(item=>items.push({value:item.n,label:item.n,meta:meta.label}));
  });
  const seen=new Set();
  suggestionPool=items.filter(item=>{
    const id=item.meta+"|"+item.value;
    if(seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return suggestionPool;
}
function searchSuggestions(q){
  const value=q.trim();
  if(!value){
    const history=readLocalJson(SEARCH_HISTORY_KEY,[]);
    return [
      ...(Array.isArray(history)?history.slice(0,3).map(item=>({value:item,label:item,meta:"最近搜索"})):[]),
      ...SEARCH_COMMANDS.map(item=>({...item,meta:"快捷命令"})),
    ].slice(0,6);
  }
  if(value.startsWith("/")){
    return SEARCH_COMMANDS.filter(item=>item.value.startsWith(value.toLowerCase()))
      .map(item=>({...item,meta:"快捷命令"}));
  }
  const normalized=value.toLowerCase();
  const aliasItems=Object.keys(SEARCH_ALIASES)
    .filter(key=>key.includes(normalized))
    .map(key=>({value:key,label:key,meta:"别名"}));
  const matches=getSuggestionPool().filter(item=>item.value.toLowerCase().includes(normalized));
  const seen=new Set();
  return [...aliasItems,...matches].filter(item=>{
    const key=item.meta+"|"+item.value;
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0,6);
}
function updateSearchSuggestions(q){
  const box=$("#searchSuggestions");
  const items=searchSuggestions(q);
  box.innerHTML=items.map(item=>`<button role="option" data-search-suggestion="${attr(item.value)}">
    <span>${esc(item.label)}</span><small>${esc(item.meta)}</small>
  </button>`).join("");
  box.classList.toggle("hidden",!items.length);
  box.querySelectorAll("[data-search-suggestion]").forEach(button=>{
    button.onmousedown=event=>event.preventDefault();
    button.onclick=()=>{
      const value=button.dataset.searchSuggestion;
      $("#globalSearch").value=value;
      box.classList.add("hidden");
      location.hash="#/search?q="+encodeURIComponent(value);
    };
  });
}
function renderSearch(q){
  setMode("codex"); setActive(null);
  if(!q){ renderHome(); return; }
  const spec=parseSearchQuery(q);
  saveSearchHistory(spec.raw);
  $("#globalSearch").value=spec.raw;
  if(document.activeElement!==$("#globalSearch")) $("#searchSuggestions").classList.add("hidden");
  const order = ["mutations","enemies","disorders","statuses","consumables","sets","familiars","weather","tiles","elements","hiddenEl","pickups","traps","locations"];
  let groups = "";
  const summary = [];
  // 职业组
  const clsHits = spec.scope ? [] : D.classes.filter(c=>matchSearchRecord(c,spec));
  if(clsHits.length){
    summary.push({key:"__classes",label:"职业",count:clsHits.length});
    groups += searchGroupHtml("职业", "__classes", clsHits,
      r=>`${imageTag(classImage(r),r.n,"search-thumb")}<span class="sr-name">${highlight(r.n,spec.query)}</span><span class="sr-eff">${highlight(r.role,spec.query)}</span><span class="sr-src">${highlight(r.unlock,spec.query)}</span>`);
  }
  const bossHits = (!spec.scope||spec.scope==="boss") ? D.bosses.filter(boss=>matchSearchRecord(boss,spec)) : [];
  if(bossHits.length){
    summary.push({key:"__boss",label:"Boss",count:bossHits.length});
    groups += searchGroupHtml("Boss 备战", "__boss", bossHits,
      boss=>`${imageTag(bossImage(boss),boss.n,"search-thumb")}<span class="sr-name">${highlight(boss.n,spec.query)}</span><span class="sr-eff">${highlight(boss.summary,spec.query)}</span><span class="sr-src">${highlight(boss.region,spec.query)}</span>`);
  }
  const presetHits = (!spec.scope||spec.scope==="build") ? D.buildPresets.filter(preset=>matchSearchRecord(preset,spec)) : [];
  if(presetHits.length){
    summary.push({key:"__preset",label:"Build",count:presetHits.length});
    groups += searchGroupHtml("Build 模板", "__preset", presetHits,
      preset=>{
        const presetClass=D.classes.find(item=>item.n===preset.classes?.[0]);
        return `${imageTag(presetClass?classImage(presetClass):"",preset.n,"search-thumb")}<span class="sr-name">${highlight(preset.n,spec.query)}</span><span class="sr-eff">${highlight(preset.en+" · "+preset.stats,spec.query)}</span><span class="sr-src">${highlight(preset.category,spec.query)}</span>`;
      });
  }
  let total = clsHits.length + bossHits.length + presetHits.length;
  order.filter(key=>!spec.scope||(spec.scope==="item"&&["consumables","sets"].includes(key))).forEach(k=>{
    const hits = dbs[k].filter(r=>matchSearchRecord(r,spec));
    total += hits.length;
    if(!hits.length) return;
    const def = DBDEF[k];
    summary.push({key:k,label:def.label,count:hits.length});
    groups += searchGroupHtml(def.label, k, hits,
      r=>`${imageTag(entityImage(k,r),dispName(r.n),"search-thumb")}<span class="sr-name">${highlight(dispName(r.n),spec.query)}</span><span class="sr-eff">${highlight(r.e||r.neg||r.p||"",spec.query)}</span><span class="sr-src">${r.r?highlight(r.r,spec.query):(r.t?highlight(r.t,spec.query):"")}</span>`);
  });
  const assetKinds=spec.scope==="item" ? ["items"] : spec.scope ? [] : Object.keys(ASSET_GALLERIES);
  assetKinds.forEach(kind=>{
    const hits=wikiAssets(kind).filter(item=>matchSearchRecord(item,spec));
    if(!hits.length) return;
    const key="asset-"+kind;
    total+=hits.length;
    summary.push({key,label:ASSET_GALLERIES[kind].label,count:hits.length});
    groups+=assetSearchGroupHtml(kind,hits,spec.query);
  });
  const expanded=spec.terms.filter(term=>term!==spec.query.toLowerCase());
  const openGroups=new Set(summary.slice().sort((a,b)=>b.count-a.count).slice(0,3).map(item=>item.key));
  $("#view-search").innerHTML = `
    <div class="db-header"><h2 class="db-title">⌕ ${spec.scopeLabel?esc(spec.scopeLabel)+" · ":""}「${esc(spec.query||"全部")}」 <span style="font-size:13px;color:var(--text-faint);font-weight:400;">共 ${total} 条</span></h2>
      ${expanded.length?`<p class="db-desc">同时匹配：${expanded.map(esc).join(" / ")}</p>`:""}
    </div>
    ${summary.length?`<nav class="search-summary" aria-label="结果分类">
      ${summary.slice().sort((a,b)=>b.count-a.count).slice(0,8).map(item=>`<button data-search-jump="${item.key}"><strong>${item.count}</strong><span>${item.label}</span></button>`).join("")}
    </nav>`:""}
    ${total ? groups : `<div class="no-result"><span class="nr-icon">///</span>没有找到相关内容，换个关键词试试<br><span style="font-size:12px">提示：可搜英文名（如 Bleed）、中文名或具体效果（如 吸血）</span></div>`}`;
  $("#view-search").querySelectorAll(".search-group").forEach(group=>{
    group.open=openGroups.has(group.dataset.searchGroup);
  });
  $("#view-search").querySelectorAll(".search-row").forEach(r=>{
    r.onclick = ()=>{
      const dbk = r.dataset.db, gi = +r.dataset.gi;
      if(dbk==="__classes") openClassDetail(gi);
      else if(dbk==="__boss") location.hash="#/boss/"+D.bosses[gi].id;
      else if(dbk==="__preset") {
        const preset=D.buildPresets[gi];
        location.hash="#/planner/0";
        setTimeout(()=>{
          const select=$("#memberPreset");
          if(select){ select.value=String(preset.id); $("#applyPreset").click(); }
        },0);
      }
      else openDetail(dbk, dbs[dbk][gi]);
    };
  });
  $("#view-search").querySelectorAll(".sg-more").forEach(b=>{
    b.onclick = ()=>{ location.hash="#/db/"+b.dataset.k+"?q="+encodeURIComponent(spec.query); };
  });
  $("#view-search").querySelectorAll("[data-asset-search-row]").forEach(button=>{
    const kind=button.dataset.assetKind;
    button.onclick=()=>openAssetDetail(kind,wikiAssets(kind)[+button.dataset.assetIndex]);
  });
  $("#view-search").querySelectorAll("[data-asset-more]").forEach(button=>{
    button.onclick=()=>location.hash=`#/assets/${button.dataset.assetMore}?q=${encodeURIComponent(spec.query)}`;
  });
  $("#view-search").querySelectorAll("[data-tool-route]").forEach(button=>{
    button.onclick=()=>location.hash=button.dataset.toolRoute;
  });
  $("#view-search").querySelectorAll("[data-search-jump]").forEach(button=>{
    button.onclick=()=>{
      const group=document.querySelector(`[data-search-group="${button.dataset.searchJump}"]`);
      if(!group) return;
      group.open=true;
      group.scrollIntoView({behavior:"smooth",block:"start"});
    };
  });
  show("view-search");
}
function searchGroupHtml(label, key, hits, rowFn){
  const top = hits.slice(0,3);
  const source = key==="__classes" ? D.classes
    : key==="__boss" ? D.bosses
    : key==="__preset" ? D.buildPresets
    : dbs[key];
  const toolRoute=key==="__classes" ? "#/classes" : key==="__boss" ? "#/boss/0" : key==="__preset" ? "#/planner/0" : "";
  return `<details class="search-group" data-search-group="${key}">
    <summary class="search-group-title">${label}<span class="sg-count">${hits.length} 条</span></summary>
    ${top.map(r=>`<button class="search-row" data-db="${key}" data-gi="${source.indexOf(r)}">${rowFn(r)}</button>`).join("")}
    ${hits.length>3 && !key.startsWith("__")?`<button class="chip sg-more" data-k="${key}">在${label}中查看全部 ${hits.length} 条 →</button>`:""}
    ${hits.length>3&&toolRoute?`<button class="chip" data-tool-route="${toolRoute}">进入${label} →</button>`:""}
  </details>`;
}
function assetSearchGroupHtml(kind,hits,q){
  const source=wikiAssets(kind);
  const meta=ASSET_GALLERIES[kind];
  return `<details class="search-group" data-search-group="asset-${kind}">
    <summary class="search-group-title">${meta.label}<span class="sg-count">${hits.length} 条</span></summary>
    ${hits.slice(0,3).map(item=>`<button class="search-row" data-asset-search-row data-asset-kind="${kind}" data-asset-index="${source.indexOf(item)}">
      ${imageTag(item.img,item.n,"search-thumb")}<span class="sr-name">${highlight(item.n,q)}</span><span class="sr-eff">${highlight(item.title,q)}</span>
    </button>`).join("")}
    ${hits.length>3?`<button class="chip" data-asset-more="${kind}">在${meta.label}中查看全部 ${hits.length} 项 →</button>`:""}
  </details>`;
}

/* ---------- 详情抽屉 ---------- */
const DETAIL_FIELDS = {
  mutations:[["id","ID"],["e","效果"],["tag","标签"],["c","部位"]],
  disorders:[["neg","负面效果"],["s","一线生机"],["p","分池"],["id","ID"]],
  statuses:[["e","效果"],["t","类型"]],
  elements:[["e","定位"],["p","优先级"]],
  hiddenEl:[["e","效果"],["src","来源"]],
  weather:[["r","稀有度"],["e","效果"],["u","解锁条件"]],
  tiles:[["e","效果"]],
  traps:[["e","触发效果"],["src","来源"]],
  pickups:[["e","效果"]],
  familiars:[["e","效果"],["c","分类"]],
  sets:[["p","组成"],["e","集齐效果"]],
  consumables:[["u","次数"],["e","效果"]],
  enemies:[["e","能力"],["r","出现区域"]],
  npcs:[["role","身份"],["cats","收取的猫"],["u","核心解锁"],["cond","解锁条件"]],
  locations:[["t","类型"],["e","要点"]],
};
function drawerShell(title, badges, body, entry){
  const favorite=entry&&isFavorite(entry);
  $("#drawer").innerHTML = `
    <button class="icon-btn drawer-close" id="drawerClose">✕</button>
    <div class="drawer-title-row">
      <h2>${title}</h2>
      ${entry?`<button class="drawer-favorite ${favorite?"active":""}" id="drawerFavorite" title="${favorite?"取消收藏":"收藏条目"}" aria-label="${favorite?"取消收藏":"收藏条目"}" aria-pressed="${String(favorite)}">${favorite?"★":"☆"}</button>`:""}
    </div>
    <div class="d-badges">${badges}</div>
    ${body}`;
  $("#drawer").classList.remove("hidden");
  $("#drawerMask").classList.remove("hidden");
  $("#drawerClose").onclick = closeDrawer;
  if(entry){
    $("#drawerFavorite").onclick=()=>{
      const active=toggleFavorite(entry);
      const button=$("#drawerFavorite");
      button.classList.toggle("active",active);
      button.textContent=active?"★":"☆";
      button.title=active?"取消收藏":"收藏条目";
      button.setAttribute("aria-label",button.title);
      button.setAttribute("aria-pressed",String(active));
    };
  }
}
function detailSummary(dbk, r){
  const preferred={
    mutations:["e","效果"],disorders:["neg","核心影响"],statuses:["e","核心效果"],
    elements:["e","战斗定位"],hiddenEl:["e","核心效果"],weather:["e","天气效果"],
    tiles:["e","地形效果"],traps:["e","触发效果"],pickups:["e","拾取效果"],
    familiars:["e","召唤效果"],sets:["e","套装效果"],consumables:["e","使用效果"],
    enemies:["e","主要能力"],npcs:["role","角色功能"],locations:["e","地点要点"],
  }[dbk];
  if(preferred&&r[preferred[0]]) return {key:preferred[0],label:preferred[1],value:r[preferred[0]]};
  const fallback=(DETAIL_FIELDS[dbk]||[]).find(([key])=>r[key]);
  return fallback ? {key:fallback[0],label:fallback[1],value:r[fallback[0]]} : null;
}
function openDetail(dbk, r){
  const gi=dbs[dbk].indexOf(r);
  const entry=detailEntry(dbk,gi,dispName(r.n));
  rememberDetail(entry);
  const badges = [];
  if(r.d) badges.push('<span class="badge defect">出生缺陷</span>');
  if(r.x) badges.push('<span class="badge unused">未启用</span>');
  if(r.t && /^(Buff|Debuff|Neutral|Elite|Keyword)/.test(r.t))
    badges.push(`<span class="badge b-${r.t.split(" ")[0]}">${esc(r.t)}</span>`);
  const summary=detailSummary(dbk,r);
  const image=entityImage(dbk,r);
  const rows = (DETAIL_FIELDS[dbk]||[]).map(([k,t])=>{
    let v = r[k];
    return v&&k!==summary?.key ? `<div class="dl-row"><div class="dl-key">${t}</div><div class="dl-val">${esc(v)}</div></div>`:"";
  }).join("");
  const body = `
    ${drawerVisual(image,dispName(r.n),dbk==="weather"||dbk==="locations")}
    ${summary?`<section class="drawer-summary"><span>${esc(summary.label)}</span><p>${esc(summary.value)}</p></section>`:""}
    ${rows?`<details class="drawer-more"><summary>完整字段与来源</summary><dl class="dl">${rows}</dl></details>`:""}`;
  drawerShell(esc(dispName(r.n)), badges.join(""),body,entry);
}
function openClassDetail(i){
  const c = D.classes[i];
  const entry=detailEntry("__classes",i,c.n);
  rememberDetail(entry);
  const badges = `<span class="badge tag-animal">${esc(c.basic)}</span>`;
  const body = `
    ${drawerVisual(classImage(c),c.n)}
    <section class="drawer-summary"><span>职业定位</span><p>${esc(c.role)}</p></section>
    <div class="drawer-facts">
      <div><span>属性修正</span><strong>${esc(c.mod)}</strong></div>
      <div><span>基础攻击</span><strong>${esc(c.basic)}</strong></div>
    </div>
    <details class="drawer-more">
      <summary>完整成长、解锁与职业攻略</summary>
      <dl class="dl">
        <div class="dl-row"><div class="dl-key">解锁条件</div><div class="dl-val">${esc(c.unlock)}</div></div>
        <div class="dl-row"><div class="dl-key">升级属性</div><div class="dl-val">${esc(c.stats)}</div></div>
      </dl>
      <div class="d-md md">${mdRender(c.detail)}</div>
    </details>`;
  drawerShell(esc(c.n), badges, body,entry);
}
function closeDrawer(){
  $("#drawer").classList.add("hidden");
  $("#drawerMask").classList.add("hidden");
}

/* ---------- Markdown 资料页 ---------- */
function renderPage(key){
  setMode("codex"); setActive("@"+key);
  const galleryKind={items:"items",furniture:"furniture",adventure:"maps"}[key];
  const gallery=galleryKind ? wikiAssets(galleryKind).slice(0,6) : [];
  const galleryHtml=galleryKind&&gallery.length ? `<section class="page-asset-strip">
    <div class="page-asset-strip-head">
      <div><span class="tool-eyebrow">VISUAL INDEX</span><strong>${ASSET_GALLERIES[galleryKind].label}</strong></div>
      <button class="btn" id="openPageGallery">浏览全部 ${wikiAssets(galleryKind).length} 项</button>
    </div>
    <div>${gallery.map(item=>imageTag(item.img,item.n,"page-asset-thumb")).join("")}</div>
  </section>` : "";
  $("#view-page").innerHTML = `${galleryHtml}<div class="md">${mdRender(D.pages[key])}</div>`;
  if(galleryKind) $("#openPageGallery").onclick=()=>location.hash="#/assets/"+galleryKind;
  show("view-page");
}

/* ---------- 新手课堂 ---------- */
const LS_KEY = "mew_lessons_done";
function getDone(){ try{ return new Set(JSON.parse(localStorage.getItem(LS_KEY)||"[]")); }catch(e){ return new Set(); } }
function saveDone(s){ localStorage.setItem(LS_KEY, JSON.stringify([...s])); }
function renderLearn(idx){
  setMode("learn"); setActive(null);
  const lessons = D.lessons;
  idx = Math.max(0, Math.min(lessons.length-1, idx));
  const done = getDone();
  done.add(idx); saveDone(done);
  const pct = Math.round(done.size/lessons.length*100);
  $("#view-learn").innerHTML = `
    <div class="learn-wrap">
      <div class="learn-rail">
        <div class="learn-progress-text"><span>学习进度</span><span>${done.size}/${lessons.length}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        ${lessons.map((l,i)=>`<button class="lesson-link ${i===idx?"active":""} ${done.has(i)?"done":""}" data-i="${i}">
          <span class="ll-check">${done.has(i)?"✓":"○"}</span>${esc(l.t)}</button>`).join("")}
      </div>
      <div class="learn-content">
        <div class="md">${mdRender("# "+lessons[idx].t+"\n"+lessons[idx].md)}</div>
        <div class="learn-nav">
          ${idx>0?`<button class="btn" id="prevLesson">← 上一课</button>`:"<span></span>"}
          ${idx<lessons.length-1?`<button class="btn primary" id="nextLesson">下一课 →</button>`
            :`<button class="btn primary" id="finishLearn">去图鉴查询 →</button>`}
        </div>
      </div>
    </div>`;
  $("#view-learn").querySelectorAll(".lesson-link").forEach(b=>{
    b.onclick = ()=>location.hash="#/learn/"+b.dataset.i;
  });
  const np=$("#prevLesson"), nn=$("#nextLesson"), fl=$("#finishLearn");
  if(np) np.onclick=()=>location.hash="#/learn/"+(idx-1);
  if(nn) nn.onclick=()=>location.hash="#/learn/"+(idx+1);
  if(fl) fl.onclick=()=>location.hash="#/home";
  show("view-learn");
}

/* ---------- 路由 ---------- */
function parseHash(){
  const h = location.hash || "#/home";
  const [path, query=""] = h.slice(1).split("?");
  const parts = path.split("/").filter(Boolean);
  const q = new URLSearchParams(query).get("q") || "";
  if(!$("#drawer").classList.contains("hidden")) closeDrawer();
  if(parts[0]!=="search" && parts[0]!=="db") $("#globalSearch").value = "";
  if(parts[0]==="home" || parts.length===0) renderHome();
  else if(parts[0]==="codex") renderCodexHome();
  else if(parts[0]==="classes") renderClasses();
  else if(parts[0]==="npcs") renderNpcs();
  else if(parts[0]==="db" && parts[1]){
    const dbq = parts[2] ? decodeURI(parts[2]) : q;
    renderDb(parts[1], dbq);
  }
  else if(parts[0]==="assets" && parts[1]) renderAssetGallery(parts[1],q);
  else if(parts[0]==="search") renderSearch(q);
  else if(parts[0]==="page" && parts[1]) renderPage(parts[1]);
  else if(parts[0]==="learn") renderLearn(parts[1]?+parts[1]:0);
  else if(parts[0]==="boss") renderBossPrep(parts[1]?+parts[1]:0);
  else if(parts[0]==="planner") renderBuildPlanner(parts[1]?+parts[1]:0);
  else if(parts[0]==="breeding") renderBreedingPlanner();
  else if(parts[0]==="calc") renderCombatCalculator();
  else renderHome();
}

/* ---------- 搜索框 ---------- */
function initSearch(){
  const inp = $("#globalSearch");
  inp.addEventListener("input", ()=>{
    clearTimeout(searchTimer);
    const q = inp.value.trim();
    $("#searchClear").style.visibility = q ? "visible":"hidden";
    updateSearchSuggestions(q);
    searchTimer = setTimeout(()=>{
      if(q) location.hash = "#/search?q="+encodeURIComponent(q);
      else location.hash = "#/home";
    }, 220);
  });
  inp.addEventListener("focus",()=>updateSearchSuggestions(inp.value));
  inp.addEventListener("keydown",event=>{
    if(event.key==="Enter"){
      clearTimeout(searchTimer);
      $("#searchSuggestions").classList.add("hidden");
      const q=inp.value.trim();
      location.hash=q ? "#/search?q="+encodeURIComponent(q) : "#/home";
    }
    if(event.key==="Escape") $("#searchSuggestions").classList.add("hidden");
  });
  inp.addEventListener("blur",()=>setTimeout(()=>$("#searchSuggestions").classList.add("hidden"),100));
  $("#searchClear").onclick = ()=>{
    inp.value="";
    $("#searchClear").style.visibility="hidden";
    $("#searchHint").textContent="";
    updateSearchSuggestions("");
    inp.focus();
    location.hash="#/home";
  };
  $("#searchClear").style.visibility="hidden";
}

/* ---------- 主题 ---------- */
function initTheme(){
  const saved = localStorage.getItem("mew_theme_v2") || "light";
  document.documentElement.dataset.theme = saved;
  const sync = ()=>{
    const light = document.documentElement.dataset.theme === "light";
    $("#themeToggle").textContent = light ? "☼" : "◐";
    $("#themeToggle").title = light ? "切换为暗色纸张" : "切换为浅色纸张";
  };
  sync();
  $("#themeToggle").onclick = ()=>{
    const next = document.documentElement.dataset.theme==="light" ? "dark":"light";
    if(next==="dark") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = "light";
    localStorage.setItem("mew_theme_v2", next);
    sync();
    drawPaperTexture();
  };
}

/* ---------- 顶部模式与移动目录 ---------- */
function initModes(){
  document.querySelectorAll(".mode-tab").forEach(btn=>{
    btn.onclick = ()=>{
      location.hash = btn.dataset.mode==="learn" ? "#/learn/0"
        : btn.dataset.mode==="codex" ? "#/codex" : "#/home";
    };
  });
}
function closeMobileNav(){
  $("#sidebar").classList.remove("open");
  $("#sidebarMask").classList.add("hidden");
  document.body.classList.remove("nav-open");
  $("#mobileNavToggle").setAttribute("aria-expanded", "false");
}
function initMobileNav(){
  const btn = $("#mobileNavToggle");
  btn.setAttribute("aria-expanded", "false");
  btn.onclick = ()=>{
    const open = !$("#sidebar").classList.contains("open");
    $("#sidebar").classList.toggle("open", open);
    $("#sidebarMask").classList.toggle("hidden", !open);
    document.body.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", String(open));
  };
  $("#sidebarMask").onclick = closeMobileNav;
  window.addEventListener("resize", ()=>{
    if(window.innerWidth > 900) closeMobileNav();
  });
  $("#mobileBottomNav").querySelectorAll("[data-mobile-route]").forEach(button=>{
    button.onclick=()=>location.hash=button.dataset.mobileRoute;
  });
  $("#mobileBottomNav [data-mobile-search]").onclick=()=>{
    if(document.body.dataset.mode==="learn") location.hash="#/codex";
    setTimeout(()=>$("#globalSearch").focus(),0);
  };
}

/* ---------- 快捷键 ---------- */
function initKeys(){
  document.addEventListener("keydown", e=>{
    if(e.key==="/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)){
      e.preventDefault(); $("#globalSearch").focus();
    }
    if(e.key==="Escape"){
      if(!$("#drawer").classList.contains("hidden")) closeDrawer();
      else if(document.activeElement===$("#globalSearch")) $("#globalSearch").blur();
    }
  });
  $("#drawerMask").onclick = closeDrawer;
}

/* ---------- 启动 ---------- */
function init(){
  $("#versionBadge").textContent = D.meta.version.split("（")[0];
  $("#sideVersion").textContent = D.meta.version;
  drawPaperTexture();
  buildSideNav();
  initSearch();
  initTheme();
  initModes();
  initMobileNav();
  initKeys();
  window.addEventListener("hashchange", parseHash);
  parseHash();
}
init();
})();
