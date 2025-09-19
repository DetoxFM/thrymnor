// ---------- Utilities ----------
const RNG = () => Math.random();
const d20 = () => Math.floor(RNG()*20)+1;
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

function el(id){ return document.getElementById(id); }
function log(msg){
  const d=document.createElement("div");
  d.className="logline";
  d.innerHTML=msg;
  el("log").appendChild(d);
  el("log").scrollTop=el("log").scrollHeight;
}
function setBadge(){ el("locBadge").textContent = "Location: " + STATE.location; }

// ---------- Base State ----------
const STATE = {
  name:"Shadowborn",
  clazz:"Balance-Bearer",
  level:3, xp:0,
  hp:28, hpmax:28,
  str:2, dex:4, con:3, int:2, wis:1, cha:3,
  gold:200,
  corruption:1.30,
  location:"Ashenford",
  inBattle:false, judgmentReady:true,
  equipped:{ weapon:{name:"Balanceblade", bonus:9, type:"balance"},
             armor:{name:"Leather", bonus:1},
             charm:{name:"Inquisitor's Sigil"},
             consum:null },
  inventory:[],
  quests:{
    active:[
      {id:"gravefen_aid", name:"Secure Gravefen", where:"Gravefen Marsh", desc:"Win marshfolk trust; break lingering curses.", reward:{gold:60,xp:40}},
    ],
    done:[
      {id:"witches", name:"Break the Wyrd Sisters", where:"Gravefen Marsh", desc:"Their circle is ash.", reward:{gold:50,xp:60}}
    ]
  },
  skills:{
    balance:{ equilibrium:true, rally:false, crownShatter:false },
    light:{ purify:false, ward:false },
    shadow:{ drain:false, veil:false }
  }
};

// ---------- UI Refresh ----------
function refreshSheet(){
  el("name").textContent = STATE.name;
  el("clazz").textContent = STATE.clazz;
  el("level").textContent = STATE.level;
  el("hp").textContent = STATE.hp;
  el("hpmax").textContent = STATE.hpmax;
  el("gold").textContent = STATE.gold;
  el("str").textContent = STATE.str;
  el("dex").textContent = STATE.dex;
  el("con").textContent = STATE.con;
  el("int").textContent = STATE.int;
  el("wis").textContent = STATE.wis;
  el("cha").textContent = STATE.cha;
  el("xp").textContent = STATE.xp;
  el("cor").textContent = STATE.corruption.toFixed(2) + " / 3";

  el("slot-weapon").textContent = (STATE.equipped.weapon?.name || "None") + (STATE.equipped.weapon?.bonus? " +" + STATE.equipped.weapon.bonus : "");
  el("slot-armor").textContent = (STATE.equipped.armor?.name || "None") + (STATE.equipped.armor?.bonus? " +" + STATE.equipped.armor.bonus : "");
  el("slot-charm").textContent = (STATE.equipped.charm?.name || "None");
  el("slot-consum").textContent = (STATE.equipped.consum?.name || "None");

  setBadge();
  renderQuests();
  renderTree();
}

// ---------- Save / Load ----------
function saveGame(){ localStorage.setItem("thry_save", JSON.stringify(STATE)); log("<span class='muted'>Game saved.</span>"); }
function loadGame(){ const raw=localStorage.getItem("thry_save"); if(!raw){ log("<span class='muted'>No save found.</span>"); return; } Object.assign(STATE, JSON.parse(raw)); refreshSheet(); log("<span class='muted'>Game loaded.</span>"); }
function resetGame(){ if(!confirm("Reset prototype?")) return; localStorage.removeItem("thry_save"); location.reload(); }
