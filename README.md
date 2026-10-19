# One Thousand Glimmers

「一个关于夏日江面日光闪烁的全屏生成艺术作品。」

从高处房间的窗台向下望，阳光落在细小的水波上。

无数光点在近乎固定的位置亮起，像很小的烟花，随即隐去；

江面没有停止，光也从不真正重复。

**[进入作品](https://yiyangbear.github.io/One-Thousand-Glimmers/)**

全屏观看，打开声音，然后停留。

## 此刻的水面

- 深蓝灰与青灰色的程序化水面会持续自然演化。
- 细碎微光、局部亮点，以及极少数高亮瞬间依附于同一组水纹与坡度场。
- 太阳方位随可见停留时间缓慢变化，反光带也会在不知不觉间移动。
- 单击会唤醒一小片水纹中的闪斑；按住拖动，会沿手势方向带起一阵克制的微光，随后自然消散。
- 右下角的声音按钮是整个作品的声音总开关，同时控制原创环境音乐与点击、拖动音效。页面始终从安静开始；音乐淡入、淡出，并从暂停位置继续。
- 单击与拖动使用两段原创交互音效，感受隐约可闻的回应。

## Music & Sound

**Original Music & Sound Design by the Creator**

Music composed and produced by the creator of One Thousand Glimmers.

环境音乐与交互音效都是原创作品的一部分。

只有开启右下角的声音总开关后，音乐以及水面交互的声音回应才会生效。

## Glitter Lab

开发面板只在地址包含 `?debug=true` 时出现：

**[打开 Glitter Lab](https://yiyangbear.github.io/One-Thousand-Glimmers/?debug=true)**

它可以实时调整光点、水纹、太阳、辉光、鼠标微风与交互音量。当前参数可以复制为 JSON，也可以一键恢复默认值。交互音效音量范围为 `0–1`；修改会平滑作用于 Web Audio 总线，正在消散的声音也不会发生突兀跳变。

本地地址：<http://127.0.0.1:5173/?debug=true>




## 技术

作品使用 Vite、React、TypeScript、Three.js 与 GLSL 构建。主体是一个全屏 WebGL 场景；音频由独立的 Web Audio 控制器处理，不与渲染循环耦合。

```bash
npm install
npm run dev
```

- 作品：<http://127.0.0.1:5173/>
- Glitter Lab：<http://127.0.0.1:5173/?debug=true>

质量检查：

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

