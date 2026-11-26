/**
 * z-toutiao-autopush.js —— 注入头条站长平台的「JS 提交」推送代码
 *
 * 用法：
 *   1. 把头条生成的 <script>…</script> 整段存到**仓库根目录**的：
 *        toutiao-autopush.html
 *      （不要放进 scripts/ —— Hexo 会把 scripts/ 下所有文件当 JS 解析）
 *   2. 本脚本读该文件，把内容插到每个页面 </head> 之前
 *
 * 幂等：页面里已有该推送脚本就不再插入；文件不存在就跳过，不影响构建。
 */

const fs = require('fs');
const path = require('path');

const SNIPPET = path.join(hexo.base_dir, 'toutiao-autopush.html');
const MARK = 'bytegoofy.com';   // 推送域名，出现即视为已注入

hexo.extend.filter.register('after_render:html', function (str) {
  if (str.indexOf(MARK) > -1) return str;          // 已注入
  if (str.indexOf('</head>') === -1) return str;   // 非 HTML 页面

  let snip = '';
  try {
    snip = fs.readFileSync(SNIPPET, 'utf8').trim();
  } catch (e) {
    return str;                                     // 没有片段文件就跳过
  }
  if (!snip) return str;

  return str.replace(/<\/head>/i, snip + '\n</head>');
});
