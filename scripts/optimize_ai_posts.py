#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
optimize_ai_posts.py —— 给三篇 AI 教程补「场景 + 服务转化」两块内容

只加不改：不碰原文的步骤、代码、表格。
幂等：已存在 OPPTOP / OPPBOTTOM 标记就跳过。

用法：
    cd /workspace/hexo-blog
    python3 scripts/optimize_ai_posts.py
"""

import os
import re
import glob
import sys

SLUGS = ['kaggle-comfyui-flux1', 'kaggle-minimax-h3', '5tu-15miao-shipin']

TOP = """<!-- OPPTOP -->
> **这篇解决什么**：不买显卡、不订会员，跟着跑一遍就能出图/出视频，全流程可复现。
> **不想自己折腾？** 我这边可以直接做成品给你（图/片子），见文末「代做」。
"""

QR = ('<div style="text-align:center;margin:24px 0">\n'
      '  <img src="https://imgbed-446.pages.dev/file/1795052387427__6855688.jpg" '
      'alt="扫码咨询 AI 出图与短视频代做" style="width:240px;border-radius:10px" loading="lazy" decoding="async">\n'
      '  <p style="margin:8px 0 0;color:#8a6a52;font-size:13px">扫码说清要什么，我先报价再动手</p>\n'
      '</div>\n')


def bottom_block(a, b, c):
    """a/b/c 为另两篇 + 果园页的相对链接"""
    return """<!-- OPPBOTTOM -->
## 这套流程除了自己用，还能卖给谁

三个最实用的场景（前两个我自己在跑）：

1. **农产品商品图**：脐橙装箱、切开、手持、场景，一次出 8 张，主图不用请摄影
2. **短视频封面与分镜**：5 张分镜串成 15 秒，果园实拍 + AI 补画面，一条能挂抖音、视频号、朋友圈
3. **本地商家物料**：菜单图、活动海报、朋友圈九宫格，宁都本地的小店都用得上

这三个场景的共同点：**客户要的是成品，不是教程**。你跑通流程之后，卖的是"省他两天时间"。

## 不想自己跑？可以直接拿成品

| 服务 | 交付内容 | 周期 | 参考价 |
|---|---|---|---|
| 商品图一套 | 8 张，含主图 + 细节图，给源文件 | 72 小时 | 150 元起 |
| 15 秒短视频 | 5 分镜，含字幕，竖版可直接发 | 3 天 | 300 元起 |
| 封面图批量 | 10 张同风格，适合图文号 | 48 小时 | 100 元起 |

说明清三件事就行：**要什么、几张、什么时候要**。我先报价，你确认了再动手，不满意不收钱。

""" + QR + """
## 常见问题

**Q：没有独立显卡，跟着这篇能跑通吗？**
A：能。全流程都在 Kaggle 的免费 GPU 上跑，本地只需要浏览器。

**Q：免费额度够用吗？**
A：日常出图够，批量出片会排队。要稳定批量，见上面「代做」。

**Q：代做和这篇教程有什么区别？**
A：教程是你自己学会；代做是直接拿成品。两者不冲突，很多人先下单要成品，再回来学流程。

## 接着看

- [{b1}]({lb1})
- [{b2}]({lb2})
- [宁都果园实录：这些图最后用在哪]({lb3})
""".format(b1=a[0], lb1=a[1], b2=b[0], lb2=b[1], lb3=c)


POSTS = {
    'kaggle-comfyui-flux1': (
        ('MiniMax-H3 免费跑 AI 视频完整流程', '/posts/kaggle-minimax-h3/'),
        ('5 图 5 提示词一键生成 15 秒开箱视频', '/posts/5tu-15miao-shipin/'),
        '/posts/gannan-qicheng-caizhai-jilu/',
    ),
    'kaggle-minimax-h3': (
        ('ComfyUI 免费 GPU 出图全流程', '/posts/kaggle-comfyui-flux1/'),
        ('5 图 5 提示词一键生成 15 秒开箱视频', '/posts/5tu-15miao-shipin/'),
        '/posts/gannan-qicheng-caizhai-jilu/',
    ),
    '5tu-15miao-shipin': (
        ('MiniMax-H3 基础版：免费跑 AI 视频', '/posts/kaggle-minimax-h3/'),
        ('ComfyUI 免费 GPU 出图全流程', '/posts/kaggle-comfyui-flux1/'),
        '/orange/',
    ),
}


def find_file(slug):
    cands = []
    for p in glob.glob('source/_posts/**/*.md', recursive=True):
        try:
            s = open(p, encoding='utf-8').read()
        except Exception:
            continue
        fm = s[:2000]
        if re.search(r'permalink:\s*posts/' + re.escape(slug) + r'/', fm):
            return p
        if os.path.basename(p) in (slug + '.md',):
            return p
        cands.append(p)
    # 兜底：文件名包含 slug
    for p in cands:
        if slug in os.path.basename(p):
            return p
    return None


def after_front_matter(s):
    """返回 front-matter 结束后的插入位置"""
    m = re.match(r'^---\s*\n.*?\n---\s*\n', s, re.S)
    return m.end() if m else 0


def main():
    ok, skip, missing = 0, 0, []
    for slug in SLUGS:
        path = find_file(slug)
        if not path:
            missing.append(slug)
            continue
        s = open(path, encoding='utf-8').read()
        if 'OPPTOP' in s and 'OPPBOTTOM' in s:
            print('[skip] %s 已处理' % slug)
            skip += 1
            continue

        a, b, c = POSTS[slug]
        changed = False

        if 'OPPTOP' not in s:
            pos = after_front_matter(s)
            s = s[:pos] + '\n' + TOP + '\n' + s[pos:]
            changed = True

        if 'OPPBOTTOM' not in s:
            s = s.rstrip() + '\n\n' + bottom_block(a, b, c)
            changed = True

        if changed:
            open(path, 'w', encoding='utf-8').write(s)
            print('[ok] %s  <- %s' % (slug, path))
            ok += 1

    print('\n完成：%d 篇已处理，%d 篇跳过' % (ok, skip))
    if missing:
        print('未找到：%s' % ', '.join(missing))
        print('检查 front-matter 里的 permalink 是否写成 posts/<slug>/')
        sys.exit(1)


if __name__ == '__main__':
    main()
