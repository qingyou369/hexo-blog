/*!
 * strip-placeholder-verification.js
 * 作用：渲染完成后，从 HTML 头部剔除「占位」的搜索引擎验证 meta，例如
 *   <meta name="baidu-site-verification" content="code-xxx">
 *   <meta name="msvalidate.01" content="xxx">
 * 只删值是占位符（code-xxx / xxx / TODO / your-token）的那些，
 * 你以后填入真实 token 不会被删。
 * 放到仓库根目录 scripts/ 下即可，无需改主题配置。
 */

'use strict';

const PLACEHOLDER = new Set(['code-xxx', 'xxx', 'todo', 'your-token', 'your_verify_code', '']);

const TARGETS = ['baidu-site-verification', 'msvalidate.01', 'google-site-verification', 'sogou-site-verification', '360-site-verification'];

hexo.extend.filter.register('after_render:html', function (str, data) {
  let out = str;
  let removed = 0;

  TARGETS.forEach(function (name) {
    const re = new RegExp('<meta\\s+name="' + name.replace(/\./g, '\\.') + '"\\s+content="([^"]*)"\\s*[^>]*>', 'gi');
    out = out.replace(re, function (m, val) {
      if (PLACEHOLDER.has(String(val).trim().toLowerCase())) {
        removed++;
        return '';
      }
      return m;
    });
  });

  if (removed) {
    hexo.log.info('[strip-verify] 已剔除 ' + removed + ' 个占位验证 meta');
  }
  return out;
});
