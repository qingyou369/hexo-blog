/**
 * z-redirects.js —— 输出 Cloudflare Pages 的 _redirects（把废掉的旧分类页 301 到新分类页）
 *
 * 背景：4 篇老文章的分类是「赣南脐橙专栏」，2 篇新文章是「赣南脐橙」，
 * 合并后旧分类没有文章、Hexo 不再生成该页，访问会 404。
 * Cloudflare Pages 原生读取站点根目录的 _redirects 做 301，不需要控制台配置。
 *
 * Hexo 会跳过 source 下以 _ 开头的文件，所以用 generator 直接把路由写出来。
 */

const RULES = [
  '# 旧分类页 → 合并后的分类页（百分号编码写法，兼容浏览器实际请求）',
  '/categories/%E8%B5%A3%E5%8D%97%E8%84%90%E6%A9%99%E4%B8%93%E6%A0%8F/ /categories/%E8%B5%A3%E5%8D%97%E8%84%90%E6%A9%99/ 301',
  '/categories/%E8%B5%A3%E5%8D%97%E8%84%90%E6%A9%99%E4%B8%93%E6%A0%8F /categories/%E8%B5%A3%E5%8D%97%E8%84%90%E6%A9%99/ 301',
  '',
  '# 未编码写法：部分客户端与爬虫直接发 UTF-8 原文',
  '/categories/赣南脐橙专栏/ /categories/赣南脐橙/ 301',
  '/categories/赣南脐橙专栏 /categories/赣南脐橙/ 301',
  ''
];

hexo.extend.generator.register('pages-redirects', function () {
  return {
    path: '_redirects',
    data: RULES.join('\n')
  };
});
