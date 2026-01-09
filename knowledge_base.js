// ============================================
// Knowledge Base - Dating Message Strategies
// Based on PDFs: マッチングアプリと恋愛におけるメッセージ戦略の統合分析
// ============================================

const KNOWLEDGE_BASE = {
    // Core Principles
    corePrinciples: [
        "相手に面倒くさいと思わせないこと",
        "1〜2行の短文を基本とし、テンポを重視する",
        "追撃LINEは絶対禁止",
        "安易な謝罪は自分の価値を下げる",
        "即レスが基本、たまに緩急をつける"
    ],

    // Bad patterns to avoid
    antiPatterns: {
        longMessage: {
            problem: "長文・面白くない",
            issue: "読む労力が大きく、相手を疲れさせる",
            solution: "1〜2行の短文を基本とし、テンポを重視"
        },
        tooPolite: {
            problem: "誠実・丁寧すぎる",
            issue: "「いい人」で終わる原因",
            solution: "友達と話すような自然体で接し、時にいじりや冗談を交える"
        },
        chasing: {
            problem: "追撃LINE",
            issue: "格下感を露呈する最悪の行動",
            solution: "返信がなければ無視する。早期撤退が基本"
        },
        apologizing: {
            problem: "安易な謝罪",
            issue: "自分の価値を下げる行為",
            solution: "200%自分が悪い場合以外は謝らない"
        }
    },

    // Message strategies
    strategies: {
        assari: {
            name: "あっさり戦略",
            description: "潔く引くことで価値を高める",
            tactics: [
                "断られたら「OK」とだけ返してすぐ引く",
                "会話の終わりも追いすがらず自分から切り上げる",
                "返信がつまらなければ無視も選択肢"
            ]
        },
        pushPull: {
            name: "Push & Pull",
            description: "褒めといじりのバランスで緊張感を作る",
            tactics: [
                "褒めた直後に軽くいじる",
                "肯定した後に疑問を投げる",
                "距離を縮めたら少し引く"
            ]
        },
        kankyu: {
            name: "緩急の創出",
            description: "予測不能性で感情を揺さぶる",
            tactics: [
                "基本は即レス、たまに数時間空ける",
                "返信速度を固定せずランダムに",
                "相手が終わらせようとしたら即座に無視"
            ]
        }
    },

    // Response types
    responseStyles: {
        empathy: {
            name: "共感型",
            description: "相手の気持ちに寄り添う",
            templates: [
                "わかる！{topic}だよね",
                "それな！{topic}って感じ",
                "めっちゃわかる笑"
            ]
        },
        wit: {
            name: "ウィット型",
            description: "軽いノリで返す",
            templates: [
                "{topic}じゃん！笑",
                "え、{topic}なの？意外！",
                "それ最高じゃん"
            ]
        },
        closing: {
            name: "クロージング型",
            description: "次のアクションに繋げる",
            templates: [
                "いいね！じゃあ{action}しよ",
                "おもろいね、今度{action}行こ",
                "それなら{action}できるね"
            ]
        }
    },

    // Host LINE examples (from txt files)
    hostExamples: [
        // Warm greetings
        { context: "お礼・感謝", example: "今日ありがとう♡ 楽しかった(smile)" },
        { context: "お礼・感謝", example: "会えて嬉しかった☺️" },
        { context: "お礼・感謝", example: "ゆっくり休んでね( ^ω^ )" },

        // Casual responses
        { context: "カジュアル", example: "おぉ！よしゃ♡" },
        { context: "カジュアル", example: "かしこまり(happy)" },
        { context: "カジュアル", example: "楽しみにしてる♡" },

        // Supportive
        { context: "応援・励まし", example: "無理せずね( ^ω^ )" },
        { context: "応援・励まし", example: "頑張ってね♡ふぁいと！" },
        { context: "応援・励まし", example: "体調気をつけてね☺️" },

        // Playful
        { context: "軽いノリ", example: "ww それな😂" },
        { context: "軽いノリ", example: "やばいね笑" },
        { context: "軽いノリ", example: "まじか！おもしろ笑" },

        // Making plans
        { context: "予定調整", example: "楽しみにしてるね♡" },
        { context: "予定調整", example: "また教えて( ^ω^ )" },
        { context: "予定調整", example: "いつでもいいよ☺️" }
    ],

    // Advice based on situation
    situationalAdvice: {
        firstMessage: "初回は短く、相手のプロフィールから一点だけ触れる",
        afterDate: "「楽しかった♡」+ 具体的な一点 + 次への期待",
        noReply: "追撃禁止。数日後に全く違う話題を一度だけ送る",
        rejection: "「OK」で即引き。執着を見せない",
        boring: "無視も選択肢。無理に続けない"
    },

    // Emoji usage
    emojiGuide: {
        recommended: ["😂", "☺️", "笑", "(happy)", "♡", "🥰", "( ^ω^ )"],
        avoid: ["💕💕💕", "😭😭😭", "❤️❤️❤️"],
        rule: "絵文字は1-2個まで。過剰使用は避ける"
    }
};

// System prompt for Gemini API
const SYSTEM_PROMPT = `あなたはマッチングアプリのメッセージ返信アドバイザーです。
以下の戦略に基づいて、適切な返信候補を3つ生成してください。

【重要な原則】
- 返信は必ず1〜2行の短文
- 絵文字は1-2個まで
- 追撃LINE禁止
- 安易な謝罪禁止
- 友達感覚の自然体

【返信スタイル】
1. 共感型: 相手の気持ちに寄り添う
2. ウィット型: 軽いノリで返す
3. クロージング型: 次のアクションに繋げる

【ホストの返信例パターン】
- お礼: 「今日ありがとう♡ 楽しかった」「会えて嬉しかった☺️」
- カジュアル: 「おぉ！よしゃ♡」「かしこまり(happy)」「楽しみにしてる♡」
- 応援: 「無理せずね( ^ω^ )」「頑張ってね♡」
- 軽いノリ: 「ww それな😂」「やばいね笑」
- 予定: 「楽しみにしてるね♡」「また教えて( ^ω^ )」

返信は必ず以下のJSON形式で出力:
{
    "responses": [
        {"type": "empathy", "text": "共感型の返信"},
        {"type": "wit", "text": "ウィット型の返信"},
        {"type": "closing", "text": "クロージング型の返信"}
    ],
    "advice": "この状況での戦略アドバイス（1文）"
}`;

// Export for use in app.js
window.KNOWLEDGE_BASE = KNOWLEDGE_BASE;
window.SYSTEM_PROMPT = SYSTEM_PROMPT;
