/*!
 * custom-404.js —— 自定义 404 页
 *
 * 生成一个自包含的 404.html（不依赖主题模板，避免主题无 404 layout 时失效）：
 *   · 品牌配色，与站点一致
 *   · 返回首页 / 赣南脐橙专栏 / AI 教程 / 速查卡 四个入口
 *   · 四条热门文章卡片
 *   · 一句"链接可能已更新"的提示（呼应 permalink 改造）
 *
 * 放仓库根目录 scripts/ 下。Cloudflare Pages 会自动用根目录 404.html。
 */

'use strict';

const SITE = 'https://jisou.dpdns.org';

const HOT = [
  ['/posts/gannan-qicheng-tiaoxuan-bikeng/', '赣南脐橙挑选避坑指南', '果径分级表 + 收购商验货 6 个动作'],
  ['/posts/gannan-qicheng-chifa-yuchucun/', '吃法与储存进阶技巧', '四档储存对照，能放多久一清二楚'],
  ['/posts/gannan-qicheng-lihe-songli/', '礼盒送礼攻略', '5/8/10 斤装各多少颗'],
  ['/posts/kaggle-comfyui-flux1/', 'Kaggle 免费 GPU 跑 ComfyUI', '不买显卡也能生图'],
];

hexo.extend.generator.register('custom_404', function () {
  const cards = HOT.map(function (it) {
    return (
      '<a class="card" href="' + it[0] + '">'
      + '<div class="card-t">' + it[1] + '</div>'
      + '<div class="card-d">' + it[2] + '</div>'
      + '</a>'
    );
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow">
<title>页面不存在 | 极搜</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(circle at 80% 10%, rgba(232,115,74,.18), transparent 45%),
               radial-gradient(circle at 10% 90%, rgba(232,115,74,.10), transparent 45%), #FBF3E8;
    font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#2C2A28;
    padding:40px 20px;
  }
  .wrap{max-width:720px;width:100%;}
  .code{font-size:88px;font-weight:800;color:#D9552B;letter-spacing:-2px;line-height:1;}
  h1{font-size:24px;margin:14px 0 10px;}
  p.lead{color:#6E635A;line-height:1.8;font-size:15px;}
  .nav{display:flex;flex-wrap:wrap;gap:10px;margin:26px 0 30px;}
  .nav a{
    padding:10px 18px;border-radius:99px;background:#fff;color:#B4623C;font-size:14px;
    text-decoration:none;box-shadow:0 2px 10px rgba(120,80,50,.08);border:1px solid #F1DCC9;
  }
  .nav a:hover{background:#E8734A;color:#fff;}
  .sec-title{font-size:14px;color:#8A7A6C;letter-spacing:1px;margin-bottom:12px;}
  .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
  @media(max-width:560px){.grid{grid-template-columns:1fr;}.code{font-size:64px;}}
  .card{
    display:block;padding:16px 18px;border-radius:12px;background:#fff;text-decoration:none;
    box-shadow:0 3px 14px rgba(120,80,50,.07);border-left:3px solid #E8734A;
  }
  .card-t{font-size:15px;color:#2C2A28;font-weight:600;margin-bottom:6px;}
  .card-d{font-size:12.5px;color:#8A7A6C;line-height:1.6;}
  .foot{margin-top:28px;font-size:12.5px;color:#9C8E82;}
</style>
</head>
<body>
<div class="wrap">
  <div class="code">404</div>
  <h1>这个页面不在了</h1>
  <p class="lead">如果你是从收藏夹或旧链接进来的，可能是我最近把文章地址改成了更易读的形式（<code>/posts/拼音-关键词/</code>）。<br>下面这几个入口应该能带你找到想要的内容。</p>

  <div class="nav">
    <a href="/">返回首页</a>
    <a href="/orange/">赣南脐橙专栏</a>
    <a href="/tutorial/">AI 实操教程</a>
    <a href="/cards/">四张速查卡</a>
    <a href="/archives/">全部文章</a>
  </div>

  <div class="sec-title">常被访问的几篇</div>
  <div class="grid">${cards}</div>

  <div class="foot">${SITE}</div>
</div>
</body>
</html>`;

  return [{ path: '404.html', data: html }];
});
