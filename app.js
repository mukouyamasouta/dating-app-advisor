// ============================================
// Dating App Message Advisor - Main Application
// ============================================

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyAIfR5zX3FzgwfUJ-XgqMLfPyt8pCkpzIg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// State Management
const state = {
    myProfile: null,
    girls: Array(20).fill(null).map((_, i) => ({
        id: i + 1,
        name: '',
        age: '',
        features: '',
        photo: '',
        history: '',
        lastMessage: ''
    })),
    activeTab: 0,
    initialized: false
};

// DOM Elements
const elements = {};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    loadFromStorage();
    initEventListeners();
    renderTabs();
    updateUI();
});

// Initialize DOM Element References
function initElements() {
    elements.setupModal = document.getElementById('setupModal');
    elements.myProfileUpload = document.getElementById('myProfileUpload');
    elements.myImagePreview = document.getElementById('myImagePreview');
    elements.myPhotoInput = document.getElementById('myPhotoInput');
    elements.myName = document.getElementById('myName');
    elements.myAge = document.getElementById('myAge');
    elements.myJob = document.getElementById('myJob');
    elements.myBio = document.getElementById('myBio');
    elements.saveProfileBtn = document.getElementById('saveProfileBtn');
    elements.editProfileBtn = document.getElementById('editProfileBtn');
    elements.myProfileImage = document.getElementById('myProfileImage');
    elements.displayMyName = document.getElementById('displayMyName');
    elements.displayMyDetails = document.getElementById('displayMyDetails');
    elements.displayMyBio = document.getElementById('displayMyBio');
    elements.girlTabs = document.getElementById('girlTabs');
    elements.addTabBtn = document.getElementById('addTabBtn');
    elements.girlImageUpload = document.getElementById('girlImageUpload');
    elements.girlImagePreview = document.getElementById('girlImagePreview');
    elements.girlPhotoInput = document.getElementById('girlPhotoInput');
    elements.girlName = document.getElementById('girlName');
    elements.girlAge = document.getElementById('girlAge');
    elements.girlFeatures = document.getElementById('girlFeatures');
    elements.girlHistory = document.getElementById('girlHistory');
    elements.receivedMessage = document.getElementById('receivedMessage');
    elements.generateBtn = document.getElementById('generateBtn');
    elements.suggestionsSection = document.getElementById('suggestionsSection');
    elements.loadingIndicator = document.getElementById('loadingIndicator');
    elements.suggestionsList = document.getElementById('suggestionsList');
    elements.strategyAdvice = document.getElementById('strategyAdvice');
    elements.adviceText = document.getElementById('adviceText');

    // Screenshot elements
    elements.myScreenshotDropzone = document.getElementById('myScreenshotDropzone');
    elements.myScreenshotInput = document.getElementById('myScreenshotInput');
    elements.myScreenshotPreviews = document.getElementById('myScreenshotPreviews');
    elements.analyzeMyScreenshotsBtn = document.getElementById('analyzeMyScreenshotsBtn');
    elements.girlScreenshotDropzone = document.getElementById('girlScreenshotDropzone');
    elements.girlScreenshotInput = document.getElementById('girlScreenshotInput');
    elements.girlScreenshotPreviews = document.getElementById('girlScreenshotPreviews');
    elements.analyzeGirlScreenshotsBtn = document.getElementById('analyzeGirlScreenshotsBtn');

    // First message elements
    elements.generateFirstMsgBtn = document.getElementById('generateFirstMsgBtn');
    elements.firstMessageResult = document.getElementById('firstMessageResult');
    elements.firstMessageText = document.getElementById('firstMessageText');

    // Category tabs
    elements.suggestionCategories = document.getElementById('suggestionCategories');
}

// Initialize Event Listeners
function initEventListeners() {
    // Profile photo upload
    elements.myProfileUpload.addEventListener('click', () => elements.myPhotoInput.click());
    elements.myPhotoInput.addEventListener('change', handleMyPhotoUpload);

    // Save profile
    elements.saveProfileBtn.addEventListener('click', saveMyProfile);

    // Edit profile
    elements.editProfileBtn.addEventListener('click', showProfileModal);

    // Girl photo upload
    elements.girlImageUpload.addEventListener('click', () => elements.girlPhotoInput.click());
    elements.girlPhotoInput.addEventListener('change', handleGirlPhotoUpload);

    // Girl info auto-save
    elements.girlName.addEventListener('change', saveCurrentGirl);
    elements.girlAge.addEventListener('change', saveCurrentGirl);
    elements.girlFeatures.addEventListener('change', saveCurrentGirl);
    elements.girlHistory.addEventListener('change', saveCurrentGirl);

    // Add tab button
    elements.addTabBtn.addEventListener('click', addNewTab);

    // Generate responses
    elements.generateBtn.addEventListener('click', generateResponses);

    // First message generator
    elements.generateFirstMsgBtn.addEventListener('click', generateFirstMessage);

    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => filterSuggestionsByCategory(tab.dataset.category));
    });

    // Screenshot dropzone events - My Profile
    setupDropzone(elements.myScreenshotDropzone, elements.myScreenshotInput, elements.myScreenshotPreviews, elements.analyzeMyScreenshotsBtn, 'my');

    // Screenshot dropzone events - Girl
    setupDropzone(elements.girlScreenshotDropzone, elements.girlScreenshotInput, elements.girlScreenshotPreviews, elements.analyzeGirlScreenshotsBtn, 'girl');
}

// Load data from localStorage
function loadFromStorage() {
    const savedProfile = localStorage.getItem('myProfile');
    const savedGirls = localStorage.getItem('girls');
    const savedActiveTab = localStorage.getItem('activeTab');

    if (savedProfile) {
        state.myProfile = JSON.parse(savedProfile);
        state.initialized = true;
    }

    if (savedGirls) {
        state.girls = JSON.parse(savedGirls);
    }

    if (savedActiveTab !== null) {
        state.activeTab = parseInt(savedActiveTab, 10);
    }
}

// Save to localStorage
function saveToStorage() {
    localStorage.setItem('myProfile', JSON.stringify(state.myProfile));
    localStorage.setItem('girls', JSON.stringify(state.girls));
    localStorage.setItem('activeTab', state.activeTab.toString());
}

// Handle my photo upload
async function handleMyPhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imgData = event.target.result;
            elements.myImagePreview.innerHTML = `<img src="${imgData}" alt="Profile">`;

            // Show analyzing status
            showAnalyzingStatus(elements.myImagePreview);

            // Analyze image with Gemini Vision
            try {
                const extractedInfo = await analyzeProfileImage(imgData, 'my');
                if (extractedInfo) {
                    // Auto-fill extracted info
                    if (extractedInfo.name && !elements.myName.value) {
                        elements.myName.value = extractedInfo.name;
                    }
                    if (extractedInfo.age && !elements.myAge.value) {
                        elements.myAge.value = extractedInfo.age;
                    }
                    if (extractedInfo.job && !elements.myJob.value) {
                        elements.myJob.value = extractedInfo.job;
                    }
                    if (extractedInfo.bio) {
                        elements.myBio.value = (elements.myBio.value ? elements.myBio.value + '\n' : '') + extractedInfo.bio;
                    }
                    showExtractedNotice(elements.myImagePreview, '情報を抽出しました');
                }
            } catch (error) {
                console.error('Image analysis error:', error);
                hideAnalyzingStatus(elements.myImagePreview);
            }

            if (state.myProfile) {
                state.myProfile.photo = imgData;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Handle girl photo upload
async function handleGirlPhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imgData = event.target.result;
            elements.girlImagePreview.innerHTML = `<img src="${imgData}" alt="Girl">`;
            state.girls[state.activeTab].photo = imgData;
            saveToStorage();
            renderTabs();

            // Show analyzing status
            showAnalyzingStatus(elements.girlImagePreview);

            // Analyze image with Gemini Vision
            try {
                const extractedInfo = await analyzeProfileImage(imgData, 'girl');
                if (extractedInfo) {
                    // Auto-fill extracted info
                    if (extractedInfo.name && !elements.girlName.value) {
                        elements.girlName.value = extractedInfo.name;
                    }
                    if (extractedInfo.age && !elements.girlAge.value) {
                        elements.girlAge.value = extractedInfo.age;
                    }
                    if (extractedInfo.features) {
                        elements.girlFeatures.value = (elements.girlFeatures.value ? elements.girlFeatures.value + '\n' : '') + extractedInfo.features;
                    }
                    if (extractedInfo.history) {
                        elements.girlHistory.value = (elements.girlHistory.value ? elements.girlHistory.value + '\n' : '') + extractedInfo.history;
                    }

                    // Save the updated data
                    saveCurrentGirl();
                    showExtractedNotice(elements.girlImagePreview, '情報を抽出しました');
                }
            } catch (error) {
                console.error('Image analysis error:', error);
                hideAnalyzingStatus(elements.girlImagePreview);
            }
        };
        reader.readAsDataURL(file);
    }
}

// Save my profile
function saveMyProfile() {
    const name = elements.myName.value.trim();
    const age = elements.myAge.value;
    const job = elements.myJob.value.trim();
    const bio = elements.myBio.value.trim();

    if (!name) {
        alert('名前を入力してください');
        return;
    }

    // Get photo from preview
    const imgElement = elements.myImagePreview.querySelector('img');
    const photo = imgElement ? imgElement.src : '';

    state.myProfile = { name, age, job, bio, photo };
    state.initialized = true;

    saveToStorage();
    hideProfileModal();
    updateMyProfileDisplay();
}

// Show profile modal
function showProfileModal() {
    elements.setupModal.classList.remove('hidden');
    if (state.myProfile) {
        elements.myName.value = state.myProfile.name || '';
        elements.myAge.value = state.myProfile.age || '';
        elements.myJob.value = state.myProfile.job || '';
        elements.myBio.value = state.myProfile.bio || '';
        if (state.myProfile.photo) {
            elements.myImagePreview.innerHTML = `<img src="${state.myProfile.photo}" alt="Profile">`;
        }
    }
}

// Hide profile modal
function hideProfileModal() {
    elements.setupModal.classList.add('hidden');
}

// Update my profile display
function updateMyProfileDisplay() {
    if (state.myProfile) {
        elements.displayMyName.textContent = state.myProfile.name || '未設定';
        elements.displayMyDetails.textContent =
            `${state.myProfile.age ? state.myProfile.age + '歳' : ''} ${state.myProfile.job || ''}`.trim() || '-';
        elements.displayMyBio.textContent = state.myProfile.bio || '-';

        if (state.myProfile.photo) {
            elements.myProfileImage.innerHTML = `<img src="${state.myProfile.photo}" alt="Profile">`;
        } else {
            elements.myProfileImage.innerHTML = '<span>📷</span>';
        }
    }
}

// Render tabs
function renderTabs() {
    elements.girlTabs.innerHTML = '';

    // Find tabs with data
    const activeTabs = state.girls.map((girl, index) => ({
        index,
        hasData: girl.name || girl.photo
    }));

    // Always show at least 3 tabs
    const tabsToShow = Math.max(3, activeTabs.filter(t => t.hasData).length + 1);

    for (let i = 0; i < Math.min(tabsToShow, 20); i++) {
        const girl = state.girls[i];
        const tab = document.createElement('button');
        tab.className = `tab-btn ${i === state.activeTab ? 'active' : ''}`;

        const name = girl.name || `${i + 1}`;
        const icon = girl.photo ? '👩' : '👤';

        tab.innerHTML = `
            <span>${icon}</span>
            <span class="tab-name">${name}</span>
            ${i > 0 ? '<span class="tab-close" onclick="event.stopPropagation(); clearTab(' + i + ')">×</span>' : ''}
        `;

        tab.addEventListener('click', () => switchTab(i));
        elements.girlTabs.appendChild(tab);
    }
}

// Switch tab
function switchTab(index) {
    // Save current girl data first
    saveCurrentGirl();

    state.activeTab = index;
    saveToStorage();
    renderTabs();
    loadCurrentGirl();
    clearSuggestions();
}

// Add new tab
function addNewTab() {
    const currentCount = document.querySelectorAll('.tab-btn').length;
    if (currentCount >= 20) {
        alert('タブは最大20個までです');
        return;
    }

    switchTab(currentCount);
    renderTabs();
}

// Clear tab
window.clearTab = function (index) {
    if (confirm('このタブをクリアしますか？')) {
        state.girls[index] = {
            id: index + 1,
            name: '',
            age: '',
            features: '',
            photo: '',
            history: '',
            lastMessage: ''
        };
        saveToStorage();

        if (state.activeTab === index) {
            loadCurrentGirl();
        }
        renderTabs();
    }
};

// Save current girl data
function saveCurrentGirl() {
    const girl = state.girls[state.activeTab];
    girl.name = elements.girlName.value.trim();
    girl.age = elements.girlAge.value;
    girl.features = elements.girlFeatures.value.trim();
    girl.history = elements.girlHistory.value.trim();
    saveToStorage();
    renderTabs();
}

// Load current girl data
function loadCurrentGirl() {
    const girl = state.girls[state.activeTab];
    elements.girlName.value = girl.name || '';
    elements.girlAge.value = girl.age || '';
    elements.girlFeatures.value = girl.features || '';
    elements.girlHistory.value = girl.history || '';
    elements.receivedMessage.value = girl.lastMessage || '';

    if (girl.photo) {
        elements.girlImagePreview.innerHTML = `<img src="${girl.photo}" alt="Girl">`;
    } else {
        elements.girlImagePreview.innerHTML = '<span class="upload-icon">👩</span>';
    }
}

// Clear suggestions
function clearSuggestions() {
    elements.suggestionsList.innerHTML = '';
    elements.strategyAdvice.style.display = 'none';
}

// Generate responses using Gemini API
async function generateResponses() {
    const message = elements.receivedMessage.value.trim();

    if (!message) {
        alert('相手からのメッセージを入力してください');
        return;
    }

    // Save the message
    state.girls[state.activeTab].lastMessage = message;
    saveToStorage();

    // Show loading
    elements.loadingIndicator.style.display = 'block';
    elements.suggestionsList.innerHTML = '';
    elements.strategyAdvice.style.display = 'none';

    try {
        const girl = state.girls[state.activeTab];
        const myProfile = state.myProfile || {};

        // Build context
        const context = buildContext(myProfile, girl, message);

        // Call Gemini API
        const response = await callGeminiAPI(context);

        // Display results
        displaySuggestions(response);

    } catch (error) {
        console.error('API Error:', error);
        displayFallbackSuggestions(message);
    } finally {
        elements.loadingIndicator.style.display = 'none';
    }
}

// Build context for API
function buildContext(myProfile, girl, message) {
    let context = `【相手からのメッセージ】\n${message}\n\n`;

    if (girl.name || girl.features) {
        context += `【相手の情報】\n`;
        if (girl.name) context += `名前: ${girl.name}\n`;
        if (girl.age) context += `年齢: ${girl.age}歳\n`;
        if (girl.features) context += `特徴: ${girl.features}\n`;
        context += '\n';
    }

    if (girl.history) {
        context += `【これまでの会話】\n${girl.history}\n\n`;
    }

    if (myProfile.name || myProfile.bio) {
        context += `【自分の情報】\n`;
        if (myProfile.name) context += `名前: ${myProfile.name}\n`;
        if (myProfile.job) context += `職業: ${myProfile.job}\n`;
        if (myProfile.bio) context += `特徴: ${myProfile.bio}\n`;
    }

    return context;
}

// Call Gemini API with expanded response format
async function callGeminiAPI(userContext) {
    const expandedPrompt = `あなたはマッチングアプリの返信アドバイザーです。以下の情報に基づいて、11種類の返信候補を生成してください。

【返信を生成する際の基本方針】
- 短文（1〜2行）が基本だが、タイプによっては長めでもOK
- 絵文字は控えめに使用（1〜2個程度）
- 相手の名前は使わないか、使っても1回まで
- 追撃LINE禁止：返信がなければ放置

【生成する11種類の返信】
1. PDF1基盤（マッチングアプリと恋愛におけるメッセージ戦略）: 非モテLINEを避け、あっさり戦略を意識した返信
2. PDF2基盤（モテ戦略：ようしゅチャンネルの戦術）: Push & Pull、緩急、高価値男性像を意識した返信
3. 共感型: 相手の感情に寄り添う優しい返信
4. ウィット型: 軽いノリや笑いを誘う返信
5. クロージング型: 次のアクション（デートや連絡先交換）に繋げる返信
6. LINE例1: ホストの会話テクニックを参考にしたカジュアルな返信
7. LINE例2: 相手を持ち上げつつも余裕を見せる返信
8. LINE例3: 短くてもインパクトのある返信
9. 統合版: 全ての要素を最もバランス良く組み合わせたベストな返信

以下のJSON形式で出力してください:
{
    "responses": [
        {"type": "pdf1", "label": "PDF1基盤", "text": "返信内容"},
        {"type": "pdf2", "label": "PDF2基盤", "text": "返信内容"},
        {"type": "empathy", "label": "共感型", "text": "返信内容"},
        {"type": "wit", "label": "ウィット型", "text": "返信内容"},
        {"type": "closing", "label": "クロージング型", "text": "返信内容"},
        {"type": "line1", "label": "LINE例1", "text": "返信内容"},
        {"type": "line2", "label": "LINE例2", "text": "返信内容"},
        {"type": "line3", "label": "LINE例3", "text": "返信内容"},
        {"type": "combined", "label": "統合ベスト", "text": "返信内容"}
    ],
    "advice": "この状況での戦略アドバイス（2〜3文）"
}

${userContext}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: expandedPrompt
            }]
        }],
        generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 2048
        }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
}

// Generate first message for new match
async function generateFirstMessage() {
    const girl = state.girls[state.activeTab];

    if (!girl.name && !girl.features) {
        alert('相手の情報を入力してください（名前や特徴など）');
        return;
    }

    elements.generateFirstMsgBtn.disabled = true;
    elements.generateFirstMsgBtn.textContent = '生成中...';
    elements.firstMessageResult.style.display = 'none';

    try {
        const myProfile = state.myProfile || {};
        const prompt = buildFirstMessagePrompt(myProfile, girl);

        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 1024
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        // Extract message from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            elements.firstMessageText.textContent = result.message || text;
        } else {
            elements.firstMessageText.textContent = text;
        }

        elements.firstMessageResult.style.display = 'block';

    } catch (error) {
        console.error('First message error:', error);
        elements.firstMessageText.textContent = generateFallbackFirstMessage(girl);
        elements.firstMessageResult.style.display = 'block';
    } finally {
        elements.generateFirstMsgBtn.disabled = false;
        elements.generateFirstMsgBtn.innerHTML = '<span class="btn-icon">💌</span> 初手メッセージを生成';
    }
}

// Build first message prompt
function buildFirstMessagePrompt(myProfile, girl) {
    return `あなたはマッチングアプリの返信アドバイザーです。マッチしたばかりの相手に送る最初のメッセージを作成してください。

【重要なポイント】
- 相手のプロフィールに触れる（共通点や興味を持った点）
- 質問で終わる（会話のきっかけを作る）
- 長すぎず短すぎない（3〜5文程度）
- 誠実さを感じさせつつも軽さも持たせる
- 「いいねありがとうございます」だけで終わらない

【相手の情報】
${girl.name ? `名前: ${girl.name}` : ''}
${girl.age ? `年齢: ${girl.age}歳` : ''}
${girl.features ? `特徴・プロフィール: ${girl.features}` : ''}

【自分の情報】
${myProfile.name ? `名前: ${myProfile.name}` : ''}
${myProfile.age ? `年齢: ${myProfile.age}歳` : ''}
${myProfile.job ? `職業: ${myProfile.job}` : ''}
${myProfile.bio ? `自己紹介: ${myProfile.bio}` : ''}

以下のJSON形式で出力:
{"message": "初手メッセージの内容"}`;
}

// Fallback first message
function generateFallbackFirstMessage(girl) {
    const templates = [
        `マッチありがとうございます！プロフィール見て気になってました☺️\n${girl.features ? girl.features.split('\n')[0] + 'って素敵ですね！' : ''}\nよかったら仲良くしてください！`,
        `はじめまして！いいねありがとうございます✨\n${girl.name ? girl.name + 'さんの' : ''}プロフィール見て共通点ありそうだなって思いました！\nぜひお話しましょう😊`,
        `こんにちは！マッチ嬉しいです！\n${girl.features ? girl.features.split('\n')[0] + 'にすごく興味あります！' : 'プロフィール素敵ですね！'}\nよかったら色々教えてください☺️`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

// Copy first message
window.copyFirstMessage = function () {
    const text = elements.firstMessageText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.btn-copy-first');
        btn.textContent = '✓ コピー済み';
        setTimeout(() => { btn.textContent = '📋 コピー'; }, 2000);
    });
};

// Filter suggestions by category
function filterSuggestionsByCategory(category) {
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });

    // Filter cards
    const cards = elements.suggestionsList.querySelectorAll('.suggestion-card');
    cards.forEach(card => {
        const type = card.dataset.type;
        let show = false;

        if (category === 'all') {
            show = true;
        } else if (category === 'pdf1') {
            show = type === 'pdf1';
        } else if (category === 'pdf2') {
            show = type === 'pdf2';
        } else if (category === 'types') {
            show = ['empathy', 'wit', 'closing'].includes(type);
        } else if (category === 'line') {
            show = ['line1', 'line2', 'line3'].includes(type);
        } else if (category === 'combined') {
            show = type === 'combined';
        }

        card.style.display = show ? 'block' : 'none';
    });
}

// Display suggestions
function displaySuggestions(result) {
    elements.suggestionsList.innerHTML = '';

    if (result.responses && Array.isArray(result.responses)) {
        // Show category tabs
        elements.suggestionCategories.style.display = 'flex';

        result.responses.forEach((response, index) => {
            const card = createSuggestionCard(response, index);
            elements.suggestionsList.appendChild(card);
        });

        // Reset category filter to 'all'
        filterSuggestionsByCategory('all');
    }

    if (result.advice) {
        elements.adviceText.textContent = result.advice;
        elements.strategyAdvice.style.display = 'block';
    }
}

// Create suggestion card
function createSuggestionCard(response, index) {
    const typeLabels = {
        pdf1: 'PDF1基盤',
        pdf2: 'PDF2基盤',
        empathy: '共感型',
        wit: 'ウィット型',
        closing: 'クロージング型',
        line1: 'LINE例1',
        line2: 'LINE例2',
        line3: 'LINE例3',
        combined: '統合ベスト'
    };

    const typeColors = {
        pdf1: 'pdf1',
        pdf2: 'pdf2',
        empathy: 'empathy',
        wit: 'wit',
        closing: 'closing',
        line1: 'line',
        line2: 'line',
        line3: 'line',
        combined: 'combined'
    };

    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.dataset.type = response.type;

    const label = response.label || typeLabels[response.type] || response.type;
    const colorClass = typeColors[response.type] || 'default';
    const escapedText = response.text.replace(/'/g, "\\'").replace(/\n/g, '\\n');

    card.innerHTML = `
        <div class="suggestion-header">
            <span class="suggestion-number">${index + 1}</span>
            <span class="suggestion-type ${colorClass}">${label}</span>
        </div>
        <div class="suggestion-text">${response.text}</div>
        <button class="btn-copy" onclick="copyToClipboard(this, '${escapedText}')">
            📋 コピー
        </button>
    `;
    return card;
}

// Display fallback suggestions (when API fails)
function displayFallbackSuggestions(message) {
    const kb = window.KNOWLEDGE_BASE;
    const examples = kb.hostExamples;

    // Simple pattern matching
    let suggestions = [];

    if (message.includes('ありがとう') || message.includes('楽しかった')) {
        suggestions = [
            { type: 'empathy', text: 'こちらこそ♡ 楽しかった(smile)' },
            { type: 'wit', text: 'ねー！また行こ笑' },
            { type: 'closing', text: '楽しかった！次いつ会える？' }
        ];
    } else if (message.includes('どう') || message.includes('？')) {
        suggestions = [
            { type: 'empathy', text: 'いいね！そうしよ☺️' },
            { type: 'wit', text: 'おっけー！笑' },
            { type: 'closing', text: 'いいじゃん！じゃあそれで♡' }
        ];
    } else if (message.includes('忙しい') || message.includes('疲れ')) {
        suggestions = [
            { type: 'empathy', text: '無理せずね( ^ω^ )' },
            { type: 'wit', text: '大変そう！頑張って♡' },
            { type: 'closing', text: '落ち着いたら教えて☺️' }
        ];
    } else {
        suggestions = [
            { type: 'empathy', text: 'わかる！いいよね☺️' },
            { type: 'wit', text: 'それな笑' },
            { type: 'closing', text: 'いいね！また話そ♡' }
        ];
    }

    displaySuggestions({
        responses: suggestions,
        advice: kb.corePrinciples[Math.floor(Math.random() * kb.corePrinciples.length)]
    });
}

// Copy to clipboard
window.copyToClipboard = function (button, text) {
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = '✓ コピー済み';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = '📋 コピー';
            button.classList.remove('copied');
        }, 2000);
    });
};

// Update UI based on state
function updateUI() {
    if (!state.initialized) {
        showProfileModal();
    } else {
        hideProfileModal();
        updateMyProfileDisplay();
    }
    loadCurrentGirl();
}

// ============================================
// Image Analysis with Gemini Vision API
// ============================================

// Analyze profile image using Gemini Vision (Enhanced)
async function analyzeProfileImage(imageData, type) {
    // Extract base64 data from data URL
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(';')[0].split(':')[1];

    const prompt = type === 'my'
        ? `この画像はマッチングアプリの自分のプロフィールまたはスクリーンショットです。
画像から読み取れる情報を可能な限り詳細に抽出してください。

【抽出のポイント】
- 名前: 「ゆう」「そうた」「れん」などのニックネームや名前っぽい文字列を探す
- 年齢: 数字で書かれている年齢（例：25歳、26）
- 職業: 仕事や職種に関する記述
- 趣味: サッカー、映画、旅行、音楽など趣味と思われるキーワード
- 特徴: 性格、好きなこと、休日の過ごし方など
- 顔写真: 画像の中に人物の顔写真が含まれているかどうか（プロフィール写真として使えそうな部分）

以下のJSON形式で出力してください（読み取れない項目はnullにしてください）：
{
    "name": "名前（ニックネーム）",
    "age": 年齢（数字のみ、なければnull）,
    "job": "職業",
    "hobbies": "趣味（複数あればカンマ区切り）",
    "bio": "自己紹介文や特徴など読み取れる情報全て",
    "hasFacePhoto": true/false（人物の顔写真が含まれているかどうか）,
    "facePhotoArea": "顔写真がある場合、その位置の説明（例：画面上部にプロフィール写真あり）"
}`
        : `この画像はマッチングアプリの相手のプロフィールまたはトーク画面のスクリーンショットです。
画像から読み取れる情報を可能な限り詳細に抽出してください。

【抽出のポイント】
- 名前: 「あやか」「みゆ」「ゆい」などのニックネームや名前っぽい文字列を探す
- 年齢: 数字で書かれている年齢（例：23歳、24）
- 趣味: カフェ、旅行、料理、ヨガなど趣味と思われるキーワード
- 職業: 仕事や職種に関する記述（看護師、OL、美容師など）
- 特徴: 見た目、性格、好きなタイプなど
- トーク内容: LINEやメッセージ画面の場合、会話の内容を要約
- 顔写真: 画像の中に人物の顔写真が含まれているかどうか

以下のJSON形式で出力してください（読み取れない項目はnullにしてください）：
{
    "name": "名前（ニックネーム）",
    "age": 年齢（数字のみ、なければnull）,
    "job": "職業",
    "hobbies": "趣味（複数あればカンマ区切り）",
    "features": "見た目の特徴、性格、好きなタイプなど読み取れる情報全て",
    "history": "トーク内容が含まれていれば、会話の要約",
    "hasFacePhoto": true/false（人物の顔写真が含まれているかどうか）
}`;

    const requestBody = {
        contents: [{
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                {
                    text: prompt
                }
            ]
        }],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500
        }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    return null;
}

// Show analyzing status overlay
function showAnalyzingStatus(container) {
    const overlay = document.createElement('div');
    overlay.className = 'analyzing-overlay';
    overlay.innerHTML = `
        <div class="analyzing-spinner"></div>
        <span>解析中...</span>
    `;
    container.style.position = 'relative';
    container.appendChild(overlay);
}

// Hide analyzing status
function hideAnalyzingStatus(container) {
    const overlay = container.querySelector('.analyzing-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Show extracted notice
function showExtractedNotice(container, message) {
    hideAnalyzingStatus(container);
    const notice = document.createElement('div');
    notice.className = 'extracted-notice';
    notice.innerHTML = `<span>✓ ${message}</span>`;
    container.appendChild(notice);

    setTimeout(() => {
        notice.remove();
    }, 3000);
}

// ============================================
// Multiple Screenshot Upload & Analysis
// ============================================

// Temporary storage for screenshots
const screenshotData = {
    my: [],
    girl: []
};

// Setup dropzone events
function setupDropzone(dropzone, input, previewContainer, analyzeBtn, type) {
    if (!dropzone) return;

    // Click to open file dialog
    dropzone.addEventListener('click', () => input.click());

    // Drag and drop events
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleScreenshotFiles(e.dataTransfer.files, previewContainer, analyzeBtn, type);
    });

    // File input change
    input.addEventListener('change', (e) => {
        handleScreenshotFiles(e.target.files, previewContainer, analyzeBtn, type);
    });

    // Analyze button click
    analyzeBtn.addEventListener('click', () => {
        analyzeAllScreenshots(type, previewContainer, analyzeBtn);
    });
}

// Handle selected screenshot files - Auto analyze immediately
async function handleScreenshotFiles(files, previewContainer, analyzeBtn, type) {
    for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        const imgData = await readFileAsDataURL(file);
        screenshotData[type].push(imgData);
        const previewItem = addScreenshotPreview(imgData, previewContainer, type);

        // Auto-analyze immediately
        previewItem.classList.add('analyzing');

        try {
            const info = await analyzeProfileImage(imgData, type);
            if (info) {
                // Auto-fill form fields immediately
                autoFillFormFields(info, type, imgData);
                previewItem.classList.remove('analyzing');
                previewItem.classList.add('done');
            }
        } catch (error) {
            console.error('Auto-analyze error:', error);
            previewItem.classList.remove('analyzing');
        }
    }
}

// Read file as data URL (Promise wrapper)
function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// Auto-fill form fields based on extracted info
function autoFillFormFields(info, type, imgData) {
    if (type === 'my') {
        // Auto-fill my profile fields
        if (info.name && !elements.myName.value) {
            elements.myName.value = info.name;
        }
        if (info.age && !elements.myAge.value) {
            elements.myAge.value = info.age;
        }
        if (info.job && !elements.myJob.value) {
            elements.myJob.value = info.job;
        }

        // Build bio from hobbies and other info
        let bioText = '';
        if (info.hobbies) bioText += `趣味: ${info.hobbies}\n`;
        if (info.bio) bioText += info.bio;
        if (bioText && !elements.myBio.value) {
            elements.myBio.value = bioText.trim();
        } else if (bioText) {
            elements.myBio.value = (elements.myBio.value + '\n' + bioText).trim();
        }

        // Set face photo as profile icon
        if (info.hasFacePhoto) {
            elements.myImagePreview.innerHTML = `<img src="${imgData}" alt="Profile">`;
            if (state.myProfile) {
                state.myProfile.photo = imgData;
            }
        }

    } else {
        // Auto-fill girl profile fields
        if (info.name && !elements.girlName.value) {
            elements.girlName.value = info.name;
        }
        if (info.age && !elements.girlAge.value) {
            elements.girlAge.value = info.age;
        }

        // Build features from job, hobbies, and other info
        let featuresText = '';
        if (info.job) featuresText += `職業: ${info.job}\n`;
        if (info.hobbies) featuresText += `趣味: ${info.hobbies}\n`;
        if (info.features) featuresText += info.features;
        if (featuresText) {
            elements.girlFeatures.value = (elements.girlFeatures.value ? elements.girlFeatures.value + '\n' : '') + featuresText.trim();
        }

        // Add conversation history
        if (info.history) {
            elements.girlHistory.value = (elements.girlHistory.value ? elements.girlHistory.value + '\n' : '') + info.history;
        }

        // Set face photo as girl's profile icon
        if (info.hasFacePhoto && !state.girls[state.activeTab].photo) {
            elements.girlImagePreview.innerHTML = `<img src="${imgData}" alt="Girl">`;
            state.girls[state.activeTab].photo = imgData;
        }

        // Save updated girl data
        saveCurrentGirl();
    }
}

// Add screenshot preview
function addScreenshotPreview(imgData, container, type) {
    const index = screenshotData[type].length - 1;
    const item = document.createElement('div');
    item.className = 'screenshot-preview-item';
    item.dataset.index = index;
    item.innerHTML = `
        <img src="${imgData}" alt="Screenshot">
        <button class="remove-btn" onclick="removeScreenshot(${index}, '${type}', this.parentElement)">×</button>
    `;
    container.appendChild(item);
    return item;  // Return the element for status tracking
}

// Remove screenshot
window.removeScreenshot = function (index, type, element) {
    screenshotData[type][index] = null; // Mark as removed
    element.remove();

    // Hide analyze button if no screenshots left
    const remaining = screenshotData[type].filter(s => s !== null).length;
    const analyzeBtn = type === 'my' ? elements.analyzeMyScreenshotsBtn : elements.analyzeGirlScreenshotsBtn;
    if (remaining === 0) {
        analyzeBtn.style.display = 'none';
    }
};

// Analyze all screenshots
async function analyzeAllScreenshots(type, previewContainer, analyzeBtn) {
    const screenshots = screenshotData[type].filter(s => s !== null);
    if (screenshots.length === 0) return;

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '解析中...';

    // Mark all previews as analyzing
    const items = previewContainer.querySelectorAll('.screenshot-preview-item');
    items.forEach(item => item.classList.add('analyzing'));

    let combinedInfo = {
        name: null,
        age: null,
        job: null,
        bio: '',
        features: '',
        history: ''
    };

    // Analyze each screenshot
    for (let i = 0; i < screenshots.length; i++) {
        try {
            const info = await analyzeProfileImage(screenshots[i], type);
            if (info) {
                // Merge info (first non-null value wins for single fields)
                if (info.name && !combinedInfo.name) combinedInfo.name = info.name;
                if (info.age && !combinedInfo.age) combinedInfo.age = info.age;
                if (info.job && !combinedInfo.job) combinedInfo.job = info.job;

                // Append for text fields
                if (info.bio) combinedInfo.bio += (combinedInfo.bio ? '\n' : '') + info.bio;
                if (info.features) combinedInfo.features += (combinedInfo.features ? '\n' : '') + info.features;
                if (info.history) combinedInfo.history += (combinedInfo.history ? '\n' : '') + info.history;
            }

            // Mark this item as done
            if (items[i]) {
                items[i].classList.remove('analyzing');
                items[i].classList.add('done');
            }
        } catch (error) {
            console.error(`Error analyzing screenshot ${i}:`, error);
            if (items[i]) {
                items[i].classList.remove('analyzing');
            }
        }
    }

    // Apply extracted info to form
    if (type === 'my') {
        if (combinedInfo.name && !elements.myName.value) elements.myName.value = combinedInfo.name;
        if (combinedInfo.age && !elements.myAge.value) elements.myAge.value = combinedInfo.age;
        if (combinedInfo.job && !elements.myJob.value) elements.myJob.value = combinedInfo.job;
        if (combinedInfo.bio) {
            elements.myBio.value = (elements.myBio.value ? elements.myBio.value + '\n' : '') + combinedInfo.bio;
        }
    } else {
        if (combinedInfo.name && !elements.girlName.value) elements.girlName.value = combinedInfo.name;
        if (combinedInfo.age && !elements.girlAge.value) elements.girlAge.value = combinedInfo.age;
        if (combinedInfo.features) {
            elements.girlFeatures.value = (elements.girlFeatures.value ? elements.girlFeatures.value + '\n' : '') + combinedInfo.features;
        }
        if (combinedInfo.history) {
            elements.girlHistory.value = (elements.girlHistory.value ? elements.girlHistory.value + '\n' : '') + combinedInfo.history;
        }
        saveCurrentGirl();
    }

    // Reset button
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '🔍 スクショを解析して情報を抽出';

    // Show success message
    alert('スクリーンショットの解析が完了しました！\n抽出した情報が自動入力されました。');

    // Clear screenshots
    screenshotData[type] = [];
    previewContainer.innerHTML = '';
    analyzeBtn.style.display = 'none';
}
