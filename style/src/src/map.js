// ---------- Locations ----------
const LOCS = [
  {key:"Ashenford", x:2, y:4, desc:"Your stronghold; militia and smiths.", vendor:true, fights:["Cultists","Thieves"]},
  {key:"Dreadspire Keep", x:6, y:3, desc:"Baron's fortress, war council.", vendor:false, fights:["Cultist Patrol"]},
  {key:"Bleakwood Edge", x:3, y:2, desc:"Twisted trees; fragments deeper in.", vendor:false, fights:["Cultists","Crownspawn"]},
  {key:"Gravefen Marsh", x:6, y:1, desc:"Witch-haunted swamps, now broken.", vendor:true, fights:["Swampspawn","Cultists"]},
  {key:"Veyra’s Crossroads", x:9, y:4, desc:"Relic market; danger in alleys.", vendor:true, fights:["Thieves","Cultists"]},
  {key:"Ashspire Peaks", x:6, y:7, desc:"Ruins of the Mirror; zealots.", vendor:false, fights:["Fanatics","Crownspawn"]},
];

// ---------- Map ----------
function drawMap(){
  const m = el("map"); m.innerHTML="";
  for(let r=0;r<8;r++){
    for(let c=0;c<12;c++){
      const cell = document.createElement("div");
      cell.className="cell"; cell.textContent="";
      m.appendChild(cell);
    }
  }
  LOCS.forEach(l=>{
    const idx = (7-l.y)*12 + l.x;
    const cell = m.children[idx];
    cell.textContent = "●";
    cell.style.color = "#d0aa5b";
    cell.title = l.key + " — " + l.desc;
    cell.onclick = ()=>travel(l.key);
  });
}

function travel(dest){
  const prev = STATE.location;
  STATE.location = dest;
  log(`<strong>Travel:</strong> From <em>${prev}</em> to <em>${dest}</em>. <span class="muted">${LOCS.find(x=>x.key===dest).desc}</span>`);
  setBadge();
  if(RNG()<0.35){
    const ev = travelEvent(dest);
    log(`<em>Event:</em> ${ev}`);
  }
}

function travelEvent(dest){
  const events = [
    "Escort caravan: <strong>+10g</strong>.",
    "Old veteran shares tactics: <strong>+5 XP</strong>.",
    "Blade whispers from within: <strong>+0.05 Corruption</strong>.",
    "Villagers share bread: <strong>+4 HP</strong>.",
    "Quiet road. Nothing happens."
  ];
  const pick = events[Math.floor(Math.random()*events.length)];
  if(pick.includes("+10g")) STATE.gold += 10;
  if(pick.includes("+5 XP")) STATE.xp += 5;
  if(pick.includes("Corruption")) STATE.corruption = clamp(+(STATE.corruption+0.05).toFixed(2),0,3);
  if(pick.includes("+4 HP")) STATE.hp = Math.min(STATE.hpmax, STATE.hp+4);
  refreshSheet();
  return pick;
}
