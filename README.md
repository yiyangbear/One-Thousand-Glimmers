# One Thousand Glimmers

一个关于夏日江面日光闪烁的全屏生成艺术作品。

作品来自一段真实记忆：从高处的窗台俯视夏日江面，细小水波上的阳光像无数微型烟花，在相对稳定的位置短暂亮起，又悄然消失。

**[观看作品](https://yiyangbear.github.io/One-Thousand-Glimmers/)**

## 作品体验

- 画面会在无人操作时持续、缓慢地自然演化。
- 高光由连续的程序化水面与多尺度闪斑共同生成，并非逐帧随机散布的粒子。
- 移动鼠标可对附近水面施加非常轻微的微风扰动。
- 点击右下角的声音按钮可开启或关闭原创环境音乐；页面加载时默认静音。
- 音乐开启与关闭均使用平滑淡入淡出，再次开启时会从暂停位置继续。

建议全屏观看，并停留几分钟观察局部光点的聚集、呼吸与消散。

## 创作与技术

画面使用 React、TypeScript、Three.js 与 GLSL 构建。主要视觉在单个全屏 WebGL 场景中完成，通过确定性的程序化波面、局部相关闪烁与克制的辉光形成可重复的江面反光。

Glitter Lab 是用于调整视觉参数的开发面板，仅在 URL 包含 `?debug=true` 时显示：

**[打开 Glitter Lab](https://yiyangbear.github.io/One-Thousand-Glimmers/?debug=true)**

调整结果会实时作用于 WebGL 渲染，并可复制为 JSON，方便视觉版本的分享与复现。

## 原创音乐

**Original Music & Sound Design by the Creator**

Music composed and produced by the creator of One Thousand Glimmers.

音乐是作品本身的一部分，由创作者独立编曲、制作并导出，并非第三方背景音乐素材。浏览器只会在用户主动点击声音按钮后加载并播放音频。

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

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会依次执行类型检查、Lint、单元测试和生产构建，通过后自动发布 `dist`。

第一次发布、故障排查和回退步骤见 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

## 已知限制

- 最终自然感与长时间观看舒适度仍需要人工艺术验收。
- 鼠标微风在部分设备上不明显，当前作为实验性、非阻塞功能保留。
- 自适应分辨率会在持续帧率压力下优先降低渲染分辨率，不改变程序化视觉逻辑。
