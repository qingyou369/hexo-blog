title: 0元白嫖AI生视频 · Kaggle免费GPU跑MiniMax-H3完整流程
cover: 'https://picsum.photos/800/400'
top_img: 'https://picsum.photos/1400/450'
tags:
  - AI视频
  - Kaggle
  - ComfyUI
  - MiniMax-H3
categories:
  - 教程
description: 全程0费用，本地无需安装配置，利用Kaggle免费GPU运行MiniMax-H3，实现音视频同步口播生成，突破磁盘容量限制。
comments: true
toc: true
copyright: true
nanoid: S8MnBad3
date: 2026-11-18 13:49:00
updated: 2026-11-18 13:49:00
---
faq:
  - q: "Kaggle 免费 GPU 能跑 MiniMax-H3 吗，需要多少显存？"
    a: "可以跑。按文中配置关闭梯度并启用半精度即可；显存不足时优先降分辨率和生成时长，而不是换卡。"
  - q: "一次会话能生成多长的视频？"
    a: "受 GPU 时长和单次推理长度双重限制，建议单条控制在 15 秒以内，长视频拆段生成后拼接。"
  - q: "运行报显存不足怎么办？"
    a: "先降分辨率与帧数，再关掉并行和缓存优化；仍报错说明会话已被回收，重开 Notebook 重新分配 GPU。"

{% note info %}
本文配套一键包，全程不花一分钱。本地电脑0配置、0安装。
{% endnote %}

🎬 先看视频（B站 / YouTube 同一支视频）
视频待制作上传中

国内访问B站链接，海外访问YouTube链接。视频详细讲解32GB模型装进19.5GB磁盘的核心操作，文字版补充细节。

## 为什么写这篇？
之前的 FLUX.1 教程模型仅1.3GB，Kaggle 19.5GB磁盘可以轻松存放。
MiniMax-H3 不一样：它支持**视频+音频同步生成，人物嘴型和声音匹配**，整套模型合计32.02GB：

## 📥 5 个模型下载地址

| 文件 | 大小 | 作用 |下载地址|
| ---- | ---- | ---- |----|
| MiniMax-H3-Ref2VA-Pruned-Q4_K_M.gguf | 11.56 GB | H3 主模型（视频+音频） |[下载地址](https://huggingface.co/Abiray/MiniMax-H3-Pruned-GGUF/resolve/main/MiniMax-H3-Ref2VA-Pruned-Q4_K_M.gguf)
| Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-IQ4_XS.gguf | 13.44 GB | 文本编码器 |[下载地址](https://huggingface.co/nif0/Qwen3-VL-32B-Instruct-MiniMax-H3-GGUF/resolve/main/Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-IQ4_XS.gguf)
| Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-mmproj-BF16.gguf | 1.20 GB | 视觉投影 |[下载地址](https://huggingface.co/nif0/Qwen3-VL-32B-Instruct-MiniMax-H3-GGUF/resolve/main/Qwen3-VL-32B-Instruct-MiniMax-H3-L0-49-mmproj-BF16.gguf)
| minimax_h3_video_vae_fp16.safetensors | 5.21 GB | 视频 VAE |[下载地址](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors)
| minimax_h3_audio_vae_fp32.safetensors | 605.25 MB | 音频 VAE |[下载地址](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors)
| 合计 | 32.02 GB | - |

32GB模型无法直接放入19.5GB的Notebook磁盘，这是大部分人失败的卡点。
本方案解决思路：模型上传为 Kaggle Dataset 挂载，**不占用Notebook本地磁盘**。
> 
> 提示：Kaggle 服务器可直连 HuggingFace，Notebook 内下载不需要翻墙；推荐电脑本地下载后再上传 Dataset。

## 本帖解决什么
✅ 突破 Kaggle 19.5 GB 磁盘限制（Dataset挂载 + 软链接）
✅ 一键包下载，不用手动抄写代码
✅ 自动开启隧道、节点自检、锁定ComfyUI版本，避免更新报错
✅ 全程0元（GPU每周免费30小时，Dataset存储免费）

## 3步完整流程
### Step 1：注册 Kaggle
打开 https://www.kaggle.com/ 注册，完全免费。
无需绑卡，邮箱或者Google账号即可注册。

💡 提示：首次开启GPU时会要求手机号验证，**国内+86手机号支持验证**，验证后解锁免费GPU。

### Step 2：5个模型上传为Dataset（核心步骤）
模型存放在Dataset，不占用Notebook磁盘，不受19.5GB限制。
1. Kaggle右上角 → `Datasets` → `+ New Dataset`
2. 名称建议：`minimaxh3`，可见性选择 `Private`（私有）
3. 上传上面列出的5个模型文件，**文件名必须完全一致，大小写敏感**
4. 上传完成 → `New Version` → 勾选 `Make dataset available`，开启挂载权限

⚠️ 耗时提示：32GB文件上传速度取决于宽带，建议夜间上传。

### Step 3：新建Notebook运行脚本
1. `New Notebook` → `Add Input`，选中你刚上传的Dataset
2. `Settings` → `Accelerator` 选择 `GPU T4×2`，`Internet` 打开
3. 新建代码单元格，粘贴 `1.Kaggle一键运行.py`
4. 修改第7行，替换为你自己的数据集地址 `用户名/minimaxh3`
5. 点击 `Run All`，等待5-10分钟，脚本输出公网访问链接

💡 兜底机制：即使地址填写错误，脚本会自动扫描 `/kaggle/input` 目录识别模型。

## 📥 一键包下载
🔗 https://tools.zaihouse.com/downloads/minimax-h3-kaggle.zip
右键另存为下载，避免复制长脚本丢行报错。
```

minimax-h3-kaggle/
├── 1.Kaggle 一键运行.py            粘贴进 Notebook 代码单元格
├── 2.H3 工作流_参考图生视频.json    ComfyUI 导入工作流
└── 3. 使用说明.txt                  完整步骤 + 常见问题

```

## 脚本自动处理的功能
✅ 自动扫描 `/kaggle/input` 兜底识别模型
✅ 锁定适配H3节点的ComfyUI版本，防止自动升级崩溃
✅ 使用软链接挂载模型，不复制文件、不占用本地磁盘
✅ 保留Kaggle自带CUDA、PyTorch，规避版本冲突
✅ 自动修复标注兼容BUG
✅ 拉起Cloudflare隧道，输出公网访问地址
✅ 启动自检7个核心节点，缺失节点直接提示

## 核心逻辑
```python
# 1) Dataset路径，修改这里
DATA = Path('/kaggle/input/datasets/你的用户名/minimaxh3')
# 2) 软链接，仅建立映射，不复制文件
for folder, names in FILES.items():
    for name in names:
        (COMFY/'models'/folder/name).symlink_to(DATA/name)
# 3) 启动服务 + 开启临时隧道
server = Popen([python, 'main.py', '--listen', '127.0.0.1', '--port', port, ...])
proxy  = Popen([cloudflared, 'tunnel', '--url', f'http://127.0.0.1:{port}'])
```

> 
> 原理：Dataset 挂载目录 `/kaggle/input` 只读，不占用 Notebook 磁盘；复制文件会占用空间导致磁盘爆满，软链接只是指向源文件。

## 🎬 跑通之后操作

1. 脚本输出 `trycloudflare.com` 链接，浏览器打开
2. `Load Workflow`，导入 `2.H3工作流_参考图生视频.json`
3. `LoadImage` 节点上传参考图，优先选择清晰正脸照片
4. 填写提示词，点击 `Queue Prompt` 开始生成
5. 视频输出目录：`ComfyUI/output/`

默认参数（首次运行直接使用）

- 分辨率：512 × 288
- 帧数：73
- 采样步数：12
- 输出文件：`H3_口播_第一段.mp4`（视频 + 音频一体）

> 
> 参考图作用：锁定人物五官、发型、服装、背景机位，图片越清晰，生成效果越稳定。

## 资源成本对比

表格

| 资源 | 工具 | 费用 |
| --- | --- | --- |
| 云端 GPU | Kaggle T4×2 | 免费 |
| 模型存储 | Kaggle Private Dataset | 免费 |
| AI 视频模型 | MiniMax-H3 开源权重 | 免费 |
| 工作流引擎 | ComfyUI | 免费 |
| 公网隧道 | Cloudflare Tunnel | 免费 |
| 教程 + 脚本 | 本文 | 免费 |

对比商用平台：

- Runway Gen-4：15 美元 / 月
- Pika：8 美元 / 月
- 可灵 Kling：几十元起
- Kaggle 方案：0 元

> 
> 区别：商用平台是封装网页；Kaggle 是完整 GPU 环境，自由度更高，可以跑任意开源模型。

## 常见问题

Q：为什么不直接在 Notebook 下载模型，非要传 Dataset？
A：可以直接下载，但 32GB 极易打满 19.5GB 磁盘，脚本自带直连兜底，稳定性很差。

Q：Dataset 有容量上限吗？
A：私有 Dataset 免费存储，容量足够存放 32GB 模型。

Q：免费 GPU 额度够不够？
A：每周 30 小时 GPU，**同一时间只能运行一个 Notebook**，和之前 FLUX 教程的 Notebook 会抢占额度。

Q：生成一条视频要多久？
A：T4 显卡，73 帧 512×288，耗时几分钟到十几分钟，建议先用默认参数测试。

Q：为什么脚本固定 ComfyUI 版本？
A：H3 自定义节点依赖特定版本，自动升级后节点失效，是踩坑总结。

Q：这个模型可以商用吗？
A：以 MiniMax 官方最新协议为准，商用前自行核验 License。

Q：手机能不能跑？
A：不支持，需要电脑操作 Kaggle Notebook。

{% note warning %}
免责声明：教程仅用于学习。0 元不等于无限制，Kaggle 存在速率、额度限制；模型版权许可需要使用者自行确认，商用请提前核查。
{% endnote %}