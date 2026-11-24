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



<!-- ANSWER-FIRST -->
> **一句话结论**：把 5 张分镜图按时间顺序串成一条 15 秒视频，关键在于每张图的构图连续性和首尾帧对齐。
<!-- /ANSWER-FIRST -->

---

{% note info %}
免费基础版教程：https://jisou.dpdns.org/posts/kaggle-minimax-h3/
基础版仅支持单段3秒视频，本文为进阶一格代码版本。
{% endnote %}

🎬 先看视频 · B站 / YouTube 同一支
视频制作中

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
