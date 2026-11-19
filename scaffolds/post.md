---
title: 这里填文章标题
date: 2026-11-19
updated: 2026-11-19
cover: https://picsum.photos/800/400 #替换本篇封面图
top_img: false
tags:
  - 赣南脐橙
  - 宁都脐橙
categories:
  - 赣南脐橙专栏
description: 简短SEO摘要，概括本文内容
comments: true
toc: true
copyright: true
keywords: 长尾关键词1,长尾关键词2,宁都赣南脐橙
---

{% note primary %}
🍊宁都自家果园｜摘要提示
{% endnote %}

{% gallery %}
https://xxx替换实拍图1.webp
https://xxx替换实拍图2.webp
https://xxx替换实拍图3.webp
{% endgallery %}

## 一级小标题
正文内容

### 二级小标题
- 列表项1
- 列表项2

{% folding green, 折叠标题 %}
折叠内容
{% endfolding %}

## 📌 推荐阅读
- [🍊赣南脐橙｜宁都果园专栏](/pages/orange/)
- [文章A标题](/posts/xxx)
- [文章B标题](/posts/xxx)

{% note success %}
脐橙相关疑问，可在评论区留言咨询🍊
{% endnote %}

<!-- 咨询按钮，全站统一 -->
{% btn 'javascript:;',点击查看咨询方式,anzhiyu-icon-wechat,block %}
<div id="wx-orange-qrcode" style="display:none;text-align:center;padding:16px 0;">
<img src="https://imgbed-446.pages.dev/file/1795052387427__6855688.jpg" style="width:260px;">
<p>扫码咨询宁都赣南脐橙、价格与发货</p>
</div>
<script>
document.querySelector('#wx-orange-qrcode').previousElementSibling.onclick=()=>{
  const dom=document.getElementById("wx-orange-qrcode");
  dom.style.display = dom.style.display === 'none' ? 'block' : 'none';
}
</script>

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Article",
  "headline":"这里填文章标题",
  "author":{
    "@type":"Person",
    "name":"宁都自家赣南脐橙果园"
  },
  "datePublished":"2026-11-19",
  "dateModified":"2026-11-19",
  "description":"和上面description保持一致",
  "image":"https://xxx替换本篇封面图.webp",
  "publisher":{
    "@type":"LocalBusiness",
    "name":"宁都自家赣南脐橙果园"
  }
}
</script>
