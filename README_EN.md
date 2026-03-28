# AI Feedback Assistant - Chrome Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./manifest.json)
[![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chrome](https://img.shields.io/badge/chrome-88+-orange.svg)](https://www.google.com/chrome/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](./LICENSE)

[中文文档](README.md) | English Document

## Introduction

AI Feedback Assistant is a Chrome browser extension designed specifically for the Qidi Education platform (www.qidi-edu.com). This extension leverages artificial intelligence technology to help teachers quickly generate student feedback, improving teaching efficiency.

## Version Information

- **Current Version**: v1.0.0
- **Manifest Version**: v3
- **Last Updated**: March 28, 2026

## Tech Stack

- **Core Language**: JavaScript (ES6+)
- **Browser Extension**: Chrome Extension Manifest V3
- **Frontend Technologies**: HTML5, CSS3
- **AI APIs**: OpenAI API / Zhipu AI API
- **Storage**: Chrome Storage Sync API

## Features

- **AI-Powered Feedback Generation**: Automatically generates natural and fluent student comments based on selected tags
- **Multiple AI Providers**: Supports both OpenAI and Zhipu AI services
- **Tag Management System**: Customize feedback tags and tag groups to organize evaluation dimensions flexibly
- **One-Click Operation**: Automatically displays the feedback panel when focusing on input fields, making operation convenient
- **Personalized Configuration**: Supports custom AI model parameters and API configurations

## Installation

### Method 1: Chrome Web Store (Recommended)

1. Visit the Chrome Web Store
2. Search for "AI Feedback Assistant"
3. Click "Add to Chrome"

### Method 2: Developer Mode Installation

1. Download the source code of this extension
2. Open Chrome browser and visit `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked extension"
5. Select the folder containing this extension

## Usage Instructions

### Initial Setup

1. After installing the extension, click the extension icon in the browser toolbar
2. Click "Options" to enter the settings page
3. Select an AI provider (OpenAI or Zhipu AI)
4. Fill in the corresponding API key and model configuration
5. Save the settings

### Using the Feedback Feature

1. Visit the Qidi Education platform (www.qidi-edu.com)
2. Click to focus on the text box where you need to enter feedback
3. The "AI Feedback Assistant" panel will automatically pop up
4. Select the appropriate tags or tag groups
5. Optional: Enter additional requirements
6. Click the "Generate Feedback" button
7. The generated feedback will be automatically filled into the input box

### Tag Management

In the extension options page, you can:
- Add, delete, and edit feedback tags
- Create and manage tag groups
- Categorize tags into different evaluation dimensions

## Configuration Guide

### OpenAI Configuration

- **API URL**: OpenAI API URL (default: https://api.openai.com/v1/chat/completions)
- **API Key**: Your OpenAI API key
- **Model ID**: The model to use (e.g., gpt-3.5-turbo)

### Zhipu AI Configuration

- **API Key**: Your Zhipu AI API key
- **Model ID**: The model to use (e.g., glm-4.6v-flash)

## Privacy Statement

- This extension only runs on the Qidi Education platform (www.qidi-edu.com)
- Your API keys are stored only in your local browser and will not be uploaded to any server
- Feedback content is generated through the API of your configured AI service provider; please comply with the privacy policy of the respective service provider

## System Requirements

- Chrome browser 88+ or Chromium-based browsers
- Internet connection required to call AI services

## Technical Support

If you have any questions or suggestions, please contact us through the following methods:
- Submit an Issue
- Send an email to: jcsyhesirui@126.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Disclaimer

By using this extension, you agree to our [Disclaimer](DISCLAIMER.md).

## User Agreement

Before using this extension, please read the [User Agreement](USER_AGREEMENT.md) carefully.

---

**Note**: This extension is a third-party tool and is not affiliated with the Qidi Education platform.
