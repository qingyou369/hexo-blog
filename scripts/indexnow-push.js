#!/usr/bin/env node
/**
 * indexnow-push.js —— 把线上 sitemap 里的全部 URL 一次性推给 Bing / Yandex
 *
 * 用法：
 *   node scripts/indexnow-push.js --dry     # 只看会推哪些，不真发
 *   node scripts/indexnow-push.js           # 真推
 *
 * 前提：https://jisou.dpdns.org/jisou2026c6d8e9f0.txt 必须能访问到，
 *       内容就是这个 key 本身（一行）。
 * 部署后再跑，别在构建阶段跑 —— 那时页面还没上线。
 */

const HOST = 'jisou.dpdns.org';
const KEY = 'jisou2026c6d8e9f0';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const DRY = process.argv.includes('--dry');

async function main() {
  // 1. 拿 sitemap
  const res = await fetch(SITEMAP, { headers: { 'cache-control': 'no-cache' } });
  if (!res.ok) throw new Error(`sitemap 拉取失败: HTTP ${res.status}`);
  const xml = await res.text();

  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith(`https://${HOST}/`));

  console.log(`sitemap 里共 ${urls.length} 条 URL`);
  if (!urls.length) throw new Error('没解析到 URL，检查 sitemap 格式');

  // 2. 校验 key 文件是否已上线（没上线就直接推会被 403）
  const keyRes = await fetch(KEY_LOCATION, { headers: { 'cache-control': 'no-cache' } });
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : '';
  console.log(`key 文件: HTTP ${keyRes.status}，内容匹配: ${keyBody === KEY}`);
  if (!keyRes.ok || keyBody !== KEY) {
    throw new Error(`key 文件没上线或内容不对：${KEY_LOCATION}\n先把 key 文件推到站点根再跑本脚本。`);
  }

  if (DRY) {
    console.log('\n--dry 模式，仅预览前 10 条：');
    urls.slice(0, 10).forEach((u) => console.log('  ' + u));
    console.log(`... 共 ${urls.length} 条，未发送`);
    return;
  }

  // 3. 推
  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };
  const push = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  const text = await push.text().catch(() => '');
  console.log(`\nIndexNow 响应: HTTP ${push.status} ${push.statusText} ${text ? '| ' + text.slice(0, 200) : ''}`);
  if ([200, 202].includes(push.status)) {
    console.log(`✅ 已提交 ${urls.length} 条，Bing 通常 1–3 天抓取`);
  } else {
    console.log('❌ 未成功，常见原因：403 = key 文件访问不到或内容不符；422 = URL 不属于该 host');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exitCode = 1;
});
