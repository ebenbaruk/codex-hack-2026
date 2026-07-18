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

createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/run') {
    let body = ''; for await (const part of req) body += part;
    try { const brief = JSON.parse(body || '{}'), companies = await shortlist(brief); res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ source: 'synthetic_test_fixture', disclaimer: 'Demo output only; neither sale status nor financials have been verified.', buyer_brief: brief, companies })); }
    catch { res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'Expected a JSON buyer brief.' })); } return;
  }
  const requested = req.url === '/' ? '/public/index.html' : req.url;
  const clean = normalize(requested).replace(/^\.{2}(?:\/|\\|$)/, '');
  const file = join(root, clean.startsWith('/data_points/') ? clean.slice(1) : clean.startsWith('/public/') ? clean.slice(1) : `public${clean}`);
  try { const content = await readFile(file); res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }); res.end(content); } catch { res.writeHead(404).end('Not found'); }
}).listen(process.env.PORT || 3000, () => console.log(`DealScout running at http://localhost:${process.env.PORT || 3000}`));
