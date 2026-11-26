#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_video_placeholder.py —— 清掉文章里的「视频制作中 / 视频待制作上传中」占位符

处理规则：
  1. 整行就是占位符（可能带句号、可能前后有空格）→ 整行替换成一句实话
  2. 占位符混在句子中间 → 只替换该短语
幂等：已经是「补录中」的不会再动。

用法：
    cd /workspace/hexo-blog
    python3 scripts/fix_video_placeholder.py            # 预演，只打印
    python3 scripts/fix_video_placeholder.py --write    # 真改
"""

import glob
import re
import sys

REPLACE_LINE = '文字版已完整可复现，视频版补录中。'

PHASES = ['视频待制作上传中', '视频制作中']

LINE_ONLY = re.compile(r'^\s*(?:%s)\s*[。.]?\s*$' % '|'.join(map(re.escape, PHASES)))


def process(text):
    out, hits = [], 0
    for line in text.split('\n'):
        if LINE_ONLY.match(line):
            out.append(REPLACE_LINE)
            hits += 1
            continue
        new = line
        for p in PHASES:
            if p in new:
                new = new.replace(p, '补录中')
                hits += 1
        out.append(new)
    return '\n'.join(out), hits


def main():
    write = '--write' in sys.argv
    files = glob.glob('source/_posts/**/*.md', recursive=True)
    if not files:
        print('没找到 source/_posts/**/*.md，确认在仓库根目录执行')
        sys.exit(1)

    total_files, total_hits = 0, 0
    for p in files:
        s = open(p, encoding='utf-8').read()
        new, hits = process(s)
        if hits == 0:
            continue
        total_files += 1
        total_hits += hits
        print('%s  %d 处' % (p, hits))
        for before in s.split('\n'):
            if LINE_ONLY.match(before) or any(x in before for x in PHASES):
                print('    - ' + before.strip()[:70])
        if write:
            open(p, 'w', encoding='utf-8').write(new)

    print('\n共 %d 个文件、%d 处%s' % (
        total_files, total_hits,
        '已修改' if write else '（预演，加 --write 才真改）'))


if __name__ == '__main__':
    main()
