let currentContainer = null;
let currentInput = null;
let selectedTags = [];
let allTags = [];
let tagGroups = [];
let isEnabled = true;

const POPUP_INPUT_CLASS = 'ai-feedback-popup-input';
const POPUP_CONTAINER_CLASS = 'ai-feedback-container';

chrome.storage.sync.get(['enabled', 'tags', 'tagGroups'], (result) => {
  isEnabled = result.enabled !== false;
  allTags = result.tags || [];
  tagGroups = result.tagGroups || [];
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    isEnabled = changes.enabled.newValue;
    if (!isEnabled && currentContainer) {
      hideFeedbackUI();
    }
  }
  if (changes.tags) {
    allTags = changes.tags.newValue;
  }
  if (changes.tagGroups) {
    tagGroups = changes.tagGroups.newValue;
  }
});

function isPopupElement(element) {
  if (!element) return false;
  
  if (element.classList && element.classList.contains(POPUP_INPUT_CLASS)) {
    return true;
  }
  
  if (element.closest && element.closest('.' + POPUP_CONTAINER_CLASS)) {
    return true;
  }
  
  return false;
}

document.addEventListener('focusin', (e) => {
  if (!isEnabled) return;
  
  const target = e.target;
  
  if (isPopupElement(target)) {
    return;
  }
  
  if (target.tagName === 'TEXTAREA' || 
      (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'textarea'))) {
    currentInput = target;
    showFeedbackUI(target);
  }
});

document.addEventListener('click', (e) => {
  if (!currentContainer) return;
  
  const target = e.target;
  
  if (isPopupElement(target)) {
    return;
  }
  
  if (currentContainer.contains(target)) {
    return;
  }
  
  if (target === currentInput) {
    return;
  }
  
  const rect = currentInput?.getBoundingClientRect();
  if (rect) {
    const clickX = e.clientX;
    const clickY = e.clientY;
    if (clickX < rect.left || clickX > rect.right || 
        clickY < rect.top - 200 || clickY > rect.bottom + 200) {
      hideFeedbackUI();
    }
  } else {
    hideFeedbackUI();
  }
}, true);

document.addEventListener('mousedown', (e) => {
  if (!currentContainer) return;
  
  if (isPopupElement(e.target)) {
    e.stopPropagation();
  }
}, true);

function showFeedbackUI(inputElement) {
  if (currentContainer) {
    currentContainer.remove();
  }
  
  selectedTags = [];
  
  const container = document.createElement('div');
  container.className = POPUP_CONTAINER_CLASS;
  
  const rect = inputElement.getBoundingClientRect();
  container.style.left = `${rect.left + window.scrollX}px`;
  container.style.top = `${rect.top + window.scrollY - 10}px`;
  container.style.transform = 'translateY(-100%)';
  
  container.innerHTML = `
    <div class="ai-feedback-header">
      <span class="ai-feedback-title">AI辅助评价</span>
      <button class="ai-feedback-close">&times;</button>
    </div>
    <div class="ai-feedback-selector">
      <button class="ai-feedback-selector-btn">
        <span>选择标签或标签组</span>
        <span>▼</span>
      </button>
      <div class="ai-feedback-dropdown" style="display: none;"></div>
    </div>
    <div class="ai-feedback-tags"></div>
    <div class="ai-feedback-add-tag">
      <input type="text" class="ai-feedback-add-input ${POPUP_INPUT_CLASS}" placeholder="添加新标签...">
      <button class="ai-feedback-add-btn">添加</button>
    </div>
    <div class="ai-feedback-input-row">
      <input type="text" class="ai-feedback-input ${POPUP_INPUT_CLASS}" placeholder="输入额外要求（可选）...">
      <button class="ai-feedback-btn">生成评价</button>
    </div>
    <div class="ai-feedback-result-area"></div>
  `;
  
  document.body.appendChild(container);
  currentContainer = container;
  
  setupEventListeners(container);
  setupPopupInputListeners(container);
  renderTags();
}

function setupPopupInputListeners(container) {
  const popupInputs = container.querySelectorAll('.' + POPUP_INPUT_CLASS);
  
  popupInputs.forEach(input => {
    input.addEventListener('focus', (e) => {
      e.stopPropagation();
    }, true);
    
    input.addEventListener('click', (e) => {
      e.stopPropagation();
    }, true);
    
    input.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    }, true);
    
    input.addEventListener('focusin', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, true);
  });
}

function hideFeedbackUI() {
  if (currentContainer) {
    currentContainer.remove();
    currentContainer = null;
    currentInput = null;
    selectedTags = [];
  }
}

function setupEventListeners(container) {
  const closeBtn = container.querySelector('.ai-feedback-close');
  closeBtn.addEventListener('click', hideFeedbackUI);
  
  const selectorBtn = container.querySelector('.ai-feedback-selector-btn');
  const dropdown = container.querySelector('.ai-feedback-dropdown');
  
  selectorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display !== 'none';
    dropdown.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      renderDropdown();
    }
  });
  
  document.addEventListener('click', (e) => {
    if (isPopupElement(e.target)) {
      return;
    }
    if (!container.querySelector('.ai-feedback-selector').contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  
  const addBtn = container.querySelector('.ai-feedback-add-btn');
  const addInput = container.querySelector('.ai-feedback-add-input');
  
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const tagName = addInput.value.trim();
    if (tagName && !selectedTags.includes(tagName)) {
      selectedTags.push(tagName);
      addInput.value = '';
      renderTags();
      
      const newTag = { id: Date.now().toString(), name: tagName, group: '自定义' };
      allTags.push(newTag);
      chrome.storage.sync.set({ tags: allTags });
    }
  });
  
  addInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      addBtn.click();
    }
  });
  
  const generateBtn = container.querySelector('.ai-feedback-btn');
  const customInput = container.querySelector('.ai-feedback-input');
  
  generateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    generateComment(customInput.value);
  });
  
  customInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      generateBtn.click();
    }
  });
  
  container.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  container.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });
}

function renderDropdown() {
  const dropdown = currentContainer.querySelector('.ai-feedback-dropdown');
  let html = '';
  
  tagGroups.forEach(group => {
    const groupTags = allTags.filter(tag => tag.group === group);
    if (groupTags.length > 0) {
      html += `<div class="ai-feedback-dropdown-item ai-feedback-dropdown-group">${group}</div>`;
      groupTags.forEach(tag => {
        html += `<div class="ai-feedback-dropdown-item ai-feedback-dropdown-tag" data-tag="${tag.name}">${tag.name}</div>`;
      });
    }
  });
  
  const ungroupedTags = allTags.filter(tag => !tag.group || !tagGroups.includes(tag.group));
  if (ungroupedTags.length > 0) {
    html += `<div class="ai-feedback-dropdown-item ai-feedback-dropdown-group">其他</div>`;
    ungroupedTags.forEach(tag => {
      html += `<div class="ai-feedback-dropdown-item ai-feedback-dropdown-tag" data-tag="${tag.name}">${tag.name}</div>`;
    });
  }
  
  dropdown.innerHTML = html;
  
  dropdown.querySelectorAll('.ai-feedback-dropdown-tag').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const tagName = item.dataset.tag;
      if (!selectedTags.includes(tagName)) {
        selectedTags.push(tagName);
        renderTags();
      }
      dropdown.style.display = 'none';
    });
  });
}

function renderTags() {
  const tagsContainer = currentContainer.querySelector('.ai-feedback-tags');
  tagsContainer.innerHTML = selectedTags.map(tag => `
    <span class="ai-feedback-tag selected" data-tag="${tag}">${tag}</span>
  `).join('');
  
  tagsContainer.querySelectorAll('.ai-feedback-tag').forEach(tagEl => {
    tagEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const tagName = tagEl.dataset.tag;
      selectedTags = selectedTags.filter(t => t !== tagName);
      renderTags();
    });
  });
}

async function generateComment(customInput) {
  if (selectedTags.length === 0) {
    showError('请至少选择一个标签');
    return;
  }

  const resultArea = currentContainer.querySelector('.ai-feedback-result-area');
  resultArea.innerHTML = '<div class="ai-feedback-loading">正在生成评价...</div>';

  try {
    console.log('Sending generate request with tags:', selectedTags);

    const response = await chrome.runtime.sendMessage({
      action: 'generateComment',
      tags: selectedTags,
      customInput: customInput
    });

    console.log('Received response:', response);

    if (response.success) {
      showResult(response.comment);
    } else {
      showError(response.error || '生成失败，请检查AI配置');
    }
  } catch (error) {
    console.error('Generate comment error:', error);
    showError('请求失败: ' + (error.message || '请检查扩展配置和API设置'));
  }
}

function showResult(comment) {
  const resultArea = currentContainer.querySelector('.ai-feedback-result-area');
  resultArea.innerHTML = `
    <div class="ai-feedback-result">${comment}</div>
    <div class="ai-feedback-result-actions">
      <button class="ai-feedback-copy-btn">复制到输入框</button>
      <button class="ai-feedback-copy-btn" style="margin-left: 8px;">仅复制</button>
    </div>
  `;
  
  const buttons = resultArea.querySelectorAll('.ai-feedback-copy-btn');
  buttons[0].addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentInput) {
      currentInput.value = comment;
      currentInput.dispatchEvent(new Event('input', { bubbles: true }));
      hideFeedbackUI();
    }
  });
  
  buttons[1].addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(comment).then(() => {
      buttons[1].textContent = '已复制!';
      setTimeout(() => {
        buttons[1].textContent = '仅复制';
      }, 1500);
    });
  });
}

function showError(message) {
  const resultArea = currentContainer.querySelector('.ai-feedback-result-area');
  resultArea.innerHTML = `<div class="ai-feedback-error">${message}</div>`;
}
