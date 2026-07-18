import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dataset = join(root, 'data_points/acquisition_screening_test_companies.json');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const number = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const within = (v, min, max) => Math.max(min, Math.min(max, v));

function assess(company, brief = {}) {
  const budget = number(brief.cash_budget_eur, 120000), reserve = number(brief.reserve_eur, budget * .2);
  const priceLimit = Math.max(0, budget - reserve); let score = 50; const reasons = [];
  if (company.asking_price_eur <= priceLimit) { score += 18; reasons.push('fits the acquisition budget after reserve'); } else { score -= 20; reasons.push('would require financing or a lower price'); }
  if (company.revenue_eur >= number(brief.min_revenue_eur, 100000)) { score += 8; reasons.push('meets revenue floor'); }
  if (company.ebitda_margin_pct >= number(brief.min_ebitda_margin_pct, 15)) { score += 12; reasons.push('meets profitability threshold'); }
  if (company.recurring_revenue_pct >= number(brief.min_recurring_revenue_pct, 40)) { score += 9; reasons.push('has meaningful recurring revenue'); }
  if (company.top_customer_revenue_pct <= number(brief.max_customer_concentration_pct, 25)) { score += 7; reasons.push('customer concentration is within threshold'); }
  if (company.owner_dependence_score <= number(brief.max_owner_dependence, 6)) { score += 6; reasons.push('owner dependence is manageable'); }
  if (!brief.sectors?.length || brief.sectors.includes(company.sector)) score += 7; else score -= 12;
  return { ...company, shortlist_score: within(score, 0, 100), fit_reasons: reasons, financing_gap_eur: Math.max(0, company.asking_price_eur - priceLimit) };
}
async function shortlist(brief) { const { companies } = JSON.parse(await readFile(dataset, 'utf8')); return companies.map(c => assess(c, brief)).sort((a, b) => b.shortlist_score - a.shortlist_score).slice(0, number(brief.limit, 12)); }
async function publicSearch(query, department) {
  const url = new URL('https://recherche-entreprises.api.gouv.fr/search');
  url.searchParams.set('q', query); url.searchParams.set('per_page', '10'); if (department) url.searchParams.set('departement', department);
  const response = await fetch(url, { headers: { 'user-agent': 'DealScout-Hackathon-Demo/0.1' } });
  if (!response.ok) throw new Error(`Official registry returned ${response.status}`);
  const body = await response.json();
  return (body.results || []).filter(item => !department || item.siege?.departement === department).map(item => ({ company_id:`sirene-${item.siren}`,legal_name:item.nom_complet||item.nom_raison_sociale||item.siren,siren:item.siren,legal_form:item.nature_juridique,sector:item.siege?.activite_principale||'Not supplied',city:item.siege?.libelle_commune||item.siege?.commune||'Not supplied',department:item.siege?.departement||department||'Not supplied',incorporation_date:item.date_creation,employee_band:item.tranche_effectif_salarie||item.siege?.tranche_effectif_salarie||'Not supplied',data_type:'official_public_registry_result',sale_status:'unknown_not_a_listing',source:'API Recherche d’Entreprises (French public administration)',source_url:`https://annuaire-entreprises.data.gouv.fr/entreprise/${item.siren}` }));
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/api/public-search')) {
    try { const url=new URL(req.url,'http://localhost'),query=url.searchParams.get('q')?.trim(); if(!query||query.length<2)throw new Error('Enter at least two characters to search.'); const companies=await publicSearch(query,url.searchParams.get('department')); res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({source:'official_public_registry',disclaimer:'Registry data is not a sale listing and does not provide financial statements.',companies})); }
    catch(error){res.writeHead(400,{'content-type':'application/json'}).end(JSON.stringify({error:error.message}));} return;
  }
  if (req.method === 'POST' && req.url === '/run') {
    let body = ''; for await (const part of req) body += part;
    try { const brief = JSON.parse(body || '{}'), companies = await shortlist(brief); res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ source: 'synthetic_test_fixture', disclaimer: 'Demo output only; neither sale status nor financials have been verified.', buyer_brief: brief, companies })); }
    catch { res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Expected a JSON buyer brief.' })); } return;
  }
  const requested = req.url === '/' ? '/public/index.html' : req.url;
  const clean = normalize(requested).replace(/^\.{2}(?:\/|\\|$)/, '');
  const file = join(root, clean.startsWith('/data_points/') ? clean.slice(1) : clean.startsWith('/public/') ? clean.slice(1) : `public${clean}`);
  try { const content = await readFile(file); res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }); res.end(content); } catch { res.writeHead(404).end('Not found'); }
});
const port = process.env.DEALSCOUT_PORT || 3000;
server.listen(port, () => console.log(`DealScout running at http://localhost:${port}`));
