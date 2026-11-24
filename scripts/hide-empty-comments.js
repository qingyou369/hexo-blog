/*!
 * hide-empty-comments.js —— 隐藏未配置后端的评论区
 *
 * 现状：主题启用 Twikoo，但 twikooEnvId 为空，评论模块加载失败，
 *       页面上留一个空的「评论」区块。
 * 做法：注入一段 CSS 把它隐藏，保留你自己的「评论区留言咨询」引导块。
 *
 * 以后配好 Twikoo（Cloudflare Worker + 数据库）后，删掉这个脚本再构建即可恢复。
 * 放仓库根目录 scripts/ 下。
 */

'use strict';

const MARK = '<!-- hide-empty-comments -->';

const CSS = `
/* 未配置后端的评论模块：隐藏，避免空白区块 */
#twikoo,
.twikoo,
#post-comment .comment-head,
#post-comment .comment-content:empty {
  display: none !important;
}
/* 若评论已配置（有 twikoo 内容）则自动显示 */
#twikoo:not(:empty) { display: block !important; }
`;

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (str.indexOf(MARK) !== -1) return str;
  const inject = MARK + '<style>' + CSS + '</style>';
  if (/<\/head>/i.test(str)) {
    return str.replace(/<\/head>/i, inject + '\n</head>');
  }
  return inject + str;
});
