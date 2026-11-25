/**
 * z-page-enhance.js —— 站点页级优化（构建时执行，不影响正文）
 *
 * 解决三件事：
 *   1. 栏目/标签/分类/归档/静态页的 description 全是同一句，改为按页生成
 *   2. 标签/分类/归档页缺少 h1（主题用 div.article-sort-title 承载），改为 h1
 *   3. 重点页补结构化数据：CollectionPage / BreadcrumbList / AboutPage + Person
 *
 * 设计原则：
 *   - 只处理非文章页（page.__post / layout==='post' 直接跳过）
 *   - 文件名以 z 开头，确保在 seo-enhance.js 之后执行（seo-enhance 会清空所有已有 JSON-LD）
 *   - 幂等：重复渲染不会插入重复条目；已存在的 h1 不再改造
 */

const DEFAULT_DESC_HINT = '赣南脐橙果农与'; // 站点默认描述的开头，用来识别“重复描述”

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clamp(s, max) {
  if (!s || s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function absUrl(site, p) {
  if (!p) return site + '/';
  if (/^http/i.test(p)) return p;
  return site + '/' + String(p).replace(/^\//, '');
}

function firstMeta(str, name) {
  const re = new RegExp('<meta\\s+name=["\']' + name + '["\']\\s+content=["\']([^"\']*)["\']', 'i');
  const m = str.match(re);
  return m ? m[1] : '';
}

function setDescription(str, desc) {
  const re = /(<meta\s+name=["']description["']\s+content=["'])([^"']*)(["'])/i;
  if (re.test(str)) return str.replace(re, '$1' + esc(desc) + '$3');
  return str.replace(/<\/head>/i, '<meta name="description" content="' + esc(desc) + '">\n</head>');
}

function titlesOf(page, n) {
  const posts = page.posts;
  if (!posts) return '';
  let arr = [];
  try {
    arr = posts.toArray ? posts.toArray() : Array.prototype.slice.call(posts);
  } catch (e) { arr = []; }
  return arr.slice(0, n).map(function (p) { return p.title; }).filter(Boolean).join(' / ');
}

function countOf(page) {
  const posts = page.posts;
  if (!posts) return 0;
  try { return posts.length || (posts.toArray ? posts.toArray().length : 0); } catch (e) { return 0; }
}

// 按路径生成 description
function buildDesc(page, path, siteTitle) {
  const tag = page.tag && (page.tag.name || page.tag);
  const cat = page.category && (page.category.name || page.category);
  const n = countOf(page);
  const t3 = titlesOf(page, 3);
  const t1 = titlesOf(page, 1);

  if (path === 'archives/' || path === 'archives/index.html') {
    return clamp(siteTitle + '全部文章按时间归档' + (n ? '，共 ' + n + ' 篇' : '') +
      '：赣南脐橙产地实录、挑选与储存技巧，以及可复现的 AI 工具实操教程。', 72);
  }
  if (tag) {
    return clamp('「' + tag + '」标签下的文章合集' + (n ? '（共 ' + n + ' 篇）' : '') + '：' +
      (t1 ? t1 + '等，' : '') + '附产地记录与实操步骤。', 72);
  }
  if (cat) {
    return clamp('「' + cat + '」分类下的文章合集' + (n ? '（共 ' + n + ' 篇）' : '') + '：' +
      (t1 ? t1 + '等，' : '') + '按主题连续阅读。', 72);
  }
  if (path === 'tags/') {
    return clamp('按主题浏览' + siteTitle + '全部标签：赣南脐橙选购与储存、AI 绘图与视频、Kaggle 免费算力等，点标签查看对应文章合集。', 72);
  }
  if (path === 'categories/') {
    return clamp(siteTitle + '全部文章分类：赣南脐橙专栏与 AI 教程两大类，按主题整理，便于连续阅读与查找。', 72);
  }
  if (path === 'tools/') {
    return clamp('本站在用的提效工具清单：免费 GPU 平台、AI 绘图与视频工具、建站与图床服务，每项都附实际使用场景与替代方案。', 72);
  }
  if (path === 'tutorial/') {
    return clamp('从零可复现的实操教程：Kaggle 免费 GPU 跑 ComfyUI 与 MiniMax、15 秒视频生成、Hexo 建站与 SEO 配置。', 72);
  }
  if (path === 'about/') {
    return clamp('小橙崽，江西赣州宁都脐橙果农，记录自家果园从开花到发货的全过程，以及用 AI 工具做内容的实操方法。', 72);
  }
  if (path === 'cards/') {
    return clamp('四张赣南脐橙速查卡：果径分级与参考价、四档储存天数与失重率、礼盒装箱颗数、单日采摘产量，数字来自产地记录。', 72);
  }
  if (path === 'orange/') {
    return clamp('宁都自家果园的赣南脐橙专栏：11 月至次年 1 月自然成熟采摘，记录挑选、储存、装箱与发货全过程。', 72);
  }
  return '';
}

function breadcrumb(site, name, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: site + '/' },
      { '@type': 'ListItem', position: 2, name: name, item: url }
    ]
  };
}

function collectionLd(site, name, url, desc) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    url: url,
    description: desc,
    inLanguage: 'zh-CN',
    isPartOf: { '@type': 'WebSite', '@id': site + '/#website', url: site + '/' }
  };
}

function aboutLd(site, author, authorUrl) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      url: site + '/about/',
      name: '关于我',
      inLanguage: 'zh-CN',
      isPartOf: { '@type': 'WebSite', '@id': site + '/#website', url: site + '/' },
      mainEntity: { '@type': 'Person', '@id': site + '/#person', name: author, url: authorUrl }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': site + '/#person',
      name: author,
      url: authorUrl,
      jobTitle: '果农 / 内容创作者',
      knowsAbout: ['赣南脐橙种植与挑选', 'AI 绘图', 'AI 视频生成', 'Hexo 建站'],
      sameAs: []
    }
  ];
}

function enhance(str, pageData, config) {
  const site = (config.url || '').replace(/\/$/, '');
  const siteTitle = config.title || '';
  const page = pageData || {};
  if (str.indexOf('<!-- z-page-enhance -->') > -1) return str;
  const path = String(page.path || '').replace(/index\.html$/, '');

  // 文章页不动
  if (page.__post || page.layout === 'post') return str;

  const oldDesc = firstMeta(str, 'description');
  const needDesc = !oldDesc || oldDesc.indexOf(DEFAULT_DESC_HINT) === 0;
  const newDesc = needDesc ? buildDesc(page, path, siteTitle) : '';
  if (newDesc) str = setDescription(str, newDesc);

  // 缺 h1 的标签/分类/归档页：div.article-sort-title → h1
  if (!/<h1[\s>]/i.test(str)) {
    const m = str.match(/<div\s+class="article-sort-title"\s*>([^<]{1,80})<\/div>/);
    if (m) {
      str = str.replace(m[0], '<h1 class="article-sort-title">' + m[1] + '</h1>');
    }
  }

  // 结构化数据（只补这些页，文章页的结构化交给 seo-enhance）
  const blocks = [];
  const isTag = !!page.tag;
  const isCat = !!page.category;
  const isArchive = path === 'archives/' || path === 'archives/index.html';

  if (isTag || isCat || isArchive) {
    const name = (page.tag && (page.tag.name || page.tag)) ||
                 (page.category && (page.category.name || page.category)) || '归档';
    const url = absUrl(site, page.path || '');
    const desc = newDesc || oldDesc;
    blocks.push(collectionLd(site, name, url, desc));
    blocks.push(breadcrumb(site, name, url));
  } else if (path === 'tools/' || path === 'tutorial/' || path === 'cards/' || path === 'orange/') {
    const nameMap = { 'tools/': '工具', 'tutorial/': '教程', 'cards/': '速查卡', 'orange/': '赣南脐橙' };
    const name = nameMap[path];
    const url = absUrl(site, page.path || path);
    blocks.push(collectionLd(site, name, url, newDesc || oldDesc));
    blocks.push(breadcrumb(site, name, url));
  } else if (path === 'about/') {
    const author = (config.author || '').replace(/^.*?\s/, '') || config.author || '';
    aboutLd(site, config.author || author, site + '/about/').forEach(function (b) { blocks.push(b); });
    blocks.push(breadcrumb(site, '关于我', site + '/about/'));
  } else if (path === 'tags/' || path === 'categories/') {
    const name = path === 'tags/' ? '标签' : '分类';
    const url = absUrl(site, page.path || path);
    blocks.push(collectionLd(site, name, url, newDesc || oldDesc));
    blocks.push(breadcrumb(site, name, url));
  }

  if (blocks.length) {
    const ld = blocks.map(function (b) {
      return '<script type="application/ld+json">' + JSON.stringify(b) + '</script>';
    }).join('\n');
    str = str.replace(/<\/head>/i, ld + '\n<!-- z-page-enhance -->\n</head>');
  }
  return str;
}

if (typeof hexo !== 'undefined' && hexo.extend && hexo.extend.filter) {
  hexo.extend.filter.register('after_render:html', function (str, data) {
    try {
      return enhance(str, (data && data.page) || {}, hexo.config || {});
    } catch (e) {
      console.warn('[z-page-enhance] skip: ' + e.message);
      return str;
    }
  });
}

module.exports = enhance;
