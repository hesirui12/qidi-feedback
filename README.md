# AI辅助评价 - Chrome浏览器扩展

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./manifest.json)
[![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
[![Chrome](https://img.shields.io/badge/chrome-88+-orange.svg)](https://www.google.com/chrome/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](./LICENSE)

[English Document](README_EN.md) | 中文文档

## 简介

AI辅助评价是一款专为启迪教育平台(www.qidi-edu.com)设计的Chrome浏览器扩展。该扩展利用人工智能技术，帮助教师快速生成学生评价，提升教学工作效率。

## 版本信息

- **当前版本**：v1.0.0
- **Manifest版本**：v3
- **最后更新**：2026年3月28日

## 技术栈

- **核心语言**：JavaScript (ES6+)
- **浏览器扩展**：Chrome Extension Manifest V3
- **前端技术**：HTML5, CSS3
- **AI接口**：OpenAI API / 智谱清言 API
- **存储**：Chrome Storage Sync API

## 功能特点

- **AI智能生成评价**：基于选择的标签，自动生成自然流畅的学生评语
- **支持多种AI提供商**：支持OpenAI和智谱清言两种AI服务
- **标签管理系统**：可自定义评价标签和标签组，灵活组织评价维度
- **一键操作**：在输入框聚焦时自动弹出评价面板，操作便捷
- **个性化配置**：支持自定义AI模型参数和API配置

## 安装方法

### 方式一：Chrome应用商店（推荐）

1. 访问Chrome网上应用店
2. 搜索"AI辅助评价"
3. 点击"添加至Chrome"

### 方式二：开发者模式安装

1. 下载本扩展的源代码
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本扩展所在的文件夹

## 使用说明

### 首次配置

1. 安装扩展后，点击浏览器工具栏上的扩展图标
2. 点击"选项"进入设置页面
3. 选择AI提供商（OpenAI或智谱清言）
4. 填写对应的API密钥和模型配置
5. 保存设置

### 使用评价功能

1. 访问启迪教育平台(www.qidi-edu.com)
2. 在需要填写评价的文本框中点击聚焦
3. 会自动弹出"AI辅助评价"面板
4. 选择相应的标签或标签组
5. 可选：输入额外要求
6. 点击"生成评价"按钮
7. 生成的评价会自动填入输入框

### 标签管理

在扩展选项页面中，您可以：
- 添加、删除、编辑评价标签
- 创建和管理标签组
- 将标签归类到不同的评价维度

## 配置说明

### OpenAI配置

- **API地址**：OpenAI API的URL（默认：https://api.openai.com/v1/chat/completions）
- **API密钥**：您的OpenAI API密钥
- **模型ID**：使用的模型（如：gpt-3.5-turbo）

### 智谱清言配置

- **API密钥**：您的智谱清言API密钥
- **模型ID**：使用的模型（如：glm-4.6v-flash）

## 隐私说明

- 本扩展仅在启迪教育平台(www.qidi-edu.com)上运行
- 您的API密钥仅存储在本地浏览器中，不会上传到任何服务器
- 评价内容通过您配置的AI服务商API生成，请遵守相应服务商的隐私政策

## 系统要求

- Chrome浏览器 88+ 或基于Chromium的浏览器
- 需要网络连接以调用AI服务

## 技术支持

如有问题或建议，请通过以下方式联系我们：
- 提交Issue
- 发送邮件至：[您的邮箱]

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 免责声明

使用本扩展即表示您同意我们的[免责声明](DISCLAIMER.md)。

## 用户协议

使用本扩展前，请仔细阅读[用户协议](USER_AGREEMENT.md)。

---

**注意**：本扩展为第三方工具，与启迪教育平台官方无关。
