---
title: 0元白嫖AI生图 · Kaggle免费GPU跑ComfyUI完整流程
date: 2026-11-18 15:00:00
updated: 2026-11-18 15:00:00
cover: https://www.dmoe.cc/random.php
top_img: false
tags:
  - AI绘图
  - ComfyUI
  - Kaggle
  - FLUX.1
categories:
  - AI教程
description: 全程零费用，本地电脑零配置零安装零翻墙，利用Kaggle免费T4×2 GPU运行FLUX.1-Schnell，一键部署ComfyUI出图。
comments: true
toc: true
copyright: true
---

{% note info %}
本文配套完整代码+工作流，全程不花一分钱。本地电脑无需安装任何软件，无需翻墙。
{% endnote %}

🎬 先看视频 · B站 / YouTube 同一支
视频制作中

两支为同一视频，国内打开B站链接，海外打开YouTube链接，文字版补充实操细节。

## 为什么写这篇？
花5000元/月订阅Midjourney？没必要。
本地买RTX4090跑大模型？没必要。
付费购买ComfyUI全套工作流？同样不需要花钱。

Kaggle免费提供 **T4×2双显卡、32GB显存**，每周30小时免费GPU时长，足够稳定运行FLUX.1-Schnell批量出图。

## 4步零成本完整流程
### Step 1：注册Kaggle（全程免费）
打开 https://www.kaggle.com/ 注册账号
- 无需绑定银行卡
- 不需要翻墙访问
- 邮箱账号或者Google账号均可直接注册

💡 手机号验证说明：
首次开启GPU会触发手机号核验（防滥用），**国内+86手机号可以正常验证，核验永久有效，不会产生任何扣费**。

### Step 2：新建Notebook，部署ComfyUI
1. 新建 Notebook → 打开设置
2. 加速器选择：GPU T4×2
3. 把Internet网络开关打开
4. 把准备好的Python代码粘贴到代码单元格

Kaggle自带完整Python环境，本地电脑不用配置任何环境。

### Step 3：自动下载FLUX.1模型
Kaggle自带19.5GB本地磁盘，完全放下FLUX.1-Schnell GGUF开源模型。
模型来源：HuggingFace + ModelScope镜像，免Token直连下载，不会出现下载失败。

> 预告：Wan2.1 AI视频教程正在测试，下周上线，后续会和本生图教程合并成一个一键安装包。

### Step 4：启动WebUI，加载工作流出图
脚本自动拉起Cloudflare临时隧道，生成公网访问链接。
1. 浏览器打开trycloudflare访问地址
2. Load Workflow导入生图JSON文件
3. 修改正向、反向提示词
4. 点击Queue Prompt一键生成图片

整套操作全程零花费。

## 零成本资源清单
| 资源项目 | 工具 | 费用 |
| ---- | ---- | ---- |
| 云端GPU | Kaggle T4×2 32GB显存 | 免费 |
| AI绘图模型 | FLUX.1-Schnell GGUF开源权重 | 免费 |
| 绘图引擎 | ComfyUI（MIT开源协议） | 免费 |
| 公网外网隧道 | Cloudflare Tunnel | 免费 |
| 教程+一键代码 | 本文配套资源 | 免费 |

## 费用对比（免费方案碾压付费平台）
| 平台 | 月度费用 |
| ---- | ---- |
| Midjourney | 约70元/月 |
| Adobe Firefly | 约35元/月 |
| Stable Diffusion云平台 | 约140元/月 |
| Kaggle免费方案 | 0元 |

## 📥 完整一键包下载
🔗 下载地址：https://tools.zaihouse.com/downloads/kaggle-v3.zip
右键选择另存为下载，避免复制代码丢行报错。

### 压缩包文件结构
```

kaggle-v3.zip
├── 临时隧道出图.py        ✅ 开箱即用，无需额外配置
└── 2. 自定义域名出图.py    ✅ 长期使用，填入 CF Token 即可绑定自有域名

```

### 两个版本怎么选
| 使用场景 | 选用脚本 |
| ---- | ---- |
| 临时测试、快速跑通流程 | 临时隧道出图.py |
| 长期稳定使用、绑定专属域名 | 自定义域名出图.py |

## 5步实操运行步骤
1. 登录Kaggle账号
2. 新建Notebook，设置：GPU T4×2 + 开启网络
3. 粘贴对应脚本代码
4. 临时隧道版：直接运行单元格，等待5-10分钟生成外网链接
   自定义域名版：先填入MY_CF_TOKEN，再执行运行
5. 浏览器打开Cloudflare链接，导入工作流，修改提示词生成图片

## 适合人群
✅ 想学AI绘图，不想花钱买会员的新手小白
✅ 手里有Kaggle账号，不知道免费GPU怎么用的人
✅ 打算做AI图文副业，预算不足的创作者
✅ 跨境电商卖家，需要批量生成商品主图的从业者

## 常见问题解答
Q：真的全程一分钱不花吗？
A：完全免费，Kaggle免费额度足够日常出图使用。

Q：这套方案可以跑AI视频吗？
A：本文只讲图片生成；视频生成用Wan2.1模型，对应另一篇教程。

Q：模型能不能商用？
A：FLUX.1-Schnell与ComfyUI分别为Apache2.0、MIT开源协议，商用合规。

Q：手机可以操作运行吗？
A：不可以，必须用电脑打开Kaggle Notebook网页端。

{% note warning %}
免责声明：本教程仅限技术学习使用。
零费用不等于无限制，Kaggle存在网络限速与GPU时长配额；商用前请仔细核对模型开源许可协议，一切商业风险由使用者自行承担。
{% endnote %}
