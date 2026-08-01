# 朋友服务器部署

这个版本不依赖外部登录平台。邮箱和加密后的密码、跨设备存档都保存在服务器自己的 SQLite 数据库中；未登录用户的完整数据始终保存在浏览器本地。

## 要求

- Node.js 22.13 或更新版本
- 建议使用 Nginx、Caddy 等提供 HTTPS，并转发到本服务

## 启动

```text
npm run build
node self-host/server.mjs
```

如果拿到的是已经构建好的扁平文件夹（根目录里直接有 `index.html`、`app.js`、`worker.js`），不需要再次构建，直接运行第二行即可。

默认监听 `127.0.0.1:3000`，数据库保存在 `data/kotonoha.sqlite`。可以通过环境变量修改：

```text
HOST=127.0.0.1
PORT=3000
DATABASE_PATH=/srv/kotonoha/data/kotonoha.sqlite
STATIC_DIR=/srv/kotonoha/dist/client
```

反向代理必须保留 `Host`，并发送 `X-Forwarded-Proto: https`，这样登录 Cookie 才会在 HTTPS 下安全工作。请定期备份 SQLite 数据库文件。
