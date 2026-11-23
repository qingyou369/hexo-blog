/**
 * scripts/seo-enhance.js
 * 极搜博客 · SEO / GEO 渲染后增强（无需改主题，放到 Hexo 根目录 scripts/ 下即可生效）
 *
 * 功能：
 *  1. 移除主题里半成品 / 带占位符的 JSON-LD，统一重注入合规结构化数据
 *  2. 文章页注入 BlogPosting（含 image / author / publisher / mainEntityOfPage）
 *  3. 支持 front-matter faq 数组，生成 FAQPage
 *  4. 全站注入 BreadcrumbList；首页注入 WebSite + Organization
 *  5. 修复 og:image 的 picsum 随机图；修复 article:tag 错用站点关键词
 *  6. 图片补 loading="lazy" / decoding="async" / 空 alt
 *  7. 把重复的 <h1 id="CrawlerTitle"> 降级为 hidden div
 *  8. 补 robots meta（max-image-preview:large）
 *
 * 配置写进 _config.yml：
 * seo_enhance:
 *   brand: 极搜
 *   author: 小橙崽
 *   author_url: /about/
 *   logo: /img/logo.png
 *   default_cover: /img/default-cover.webp
 *   lang: zh-CN
 *   sameAs:
 *     - https://v.douyin.com/xxxx/
 */

'use strict';

const SITE = (hexo.config.url || '').replace(/\/+$/, '');
const DEFAULT_CFG = {
  brand: '极搜',
  author: '小橙崽',
  author_url: '/about/',
  logo: '/img/logo.png',
  default_cover: '/img/default-cover.webp',
  lang: 'zh-CN',
  sameAs: []
};

function cfg() {
  return Object.assign({}, DEFAULT_CFG, hexo.config.seo_enhance || {});
}

function abs(p) {
  if (!p) return '';
  var u = /^https?:\/\//i.test(p) ? p : SITE + (p.startsWith('/') ? p : '/' + p);
  try {
    return encodeURI(decodeURI(u));
  } catch (e) {
    return encodeURI(u);
  }
}

function strip(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function escJson(obj) {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

function jsonld(obj) {
  return '<script type="application/ld+json">' + escJson(obj) + '</script>';
}

function isBadImage(url) {
  return !url || /picsum\.photos|placeholder|\bxxx\b|替换|default\.(jpg|png)$/i.test(url);
}

function firstImage(content) {
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(content || ''))) {
    if (!isBadImage(m[1])) return m[1];
  }
  return '';
}

function postCover(page) {
  const candidates = [page.cover, page.top_img, page.banner];
  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i] && !isBadImage(candidates[i])) return abs(candidates[i]);
  }
  const inner = firstImage(page.content);
  if (inner) return abs(inner);
  return abs(cfg().default_cover);
}

function iso(d) {
  try {
    return new Date(d).toISOString();
  } catch (e) {
    return '';
  }
}

function names(list) {
  return (list || []).map(function (x) { return typeof x === 'string' ? x : (x && x.name) || ''; }).filter(Boolean);
}

function buildPost(page, c) {
  const url = abs(page.permalink || page.path);
  const desc = page.description || truncate(strip(page.excerpt || page.content), 160);
  const tags = names(page.tags).join(',');
  const cats = names(page.categories);
  const words = strip(page.content).replace(/\s/g, '').length;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url + '#article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: (page.title || '').slice(0, 110),
    description: desc,
    image: [postCover(page)],
    datePublished: iso(page.date),
    dateModified: iso(page.updated || page.date),
    inLanguage: c.lang,
    wordCount: words,
    articleSection: cats[0] || undefined,
    keywords: tags || undefined,
    author: {
      '@type': 'Person',
      name: c.author,
      url: abs(c.author_url),
      affiliation: { '@type': 'Organization', name: c.brand, url: SITE + '/' }
    },
    publisher: {
      '@type': 'Organization',
      name: c.brand,
      url: SITE + '/',
      logo: { '@type': 'ImageObject', url: abs(c.logo) }
    },
    isPartOf: { '@type': 'Blog', '@id': SITE + '/#blog', name: c.brand, url: SITE + '/' }
  };
  return article;
}

function buildFaq(page) {
  const faq = page.faq;
  if (!Array.isArray(faq) || !faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(function (item) {
      const q = item.q || item.question || '';
      const a = item.a || item.answer || '';
      return {
        '@type': 'Question',
        name: strip(q),
        acceptedAnswer: { '@type': 'Answer', text: strip(a) }
      };
    })
  };
}

function buildBreadcrumb(page) {
  const items = [{ name: '首页', url: SITE + '/' }];
  const list = page.categories && page.categories.length
    ? (page.categories.toArray ? page.categories.toArray() : Array.prototype.slice.call(page.categories))
    : [];
  const cat = list[0];
  if (cat) items.push({ name: cat.name, url: abs(cat.path) });
  if (page.title) items.push({ name: page.title, url: abs(page.permalink || page.path) });
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(function (it, i) {
      return { '@type': 'ListItem', position: i + 1, name: it.name, item: it.url };
    })
  };
}

function buildSite(c) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE + '/',
      name: c.brand,
      description: '赣南脐橙果农 + AI 实操教程博客',
      inLanguage: c.lang,
      publisher: { '@id': SITE + '/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE + '/search/?q={search_term_string}' },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': SITE + '/#organization',
      name: c.brand,
      url: SITE + '/',
      logo: { '@type': 'ImageObject', url: abs(c.logo) },
      founder: { '@type': 'Person', name: c.author, url: abs(c.author_url) },
      sameAs: c.sameAs || []
    }
  ];
}

function buildLocalBusiness(page, c) {
  // 只给脐橙专栏页用；地址/电话请在 _config.yml 的 seo_enhance.local_business 里填真值
  const lb = (hexo.config.seo_enhance && hexo.config.seo_enhance.local_business) || {};
  if (!lb.name) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: lb.name,
    description: lb.description || '',
    url: abs(page.permalink || page.path),
    image: lb.image ? abs(lb.image) : abs(c.default_cover),
    telephone: lb.telephone || '',
    priceRange: lb.priceRange || '¥¥',
    address: lb.address || {},
    geo: lb.geo || undefined,
    areaServed: lb.areaServed || ['中国'],
    sameAs: lb.sameAs || []
  };
}

hexo.extend.filter.register('after_render:html', function (str, data) {
  const page = (data && data.page) || {};
  const c = cfg();
  if (!page || page.layout === false) return str;

  const isPost = !!page.__post || page.layout === 'post';
  const isHome = !!page.__index;
  const isOrange = /orange\//.test(page.path || '');

  // 1. 清掉主题自带的半成品 JSON-LD（尤其 image 是 "https://xxx替换…" 的）
  str = str.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

  // 2. 结构化数据
  const blocks = [];
  if (isHome) {
    buildSite(c).forEach(function (b) { blocks.push(b); });
  }
  if (isPost) {
    blocks.push(buildPost(page, c));
    const faq = buildFaq(page);
    if (faq) blocks.push(faq);
    const bc = buildBreadcrumb(page);
    if (bc) blocks.push(bc);
  }
  if (isOrange) {
    const lb = buildLocalBusiness(page, c);
    if (lb) blocks.push(lb);
  }
  const ld = blocks.map(jsonld).join('\n');
  if (ld) {
    if (/<\/head>/i.test(str)) str = str.replace(/<\/head>/i, ld + '\n</head>');
    else str += ld;
  }

  // 3. og:image / twitter:image 兜底
  const cover = postCover(page);
  str = str.replace(
    /(<meta\s+property=["']og:image["']\s+content=["'])([^"']*)(["'])/gi,
    function (m, p1, p2, p3) { return p1 + (/picsum\.photos|xxx|替换/.test(p2) ? cover : p2) + p3; }
  );
  str = str.replace(
    /(<meta\s+name=["']twitter:image["']\s+content=["'])([^"']*)(["'])/gi,
    function (m, p1, p2, p3) { return p1 + (/picsum\.photos|xxx|替换/.test(p2) ? cover : p2) + p3; }
  );
  // 完全没有 og:image 时补一条
  if (!/property=["']og:image["']/i.test(str)) {
    str = str.replace(/<\/head>/i, '<meta property="og:image" content="' + cover + '">\n</head>');
  }

  // 4. article:tag 用真实标签，而不是站点关键词
  if (isPost && page.tags && page.tags.length) {
    const tags = names(page.tags).join(',');
    str = str.replace(/(<meta\s+property=["']article:tag["']\s+content=["'])[^"']*(["'])/gi, '$1' + tags + '$2');
  }

  // 5. robots meta：允许大图预览（Discover / AI 摘要都需要）
  if (!/<meta\s+name=["']robots["']/i.test(str)) {
    str = str.replace(
      /<\/head>/i,
      '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">\n</head>'
    );
  }

  // 6. 图片懒加载 + 空 alt 兜底（只处理正文及卡片图，不动 preloader）
  let imgIndex = 0;
  str = str.replace(/<img\b([^>]*)>/gi, function (m, attrs) {
    imgIndex += 1;
    // 首屏 2 张图不懒加载，避免影响 LCP
    if (!/loading=/i.test(attrs) && imgIndex > 2) attrs += ' loading="lazy"';
    if (!/decoding=/i.test(attrs)) attrs += ' decoding="async"';
    if (!/\balt=/i.test(attrs)) attrs += ' alt=""';
    return '<img' + attrs + '>';
  });

  // 7. 重复 H1：把爬虫用的 CrawlerTitle 降级
  str = str.replace(
    /<h1([^>]*id=["']CrawlerTitle["'][^>]*)>/gi,
    '<div$1 hidden>'
  ).replace(
    /(<div[^>]*id=["']CrawlerTitle["'][^>]*>[\s\S]*?)<\/h1>/gi,
    '$1</div>'
  );

  return str;
}, 10);
//（注：内容由AI生成）
