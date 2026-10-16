# One Thousand Glimmers

一个关于夏日江面日光闪烁的全屏生成艺术作品。画面使用 React、Three.js 与 GLSL 构建，保持自主运行；开发参数面板只在 URL 包含 `?debug=true` 时出现。

**Original Music & Sound Design by the Creator**

原创环境音乐文件应位于 `public/audio/one-thousand-glimmers.mp3`。页面默认静音，右下角的声音开关会在用户主动点击后播放音乐。

## 本地运行

```bash
npm install
npm run dev
```

- 作品：<http://127.0.0.1:5173/>
- Glitter Lab：<http://127.0.0.1:5173/?debug=true>

## 质量检查

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## GitHub Pages

仓库已包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会检查并构建项目，再发布 `dist`。

第一次发布、故障排查和回退步骤见 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

## 已知限制

- 最终自然感与长时间观看舒适度仍需要人工艺术验收。
- 鼠标微风在部分设备上不明显，当前作为实验性、非阻塞功能保留。
- 自适应分辨率会在持续帧率压力下优先降低渲染分辨率，不改变程序化视觉逻辑。
