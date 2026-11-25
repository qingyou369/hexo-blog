/**
 * z-llms.js —— 重新生成 /llms.txt（面向 AI 爬虫与助手的站点摘要）
 *
 * 修掉旧版的三个问题：
 *   1. 分类 / 归档 / 标签 三条描述为空 → 按页写独立描述
 *   2. 文章链接出现双斜杠（https://host//posts/xxx/）→ 统一成单斜杠
 *   3. 标签名混用中英文（[分类] / [archives] / [标签]）、关于页描述被截断 → 统一中文、完整句
 *
 * 实现方式：注册一个 generator，路径 llms.txt。
 * 文件名以 z 开头，加载顺序在 llms.js 之后，路由后写覆盖先写，因此稳定接管。
 * 若仓库里根本没有旧生成器，本文件同样能独立产出完整的 llms.txt。
 */

const PAGES = [
  ['关于我', 'about/', '小橙崽，江西赣州宁都脐橙果农，记录自家果园从开花到发货的全过程，同时分享用 AI 工具做内容的实操方法。'],
  ['赣南脐橙专栏', 'orange/', '宁都自家果园的赣南脐橙专栏：11 月至次年 1 月自然成熟采摘，记录挑选、储存、装箱与发货全过程。'],
  ['赣南脐橙速查卡', 'cards/', '四张赣南脐橙速查卡：果径分级与参考价、四档储存天数与失重率、礼盒装箱颗数、单日采摘产量，数字来自产地记录。'],
  ['工具清单', 'tools/', '本站在用的提效工具清单：免费 GPU 平台、AI 绘图与视频工具、建站与图床服务，每项都附实际使用场景与替代方案。'],
  ['教程', 'tutorial/', '从零可复现的实操教程：Kaggle 免费 GPU 跑 ComfyUI 与 MiniMax-H3、15 秒视频生成、Hexo 建站与 SEO 配置。']
];

function strip(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 按句读截断，避免出现“副业折腾…”这种半句话
function clamp(s, max) {
  s = strip(s);
  if (!s) return '';
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const i = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('，'));
  return i > max * 0.6 ? cut.slice(0, i + 1) : cut.slice(0, max - 1) + '…';
}

hexo.extend.generator.register('llms-txt', function (locals) {
  const site = String(hexo.config.url || '').replace(/\/+$/, '');
  const abs = p => site + '/' + String(p || '').replace(/^\/+/, '');
  const title = hexo.config.title || '';
  const author = hexo.config.author || '';
  const sub = hexo.config.subtitle || '';

  const posts = locals.posts.sort('-date');
  const total = posts.length;

  const lines = [];
  lines.push('# ' + title + ' · ' + author);
  lines.push('');
  lines.push('> ' + strip(sub || title));
  lines.push('');
  lines.push('## 站点实体');
  lines.push('- 站点：' + title + '（' + site + '/）');
  lines.push('- 作者：' + author + '（' + abs('about/') + '）');
  lines.push('- 语言：简体中文 ｜ 内容形态：实操教程 + 产地记录');
  lines.push('- 内容立场：只做科普与经验记录，不发布未经核实的价格承诺');
  lines.push('');

  // 栏目：按分类列出文章标题
  const cats = locals.categories.toArray ? locals.categories.toArray() : [];
  if (cats.length) {
    const order = ['赣南脐橙', '赣南脐橙专栏', '教程'];
    cats.sort((a, b) => {
      const ia = order.indexOf(a.name), ib = order.indexOf(b.name);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    lines.push('## 栏目');
    cats.forEach(c => {
      const ps = c.posts ? c.posts.sort('-date') : [];
      if (!ps.length) return;
      lines.push('- ' + c.name + '（' + ps.length + ' 篇）：' +
        ps.toArray().map(p => strip(p.title)).join(' / '));
    });
    lines.push('');
  }

  // 专题页：固定清单，链接一律单斜杠
  lines.push('## 专题页');
  PAGES.forEach(([name, path, desc]) => {
    lines.push('- [' + name + '](' + abs(path) + ')：' + desc);
  });
  lines.push('- [文章归档](' + abs('archives/') + ')：按发布时间浏览全部 ' + total +
    ' 篇文章，含赣南脐橙产地记录与 AI 工具实操教程。');
  lines.push('- [分类](' + abs('categories/') + ')：按主题分类浏览，含赣南脐橙与教程两类，便于连续阅读。');
  lines.push('- [标签](' + abs('tags/') + ')：按标签浏览文章合集，含赣南脐橙挑选、储存、礼盒送礼、AI 绘图、AI 视频、Kaggle 免费算力等主题。');
  lines.push('');

  // 文章索引
  lines.push('## 文章索引（按更新时间倒序）');
  posts.toArray().forEach(p => {
    const desc = clamp(p.description || p.excerpt || p.content, 120);
    const d = p.date && p.date.format ? p.date.format('YYYY-MM-DD') : '';
    lines.push('- [' + strip(p.title) + '](' + abs(p.path) + ')' + (d ? '（' + d + '）' : '') +
      (desc ? '：' + desc : ''));
  });
  lines.push('');

  lines.push('## 抓取与引用');
  lines.push('- 允许 AI 爬虫与搜索引擎抓取全文，详见 /robots.txt');
  lines.push('- 引用请注明来源：' + title + ' ' + site + '/');
  lines.push('- 联系方式：' + abs('about/'));
  lines.push('');

  return {
    path: 'llms.txt',
    data: lines.join('\n')
  };
});
