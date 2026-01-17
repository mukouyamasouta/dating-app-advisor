// ============================================
// Dating App Message Advisor - Main Application
// ============================================

// Gemini API Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Get API key from app state
function getApiKey() {
    return appState.apiKey || '';
}

// Application State
const appState = {
    apiKey: '',
    myProfile: {
        name: '',
        age: '',
        job: '',
        memo: '',
        photo: null,
        attributes: ''
    },
    girls: [],
    selectedGirlIndex: -1,
    selectedPlan: null,
    isProfileSetup: false
};

// DOM Elements Cache
let elements = {};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initElements();
    loadFromStorage();
    initEventListeners();
    updateUI();
});

function initElements() {
    elements = {
        // Screens
        setupScreen: document.getElementById('setupScreen'),
        mainScreen: document.getElementById('mainScreen'),

        // Setup Screen
        myPhotoUploadArea: document.getElementById('myPhotoUploadArea'),
        myPhotoInput: document.getElementById('myPhotoInput'),
        myPhotoPreview: document.getElementById('myPhotoPreview'),
        myName: document.getElementById('myName'),
        myAge: document.getElementById('myAge'),
        myJob: document.getElementById('myJob'),
        myMemo: document.getElementById('myMemo'),
        myScreenshotDropzone: document.getElementById('myScreenshotDropzone'),
        myScreenshotInput: document.getElementById('myScreenshotInput'),
        myScreenshotPreviews: document.getElementById('myScreenshotPreviews'),
        myAnalysisResult: document.getElementById('myAnalysisResult'),
        saveProfileBtn: document.getElementById('saveProfileBtn'),

        // Main Screen - Sidebar
        girlList: document.getElementById('girlList'),
        emptyListMessage: document.getElementById('emptyListMessage'),
        addGirlBtn: document.getElementById('addGirlBtn'),

        // Main Screen - Content Views
        noSelectionView: document.getElementById('noSelectionView'),
        girlFormView: document.getElementById('girlFormView'),
        messageView: document.getElementById('messageView'),

        // Girl Form
        girlName: document.getElementById('girlName'),
        girlMemo: document.getElementById('girlMemo'),
        girlScreenshotDropzone: document.getElementById('girlScreenshotDropzone'),
        girlScreenshotInput: document.getElementById('girlScreenshotInput'),
        girlScreenshotPreviews: document.getElementById('girlScreenshotPreviews'),
        girlAnalysisResult: document.getElementById('girlAnalysisResult'),
        cancelAddGirlBtn: document.getElementById('cancelAddGirlBtn'),
        saveGirlBtn: document.getElementById('saveGirlBtn'),

        // Message View
        selectedGirlAvatar: document.getElementById('selectedGirlAvatar'),
        selectedGirlName: document.getElementById('selectedGirlName'),
        selectedGirlMemo: document.getElementById('selectedGirlMemo'),
        editGirlBtn: document.getElementById('editGirlBtn'),
        deleteGirlBtn: document.getElementById('deleteGirlBtn'),
        planButtons: document.querySelectorAll('.plan-btn'),
        customPlanInput: document.getElementById('customPlanInput'),
        customPlanText: document.getElementById('customPlanText'),
        receivedMessage: document.getElementById('receivedMessage'),
        generateBtn: document.getElementById('generateBtn'),
        cameraBtn: document.getElementById('cameraBtn'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        suggestionsList: document.getElementById('suggestionsList'),

        // Camera Modal
        cameraModal: document.getElementById('cameraModal'),
        closeCameraModal: document.getElementById('closeCameraModal'),
        chatScreenshotDropzone: document.getElementById('chatScreenshotDropzone'),
        chatScreenshotInput: document.getElementById('chatScreenshotInput'),
        chatScreenshotPreviews: document.getElementById('chatScreenshotPreviews'),
        analyzeChatBtn: document.getElementById('analyzeChatBtn'),

        // Profile Edit
        profileEditTab: document.getElementById('profileEditTab'),
        openProfileEditBtn: document.getElementById('openProfileEditBtn'),
        profileEditModal: document.getElementById('profileEditModal'),
        closeProfileModal: document.getElementById('closeProfileModal'),
        myAvatarSmall: document.getElementById('myAvatarSmall'),
        myNameSmall: document.getElementById('myNameSmall'),
        editPhotoUploadArea: document.getElementById('editPhotoUploadArea'),
        editPhotoInput: document.getElementById('editPhotoInput'),
        editPhotoPreview: document.getElementById('editPhotoPreview'),
        editMyName: document.getElementById('editMyName'),
        editMyAge: document.getElementById('editMyAge'),
        editMyJob: document.getElementById('editMyJob'),
        editMyMemo: document.getElementById('editMyMemo'),
        updateProfileBtn: document.getElementById('updateProfileBtn')
    };
}

function initEventListeners() {
    // Setup Screen
    elements.myPhotoUploadArea.addEventListener('click', () => elements.myPhotoInput.click());
    elements.myPhotoInput.addEventListener('change', handleMyPhotoUpload);
    setupDropzone(elements.myScreenshotDropzone, elements.myScreenshotInput, elements.myScreenshotPreviews, 'my');
    elements.saveProfileBtn.addEventListener('click', saveMyProfile);

    // Add Girl
    elements.addGirlBtn.addEventListener('click', showGirlForm);
    // Mobile Add Button
    const mobileAddBtn = document.getElementById('mobileAddGirlBtn');
    if (mobileAddBtn) mobileAddBtn.addEventListener('click', showGirlForm);
    elements.cancelAddGirlBtn.addEventListener('click', hideGirlForm);
    elements.saveGirlBtn.addEventListener('click', saveGirl);
    setupDropzone(elements.girlScreenshotDropzone, elements.girlScreenshotInput, elements.girlScreenshotPreviews, 'girl');

    // Plan Selection
    elements.planButtons.forEach(btn => {
        btn.addEventListener('click', () => selectPlan(btn.dataset.plan));
    });

    // Message Generation
    elements.generateBtn.addEventListener('click', generateResponses);

    // Camera Modal
    elements.cameraBtn.addEventListener('click', () => showModal(elements.cameraModal));
    elements.closeCameraModal.addEventListener('click', () => hideModal(elements.cameraModal));
    setupDropzone(elements.chatScreenshotDropzone, elements.chatScreenshotInput, elements.chatScreenshotPreviews, 'chat');
    elements.analyzeChatBtn.addEventListener('click', analyzeChatAndGenerate);

    // Profile Edit
    elements.openProfileEditBtn.addEventListener('click', openProfileEditModal);
    elements.closeProfileModal.addEventListener('click', () => hideModal(elements.profileEditModal));
    elements.editPhotoUploadArea.addEventListener('click', () => elements.editPhotoInput.click());
    elements.editPhotoInput.addEventListener('change', handleEditPhotoUpload);
    elements.updateProfileBtn.addEventListener('click', updateMyProfile);

    // Girl Actions
    elements.deleteGirlBtn.addEventListener('click', deleteSelectedGirl);
}

// ============================================
// Storage Management
// ============================================

function loadFromStorage() {
    try {
        const saved = localStorage.getItem('datingAppData');
        if (saved) {
            const data = JSON.parse(saved);
            appState.apiKey = data.apiKey || '';
            appState.myProfile = data.myProfile || appState.myProfile;
            appState.girls = data.girls || [];
            appState.isProfileSetup = data.isProfileSetup || false;
        }
    } catch (e) {
        console.error('Failed to load from storage:', e);
    }
}

function saveToStorage() {
    try {
        localStorage.setItem('datingAppData', JSON.stringify({
            apiKey: appState.apiKey,
            myProfile: appState.myProfile,
            girls: appState.girls,
            isProfileSetup: appState.isProfileSetup
        }));
    } catch (e) {
        console.error('Failed to save to storage:', e);
    }
}

// ============================================
// UI Updates
// ============================================

function updateUI() {
    if (appState.isProfileSetup) {
        elements.setupScreen.style.display = 'none';
        elements.mainScreen.style.display = 'grid';
        updateProfileDisplay();
        renderGirlList();
    } else {
        elements.setupScreen.style.display = 'flex';
        elements.mainScreen.style.display = 'none';
    }
}

function updateProfileDisplay() {
    // Small avatar in header
    if (appState.myProfile.photo) {
        elements.myAvatarSmall.innerHTML = `<img src="${appState.myProfile.photo}" alt="My Photo">`;
    } else {
        elements.myAvatarSmall.textContent = '👤';
    }
    elements.myNameSmall.textContent = appState.myProfile.name || 'プロフィール';
}

function renderGirlList() {
    const list = elements.girlList;
    list.innerHTML = '';

    if (appState.girls.length === 0) {
        list.innerHTML = `<div class="empty-list-message"><p>「+」ボタンで女の子を追加してください</p></div>`;
        return;
    }

    appState.girls.forEach((girl, index) => {
        const tab = document.createElement('div');
        tab.className = `girl-tab ${index === appState.selectedGirlIndex ? 'active' : ''}`;
        tab.innerHTML = `
            <div class="avatar">
                ${girl.photo ? `<img src="${girl.photo}" alt="${girl.name}">` : '👩'}
            </div>
            <span class="name">${girl.name}</span>
        `;
        tab.addEventListener('click', () => selectGirl(index));
        list.appendChild(tab);
    });
}

// ============================================
// Profile Management
// ============================================

function handleMyPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const photoData = event.target.result;
        appState.myProfile.photo = photoData;
        elements.myPhotoPreview.innerHTML = `<img src="${photoData}" alt="My Photo">`;
    };
    reader.readAsDataURL(file);
}

function handleEditPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const photoData = event.target.result;
        appState.myProfile.photo = photoData;
        elements.editPhotoPreview.innerHTML = `<img src="${photoData}" alt="My Photo">`;
    };
    reader.readAsDataURL(file);
}

function saveMyProfile() {
    const name = elements.myName.value.trim();
    const apiKey = document.getElementById('apiKeyInput').value.trim();

    if (!apiKey) {
        alert('APIキーを入力してください');
        return;
    }
    if (!name) {
        alert('名前を入力してください');
        return;
    }

    appState.apiKey = apiKey;
    appState.myProfile.name = name;
    appState.myProfile.age = elements.myAge.value;
    appState.myProfile.job = elements.myJob.value;
    appState.myProfile.memo = elements.myMemo.value;
    appState.isProfileSetup = true;

    saveToStorage();
    updateUI();
}

function openProfileEditModal() {
    document.getElementById('editApiKey').value = appState.apiKey || '';
    elements.editMyName.value = appState.myProfile.name || '';
    elements.editMyAge.value = appState.myProfile.age || '';
    elements.editMyJob.value = appState.myProfile.job || '';
    elements.editMyMemo.value = appState.myProfile.memo || '';

    if (appState.myProfile.photo) {
        elements.editPhotoPreview.innerHTML = `<img src="${appState.myProfile.photo}" alt="My Photo">`;
    }

    showModal(elements.profileEditModal);
}

function updateMyProfile() {
    const apiKey = document.getElementById('editApiKey').value.trim();
    if (apiKey) {
        appState.apiKey = apiKey;
    }
    appState.myProfile.name = elements.editMyName.value.trim() || appState.myProfile.name;
    appState.myProfile.age = elements.editMyAge.value;
    appState.myProfile.job = elements.editMyJob.value;
    appState.myProfile.memo = elements.editMyMemo.value;

    saveToStorage();
    updateProfileDisplay();
    hideModal(elements.profileEditModal);
}

// ============================================
// Girl Management
// ============================================

let tempGirlData = {
    photo: null,
    attributes: ''
};

function showGirlForm() {
    tempGirlData = { photo: null, attributes: '' };
    elements.girlName.value = '';
    elements.girlMemo.value = '';
    elements.girlScreenshotPreviews.innerHTML = '';
    elements.girlAnalysisResult.classList.remove('show');

    hideAllViews();
    elements.girlFormView.style.display = 'flex';
}

function hideGirlForm() {
    elements.girlFormView.style.display = 'none';

    if (appState.selectedGirlIndex >= 0) {
        showMessageView();
    } else {
        elements.noSelectionView.style.display = 'flex';
    }
}

function saveGirl() {
    const name = elements.girlName.value.trim();
    if (!name) {
        alert('名前を入力してください');
        return;
    }

    const girl = {
        id: Date.now(),
        name: name,
        memo: elements.girlMemo.value,
        photo: tempGirlData.photo,
        attributes: tempGirlData.attributes,
        conversationHistory: []
    };

    appState.girls.push(girl);
    appState.selectedGirlIndex = appState.girls.length - 1;

    saveToStorage();
    renderGirlList();
    hideGirlForm();
    showMessageView();
}

function selectGirl(index) {
    appState.selectedGirlIndex = index;
    renderGirlList();
    hideAllViews();
    showMessageView();
}

function showMessageView() {
    const girl = appState.girls[appState.selectedGirlIndex];
    if (!girl) return;

    elements.selectedGirlName.textContent = girl.name;
    elements.selectedGirlMemo.textContent = girl.memo || '(メモなし)';

    if (girl.photo) {
        elements.selectedGirlAvatar.innerHTML = `<img src="${girl.photo}" alt="${girl.name}">`;
    } else {
        elements.selectedGirlAvatar.textContent = '👩';
    }

    // Reset message view state
    elements.receivedMessage.value = '';
    elements.suggestionsList.innerHTML = '';
    appState.selectedPlan = null;
    elements.planButtons.forEach(btn => btn.classList.remove('active'));
    elements.customPlanInput.style.display = 'none';

    elements.messageView.style.display = 'block';
}

function deleteSelectedGirl() {
    if (appState.selectedGirlIndex < 0) return;

    const girl = appState.girls[appState.selectedGirlIndex];
    if (!confirm(`${girl.name}さんを削除しますか？`)) return;

    appState.girls.splice(appState.selectedGirlIndex, 1);
    appState.selectedGirlIndex = -1;

    saveToStorage();
    renderGirlList();
    hideAllViews();
    elements.noSelectionView.style.display = 'flex';
}

function hideAllViews() {
    elements.noSelectionView.style.display = 'none';
    elements.girlFormView.style.display = 'none';
    elements.messageView.style.display = 'none';
}

// ============================================
// Plan Selection
// ============================================

function selectPlan(plan) {
    appState.selectedPlan = plan;

    elements.planButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.plan === plan);
    });

    elements.customPlanInput.style.display = plan === 'custom' ? 'block' : 'none';
}

function getPlanDescription() {
    switch (appState.selectedPlan) {
        case 'quick': return '最速で会うことを目指す。積極的にデートに誘う';
        case 'phone': return '電話に誘って距離を縮める';
        case 'slow': return 'ゆっくり仲良くなる。焦らず自然体で';
        case 'custom': return elements.customPlanText.value || '自然体で接する';
        default: return '自然体で楽しく会話する';
    }
}

// ============================================
// Screenshot Dropzone Setup
// ============================================

const screenshotData = {
    my: [],
    girl: [],
    chat: []
};

function setupDropzone(dropzone, input, previewContainer, type) {
    dropzone.addEventListener('click', () => input.click());

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
        handleFiles(e.dataTransfer.files, previewContainer, type);
    });

    input.addEventListener('change', (e) => {
        handleFiles(e.target.files, previewContainer, type);
    });
}

function handleFiles(files, previewContainer, type) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            screenshotData[type].push(imageData);

            const preview = document.createElement('div');
            preview.className = 'preview-item';
            preview.innerHTML = `
                <img src="${imageData}" alt="Screenshot">
                <button class="remove-btn" onclick="removeScreenshot('${type}', ${screenshotData[type].length - 1}, this)">✕</button>
            `;
            previewContainer.appendChild(preview);

            // Auto-analyze on upload
            analyzeScreenshot(imageData, type);
        };
        reader.readAsDataURL(file);
    });
}

window.removeScreenshot = function (type, index, btn) {
    screenshotData[type].splice(index, 1);
    btn.parentElement.remove();
};

// ============================================
// Gemini Vision API - Screenshot Analysis
// ============================================

async function analyzeScreenshot(imageData, type) {
    const resultElement = type === 'my' ? elements.myAnalysisResult :
        type === 'girl' ? elements.girlAnalysisResult : null;

    // Get memo element based on type
    const memoElement = type === 'my' ? elements.myMemo :
        type === 'girl' ? elements.girlMemo : null;

    if (resultElement) {
        resultElement.innerHTML = '<div class="loading"><div class="spinner"></div>🔍 スクリーンショットを詳細解析中...</div>';
        resultElement.classList.add('show', 'loading');
    }

    // Enhanced prompts to extract all visible information
    const prompt = type === 'my'
        ? `このマッチングアプリのプロフィール画面スクリーンショットから、表示されている全ての情報を抽出してください。

【抽出項目】
- 名前/ニックネーム
- 年齢
- 職業/仕事
- 居住地/地域
- 身長/体型
- 趣味・興味
- 自己紹介文の内容
- 好きなもの/好み
- 性格の特徴（文章から読み取れるもの）
- その他プロフィールに表示されている情報

※表示されていない項目は「不明」と記載
※各項目を簡潔に箇条書きで出力`
        : `このマッチングアプリのプロフィール画面スクリーンショットから、この女性について表示されている全ての情報を抽出してください。

【抽出項目】
- 名前/ニックネーム
- 年齢
- 職業/仕事
- 居住地/地域
- 身長/体型
- 趣味・興味
- 自己紹介文の内容
- 好きなもの/タイプ
- 性格の特徴（文章や雰囲気から読み取れるもの）
- 好みそうな話題・アプローチ方法
- 使っているアプリ名（わかれば）
- その他プロフィールに表示されている情報

※表示されていない項目は「不明」と記載
※各項目を簡潔に箇条書きで出力
※この人へのアプローチアドバイスも最後に1-2行追加`;

    try {
        const result = await callGeminiVision(imageData, prompt);

        if (resultElement) {
            resultElement.innerHTML = `<strong>✅ 解析完了:</strong><br>${result.replace(/\n/g, '<br>')}`;
            resultElement.classList.remove('loading');
        }

        // Save to attributes
        if (type === 'my') {
            appState.myProfile.attributes = result;
        } else if (type === 'girl') {
            tempGirlData.attributes = result;
        }

        // AUTO-POPULATE MEMO FIELD with analysis results
        if (memoElement) {
            // Add analysis result to memo (append if there's existing content)
            const existingMemo = memoElement.value.trim();
            const newContent = `【スクショ解析結果】\n${result}`;

            if (existingMemo) {
                memoElement.value = `${existingMemo}\n\n${newContent}`;
            } else {
                memoElement.value = newContent;
            }

            // Trigger input event for any listeners
            memoElement.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Extract photo if present
        if (type === 'girl' && !tempGirlData.photo) {
            tempGirlData.photo = imageData;
        }

    } catch (error) {
        console.error('Analysis error:', error);
        if (resultElement) {
            resultElement.innerHTML = `⚠️ 解析に失敗しました: ${error.message || 'APIエラー'}`;
            resultElement.classList.remove('loading');
        }
    }
}

async function callGeminiVision(imageData, prompt) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('APIキーが設定されていません。設定画面でAPIキーを入力してください。');
    }

    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(';')[0].split(':')[1] || 'image/jpeg';

    console.log('Calling Gemini Vision API...');
    console.log('API Key prefix:', apiKey.substring(0, 10) + '...');

    try {
        const response = await fetch(`${GEMINI_VISION_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ]
                }]
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
            const errorMsg = data.error?.message || 'API呼び出しに失敗しました';
            throw new Error(errorMsg);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('AIからの応答が空でした');
        }

        return text;
    } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(`API接続エラー: ${fetchError.message}`);
    }
}

// ============================================
// Message Generation
// ============================================

async function generateResponses() {
    const message = elements.receivedMessage.value.trim();
    if (!message) {
        alert('相手からのメッセージを入力してください');
        return;
    }

    showLoading();

    try {
        const result = await callGeminiForReplies(message);
        displaySuggestions(result);
    } catch (error) {
        console.error('Generation error:', error);
        displayFallbackSuggestions();
    } finally {
        hideLoading();
    }
}

async function callGeminiForReplies(message) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('APIキーが設定されていません。プロフィール編集からAPIキーを設定してください。');
    }

    const girl = appState.girls[appState.selectedGirlIndex];
    const planDesc = getPlanDescription();
    const prompt = buildPrompt(message, girl, planDesc);

    console.log('Calling Gemini API for replies...');

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 2000
                }
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
            const errorMsg = data.error?.message || 'API呼び出しに失敗しました';
            throw new Error(errorMsg);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!text) {
            throw new Error('AIからの応答が空でした');
        }

        return parseResponses(text);
    } catch (fetchError) {
        console.error('API error:', fetchError);
        throw new Error(`API接続エラー: ${fetchError.message}`);
    }
}

function buildPrompt(message, girl, planDesc) {
    return `あなたは売れっ子ホストのLINE術を完璧に習得したマッチングアプリのメッセージアドバイザーです。
以下の情報と学習データを元に、6タイプの返信候補を生成してください。

【自分の情報】
名前: ${appState.myProfile.name}
年齢: ${appState.myProfile.age}歳
職業: ${appState.myProfile.job}
特徴・メモ: ${appState.myProfile.attributes || appState.myProfile.memo}

【相手の女性の情報】
名前: ${girl.name}
メモ・属性: ${girl.memo}
解析済み属性: ${girl.attributes}

【目標プラン】
${planDesc}

【相手からのメッセージ】
「${message}」

============================
【実際の売れっ子ホストLINE学習データ】
============================

■来店感謝パターン
「今日は延長までありがと！！」「恥ずかしがってるのめっちゃ可愛かったしいいとこ多すぎ！仲良くしてね🥰」

■相手を褒めるパターン  
「ええ嬉しい🥺」「可愛すぎるやろあいたくなるやんか」「いい子やなあありがと🥰」「偉すぎ毎日」

■会いたい訴求パターン
「俺もみゆちゃん摂取しよーっと😏」「てか今日あえるん？🥺」「早く会いたいなー」「はやくあいたいでーす」

■労いパターン
「バイトしてたん！偉いぞ🥺」「俺も今日もがんばるうううう」「頑張るんやで」

■軽いツッコミパターン
「それやばすぎ」「みゆちゃん落とすのはせんすないわ笑」「何してるんー？？」

■デレパターン
「すき」「はぁかわいい」「俺だけのるいちゃん！」「愛してるよ🥰」

■質問で会話継続
「バイトなにしてるんみゆちゃん😳」「今は何してるんー？」「いつ会えるんよーーーー」

============================
【6タイプのホスト人格設定】
============================

【1. 王子様系（癒し系）】👑
一人称「僕」、全肯定、「幸です」「えらい」、絵文字 ( ^ω^ ) 😊 ♡
例: 「お疲れ様😊 よく頑張ってるねえらい！( ^ω^ )」

【2. ホスト系（彼氏営業）】🍷
一人称「俺」、関西弁、🥺多用、甘えて要求
例: 「俺もめっちゃ会いたいねん🥺」「今日とか来れたりせん？」

【3. 知的系（紳士）】🎓
一人称「私」、落ち着いた会話、深掘り質問
例: 「それ面白いね。詳しく聞かせて？」

【4. お笑い系（ツッコミ）】🎭
「w」「笑」多用、軽いノリ、ボケ/ツッコミ
例: 「それなw めっちゃわかる😂」

【5. S系（俺様）】😈
短文、ツンデレ、押して引く
例: 「へー...まあ、ちょっとだけ偉いな🥰」

【6. 癒し系（包容力）】🌸
聞き上手、共感、安心感
例: 「大変だったね。話聞くよ🌸」

============================
【厳守ルール】
============================
- 返信は1〜2文（最大25文字）で超簡潔に
- 解説禁止、返信文のみ
- 学習データの表現・絵文字を参考に
- 相手の名前を呼ぶと効果的

【出力】返信文のみ
===PRINCE===
===HOST===
===SMART===
===COMEDY===
===SADISTIC===
===HEALING===`;
}

function parseResponses(text) {
    const responses = [];

    const patterns = [
        { regex: /===PRINCE===\s*\n?([\s\S]*?)(?====|$)/, category: 'prince', label: '👑 王子様系', icon: '👑' },
        { regex: /===HOST===\s*\n?([\s\S]*?)(?====|$)/, category: 'host', label: '🍷 ホスト系', icon: '🍷' },
        { regex: /===SMART===\s*\n?([\s\S]*?)(?====|$)/, category: 'smart', label: '🎓 知的系', icon: '🎓' },
        { regex: /===COMEDY===\s*\n?([\s\S]*?)(?====|$)/, category: 'comedy', label: '🎭 お笑い系', icon: '🎭' },
        { regex: /===SADISTIC===\s*\n?([\s\S]*?)(?====|$)/, category: 'sadistic', label: '😈 S系', icon: '😈' },
        { regex: /===HEALING===\s*\n?([\s\S]*?)(?====|$)/, category: 'healing', label: '🌸 癒し系', icon: '🌸' }
    ];

    patterns.forEach(p => {
        const match = text.match(p.regex);
        if (match) {
            responses.push({
                text: match[1].trim().replace(/^（|）$/g, ''),
                category: p.category,
                label: p.label,
                icon: p.icon
            });
        }
    });

    // Fallback if parsing failed
    if (responses.length < 6) {
        const lines = text.split('\n').filter(l => l.trim() && !l.includes('==='));
        while (responses.length < 6 && lines.length > 0) {
            responses.push({
                text: lines.shift().trim(),
                category: 'host',
                label: `返信候補${responses.length + 1}`,
                icon: '💬'
            });
        }
    }

    return responses;
}

function displaySuggestions(responses) {
    elements.suggestionsList.innerHTML = '';

    responses.forEach((response, index) => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.innerHTML = `
            <div class="suggestion-category ${response.category}">${response.label}</div>
            <div class="suggestion-text">${response.text}</div>
            <div class="suggestion-actions">
                <button class="btn-copy" onclick="copyToClipboard(this, \`${response.text.replace(/`/g, '\\`')}\`)">
                    📋 コピー
                </button>
            </div>
        `;
        elements.suggestionsList.appendChild(card);
    });
}

function displayFallbackSuggestions() {
    const fallbacks = [
        { text: 'そうなんだ！嬉しいよ😊', category: 'prince', label: '👑 王子様系' },
        { text: '俺もめっちゃ気になってた🥺', category: 'host', label: '🍷 ホスト系' },
        { text: 'それ興味深いね、詳しく聞かせて？', category: 'smart', label: '🎓 知的系' },
        { text: 'それなw めっちゃわかる😂', category: 'comedy', label: '🎭 お笑い系' },
        { text: 'へえ...まあ、悪くないんじゃない🥰', category: 'sadistic', label: '😈 S系' },
        { text: '大変だったね。話聞くよ🌸', category: 'healing', label: '🌸 癒し系' }
    ];
    displaySuggestions(fallbacks);
}

// ============================================
// Chat Screenshot Analysis
// ============================================

async function analyzeChatAndGenerate() {
    if (screenshotData.chat.length === 0) {
        alert('トーク画面のスクショをアップロードしてください');
        return;
    }

    const imageData = screenshotData.chat[screenshotData.chat.length - 1];

    showLoading();
    hideModal(elements.cameraModal);

    try {
        // 1. 詳細なトーク画面解析（AIチャット技術）
        const analysisPrompt = `あなたはLINEトーク画面を分析するエキスパートです。
この画面を詳細に分析して、以下の形式で出力してください：

【会話の流れ】
- 直近5-10メッセージの要約

【相手（女性）の最後のメッセージ】
「ここに正確に転記」

【相手の感情・温度感】
- 好意度: 高/中/低
- 現在の気分: （例：嬉しそう、疲れてる、期待してる等）
- 返信の緊急度: 高/中/低

【相手の特徴（今回の会話から）】
- 話し方の特徴
- 興味がありそうな話題
- 避けた方がいい話題

【推奨アプローチ】
- この流れでの最適な返信方針`;

        const chatAnalysis = await callGeminiVision(imageData, analysisPrompt);

        // 2. 解析結果をメモに保存
        const girl = appState.girls[appState.selectedGirlIndex];
        if (girl) {
            const timestamp = new Date().toLocaleString('ja-JP');
            const newAnalysis = `\n\n【トーク解析 ${timestamp}】\n${chatAnalysis}`;
            girl.memo = (girl.memo || '') + newAnalysis;
            saveToStorage();

            // UI更新
            if (elements.selectedGirlMemo) {
                elements.selectedGirlMemo.textContent = girl.memo.substring(0, 50) + '...';
            }
        }

        // 3. 解析結果から女性の最後のメッセージを抽出
        const lastMsgMatch = chatAnalysis.match(/【相手（女性）の最後のメッセージ】\s*「([^」]+)」/);
        const lastMessage = lastMsgMatch ? lastMsgMatch[1] : chatAnalysis;

        // 4. 受信メッセージ欄に表示
        elements.receivedMessage.value = lastMessage;

        // 5. 解析コンテキスト付きで返信生成
        const contextualPrompt = `${chatAnalysis}\n\n上記の分析を踏まえて、相手の最後のメッセージ「${lastMessage}」への返信を生成してください。`;

        const result = await callGeminiForRepliesWithContext(lastMessage, chatAnalysis);
        displaySuggestions(result);

    } catch (error) {
        console.error('Chat analysis error:', error);
        alert('トーク解析エラー: ' + error.message);
        displayFallbackSuggestions();
    } finally {
        hideLoading();
    }
}

// コンテキスト付き返信生成
async function callGeminiForRepliesWithContext(message, context) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('APIキーが設定されていません');
    }

    const girl = appState.girls[appState.selectedGirlIndex];
    const planDesc = getPlanDescription();

    const prompt = `あなたは売れっ子ホストのLINE術を完璧に習得したメッセージアドバイザーです。

【トーク解析結果】
${context}

【自分の情報】
名前: ${appState.myProfile.name}
年齢: ${appState.myProfile.age}歳
職業: ${appState.myProfile.job}

【相手の情報】
名前: ${girl.name}
メモ: ${girl.memo}

【目標】
${planDesc}

【相手の最後のメッセージ】
「${message}」

【実際のホストLINE例】
■褒める: 「えら🥺」「可愛すぎる」「いい子やなあ🥰」
■会いたい: 「てか今日あえるん？🥺」「早く会いたいなー」
■デレ: 「すき」「はぁかわいい」
■質問: 「今は何してるんー？」「バイトなにしてるん？😳」

【6タイプで返信生成】
===PRINCE=== 👑王子様系（全肯定・癒し）
===HOST=== 🍷ホスト系（関西弁・🥺多用）
===SMART=== 🎓知的系（深掘り質問）
===COMEDY=== 🎭お笑い系（w多用）
===SADISTIC=== 😈S系（ツンデレ）
===HEALING=== 🌸癒し系（包容力）

※返信は1-2文、最大25文字で超簡潔に`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 2000 }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'API失敗');

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return parseResponses(text);
    } catch (error) {
        throw new Error(`API接続エラー: ${error.message}`);
    }
}

// ============================================
// Utility Functions
// ============================================

function showModal(modal) {
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

function showLoading() {
    elements.loadingIndicator.style.display = 'block';
    elements.suggestionsList.innerHTML = '';
}

function hideLoading() {
    elements.loadingIndicator.style.display = 'none';
}

window.copyToClipboard = function (button, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '✅ コピーしました';
        button.classList.add('copied');
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
};

// Make analyze button visible when screenshot added
const originalHandleFiles = handleFiles;
handleFiles = function (files, previewContainer, type) {
    originalHandleFiles(files, previewContainer, type);
    if (type === 'chat' && files.length > 0) {
        elements.analyzeChatBtn.style.display = 'block';
    }
};
