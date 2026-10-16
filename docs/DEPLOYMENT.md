# GitHub 与 GitHub Pages 发布指南

## 发布前状态

- 默认分支：`main`
- 生产目录：`dist`
- 自动部署工作流：`.github/workflows/deploy-pages.yml`
- 推荐仓库名：`One-Thousand-Glimmers`
- 预期地址：`https://你的用户名.github.io/One-Thousand-Glimmers/`

## 第一次推送

1. 登录 GitHub，右上角选择 **New repository**。
2. Repository name 填写 `One-Thousand-Glimmers`。
3. 选择 Public。不要勾选 README、`.gitignore` 或 License，因为本地项目已经存在提交历史。
4. 创建仓库后，复制页面显示的 HTTPS 地址，例如：

   ```text
   https://github.com/你的用户名/One-Thousand-Glimmers.git
   ```

5. 在本项目目录运行：

   ```bash
   git remote add origin https://github.com/你的用户名/One-Thousand-Glimmers.git
   git push -u origin main
   ```

   GitHub 要求登录时，使用浏览器授权、GitHub CLI，或 Personal Access Token；不要在聊天、截图或仓库文件中保存令牌。

## 开启 Pages

1. 打开 GitHub 仓库。
2. 进入 **Settings → Pages**。
3. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
4. 打开仓库的 **Actions** 标签，选择 **Deploy to GitHub Pages**。
5. 等待所有步骤变绿；完成后部署页面会显示公开地址。

以后每次推送 `main` 都会自动重新检查、构建和发布：

```bash
git add .
git commit -m "描述这次修改"
git push
```

## 验证部署

1. 打开 `https://你的用户名.github.io/One-Thousand-Glimmers/`。
2. 确认不是空白页，浏览器控制台没有资源 404 或 WebGL 错误。
3. 再打开带调试参数的地址：

   ```text
   https://你的用户名.github.io/One-Thousand-Glimmers/?debug=true
   ```

4. 确认 Glitter Lab 可展开、参数可即时改变画面。

## 常见问题

### 页面 404

- 确认仓库名与 URL 中的 `One-Thousand-Glimmers` 完全一致。
- 确认 Settings → Pages 的 Source 是 GitHub Actions。
- 查看 Actions 中失败步骤的日志。

### 页面打开但资源 404 或空白

- 工作流通过 `VITE_BASE_PATH` 构建仓库子路径；不要删除该环境变量。
- 如果仓库改名，重新推送一次即可让工作流使用新仓库名构建。

### Actions 没有运行

- 确认代码已推送到 `main`。
- 在 Actions 页面启用 workflows，或手动选择 **Run workflow**。

## 回退

代码回退优先使用可追踪的新提交：

```bash
git log --oneline
git revert 要撤销的提交哈希
git push
```

不要使用强制推送覆盖公开历史。`git revert` 推送后，Pages 会自动发布回退后的版本。
