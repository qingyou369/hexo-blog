/*!
 * redirect-alias.js —— 旧 hash 地址软跳转（无需 Cloudflare 配置）
 * 放在仓库根目录 scripts/ 下，hexo generate / Cloudflare Pages 构建时自动执行。
 *
 * 原理：注册一个 Hexo generator，把 7 个旧路径直接登记成路由，
 *       构建时由 Hexo 写入 public/posts/<旧hash>/index.html。
 *       每个跳转页包含：
 *         1) canonical 指向新地址（告诉引擎哪个才是正版）
 *         2) meta refresh 0 秒 + JS 跳转 + 可见内链（用户/爬虫自动到新页）
 *
 * 幂等：只会写这 7 个固定路径，不依赖新页面是否已生成，不会报错中断构建。
 */

'use strict';

const SITE = 'https://jisou.dpdns.org';

// 旧 hash → 新 slug
const MAP = {
  'Y9yUoHR-': 'gannan-qicheng-tiaoxuan-bikeng',
  'qUsebbt1': 'gannan-qicheng-chifa-yuchucun',
  'CgPcnjPe': 'gannan-qicheng-lihe-songli',
  'n2pe-P36': 'gannan-qicheng-caizhai-jilu',
  'S8MnBad3': 'kaggle-minimax-h3',
  'm8xSXavD': 'kaggle-comfyui-flux1',
  'F7NpO7jm': '5tu-15miao-shipin'
};

function buildStub(target) {
  const abs = SITE + target;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>页面已迁移</title>
<link rel="canonical" href="${abs}">
<meta http-equiv="refresh" content="0; url=${target}">
<script>location.replace('${target}' + location.search + location.hash);</script>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;padding:24px;line-height:1.7">
<p>这篇文章的地址已经更新。</p>
<p>如果没有自动跳转，请点击 <a href="${target}">${abs}</a></p>
</body>
</html>
`;
}

hexo.extend.generator.register('alias_redirect', function () {
  const routes = [];

  Object.keys(MAP).forEach(function (old) {
    const target = '/posts/' + MAP[old] + '/';
    routes.push({
      path: 'posts/' + old + '/index.html',
      data: buildStub(target)
    });
  });

  hexo.log.info('[alias] 登记 ' + routes.length + ' 个旧地址跳转路由');
  return routes;
});
