import admin from 'firebase-admin';
import * as cheerio from 'cheerio';

const SOURCE = 'podkarpacielive';
const BASE = 'https://www.podkarpacielive.pl';
const RESULTS_URL = `${BASE}/wyniki`;
const LIVE_URL = `${BASE}/wyniki-na-zywo`;
const TZ = 'Europe/Warsaw';

const LEAGUES = {
  iv_liga: 'IV liga podkarpacka',
  okr_jaroslaw: 'Klasa Okręgowa Jarosław',
  okr_krosno: 'Klasa Okręgowa Krosno',
  okr_rzeszow: 'Klasa Okręgowa Rzeszów',
  okr_debica: 'Klasa Okręgowa Dębica',
  okr_stalowa: 'Klasa Okręgowa Stalowa Wola',
  a_przeworsk: 'A Klasa Przeworsk',
  a_jaroslaw: 'A Klasa Jarosław',
  a_rzeszow: 'A Klasa Rzeszów',
  a_debica: 'A Klasa Dębica',
  a_krosno_1: 'A Klasa Krosno I',
  a_krosno_2: 'A Klasa Krosno II',
  a_krosno_3: 'A Klasa Krosno III',
  a_lancut: 'A Klasa Łańcut',
  a_mielec: 'A Klasa Mielec',
  a_stalowa_1: 'A Klasa Stalowa Wola I',
  a_stalowa_2: 'A Klasa Stalowa Wola II',
  b_przeworsk: 'B Klasa Przeworsk',
  b_jaroslaw: 'B Klasa Jarosław',
  b_rzeszow: 'B Klasa Rzeszów',
  b_debica_1: 'B Klasa Dębica I',
  b_debica_2: 'B Klasa Dębica II',
  b_krosno_1: 'B Klasa Krosno I',
  b_krosno_2: 'B Klasa Krosno II',
  b_krosno_3: 'B Klasa Krosno III',
  b_krosno_4: 'B Klasa Krosno IV',
  b_krosno_5: 'B Klasa Krosno V',
  b_lancut_1: 'B Klasa Łańcut I',
  b_lancut_2: 'B Klasa Łańcut II',
  b_mielec_1: 'B Klasa Mielec I',
  b_mielec_2: 'B Klasa Mielec II',
  b_kolbuszowa: 'B Klasa Kolbuszowa',
  b_stalowa_1: 'B Klasa Stalowa Wola I',
  b_stalowa_2: 'B Klasa Stalowa Wola II',
  b_stalowa_3: 'B Klasa Stalowa Wola III'
};

const DB2_LEAGUES = new Set([
  'a_przeworsk','a_jaroslaw','a_rzeszow',
  'b_przeworsk','b_jaroslaw','b_rzeszow','b_debica_1','b_debica_2',
  'b_krosno_1','b_krosno_2','b_krosno_3','b_krosno_4','b_krosno_5',
  'b_lancut_1','b_lancut_2','b_mielec_1','b_mielec_2','b_kolbuszowa',
  'b_stalowa_1','b_stalowa_2','b_stalowa_3'
]);

function normalize(s='') {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/\bks\b|\blks\b|\bmks\b|\bglks\b/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim().replace(/\s+/g,' ');
}

function slugText(s='') { return normalize(s).replace(/\s+/g,'-'); }

function parseDateTime(date, time='12:00') {
  const m = String(date||'').match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [_, y, mo, d] = m;
  const [hh, mm] = String(time||'12:00').match(/\d+/g)?.map(Number) || [12,0];
  return new Date(`${y}-${mo}-${d}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00+02:00`);
}

function parseMatchPage(text, url) {
  const clean = text.replace(/\s+/g,' ').trim();
  const head = clean.match(/(\d+)\.\s*kolejka\s*-\s*(.+?)\s+(\d{4}-\d{2}-\d{2}),\s*god\.\s*(\d{1,2}:\d{2})/i);
  if (!head) return null;
  const leagueName = head[2].trim();
  const date = head[3];
  const time = head[4];
  const after = clean.slice(clean.indexOf(head[0]) + head[0].length);
  const score = after.match(/([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 .&'’()\-]+?)\s+(\d+)\s*-\s*(\d+)\s+([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 .&'’()\-]+?)\s+(?:Relacja|Transmisja|Info|Bezpośrednie|Tabela|Ostatnie)/i);
  let homeTeam = null, awayTeam = null, scoreHome = null, scoreAway = null;
  if (score) {
    homeTeam = score[1].trim(); scoreHome = Number(score[2]); scoreAway = Number(score[3]); awayTeam = score[4].trim();
  }
  const title = clean.match(/Centrum meczowe\s+(?:\d+\.\s*kolejka[^]*?)?([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 .&'’()\-]+?)\s+-\s+([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 .&'’()\-]+?)\s+(?:\d+\s*-\s*\d+|\?|\?\s+\?)/i);
  if (!homeTeam || !awayTeam) {
    const m = url.match(/\/mecz\/\d+,([^?/#]+)/);
    if (m) {
      const parts = m[1].split('-vs-');
      if (parts.length===2) {
        homeTeam = parts[0].replace(/-/g,' ').trim();
        awayTeam = parts[1].replace(/-/g,' ').trim();
      }
    }
  }
  return { round:Number(head[1]), sourceLeague:leagueName, date, time, homeTeam, awayTeam, scoreHome, scoreAway, url };
}

async function fetchText(url) {
  const res = await fetch(url, {headers:{'user-agent':'StrefaGola-PodkarpacieLIVE-Sync/1.0'}});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ${url}`);
  return await res.text();
}

function extractMatchUrls(html) {
  const $ = cheerio.load(html);
  const out = new Set();
  $('a[href*="/mecz/"]').each((_,a)=>{
    const href = $(a).attr('href');
    if (href) out.add(new URL(href, BASE).href);
  });
  return [...out];
}

function detectLeagueKey(sourceLeague, home, away) {
  const n = normalize(sourceLeague);
  let best = null;
  for (const [key,label] of Object.entries(LEAGUES)) {
    const x = normalize(label);
    if (n===x || n.includes(x) || x.includes(n)) return key;
    if (!best && (n.includes(normalize(label.replace('Klasa ',''))) || normalize(label).includes(n))) best=key;
  }
  // A/B groups sometimes have extra punctuation or "gr." in source labels.
  if (best) return best;
  const h = normalize(home), a = normalize(away);
  if (!h || !a) return null;
  return null;
}

function toFirestoreDate(d) { return admin.firestore.Timestamp.fromDate(d); }
function weekKey(date=new Date()) {
  const x = new Date(date); x.setHours(0,0,0,0);
  const day = x.getDay() || 7; x.setDate(x.getDate() + 4 - day);
  const yearStart = new Date(x.getFullYear(),0,1);
  return `${x.getFullYear()}-W${String(Math.ceil((((x-yearStart)/86400000)+1)/7)).padStart(2,'0')}`;
}

function sameMatch(a,b) {
  const teams = normalize(a.homeTeam)===normalize(b.homeTeam) && normalize(a.awayTeam)===normalize(b.awayTeam);
  if (!teams) return false;
  const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
  const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
  return Math.abs(da-db) <= 36*60*60*1000;
}

function appDbFor(league, primary, secondary) { return DB2_LEAGUES.has(league) && secondary ? secondary : primary; }

function initApps() {
  const primaryJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!primaryJson) throw new Error('Brak FIREBASE_SERVICE_ACCOUNT_JSON');
  const p = JSON.parse(primaryJson);
  const primary = admin.initializeApp({credential:admin.credential.cert(p), projectId:p.project_id});
  let secondary = null;
  if (process.env.FIREBASE_DB2_SERVICE_ACCOUNT_JSON) {
    const p2 = JSON.parse(process.env.FIREBASE_DB2_SERVICE_ACCOUNT_JSON);
    secondary = admin.initializeApp({credential:admin.credential.cert(p2), projectId:p2.project_id}, 'db2');
  }
  return {primary:primary.firestore(), secondary:secondary?.firestore()||null};
}

async function listMatches(db) {
  const snap = await db.collection('matches').limit(5000).get();
  return snap.docs.map(d=>({id:d.id, ref:d.ref, ...d.data()}));
}

async function updateResults(db, label) {
  const all = await listMatches(db);
  const candidates = all.filter(m=>m.source===SOURCE && !m.manualOverride && m.sourceUrl);
  let updated=0;
  for (const m of candidates) {
    try {
      const html = await fetchText(m.sourceUrl);
      const parsed = parseMatchPage(cheerio.load(html).text(), m.sourceUrl);
      if (!parsed || parsed.scoreHome===null || parsed.scoreAway===null) continue;
      if (m.scoreHome===parsed.scoreHome && m.scoreAway===parsed.scoreAway && m.status==='finished') continue;
      await m.ref.set({scoreHome:parsed.scoreHome,scoreAway:parsed.scoreAway,status:'finished',sourceLastCheckedAt:admin.firestore.FieldValue.serverTimestamp(),sourceUpdatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
      updated++;
    } catch(e) { console.warn(`[${label}] wynik ${m.id}: ${e.message}`); }
  }
  return updated;
}

async function importNextRound(db, db2) {
  const controlRef = db.collection('system').doc('podkarpacieliveSync');
  const key = weekKey();
  const lock = await db.runTransaction(async tx=>{
    const doc=await tx.get(controlRef); const d=doc.exists?doc.data():{};
    if (d.lastWeeklyImportKey===key) return false;
    tx.set(controlRef,{lastWeeklyImportKey:key,weeklyImportStartedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    return true;
  });
  if (!lock) return {skipped:true, imported:0};

  const html = await fetchText(RESULTS_URL);
  const urls = extractMatchUrls(html);
  const parsed=[];
  for (const url of urls.slice(0,500)) {
    try {
      const page=await fetchText(url);
      const item=parseMatchPage(cheerio.load(page).text(),url);
      if (!item?.homeTeam || !item?.awayTeam) continue;
      const league=detectLeagueKey(item.sourceLeague,item.homeTeam,item.awayTeam);
      if (!league) continue;
      const dt=parseDateTime(item.date,item.time);
      if (!dt || dt.getTime() < Date.now()-2*60*60*1000) continue;
      parsed.push({...item,league,dt});
    } catch(e) { console.warn(`parse ${url}: ${e.message}`); }
  }
  const byLeague=new Map();
  for(const m of parsed) { if(!byLeague.has(m.league)) byLeague.set(m.league,[]); byLeague.get(m.league).push(m); }
  let imported=0;
  for(const [league,items] of byLeague) {
    items.sort((a,b)=>a.dt-b.dt);
    const first=items[0];
    // Import only the nearest round: all matches carrying the same round number.
    const roundItems=items.filter(x=>x.round===first.round);
    if(!roundItems.length) continue;
    const targetDb=appDbFor(league,db,db2);
    if(!targetDb) continue;
    const existing=await listMatches(targetDb);
    for(const x of roundItems) {
      const found=existing.find(e=>e.league===league && sameMatch(e,{homeTeam:x.homeTeam,awayTeam:x.awayTeam,date:toFirestoreDate(x.dt)}));
      if(found) {
        // Never replace an existing manual result or manual edit.
        if(found.manualOverride) continue;
        await found.ref.set({source:SOURCE,sourceUrl:x.url,sourceRound:x.round,sourceLastSeenAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
        continue;
      }
      await targetDb.collection('matches').add({
        homeTeam:x.homeTeam, awayTeam:x.awayTeam, league,
        scoreHome:x.scoreHome ?? null, scoreAway:x.scoreAway ?? null,
        status:(x.scoreHome!==null && x.scoreAway!==null)?'finished':'upcoming',
        date:toFirestoreDate(x.dt), source:SOURCE, sourceUrl:x.url, sourceRound:x.round,
        manualOverride:false, importedAt:admin.firestore.FieldValue.serverTimestamp(),
        sourceLastSeenAt:admin.firestore.FieldValue.serverTimestamp()
      });
      imported++;
    }
  }
  await controlRef.set({weeklyImportFinishedAt:admin.firestore.FieldValue.serverTimestamp(),weeklyImportedCount:imported},{merge:true});
  return {skipped:false,imported};
}

async function main() {
  const {primary,secondary}=initApps();
  const resultPrimary=await updateResults(primary,'db1');
  const resultSecondary=secondary?await updateResults(secondary,'db2'):0;
  const weekly=await importNextRound(primary,secondary);
  console.log(JSON.stringify({ok:true,resultPrimary,resultSecondary,weekly},null,2));
}

main().catch(e=>{console.error(e);process.exit(1);});
