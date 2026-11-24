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

function cleanDesc(text) {
  let t = strip(String(text || ''));
  t = t.replace(/^[\s\-—>#*\/"'“]*一?句?话?结论[\s*]*[：:]\s*/, '');
  t = t.split(/faq[\s:：]/)[0];
  t = t.split(/keywords[\s:：]/)[0];
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function sanitize(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/\s+/g, ' ').trim();
}

function escJson(obj) {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

function jsonld(obj) {
  return '<script type="application/ld+json">' + escJson(obj) + '</script>';
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iso(d) {
  try {
    const t = new Date(d);
    return isNaN(t.getTime()) ? '' : t.toISOString();
  } catch (e) {
    return '';
  }
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
      description: c.summary || '赣南脐橙果农与 AI 工具实操教程博客',
      inLanguage: c.lang,
      publisher: { '@id': SITE + '/#organization' }
      // 注意：原 potentialAction(SearchAction) 已移除 —— /search/ 线上返回 400，
      // 保留会触发 Search Console 的"结构化数据无效"警告
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

  // 3. og:image / twitter:image：统一换成本站图片（原来首页指向 bu.dusays.com 外链）
  const cover = postCover(page);
  const ogImg = abs(isPost ? cover : c.default_cover);
  str = str.replace(
    /(<meta\s+property=["']og:image["']\s+content=["'])([^"']*)(["'])/gi,
    '$1' + ogImg + '$3'
  );
  str = str.replace(
    /(<meta\s+name=["']twitter:image["']\s+content=["'])([^"']*)(["'])/gi,
    '$1' + ogImg + '$3'
  );
  if (!/property=["']og:image["']/i.test(str)) {
    str = str.replace(/<\/head>/i, '<meta property="og:image" content="' + ogImg + '">\n</head>');
  }

  // 3b. 文章页补 og:type=article 与 article 时间（主题默认输出 website，且没有时间）
  if (isPost) {
    str = str.replace(
      /(<meta\s+property=["']og:type["']\s+content=["'])[^"']*(["'])/i,
      '$1article$2'
    );
    if (!/article:published_time/i.test(str)) {
      const pub = iso(page.date);
      const mod = iso(page.updated || page.date) || pub;
      if (pub) {
        str = str.replace(
          /<\/head>/i,
          '<meta property="article:published_time" content="' + pub + '">\n' +
          '<meta property="article:modified_time" content="' + mod + '">\n</head>'
        );
      }
    }
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

  // 6a. 正文占位图替换：picsum / dmoe 随机图统一换成真实封面，避免内容与图不符
  str = str.replace(
    /(<img\b[^>]*\bsrc=["'])(https?:\/\/(?:picsum\.photos|www\.dmoe\.cc|api\.dmoe\.cc)[^"']*)(["'])/gi,
    function (m, p1, p2, p3) { return p1 + cover + p3; }
  );
  // 6b. data-src / data-original 懒加载源也一起换
  str = str.replace(
    /((?:data-src|data-original)=["'])(https?:\/\/(?:picsum\.photos|www\.dmoe\.cc|api\.dmoe\.cc)[^"']*)(["'])/gi,
    function (m, p1, p2, p3) { return p1 + cover + p3; }
  );

  // 6c. 图片懒加载 + 空 alt 兜底（只处理正文及卡片图，不动 preloader）
  let imgIndex = 0;
  str = str.replace(/<img\b([^>]*)>/gi, function (m, attrs) {
    imgIndex += 1;
    // 首屏 2 张图不懒加载，避免影响 LCP
    if (!/loading=/i.test(attrs) && imgIndex > 2) attrs += ' loading="lazy"';
    if (!/decoding=/i.test(attrs)) attrs += ' decoding="async"';
    if (!/\balt=/i.test(attrs)) attrs += ' alt=""';
    return '<img' + attrs + '>';
  });

  // 7. 删掉主题给爬虫用的隐藏重复标题（与正文 H1 重复声明 headline）
  str = str.replace(
    /<(?:h1|div)[^>]*id=["']CrawlerTitle["'][^>]*>[\s\S]*?<\/(?:h1|div)>/gi,
    ''
  );

  // 7b. 首页静态内容：anzhiyu 首页是 JS 渲染，静态 HTML 里没有 H1、没有正文、没有内链，
  //     百度和 Bing 抓不到内容。补一个可见的站点简介块（含 H1 + 最新文章内链）。
  if (isHome) {
    let latest = [];
    try {
      latest = hexo.locals.get('posts').toArray().slice(0, 8);
    } catch (e) { latest = []; }
    const listHtml = latest.length
      ? '<ul style="list-style:none;padding:0;margin:14px 0 0">' +
        latest.map(function (p) {
          const desc = truncate(cleanDesc(p.description || p.excerpt || p.content), 120);
          const cat = (p.categories && p.categories.length) ? names(p.categories).join(' / ') : '';
          const day = iso(p.date).slice(0, 10);
          return '<li style="margin:0 0 14px">' +
            '<a href="' + abs(p.path) + '" style="font-weight:600;color:#1f2328">' + esc(p.title) + '</a>' +
            '<span style="color:#9aa3af;margin:0 8px;font-size:12px">' + (cat ? esc(cat) + ' · ' : '') + day + '</span>' +
            '<p style="margin:4px 0 0;color:#5b6470">' + esc(desc) + '</p>' +
            '</li>';
        }).join('') + '</ul>' +
        '<p style="margin:12px 0 0"><a href="' + SITE + '/archives/">查看全部文章 →</a></p>'
      : '';
    const intro =
      '<section class="seo-home-intro" style="max-width:860px;margin:28px auto 0;padding:0 20px;color:#5b6470;font-size:14px;line-height:1.9">' +
      '<h1 style="font-size:18px;font-weight:700;color:#26282c;margin:0 0 10px">' +
      esc(c.brand) + '｜赣南脐橙挑选与 AI 实操教程</h1>' +
      '<p style="margin:0">' +
      esc(c.summary || '赣南脐橙果农与 AI 工具实操教程博客，记录产地实况与可复现的实操流程。') +
      ' 江西赣州宁都产地直供，11 月中旬开摘，内容含挑选标准、储存方法、礼盒选购与 AI 工具实操步骤。</p>' +
      '<p style="margin:8px 0 0">果园在江西赣州宁都，脐橙 11 月中旬开摘、次年 1 月结束。' +
      '挑选看果径与果皮毛孔，同大小掂重量最准；储存讲通风单层摊放，冰箱冷藏反而失水；' +
      '礼盒按 75–85mm 果径最稳妥。教程部分只写跑通过的流程，Kaggle 免费 GPU 跑 ComfyUI、' +
      'MiniMax-H3 与多图生成短视频都有完整步骤与踩坑记录。</p>' +
      '<div style="display:flex;gap:12px;margin:16px 0 6px;flex-wrap:wrap">' +
      '<a href="' + SITE + '/orange/" style="flex:1;min-width:220px;padding:14px 16px;border-radius:10px;background:#fff8f0;border:1px solid #f1ddc8;text-decoration:none;color:#8a4a26;font-weight:600;font-size:14px">赣南脐橙专栏' +
      '<span style="display:block;font-weight:400;font-size:12px;color:#9a7b62;margin-top:5px;line-height:1.6">挑选 · 储存 · 礼盒 · 采摘实录，附果径分级表与实测区间</span></a>' +
      '<a href="' + SITE + '/tutorial/" style="flex:1;min-width:220px;padding:14px 16px;border-radius:10px;background:#fff8f0;border:1px solid #f1ddc8;text-decoration:none;color:#8a4a26;font-weight:600;font-size:14px">AI 工具实操' +
      '<span style="display:block;font-weight:400;font-size:12px;color:#9a7b62;margin-top:5px;line-height:1.6">Kaggle 免费 GPU · ComfyUI 生图 · MiniMax 生视频</span></a>' +
      '</div>' +
            listHtml + '</section>';
    str = str.replace(/<\/body>/i, intro + '\n</body>');
  }

  // 8. meta description / keywords 去重：主题与主题配置可能各输出一条，统一成唯一一条
  let pageDesc = page.description;
  const pPath = String(page.path || '');
  if (!pageDesc && !isPost && page.title) {
    if (/^tags\//.test(pPath)) {
      pageDesc = '「' + page.title + '」标签下的全部文章合集，含产地实录与实操步骤，均由宁都果园作者撰写。';
    } else if (/^categories\//.test(pPath)) {
      pageDesc = '「' + page.title + '」分类下的全部文章，按主题整理，便于连续阅读。';
    }
  }
  const metaDesc = pageDesc
    ? sanitize(pageDesc)
    : (isPost ? truncate(cleanDesc(page.excerpt || page.content), 155) : sanitize(hexo.config.description || ''));
  const metaKw = (isPost && page.tags && page.tags.length)
    ? names(page.tags).join(',')
    : sanitize(hexo.config.keywords || '');

  str = str
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']keywords["'][^>]*>\s*/gi, '');

  let headMeta = '';
  if (metaDesc) headMeta += '<meta name="description" content="' + metaDesc + '">\n';
  if (metaKw) headMeta += '<meta name="keywords" content="' + metaKw + '">\n';
  if (headMeta) str = str.replace(/<\/head>/i, headMeta + '</head>');

  return str;
}, 10);
