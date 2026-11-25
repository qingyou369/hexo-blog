/**
 * z-outbound.js —— 给指定站外链接自动补 rel / target
 *
 * 站点侧栏与右下角有 3 个自有推广位（fanwq / imgbed / fcx）。
 * 它们不改内容、不改位置，只补上搜索引擎要求的链接属性：
 *   - nofollow   不传递权重，避免被判定为链接交换或付费链接
 *   - sponsored  广告/返佣类链接必须标注（fcx 属于这一类）
 *   - noopener / noreferrer  新窗口打开时的安全属性
 *
 * 只在 HTML 渲染阶段处理，幂等：已有属性不重复追加。
 */

const DOMAINS = ['fanwq.dpdns.org', 'imgbed-446.pages.dev', 'fcx.zag9.cn'];
const SPONSORED = ['fcx.zag9.cn']; // 带返佣/推广性质的链接

function hostOf(url) {
  try {
    return new URL(url, 'https://placeholder.invalid/').hostname;
  } catch (e) {
    return '';
  }
}

hexo.extend.filter.register('after_render:html', function (str) {
  return str.replace(/<a\b[^>]*>/gi, function (tag) {
    const m = tag.match(/\bhref\s*=\s*"([^"]*)"/i);
    if (!m) return tag;
    const host = hostOf(m[1]);
    if (!host) return tag;
    const hit = DOMAINS.find(d => host === d || host.endsWith('.' + d));
    if (!hit) return tag;

    const want = ['nofollow', 'noopener', 'noreferrer'];
    if (SPONSORED.indexOf(hit) > -1) want.push('sponsored');

    let rel = (tag.match(/\brel\s*=\s*"([^"]*)"/i) || [null, ''])[1]
      .split(/\s+/).filter(Boolean);
    want.forEach(r => { if (rel.indexOf(r) < 0) rel.push(r); });

    if (/\brel\s*=\s*"/i.test(tag)) {
      tag = tag.replace(/\brel\s*=\s*"[^"]*"/i, 'rel="' + rel.join(' ') + '"');
    } else {
      tag = tag.replace(/<a\b/i, '<a rel="' + rel.join(' ') + '"');
    }
    if (!/\btarget\s*=/i.test(tag)) {
      tag = tag.replace(/<a\b/i, '<a target="_blank"');
    }
    return tag;
  });
});
