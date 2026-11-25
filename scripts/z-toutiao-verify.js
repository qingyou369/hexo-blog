/**
 * z-toutiao-verify.js —— 头条搜索站长平台的 HTML 标签验证
 *
 * 令牌文件放在**仓库根目录**：toutiao-verify.token（内容就是 content 那串值，单行）
 * 不能放在 scripts/ 下 —— Hexo 会把 scripts/ 里所有文件当 JS 加载，
 * .token 后缀也会走 .js 解析器，令牌里的 "+" 会直接抛 ReferenceError 中断构建。
 *
 * 幂等：页面里已有该标签就不再插入；token 读不到就跳过，不影响构建。
 */

const fs = require('fs');
const path = require('path');

const ROOT_TOKEN = path.join(hexo.base_dir, 'toutiao-verify.token');
const LEGACY_TOKEN = path.join(hexo.base_dir, 'scripts', 'toutiao-verify.token');
const MARK = 'bytedance-verification-code';

function readToken() {
  for (const f of [ROOT_TOKEN, LEGACY_TOKEN]) {
    try {
      const t = fs.readFileSync(f, 'utf8').trim();
      if (t) return t;
    } catch (e) { /* 试下一个位置 */ }
  }
  return '';
}

hexo.extend.filter.register('after_render:html', function (str) {
  if (str.indexOf(MARK) > -1) return str;                 // 已注入
  if (str.indexOf('</head>') === -1) return str;

  const token = readToken();
  if (!token) return str;

  const tag = '<meta name="' + MARK + '" content="' + token + '"/>';
  return str.replace(/<\/head>/i, tag + '\n</head>');
});
