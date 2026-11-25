/**
 * z-toutiao-verify.js —— 头条搜索站长平台的 HTML 标签验证
 *
 * 平台给的验证代码长这样：
 *   <meta name="bytedance-verification-code" content="xxxxx" />
 * 把 content 那串值写进 scripts/toutiao-verify.token 就行，本脚本会自动注入到 <head>。
 *
 * 为什么不用文件验证：
 *   Hexo 会把 source 下的 .html 当页面渲染，Cloudflare 还有 *.html 的跳转规则，
 *   标签验证没有这些依赖，改一行值就能重来。
 *
 * 幂等：页面里已有该标签就不再插入；token 为空时不插入，也不影响构建。
 */

const fs = require('fs');
const path = require('path');

const TOKEN_FILE = path.join(hexo.base_dir, 'scripts', 'toutiao-verify.token');
const MARK = 'bytedance-verification-code';

hexo.extend.filter.register('after_render:html', function (str) {
  if (str.indexOf(MARK) > -1) return str;      // 已注入
  if (str.indexOf('</head>') < -1) return str;

  let token = '';
  try {
    token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  } catch (e) {
    return str;                                 // 没有 token 文件就跳过
  }
  if (!token) return str;

  const tag = '<meta name="' + MARK + '" content="' + token + '"/>';
  return str.replace(/<\/head>/i, tag + '\n</head>');
});
