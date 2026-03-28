chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: true,
    aiProvider: 'openai',
    openai: {
      url: 'https://api.openai.com/v1/chat/completions',
      key: '',
      modelId: 'gpt-3.5-turbo'
    },
    zhipu: {
      key: '',
      modelId: 'glm-4.6v-flash'
    },
    tags: [
      { id: '1', name: '表现优秀', group: '评价等级' },
      { id: '2', name: '表现良好', group: '评价等级' },
      { id: '3', name: '需要改进', group: '评价等级' },
      { id: '4', name: '积极参与', group: '课堂表现' },
      { id: '5', name: '认真听讲', group: '课堂表现' },
      { id: '6', name: '作业完成好', group: '作业情况' },
      { id: '7', name: '作业需改进', group: '作业情况' }
    ],
    tagGroups: ['评价等级', '课堂表现', '作业情况']
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateComment') {
    generateComment(request.tags, request.customInput)
      .then(result => sendResponse({ success: true, comment: result }))
      .catch(error => {
        console.error('Generate comment error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function generateComment(tags, customInput) {
  const settings = await chrome.storage.sync.get(['aiProvider', 'openai', 'zhipu']);

  if (!settings.aiProvider) {
    throw new Error('AI提供商未配置');
  }

  const systemPrompt = `你是一位专业的教育评价助手。请根据提供的标签生成一段恰当的学生评价。
要求：
1. 评价要自然流畅，像老师写的评语，没有人称代词，如"他"、"她"等
2. 结合所有标签的含义，写出连贯的段落
3. 语气要积极正面，即使是"需要改进"也要用建设性的方式表达
4. 评价长度在50-100字左右
5. 不要简单罗列标签，而是融合到评价中`;

  const userPrompt = `请根据以下标签生成学生评价：
标签：${tags.join('、')}
${customInput ? '额外要求：' + customInput : ''}

请直接输出评价内容，不要加任何前缀或说明。`;

  console.log('Generating comment with provider:', settings.aiProvider);
  console.log('Tags:', tags);

  if (settings.aiProvider === 'openai') {
    if (!settings.openai || !settings.openai.key) {
      throw new Error('OpenAI API密钥未配置，请先在扩展选项中配置');
    }
    return await callOpenAI(settings.openai, systemPrompt, userPrompt);
  } else if (settings.aiProvider === 'zhipu') {
    if (!settings.zhipu || !settings.zhipu.key) {
      throw new Error('智谱清言 API密钥未配置，请先在扩展选项中配置');
    }
    return await callZhipu(settings.zhipu, systemPrompt, userPrompt);
  } else {
    throw new Error('未知的AI提供商: ' + settings.aiProvider);
  }
}

async function callOpenAI(config, systemPrompt, userPrompt) {
  const url = config.url || 'https://api.openai.com/v1/chat/completions';
  const model = config.modelId || 'gpt-3.5-turbo';

  console.log('Calling OpenAI API:', url, 'Model:', model);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const responseText = await response.text();
    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      let errorMessage = `API请求失败: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('API返回数据格式异常');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

async function callZhipu(config, systemPrompt, userPrompt) {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const model = config.modelId || 'glm-4.6v-flash';

  console.log('Calling Zhipu API:', url, 'Model:', model);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const responseText = await response.text();
    console.log('Zhipu API response status:', response.status);

    if (!response.ok) {
      let errorMessage = `API请求失败: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('API返回数据格式异常');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Zhipu API error:', error);
    throw error;
  }
}
