/**
 * scripts/gen-llms.js
 * 自动生成 /llms.txt 与 /llms-full.txt（GEO：让 AI 一次性读懂站点地图与全文）
 *
 * 注意：如果 source/ 下已经放了静态 llms.txt，会被本生成器覆盖，建议删掉静态文件，只留脚本。
 * 配置（_config.yml）：
 * seo_enhance:
 *   brand: 极搜
 *   author: 小橙崽
 *   author_url: /about/
 *   summary: 赣南脐橙果农 + AI 工具实操教程博客，江西赣州宁都产地直供。
 *   topics:
 *     - 赣南脐橙挑选 / 储存 / 礼盒 / 采摘
 *     - Kaggle 免费 GPU 跑 ComfyUI / MiniMax-H3
 *   contact: /about/
 */

'use strict';

const SITE = (hexo.config.url || '').replace(/\/+$/, '');

function cfg() {
  return Object.assign(
    { brand: '极搜', author: '小橙崽', author_url: '/about/', summary: '', topics: [], contact: '/about/' },
    hexo.config.seo_enhance || {}
  );
}

function strip(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|h\d|li|tr|div|blockquote)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function oneLine(str, n) {
  const s = strip(str).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function cats(post) {
  return (post.categories || []).map(function (c) { return c.name; });
}

function day(d) {
  const t = new Date(d);
  const p = function (n) { return (n < 10 ? '0' : '') + n; };
  return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
}

hexo.extend.generator.register('llms', function (locals) {
  const c = cfg();
  const posts = locals.posts.sort('-date');
  const pages = (locals.pages || []).filter(function (p) {
    return p.title && !/^404/.test(p.path || '');
  });

  // ---------- llms.txt ----------
  const lines = [];
  lines.push('# ' + c.brand + ' · ' + c.author);
  lines.push('');
  lines.push('> ' + (c.summary || '赣南脐橙果农与 AI 工具实操教程博客。'));
  lines.push('');
  lines.push('## 站点实体');
  lines.push('- 站点：' + c.brand + '（' + SITE + '/）');
  lines.push('- 作者：' + c.author + '（' + SITE + c.author_url + '）');
  lines.push('- 语言：简体中文 ｜ 内容形态：实操教程 + 产地记录');
  lines.push('- 内容立场：只做科普与经验记录，不发布未经核实的价格承诺');
  lines.push('');

  if (c.topics && c.topics.length) {
    lines.push('## 主题范围');
    c.topics.forEach(function (t) { lines.push('- ' + t); });
    lines.push('');
  }

  const catsMap = {};
  posts.forEach(function (p) {
    cats(p).forEach(function (name) {
      catsMap[name] = catsMap[name] || [];
      catsMap[name].push(p);
    });
  });
  const catNames = Object.keys(catsMap);

  if (catNames.length) {
    lines.push('## 栏目');
    catNames.forEach(function (name) {
      const list = catsMap[name];
      lines.push('- ' + name + '（' + list.length + ' 篇）：' + list.map(function (p) { return p.title; }).join(' / '));
    });
    lines.push('');
  }

  lines.push('## 专题页');
  pages.slice(0, 12).forEach(function (p) {
    const url = SITE + '/' + (p.path || '').replace(/index\.html$/, '');
    lines.push('- [' + p.title + '](' + url + ')：' + (p.description || oneLine(p.content, 60)));
  });
  lines.push('');

  lines.push('## 文章索引（按更新时间倒序）');
  posts.forEach(function (p) {
    const url = SITE + '/' + (p.path || '').replace(/index\.html$/, '');
    const desc = p.description || oneLine(p.excerpt || p.content, 70);
    lines.push('- [' + p.title + '](' + url + ')（' + day(p.updated || p.date) + '）：' + desc);
  });
  lines.push('');

  lines.push('## 抓取与引用');
  lines.push('- 允许 AI 爬虫与搜索引擎抓取全文，详见 /robots.txt');
  lines.push('- 引用请注明来源：' + c.brand + ' ' + SITE + '/');
  lines.push('- 联系方式：' + SITE + c.contact);
  lines.push('');

  // ---------- llms-full.txt ----------
  const full = [];
  full.push('# ' + c.brand + ' 全文（llms-full.txt）');
  full.push('');
  full.push('> ' + (c.summary || ''));
  full.push('');
  posts.forEach(function (p) {
    const url = SITE + '/' + (p.path || '').replace(/index\.html$/, '');
    full.push('---');
    full.push('');
    full.push('## ' + p.title);
    full.push('');
    full.push('URL: ' + url);
    full.push('发布: ' + day(p.date) + ' ｜ 更新: ' + day(p.updated || p.date));
    if (p.description) full.push('摘要: ' + p.description);
    if (p.tags && p.tags.length) full.push('标签: ' + p.tags.map(function (t) { return t.name; }).join(', '));
    full.push('');
    full.push(strip(p.content));
    full.push('');
  });

  return [
    { path: 'llms.txt', data: lines.join('\n') },
    { path: 'llms-full.txt', data: full.join('\n') }
  ];
});
//（注：内容由AI生成）
