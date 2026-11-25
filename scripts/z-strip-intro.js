// 清除渲染后 HTML 里残留的 seo-home-intro 摘要块（含其 h1，避免首页双 h1）
// 幂等：没有该块时原样返回
hexo.extend.filter.register('after_render:html', function (str) {
  if (str.indexOf('seo-home-intro') === -1) return str;
  var out = str.replace(/<section[^>]*class="[^"]*seo-home-intro[^"]*"[\s\S]*?<\/section>/gi, '');
  return out;
}, 99);
