/**
 * scripts/indexnow.js
 * 部署完成后自动向 IndexNow（Bing / Yandex / Naver 等）提交 URL。
 * IndexNow 提交后 Bing 通常 10 分钟–2 小时收录，而 ChatGPT Search / Copilot 的检索池来自 Bing。
 *
 * 准备：
 *  1. 随便生成一个 32 位十六进制 key，例如：
 *     node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
 *  2. _config.yml：
 *     seo_enhance:
 *       indexnow:
 *         key: 你的32位key
 *         enabled: true
 *  3. 本脚本会自动发布 /<key>.txt 校验文件，无需手动上传。
 */

'use strict';

const https = require('https');
const SITE = (hexo.config.url || '').replace(/\/+$/, '');
const IN = (hexo.config.seo_enhance && hexo.config.seo_enhance.indexnow) || {};
const KEY = IN.key || '';

hexo.extend.generator.register('indexnow_key', function () {
  if (!KEY) return [];
  return [{ path: KEY + '.txt', data: KEY }];
});

function submit(urls) {
  return new Promise(function (resolve) {
    const body = JSON.stringify({
      host: SITE.replace(/^https?:\/\//, ''),
      key: KEY,
      keyLocation: SITE + '/' + KEY + '.txt',
      urlList: urls
    });
    const req = https.request(
      {
        hostname: 'api.indexnow.org',
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 10000
      },
      function (res) {
        let data = '';
        res.on('data', function (d) { data += d; });
        res.on('end', function () {
          hexo.log.info('[indexnow] HTTP %s %s', res.statusCode, data.slice(0, 120));
          resolve();
        });
      }
    );
    req.on('timeout', function () { req.destroy(); resolve(); });
    req.on('error', function (e) {
      hexo.log.warn('[indexnow] 提交失败：%s', e.message);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

hexo.on('deployAfter', function () {
  if (!IN.enabled || !KEY) return;
  const urls = [];
  hexo.locals.get('posts').sort('-updated').limit(50).forEach(function (p) {
    const path = (p.path || '').replace(/index\.html$/, '');
    urls.push(SITE + '/' + path);
  });
  if (!urls.length) return;
  hexo.log.info('[indexnow] 提交 %s 条 URL', urls.length);
  submit(urls);
});
//（注：内容由AI生成）
