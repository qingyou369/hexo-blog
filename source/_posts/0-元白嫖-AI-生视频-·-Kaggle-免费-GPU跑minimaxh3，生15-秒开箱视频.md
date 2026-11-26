---
title: MiniMax-H3进阶｜5图5提示词一键生成15秒4K开箱视频
permalink: posts/5tu-15miao-shipin/
cover: "/img/covers/cover-video-5img.webp"
top_img: false
tags:
  - AI视频
  - MiniMax-H3
  - Kaggle
  - ComfyUI
categories:
  - 教程
description: MiniMax-H3一格代码进阶方案，5张图+5组提示词，直接输出15秒开箱成片，自带4K放大，自动备份，心跳保活防断连。
comments: true
toc: true
copyright: true
nanoid: F7NpO7jm
date: 2026-11-18 15:10:00
updated: 2026-11-18 15:10:00
faq:
  - q: "5 张图怎么分工才能生成 15 秒视频？"
    a: "首尾两帧定动作起点与终点，其余三张做中段关键帧过渡，提示词按画面顺序逐条对应，模型才会按时间轴连贯推演。"
  - q: "为什么生成的视频会出现人物变形或场景跳变？"
    a: "多为关键帧之间差异过大，建议相邻两张图保持同一场景、同一机位，只改动作幅度，避免跨场景硬跳。"
  - q: "免费额度用完了还能继续生成吗？"
    a: "Kaggle 单次会话有 GPU 时长上限，跑满后需重新开新会话；提示词和参数先存进 Notebook，换会话直接续跑。"
---




<!-- OPPTOP -->
> **这篇解决什么**：不买显卡、不订会员，跟着跑一遍就能出图/出视频，全流程可复现。
> **不想自己折腾？** 我这边可以直接做成品给你（图/片子），见文末「代做」。

<!-- ANSWER-FIRST -->
> **一句话结论**：把 5 张分镜图按时间顺序串成一条 15 秒视频，关键在于每张图的构图连续性和首尾帧对齐。
<!-- /ANSWER-FIRST -->

---

{% note info %}
免费基础版教程：https://jisou.dpdns.org/posts/kaggle-minimax-h3/
基础版仅支持单段3秒视频，本文为进阶一格代码版本。
{% endnote %}

🎬 先看视频 · B站 / YouTube 同一支
文字版已完整可复现，视频版补录中。

## 能做什么
- 5张开箱图片，按分镜顺序上传
- 每张图独立配置提示词，可自由修改
- 单格代码运行，一次性生成15秒成片（5段 × 73帧，512×288，24fps）
- 自动4K放大
- 成品自动备份到Kaggle Dataset
- 内置心跳保活，防止长时间运行断连

## 怎么跑
1. 下载7个权重文件（合计约45GB），上传至Kaggle私有Dataset
2. 新建Notebook，挂载Dataset；GPU选择T4，Internet开启
3. Secrets添加 `KAGGLE_API_TOKEN`，在 kaggle.com/settings/api 生成
4. 粘贴一格代码运行，打开控制台输出的临时网页
5. 依次上传5张图、修改对应提示词，点击开始生成
6. 控制台显示「远端备份已核验」代表视频保存成功

## 📦 免费下载
一格代码包
https://tools.zaihouse.com/downloads/h3-5clips-4k-onecell.py —— Kaggle单格运行代码
https://tools.zaihouse.com/downloads/h3-5clips-README.txt —— Dataset上传、GPU、Secrets配置文档

7个权重文件（约45GB）
|#|文件|大小|下载|
|----|----|----|----|
1 | MiniMax-H3-FL2VA-Pruned-Q4_K_M.gguf | 11.56 GB | [点此下载](https://huggingface.co/Abiray/MiniMax-H3-Pruned-GGUF/resolve/main/MiniMax-H3-FL2VA-Pruned-Q4_K_M.gguf)
2 | MiniMax-H3-Ref2VA-Pruned-Q4_K_M.gguf | 11.56 GB | [点此下载](https://huggingface.co/Abiray/MiniMax-H3-Pruned-GGUF/resolve/main/MiniMax-H3-Ref2VA-Pruned-Q4_K_M.gguf)
3 | Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-IQ4_XS.gguf | 13.44 GB | [点此下载](https://huggingface.co/nif0/Qwen3-VL-32B-Instruct-MiniMax-H3-GGUF/resolve/main/Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-IQ4_XS.gguf)
4 | Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-mmproj-BF16.gguf | 1.20 GB | [点此下载](https://huggingface.co/nif0/Qwen3-VL-32B-Instruct-MiniMax-H3-GGUF/resolve/main/Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-mmproj-BF16.gguf)
5 | minimax_h3_audio_vae_fp32.safetensors | 605 MB | [点此下载](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors)
6 | minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors | 1.96 GB | [点此下载](https://huggingface.co/lightx2v/Minimax-h3-Turbo/resolve/main/minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors)
7 | minimax_h3_video_vae_fp16.safetensors | 5.21 GB |[点此下载](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors)

{% note warning %}
Kaggle服务器可直连HuggingFace，Notebook内拉取无需翻墙；推荐电脑本地下载完成后再上传Dataset。本教程仅用于学习，商用前核对模型许可协议。
{% endnote %}

<!-- RELATED-LINKS -->
## 延伸阅读

<ul style="line-height:2;">
<li><a href="/posts/kaggle-minimax-h3/">MiniMax-H3 生视频</a> —— 单段视频的生成方式</li>
<li><a href="/posts/kaggle-comfyui-flux1/">ComfyUI 生图流程</a> —— 分镜图从哪来</li>
</ul>
<!-- /RELATED-LINKS -->

<!-- OPPBOTTOM -->
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

<div style="text-align:center;margin:24px 0">
  <img src="https://imgbed-446.pages.dev/file/1795052387427__6855688.jpg" alt="扫码咨询 AI 出图与短视频代做" style="width:240px;border-radius:10px" loading="lazy" decoding="async">
  <p style="margin:8px 0 0;color:#8a6a52;font-size:13px">扫码说清要什么，我先报价再动手</p>
</div>

## 常见问题

**Q：没有独立显卡，跟着这篇能跑通吗？**
A：能。全流程都在 Kaggle 的免费 GPU 上跑，本地只需要浏览器。

**Q：免费额度够用吗？**
A：日常出图够，批量出片会排队。要稳定批量，见上面「代做」。

**Q：代做和这篇教程有什么区别？**
A：教程是你自己学会；代做是直接拿成品。两者不冲突，很多人先下单要成品，再回来学流程。

## 接着看

- [MiniMax-H3 基础版：免费跑 AI 视频](/posts/kaggle-minimax-h3/)
- [ComfyUI 免费 GPU 出图全流程](/posts/kaggle-comfyui-flux1/)
- [宁都果园实录：这些图最后用在哪](/orange/)
