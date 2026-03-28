document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

let currentTags = [];
let currentGroups = [];
let currentGroup = '';

function loadSettings() {
  chrome.storage.sync.get([
    'enabled',
    'aiProvider',
    'openai',
    'zhipu',
    'tags',
    'tagGroups'
  ], (result) => {
    document.getElementById('enabledToggle').checked = result.enabled !== false;

    const provider = result.aiProvider || 'openai';
    document.querySelector(`input[name="aiProvider"][value="${provider}"]`).checked = true;
    toggleProviderSection(provider);

    if (result.openai) {
      document.getElementById('openaiUrl').value = result.openai.url || '';
      document.getElementById('openaiKey').value = result.openai.key || '';
      document.getElementById('openaiModel').value = result.openai.modelId || '';
    }

    if (result.zhipu) {
      document.getElementById('zhipuKey').value = result.zhipu.key || '';
      document.getElementById('zhipuModel').value = result.zhipu.modelId || '';
    }

    currentTags = result.tags || [];
    currentGroups = result.tagGroups || [];

    renderGroupList();
    renderTagGroupSelect();
    renderTagList();
    updateConfigSummary(result);
  });
}

function setupEventListeners() {
  document.querySelectorAll('input[name="aiProvider"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      toggleProviderSection(e.target.value);
    });
  });

  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  document.getElementById('testOpenAIBtn').addEventListener('click', () => testAIConnection('openai'));
  document.getElementById('testZhipuBtn').addEventListener('click', () => testAIConnection('zhipu'));

  document.getElementById('addTagBtn').addEventListener('click', addNewTag);
  document.getElementById('newTagInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNewTag();
  });

  document.getElementById('addGroupBtn').addEventListener('click', addNewGroup);
  document.getElementById('newGroupInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNewGroup();
  });

  document.getElementById('tagGroupSelect').addEventListener('change', (e) => {
    currentGroup = e.target.value;
    renderTagList();
  });
}

function toggleProviderSection(provider) {
  document.getElementById('openaiSection').classList.toggle('active', provider === 'openai');
  document.getElementById('zhipuSection').classList.toggle('active', provider === 'zhipu');
}

function updateConfigSummary(settings) {
  const summaryEl = document.getElementById('configSummary');
  const contentEl = document.getElementById('configSummaryContent');

  const provider = settings.aiProvider || 'openai';
  let config = null;

  if (provider === 'openai' && settings.openai) {
    config = settings.openai;
  } else if (provider === 'zhipu' && settings.zhipu) {
    config = settings.zhipu;
  }

  if (!config || !config.key) {
    summaryEl.style.display = 'block';
    summaryEl.className = 'config-summary error';
    contentEl.innerHTML = '<div style="color: #ff4d4f;">⚠️ AI配置不完整，请配置API密钥</div>';
    return;
  }

  summaryEl.style.display = 'block';
  summaryEl.className = 'config-summary';

  const providerName = provider === 'openai' ? 'OpenAI格式' : '智谱清言';
  const keyMasked = config.key ? config.key.substring(0, 6) + '****' + config.key.substring(config.key.length - 4) : '未设置';

  contentEl.innerHTML = `
    <div class="config-item">
      <span class="config-label">提供商:</span>
      <span class="config-value">${providerName}</span>
    </div>
    <div class="config-item">
      <span class="config-label">模型:</span>
      <span class="config-value">${config.modelId || '未设置'}</span>
    </div>
    <div class="config-item">
      <span class="config-label">API密钥:</span>
      <span class="config-value">${keyMasked}</span>
    </div>
    ${provider === 'openai' ? `
    <div class="config-item">
      <span class="config-label">API地址:</span>
      <span class="config-value">${config.url || '未设置'}</span>
    </div>
    ` : ''}
  `;
}

async function testAIConnection(provider) {
  const statusEl = document.getElementById(provider === 'openai' ? 'openaiTestStatus' : 'zhipuTestStatus');
  const btnEl = document.getElementById(provider === 'openai' ? 'testOpenAIBtn' : 'testZhipuBtn');

  let config = {};

  if (provider === 'openai') {
    config = {
      url: document.getElementById('openaiUrl').value.trim(),
      key: document.getElementById('openaiKey').value.trim(),
      modelId: document.getElementById('openaiModel').value.trim()
    };
  } else {
    config = {
      key: document.getElementById('zhipuKey').value.trim(),
      modelId: document.getElementById('zhipuModel').value.trim()
    };
  }

  if (!config.key) {
    showTestStatus(statusEl, '请先输入API密钥', 'error');
    return;
  }

  if (provider === 'openai' && !config.url) {
    showTestStatus(statusEl, '请先输入API地址', 'error');
    return;
  }

  btnEl.disabled = true;
  showTestStatus(statusEl, '测试中...', 'testing');

  try {
    const result = await sendTestRequest(provider, config);
    showTestStatus(statusEl, '✓ 连接成功', 'success');
  } catch (error) {
    showTestStatus(statusEl, '✗ ' + error.message, 'error');
  } finally {
    btnEl.disabled = false;
  }
}

function showTestStatus(element, message, type) {
  element.textContent = message;
  element.className = 'test-status ' + type;
}

async function sendTestRequest(provider, config) {
  const testPrompt = '你好，请回复"测试成功"两个字。';

  if (provider === 'openai') {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: config.modelId || 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: testPrompt }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }

    return await response.json();
  } else {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: config.modelId || 'glm-4.6v-flash',
        messages: [
          { role: 'user', content: testPrompt }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }

    return await response.json();
  }
}

function renderGroupList() {
  const container = document.getElementById('groupList');
  container.innerHTML = currentGroups.map((group, index) => `
    <div class="group-item">
      <span class="group-name">${group}</span>
      <div class="group-actions">
        <button class="btn btn-secondary" onclick="editGroup(${index})">编辑</button>
        <button class="btn btn-danger" onclick="deleteGroup(${index})">删除</button>
      </div>
    </div>
  `).join('');
}

function renderTagGroupSelect() {
  const select = document.getElementById('tagGroupSelect');
  select.innerHTML = '<option value="">默认分组</option>' +
    currentGroups.map(group => `<option value="${group}">${group}</option>`).join('');
  if (currentGroup) {
    select.value = currentGroup;
  }
}

function renderTagList() {
  const container = document.getElementById('tagList');
  const filteredTags = currentGroup
    ? currentTags.filter(tag => tag.group === currentGroup)
    : currentTags.filter(tag => !tag.group || !currentGroups.includes(tag.group));

  container.innerHTML = filteredTags.map((tag, index) => `
    <span class="tag-item">
      ${tag.name}
      <span class="remove" onclick="deleteTag('${tag.id}')">&times;</span>
    </span>
  `).join('');

  if (filteredTags.length === 0) {
    container.innerHTML = '<span style="color: #999; font-size: 13px;">暂无标签</span>';
  }
}

function addNewTag() {
  const input = document.getElementById('newTagInput');
  const name = input.value.trim();

  if (!name) {
    showStatus('请输入标签名称', 'error');
    return;
  }

  if (currentTags.some(tag => tag.name === name)) {
    showStatus('标签已存在', 'error');
    return;
  }

  const newTag = {
    id: Date.now().toString(),
    name: name,
    group: currentGroup || undefined
  };

  currentTags.push(newTag);
  input.value = '';
  renderTagList();
  showStatus('标签添加成功', 'success');
}

function deleteTag(tagId) {
  currentTags = currentTags.filter(tag => tag.id !== tagId);
  renderTagList();
}

function addNewGroup() {
  const input = document.getElementById('newGroupInput');
  const name = input.value.trim();

  if (!name) {
    showStatus('请输入标签组名称', 'error');
    return;
  }

  if (currentGroups.includes(name)) {
    showStatus('标签组已存在', 'error');
    return;
  }

  currentGroups.push(name);
  input.value = '';
  renderGroupList();
  renderTagGroupSelect();
  showStatus('标签组添加成功', 'success');
}

function editGroup(index) {
  const newName = prompt('请输入新的标签组名称:', currentGroups[index]);
  if (newName && newName.trim() && !currentGroups.includes(newName.trim())) {
    const oldName = currentGroups[index];
    currentGroups[index] = newName.trim();

    currentTags.forEach(tag => {
      if (tag.group === oldName) {
        tag.group = newName.trim();
      }
    });

    if (currentGroup === oldName) {
      currentGroup = newName.trim();
    }

    renderGroupList();
    renderTagGroupSelect();
    renderTagList();
    showStatus('标签组修改成功', 'success');
  }
}

function deleteGroup(index) {
  if (!confirm('确定要删除这个标签组吗？该组下的标签将变为未分组。')) {
    return;
  }

  const groupName = currentGroups[index];
  currentGroups.splice(index, 1);

  currentTags.forEach(tag => {
    if (tag.group === groupName) {
      delete tag.group;
    }
  });

  if (currentGroup === groupName) {
    currentGroup = '';
  }

  renderGroupList();
  renderTagGroupSelect();
  renderTagList();
  showStatus('标签组删除成功', 'success');
}

function saveSettings() {
  const enabled = document.getElementById('enabledToggle').checked;
  const aiProvider = document.querySelector('input[name="aiProvider"]:checked').value;

  const openai = {
    url: document.getElementById('openaiUrl').value.trim(),
    key: document.getElementById('openaiKey').value.trim(),
    modelId: document.getElementById('openaiModel').value.trim()
  };

  const zhipu = {
    key: document.getElementById('zhipuKey').value.trim(),
    modelId: document.getElementById('zhipuModel').value.trim()
  };

  if (aiProvider === 'openai' && (!openai.url || !openai.key)) {
    showStatus('请完整填写OpenAI配置信息', 'error');
    return;
  }

  if (aiProvider === 'zhipu' && !zhipu.key) {
    showStatus('请填写智谱清言API密钥', 'error');
    return;
  }

  chrome.storage.sync.set({
    enabled,
    aiProvider,
    openai,
    zhipu,
    tags: currentTags,
    tagGroups: currentGroups
  }, () => {
    showStatus('设置保存成功', 'success');
    updateConfigSummary({ aiProvider, openai, zhipu });
  });
}

function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;

  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}
