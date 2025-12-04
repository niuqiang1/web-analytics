# 发布到 npm 指南

## 📦 发布前准备

### 1. 更新 package.json 信息

请修改以下字段为您的实际信息：

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/codeless-analytics-sdk.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/codeless-analytics-sdk/issues"
  },
  "homepage": "https://github.com/yourusername/codeless-analytics-sdk#readme"
}
```

### 2. 检查包名是否可用

```bash
npm search codeless-analytics-sdk
```

如果已被占用，需要修改 `package.json` 中的 `name` 字段。

建议的包名格式：
- `@yourusername/codeless-analytics-sdk` (scoped package)
- `your-codeless-analytics-sdk`
- `codeless-analytics-sdk-plus`

### 3. 构建项目

```bash
cd analytics-sdk
npm run build
```

确保 `dist/` 目录下生成了以下文件：
- `analytics.umd.js`
- `analytics.esm.js`

### 4. 测试包内容

查看将要发布的文件：

```bash
npm pack --dry-run
```

这会显示将要包含在 npm 包中的所有文件。

## 🚀 发布步骤

### 步骤 1: 登录 npm

如果还没有 npm 账号，先注册：
```bash
npm adduser
```

如果已有账号，登录：
```bash
npm login
```

输入用户名、密码和邮箱。

### 步骤 2: 验证登录状态

```bash
npm whoami
```

应该显示您的 npm 用户名。

### 步骤 3: 发布包

```bash
cd analytics-sdk
npm publish
```

如果使用 scoped package（@yourusername/package-name），首次发布需要：
```bash
npm publish --access public
```

### 步骤 4: 验证发布

访问 npm 网站查看您的包：
```
https://www.npmjs.com/package/codeless-analytics-sdk
```

或使用命令：
```bash
npm view codeless-analytics-sdk
```

## 📝 版本管理

### 更新版本号

使用 npm 命令自动更新版本：

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 小版本 (1.0.0 -> 1.1.0)
npm version minor

# 大版本 (1.0.0 -> 2.0.0)
npm version major
```

### 发布新版本

```bash
# 1. 更新代码
# 2. 构建
npm run build

# 3. 更新版本
npm version patch

# 4. 发布
npm publish

# 5. 推送 git tag
git push && git push --tags
```

## 🔖 发布标签

### 发布 beta 版本

```bash
npm version prerelease --preid=beta
npm publish --tag beta
```

用户安装：
```bash
npm install codeless-analytics-sdk@beta
```

### 发布 next 版本

```bash
npm publish --tag next
```

### 设置 latest 标签

```bash
npm dist-tag add codeless-analytics-sdk@1.0.0 latest
```

## 📋 发布检查清单

发布前请确认：

- [ ] 已更新 `package.json` 中的作者信息
- [ ] 已更新 `package.json` 中的仓库地址
- [ ] 已运行 `npm run build` 构建项目
- [ ] 已测试构建后的文件
- [ ] 已更新 `README.md` 文档
- [ ] 已更新版本号
- [ ] 已登录 npm 账号
- [ ] 包名未被占用
- [ ] `.npmignore` 配置正确
- [ ] 已测试 `npm pack --dry-run`

## 🚫 撤销发布

如果发布后发现问题，可以在 24 小时内撤销：

```bash
npm unpublish codeless-analytics-sdk@1.0.0
```

**注意**：
- 撤销后 24 小时内不能使用相同版本号重新发布
- 不建议撤销已被使用的版本
- 建议发布新版本修复问题

## 📊 查看包信息

```bash
# 查看包详情
npm view codeless-analytics-sdk

# 查看所有版本
npm view codeless-analytics-sdk versions

# 查看下载统计
npm view codeless-analytics-sdk downloads
```

## 🔧 常见问题

### Q: 包名已被占用怎么办？

A: 使用 scoped package 或修改包名：
```json
{
  "name": "@yourusername/codeless-analytics-sdk"
}
```

### Q: 发布失败提示权限错误？

A: 确保已登录正确的 npm 账号：
```bash
npm logout
npm login
```

### Q: 如何发布私有包？

A: 需要 npm 付费账号，然后：
```bash
npm publish --access restricted
```

### Q: 如何更新包的 README？

A: 更新 README.md 后重新发布新版本即可。

## 📚 相关资源

- [npm 官方文档](https://docs.npmjs.com/)
- [npm 包发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

**准备好后，执行以下命令发布：**

```bash
cd analytics-sdk
npm run build
npm login
npm publish
```

🎉 祝发布成功！
