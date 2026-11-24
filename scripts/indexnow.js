/*!
 * indexnow.js —— IndexNow 主动推送（Bing / Yandex / Seznam 秒级收录）
 *
 * 两件事：
 *   1) 生成站点根目录的 key 文件：/<KEY>.txt（内容是 KEY 本身），用于证明站点归属
 *   2) 每次 hexo generate 完成后，把全站 URL 推送给 https://api.indexnow.org/indexnow
 *
 * 放在仓库根目录 scripts/ 下。Cloudflare Pages 构建时会自动执行。
 * 想临时关闭：设置环境变量 INDEXNOW_DISABLE=1
 */

'use strict';

const https = require('https');

const KEY = '2b392000db016e65781ad8141d5dd62a';
const KEY_PATH = KEY + '.txt';
const ENDPOINT_HOST = 'api.indexnow.org';
const ENDPOINT_PATH = '/indexnow';

// 额外页（不在 posts 里但值得收录的）
const EXTRA_PATHS = ['about/', 'orange/', 'tutorial/', 'archives/', 'tags/', 'categories/'];

/* ---------- 1. 生成 key 文件 ---------- */
hexo.extend.generator.register('indexnow_keyfile', function () {
  return [{
    path: KEY_PATH,
    data: KEY
  }];
});

/* ---------- 2. 构建完成后推送 ---------- */
function postJSON(payload, cb) {
  const body = JSON.stringify(payload);
  const req = https.request({
    host: ENDPOINT_HOST,
    path: ENDPOINT_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body)
    },
    timeout: 8000
  }, function (res) {
    let data = '';
    res.on('data', function (c) { data += c; });
    res.on('end', function () { cb(null, res.statusCode, data); });
  });
  req.on('error', function (e) { cb(e); });
  req.on('timeout', function () { req.destroy(); cb(new Error('timeout')); });
  req.write(body);
  req.end();
}

hexo.extend.filter.register('after_generate', function () {
  if (process.env.INDEXNOW_DISABLE === '1') {
    hexo.log.info('[indexnow] 已通过环境变量关闭');
    return;
  }

  const base = String(hexo.config.url || '').replace(/\/+$/, '');
  if (!/^https?:\/\//.test(base)) {
    hexo.log.warn('[indexnow] site url 未配置，跳过推送');
    return;
  }

  const urls = [base + '/'];
  const seen = new Set(urls);

  function push(u) {
    if (!u || seen.has(u)) return;
    seen.add(u);
    urls.push(u);
  }

  // 文章
  const posts = hexo.locals.get ? hexo.locals.get('posts') : null;
  if (posts && posts.forEach) {
    posts.forEach(function (p) {
      let path = String(p.path || '');
      path = path.replace(/index\.html$/i, '');
      push(base + '/' + path.replace(/^\/+/, ''));
    });
  }

  // 固定页
  EXTRA_PATHS.forEach(function (p) { push(base + '/' + p); });

  if (urls.length < 2) {
    hexo.log.warn('[indexnow] 没取到 URL 列表，跳过');
    return;
  }

  const payload = {
    host: base.replace(/^https?:\/\//, ''),
    key: KEY,
    keyLocation: base + '/' + KEY_PATH,
    urlList: urls.slice(0, 10000)
  };

  hexo.log.info('[indexnow] 准备推送 ' + payload.urlList.length + ' 条 URL');

  postJSON(payload, function (err, code, body) {
    if (err) {
      hexo.log.warn('[indexnow] 推送失败（不影响构建）：' + err.message);
      return;
    }
    hexo.log.info('[indexnow] 推送完成，HTTP ' + code + (body ? ' ' + String(body).slice(0, 120) : ''));
  });
});
