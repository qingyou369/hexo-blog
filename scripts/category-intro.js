/*!
 * category-intro.js —— 给分类/栏目页注入导语（解决薄内容页）
 *
 * 现状：/orange/ 和 /tutorial/ 由主题自动生成，只有标题 + 文章列表，正文近乎空白。
 * 做法：渲染完成后，在页面标题 <h1 class="page-title"> 之后插入一段导语 + 内链。
 *       不动主题模板，不改分类数据，幂等（已插入的不会重复）。
 *
 * 放仓库根目录 scripts/ 下即可。
 */

'use strict';

const MARK = '<!-- CAT-INTRO -->';

const INTROS = [
  {
    // 赣南脐橙专栏
    path: /^orange\/index\.html$/,
    html:
      '<div class="cat-intro" style="margin:18px 0 26px;padding:22px 24px;border-radius:12px;'
      + 'background:var(--anzhiyu-card-bg,#fff);box-shadow:0 4px 16px rgba(120,80,50,.07);line-height:1.85;">'
      + '<p style="margin:0 0 12px;">这个专栏写的是江西赣州宁都的自家果园：脐橙怎么挑、怎么存、怎么装箱送礼，'
      + '以及一年里从采果到发货的现场记录。所有价格和天数都按宁都产地的实际区间标注，'
      + '不写“极品”“顶级”这类没法验证的词。</p>'
      + '<p style="margin:0 0 12px;">如果你只想先解决一个问题，可以按这个顺序看：</p>'
      + '<ul style="margin:0 0 12px;padding-left:20px;">'
      + '<li><a href="/posts/gannan-qicheng-tiaoxuan-bikeng/">赣南脐橙挑选避坑指南</a>'
      + '：55–80mm 果径分级表（含单果重与参考价）、收购商验货 6 个动作、糖度实测区间</li>'
      + '<li><a href="/posts/gannan-qicheng-chifa-yuchucun/">吃法与储存进阶技巧</a>'
      + '：常温／冷藏／保鲜袋／冷库四档储存对照，能放多久、失重多少</li>'
      + '<li><a href="/posts/gannan-qicheng-lihe-songli/">礼盒送礼攻略</a>'
      + '：5／8／10 斤装各多少颗、箱型怎么选、包装成本拆解</li>'
      + '<li><a href="/posts/gannan-qicheng-caizhai-jilu/">成熟采摘现场记录</a>'
      + '：单日作业时间表，四个人一天能摘多少斤</li>'
      + '</ul>'
      + '<p style="margin:0;">四张速查卡在 <a href="/cards/">/cards/</a> 页面，手机上存图更方便。</p>'
      + '</div>',
  },
  {
    // 教程专栏
    path: /^tutorial\/index\.html$/,
    html:
      '<div class="cat-intro" style="margin:18px 0 26px;padding:22px 24px;border-radius:12px;'
      + 'background:var(--anzhiyu-card-bg,#fff);box-shadow:0 4px 16px rgba(120,80,50,.07);line-height:1.85;">'
      + '<p style="margin:0 0 12px;">这里放的是能直接照做的工具实操：怎么用免费的 GPU 跑通一个 AI 生图或生视频的完整流程，'
      + '每一步都写到能复现的程度，不讲概念、不堆术语。</p>'
      + '<p style="margin:0 0 12px;">目前已上线的三篇：</p>'
      + '<ul style="margin:0 0 12px;padding-left:20px;">'
      + '<li><a href="/posts/kaggle-comfyui-flux1/">0 元白嫖 AI 生图 · Kaggle 免费 GPU 跑 ComfyUI 完整流程</a>'
      + '：从注册 Kaggle 到出图的每一步</li>'
      + '<li><a href="/posts/kaggle-minimax-h3/">0 元白嫖 AI 生视频 · Kaggle 免费 GPU 跑 MiniMax-H3</a>'
      + '：文生视频与首尾帧的跑法</li>'
      + '<li><a href="/posts/5tu-15miao-shipin/">0 元白嫖 AI 生视频 · 5 图 15 秒视频完整流程</a>'
      + '：多图分镜串成一条短视频</li>'
      + '</ul>'
      + '<p style="margin:0;">后续会补的内容：本地部署、参数调优、成片后期，以及踩过的坑。</p>'
      + '</div>',
  },
];

hexo.extend.filter.register('after_render:html', function (str, data) {
  const path = String((data && data.path) || '');
  const hit = INTROS.find(function (x) { return x.path.test(path); });
  if (!hit) return str;
  if (str.indexOf(MARK) !== -1) return str;

  const block = MARK + hit.html;
  // 插在页面标题之后；找不到标题就放弃，避免破坏布局
  const re = /(<h1 class="page-title">[\s\S]*?<\/h1>)/;
  if (!re.test(str)) {
    hexo.log.warn('[cat-intro] 未找到 page-title，跳过：' + path);
    return str;
  }
  hexo.log.info('[cat-intro] 已注入导语：' + path);
  return str.replace(re, '$1\n' + block);
});
