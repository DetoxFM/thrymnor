// ---------- Quests ----------
function renderQuests(){
  const q = el("questList"); q.innerHTML="";
  STATE.quests.active.forEach(qq=>{
    const d = document.createElement("div");
    d.className="quest";
    d.innerHTML = `<strong>${qq.name}</strong> <small>(${qq.where})</small><div class="muted">${qq.desc}</div>`;
    q.appendChild(d);
  });
  if(!STATE.quests.active.length){
    const d = document.createElement("div"); d.className="quest"; d.innerHTML="<em>No active quests.</em>"; q.appendChild(d);
  }
}
function addQuest(qq){ STATE.quests.active.push(qq); renderQuests(); }
function completeQuest(id){
  const idx = STATE.quests.active.findIndex(x=>x.id===id);
  if(idx>=0){
    const qq = STATE.quests.active.splice(idx,1)[0];
    STATE.quests.done.push(qq);
    if(qq.reward?.gold) STATE.gold += qq.reward.gold;
    if(qq.reward?.xp) STATE.xp += qq.reward.xp;
    log(`<strong>Quest complete:</strong> ${qq.name} — Rewards: ${qq.reward?.gold||0}g, ${qq.reward?.xp||0} XP`);
    refreshSheet();
  }
}

// ---------- Vendors / Items ----------
function Item(name,desc,code,price=10, tier="common"){ return {name,desc,code,price,tier}; }
const VENDORS = {
  "Ashenford":[ Item("Armor Kit","+2 Max HP","kit_hp",15), Item("Throwing Spikes","+2 next attack","spikes",10), Item("Leather+2","Armor +2","armor2",30) ],
  "Gravefen Marsh":[ Item("Toxin Vial","Apply poison (DoT)","toxin",18), Item("Herbal Salve","+8 HP","salve",14) ],
  "Veyra’s Crossroads":[ Item("Shadow Trinket","+1 shadow dmg","trink_shadow",25), Item("Radiant Charm","+1 light dmg","trink_light",25) ]
};
function openVendor(){
  const list = VENDORS[STATE.location];
  if(!list){ log("<span class='muted'>No vendors here.</span>"); return; }
  log(`<strong>Vendors in ${STATE.location}:</strong>`);
  list.forEach(it=>{
    const btn = document.createElement("button");
    btn.textContent = `${it.name} (${it.price}g)`;
    btn.onclick = ()=>buyItem(it);
    btn.style.marginRight="6px";
    el("log").appendChild(btn);
  });
  el("log").appendChild(document.createElement("div"));
}
function buyItem(it){
  if(STATE.gold < it.price){ log("<span class='danger'>Not enough gold.</span>"); return; }
  STATE.gold -= it.price;
  STATE.inventory.push(it);
  log(`Bought <strong>${it.name}</strong>.`);
  refreshSheet();
}

function openInventory(){
  if(!STATE.inventory.length){ log("<span class='muted'>Inventory empty.</span>"); return; }
  log("<strong>Inventory:</strong>");
  STATE.inventory.forEach((it,idx)=>{
    const wrap = document.createElement("div"); wrap.className="row";
    const label = document.createElement("div"); label.textContent = `${idx+1}. ${it.name} — ${it.desc}`;
    const equipBtn = document.createElement("button"); equipBtn.textContent="Equip"; equipBtn.onclick = ()=>equip(it);
    const useBtn = document.createElement("button"); useBtn.textContent="Use"; useBtn.onclick = ()=>useItem(it);
    wrap.appendChild(label); wrap.appendChild(equipBtn); wrap.appendChild(useBtn);
    el("log").appendChild(wrap);
  });
}
function equip(it){
  if(it.code==="armor2"){ STATE.equipped.armor = {name:"Leather", bonus:2}; STATE.hpmax+=2; STATE.hp+=2; }
  if(it.code==="trink_shadow"){ STATE.equipped.charm = {name:"Shadow Trinket"}; }
  if(it.code==="trink_light"){ STATE.equipped.charm = {name:"Radiant Charm"}; }
  if(it.code==="spikes"){ STATE.equipped.consum = {name:"Throwing Spikes", code:"spikes"}; }
  log(`Equipped <strong>${it.name}</strong>.`); refreshSheet();
}
function useItem(it){
  if(it.code==="salve"){ STATE.hp = Math.min(STATE.hpmax, STATE.hp+8); log("You apply <strong>Herbal Salve</strong> (+8 HP)."); }
  if(it.code==="kit_hp"){ STATE.hpmax+=2; STATE.hp+=2; log("Armor kit applied: <strong>+2 Max HP</strong>."); }
  if(it.code==="toxin"){ tempBuff.poison = 3; log("Next hits apply <strong>poison</strong> for 3 turns."); }
  if(it.code==="spikes"){ tempBuff.attack+=2; STATE.equipped.consum=null; log("Throwing spikes readied: <strong>+2 attack</strong> once."); }
  refreshSheet();
}

// ---------- Skills ----------
function switchTree(which){
  ["balance","light","shadow"].forEach(k=>document.getElementById("tab-"+k).classList.remove("active"));
  document.getElementById("tab-"+which).classList.add("active");
  renderTree(which);
}
function renderTree(which="balance"){
  const T = document.getElementById("tree"); T.innerHTML="";
  const Node = (title,desc,key,branch)=>{
    const owned = !!STATE.skills[branch][key];
    const d = document.createElement("div");
    d.className="stat";
    d.innerHTML = `<span><strong>${title}</strong><br><span class="muted">${desc}</span></span><span>${owned?"✅":"<button onclick=\"learnSkill('"+branch+"','"+key+"')\">Learn</button>"}</span>`;
    return d;
  };
  const nodes = {
    balance:[
      Node("Equilibrium Wave","Judgment hits all foes","equilibrium","balance"),
      Node("Rally","+4 HP self; ally buff","rally","balance"),
      Node("Crown Shatter","Tear wards/relics (1/battle)","crownShatter","balance")
    ],
    light:[ Node("Purify","-0.06 corruption; radiant bonus","purify","light"), Node("Ward","Reduce next damage","ward","light") ],
    shadow:[ Node("Drain","Life steal on hit","drain","shadow"), Node("Veil","Evade next attack","veil","shadow") ]
  }[which];
  nodes.forEach(n=>T.appendChild(n));
}
function learnSkill(branch,key){
  if(STATE.xp<20){ log("<span class='muted'>Earn 20 XP to learn a skill.</span>"); return; }
  STATE.xp -= 20; STATE.skills[branch][key] = true;
  log(`<strong>Skill learned:</strong> ${branch} / ${key}`); refreshSheet();
}

// ---------- Character Select ----------
function openCharacter(){
  log("<strong>New Game:</strong> Choose a character:");
  const opts = [
    {name:"Shadowborn", clazz:"Balance-Bearer", stats:{str:2,dex:4,con:3,int:2,wis:1,cha:3}, start:{weapon:{name:"Balanceblade",bonus:9,type:"balance"}}},
    {name:"Kaelen", clazz:"Knight", stats:{str:4,dex:2,con:4,int:1,wis:1,cha:2}, start:{weapon:{name:"Bastion Blade",bonus:6,type:"light"}, armor:{name:"Mail",bonus:2}}},
    {name:"Kairen", clazz:"Striker", stats:{str:2,dex:5,con:2,int:2,wis:1,cha:2}, start:{weapon:{name:"Twin Knives",bonus:7,type:"shadow"}}}
  ];
  opts.forEach(o=>{
    const b=document.createElement("button");
    b.textContent=`${o.name} — ${o.clazz}`;
    b.onclick=()=>startNew(o);
    el("log").appendChild(b);
  });
}
function startNew(o){
  Object.assign(STATE, {
    name:o.name, clazz:o.clazz, level:1, xp:0, hp:22, hpmax:22, gold:60,
    str:o.stats.str, dex:o.stats.dex, con:o.stats.con, int:o.stats.int, wis:o.stats.wis, cha:o.stats.cha,
    corruption:0.8, location:"Ashenford", inBattle:false, judgmentReady:true,
    equipped:{ weapon:o.start.weapon || null, armor:o.start.armor || {name:"Leather",bonus:1}, charm:null, consum:null },
    inventory:[], quests:{active:[], done:[]},
    skills:{balance:{equilibrium:false,rally:false,crownShatter:false}, light:{purify:false,ward:false}, shadow:{drain:false,veil:false}}
  });
  log(`<strong>New journey:</strong> ${o.name}, the ${o.clazz}.`); refreshSheet();
}
