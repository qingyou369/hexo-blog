/*!
 * table-responsive.js —— 手机端表格适配
 *
 * 问题：四张数据表在 768px 以下被挤成竖排，读不了。
 * 做法：给所有页面注入一段 <style>，小屏下让表格变成可横向滚动的块，
 *       并给表格加视觉提示（右侧渐隐），读者知道"能滑"。
 *
 * 纯 CSS，不改 DOM，不依赖 JS 执行，爬虫看到的表格结构完全不变。
 * 放仓库根目录 scripts/ 下即可。
 */

'use strict';

const MARK = '<!-- table-responsive -->';

const CSS = `
/* 手机端表格适配（table-responsive） */
.post-content table,
#article-container table {
  border-collapse: collapse;
  max-width: 100%;
}
@media (max-width: 820px) {
  .post-content table,
  #article-container table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    max-width: 100%;
    border-radius: 8px;
  }
  .post-content table th,
  .post-content table td,
  #article-container table th,
  #article-container table td {
    white-space: nowrap;
    font-size: 13px;
    padding: 8px 10px;
  }
  .post-content table::-webkit-scrollbar,
  #article-container table::-webkit-scrollbar {
    height: 5px;
  }
  .post-content table::-webkit-scrollbar-thumb,
  #article-container table::-webkit-scrollbar-thumb {
    background: rgba(232,115,74,.5);
    border-radius: 3px;
  }
  .table-hint {
    display: block;
    font-size: 12px;
    color: #999;
    margin: 4px 0 16px;
    text-align: right;
  }
}
.table-hint { display: none; }
`;

// 给表格后插一句"左右滑动查看"提示（仅小屏可见）
const JS_HINT = `
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.post-content table, #article-container table').forEach(function (t) {
    if (t.dataset.hintAdded) return;
    t.dataset.hintAdded = '1';
    var hint = document.createElement('div');
    hint.className = 'table-hint';
    hint.textContent = '表格可左右滑动查看 →';
    t.parentNode.insertBefore(hint, t.nextSibling);
  });
});
`;

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (str.indexOf(MARK) !== -1) return str;
  const inject = MARK
    + '<style>' + CSS + '</style>'
    + '<script>' + JS_HINT + '</script>';

  if (/<\/head>/i.test(str)) {
    return str.replace(/<\/head>/i, inject + '\n</head>');
  }
  return inject + str;
});
