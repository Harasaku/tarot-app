export type CardOrientation = "upright" | "reversed";

export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  imagePath: string;
  upright: {
    keywords: string[];
    meaning: string;
  };
  reversed: {
    keywords: string[];
    meaning: string;
  };
}

export const majorArcana: TarotCard[] = [
  {
    id: "maj_00",
    name: "愚者",
    nameEn: "The Fool",
    imagePath: "/cards/maj_00.png",
    upright: {
      keywords: ["新しい始まり", "自由", "冒険", "可能性"],
      meaning:
        "新たな旅の出発点に立っています。恐れを手放し、純粋な心で一歩を踏み出すときです。無限の可能性があなたを待っています。直感を信じて、未知の世界へ飛び込みましょう。",
    },
    reversed: {
      keywords: ["無謀", "準備不足", "リスク回避"],
      meaning:
        "焦りや無謀な行動に注意が必要です。今は立ち止まって、もう少し準備を整える時かもしれません。足元をしっかり確認してから進みましょう。",
    },
  },
  {
    id: "maj_01",
    name: "魔術師",
    nameEn: "The Magician",
    imagePath: "/cards/maj_01.png",
    upright: {
      keywords: ["意志力", "スキル", "創造力", "行動"],
      meaning:
        "あなたには目標を実現するすべての力が備わっています。意志と技術を組み合わせ、創造力を発揮するときです。自分の可能性を信じて、積極的に行動しましょう。",
    },
    reversed: {
      keywords: ["操作", "スキル不足", "計画の欠如"],
      meaning:
        "力を持て余しているか、誰かに操られている可能性があります。自分のスキルを過信せず、足りない部分を補うことに集中しましょう。",
    },
  },
  {
    id: "maj_02",
    name: "女教皇",
    nameEn: "The High Priestess",
    imagePath: "/cards/maj_02.png",
    upright: {
      keywords: ["直感", "神秘", "内なる知恵", "沈黙"],
      meaning:
        "今は行動よりも内省の時です。あなたの内なる声に耳を傾けてください。表に見えていない情報や、潜在意識からのメッセージが重要な答えを持っています。",
    },
    reversed: {
      keywords: ["秘密の暴露", "直感の無視", "表面的な知識"],
      meaning:
        "大切なことを見落としているかもしれません。直感を無視して表面だけを見ていないか、立ち止まって考えてみましょう。",
    },
  },
  {
    id: "maj_03",
    name: "女帝",
    nameEn: "The Empress",
    imagePath: "/cards/maj_03.png",
    upright: {
      keywords: ["豊かさ", "創造性", "母性", "自然"],
      meaning:
        "豊かさと創造のエネルギーが満ちています。愛情を注いで物事を育てるときです。自然の流れに逆らわず、周囲の人や環境との調和を大切にしましょう。",
    },
    reversed: {
      keywords: ["依存", "創造性の停滞", "過保護"],
      meaning:
        "誰かへの依存や過保護が問題になっているかもしれません。自立心を持ち、自分自身の力で物事を育てる勇気を持ちましょう。",
    },
  },
  {
    id: "maj_04",
    name: "皇帝",
    nameEn: "The Emperor",
    imagePath: "/cards/maj_04.png",
    upright: {
      keywords: ["権威", "安定", "構造", "リーダーシップ"],
      meaning:
        "強いリーダーシップと安定した基盤を築くときです。ルールや秩序を大切にしながら、責任を持って周囲を導きましょう。堅実な計画が成功をもたらします。",
    },
    reversed: {
      keywords: ["支配欲", "柔軟性の欠如", "権威への反発"],
      meaning:
        "過度な支配欲や頑固さが障害になっています。もう少し柔軟に考え、他者の意見にも耳を傾けることで道が開けます。",
    },
  },
  {
    id: "maj_05",
    name: "教皇",
    nameEn: "The Hierophant",
    imagePath: "/cards/maj_05.png",
    upright: {
      keywords: ["伝統", "信念", "精神的な指導", "慣習"],
      meaning:
        "伝統や確立された価値観の中に答えがあります。信頼できる師や先人の知恵を借りましょう。精神的な成長と学びの時です。",
    },
    reversed: {
      keywords: ["因習打破", "新しい方法", "反体制"],
      meaning:
        "古い慣習や枠組みが制限になっています。自分なりの価値観を大切にし、新しいアプローチを試みる勇気を持ちましょう。",
    },
  },
  {
    id: "maj_06",
    name: "恋人",
    nameEn: "The Lovers",
    imagePath: "/cards/maj_06.png",
    upright: {
      keywords: ["愛", "調和", "選択", "価値観"],
      meaning:
        "大切な選択の岐路に立っています。心の声に従い、本当に大切にしたいものを選びましょう。愛と調和のエネルギーが、あなたの決断を支えています。",
    },
    reversed: {
      keywords: ["不調和", "誤った選択", "価値観の不一致"],
      meaning:
        "関係や選択に不調和があるようです。自分の本当の価値観と向き合い、表面的な魅力に惑わされないよう注意しましょう。",
    },
  },
  {
    id: "maj_07",
    name: "戦車",
    nameEn: "The Chariot",
    imagePath: "/cards/maj_07.png",
    upright: {
      keywords: ["勝利", "意志力", "前進", "自制心"],
      meaning:
        "強い意志と自制心で障害を乗り越えるときです。目標に向かって真っすぐ進みましょう。困難があっても諦めなければ、必ず勝利を手にできます。",
    },
    reversed: {
      keywords: ["方向性の喪失", "攻撃性", "コントロールの欠如"],
      meaning:
        "エネルギーが空回りしているようです。感情をコントロールし、進む方向を定め直しましょう。焦りは禁物です。",
    },
  },
  {
    id: "maj_08",
    name: "力",
    nameEn: "Strength",
    imagePath: "/cards/maj_08.png",
    upright: {
      keywords: ["勇気", "忍耐", "内なる強さ", "慈悲"],
      meaning:
        "本当の強さは、力づくではなく愛と忍耐から生まれます。困難な状況でも穏やかな心を保ち、優しさで乗り越えましょう。あなたには十分な強さがあります。",
    },
    reversed: {
      keywords: ["自己不信", "弱さ", "感情の爆発"],
      meaning:
        "自分の力を過小評価しているかもしれません。内なる強さを信じて。感情が制御できなくなりそうなら、立ち止まる勇気も必要です。",
    },
  },
  {
    id: "maj_09",
    name: "隠者",
    nameEn: "The Hermit",
    imagePath: "/cards/maj_09.png",
    upright: {
      keywords: ["内省", "孤独", "魂の探求", "指針"],
      meaning:
        "一人の時間を大切にし、内側に向き合うときです。喧騒から離れ、自分の魂の声に耳を傾けましょう。その静寂の中に、大切な答えが見つかります。",
    },
    reversed: {
      keywords: ["孤立", "孤独の拒絶", "引きこもり"],
      meaning:
        "孤立しすぎているか、逆に必要な一人の時間を避けているかもしれません。バランスを取り、適度に社会とのつながりを保ちましょう。",
    },
  },
  {
    id: "maj_10",
    name: "運命の輪",
    nameEn: "Wheel of Fortune",
    imagePath: "/cards/maj_10.png",
    upright: {
      keywords: ["変化", "チャンス", "サイクル", "運命"],
      meaning:
        "運命の流れが大きく動いています。変化を恐れずに受け入れましょう。今は追い風が吹いており、新しいチャンスが訪れるサインです。流れに乗って前進を。",
    },
    reversed: {
      keywords: ["悪運", "変化への抵抗", "停滞"],
      meaning:
        "変化の流れに逆らっているかもしれません。運の周期が下降しているときは、無理に抗わず、嵐が過ぎるのを待つ賢さも必要です。",
    },
  },
  {
    id: "maj_11",
    name: "正義",
    nameEn: "Justice",
    imagePath: "/cards/maj_11.png",
    upright: {
      keywords: ["公正", "真実", "法律", "バランス"],
      meaning:
        "物事は公正に裁かれます。自分の行動に責任を持ち、誠実であり続けましょう。過去の行いが今の結果を生んでいます。真実と向き合う勇気を持ってください。",
    },
    reversed: {
      keywords: ["不公正", "不誠実", "責任回避"],
      meaning:
        "不公正な状況や、自分自身の不誠実さが問題になっています。逃げずに向き合い、正しい道を選ぶことが今後の展開を左右します。",
    },
  },
  {
    id: "maj_12",
    name: "吊るされた男",
    nameEn: "The Hanged Man",
    imagePath: "/cards/maj_12.png",
    upright: {
      keywords: ["一時停止", "手放す", "新しい視点", "犠牲"],
      meaning:
        "今は行動を止め、まったく異なる角度から物事を見るときです。手放すことで新しい視点が生まれます。この一時停止は、より大きな前進のための準備期間です。",
    },
    reversed: {
      keywords: ["無駄な犠牲", "停滞への抵抗", "先延ばし"],
      meaning:
        "不必要な犠牲を払っているか、変化を先延ばしにしています。本当に手放すべきものを見極め、前に進む決断をしましょう。",
    },
  },
  {
    id: "maj_13",
    name: "死神",
    nameEn: "Death",
    imagePath: "/cards/maj_13.png",
    upright: {
      keywords: ["変容", "終わりと始まり", "手放す", "変革"],
      meaning:
        "何かが終わり、新しいものが生まれようとしています。終わりを恐れないで。それは必ず新しい始まりをもたらします。古いものを手放し、変容を受け入れましょう。",
    },
    reversed: {
      keywords: ["変化への抵抗", "停滞", "過去への執着"],
      meaning:
        "変化を恐れ、古いものにしがみついています。手放すことへの抵抗が、あなたの成長を妨げています。勇気を持って次のステージへ進みましょう。",
    },
  },
  {
    id: "maj_14",
    name: "節制",
    nameEn: "Temperance",
    imagePath: "/cards/maj_14.png",
    upright: {
      keywords: ["バランス", "調和", "忍耐", "適度"],
      meaning:
        "バランスと調和が鍵です。焦らず、ゆっくりと着実に進みましょう。異なる要素を上手く組み合わせることで、美しい結果が生まれます。中庸の道を歩んでください。",
    },
    reversed: {
      keywords: ["不均衡", "過剰", "衝動"],
      meaning:
        "何かが過剰になっているか、アンバランスな状態です。どこかで行き過ぎがないか見直しましょう。適度さを取り戻すことが今の課題です。",
    },
  },
  {
    id: "maj_15",
    name: "悪魔",
    nameEn: "The Devil",
    imagePath: "/cards/maj_15.png",
    upright: {
      keywords: ["束縛", "物質主義", "依存", "影の自己"],
      meaning:
        "何かに縛られていると感じていませんか？その鎖は、実は自分で外せるかもしれません。欲望や依存から解放されるときです。影の部分と向き合う勇気を持ちましょう。",
    },
    reversed: {
      keywords: ["解放", "束縛からの脱出", "自己認識"],
      meaning:
        "束縛から解放されようとしています。依存していたものと向き合い、自分を縛っていたものに気づき始めています。この気づきが自由への第一歩です。",
    },
  },
  {
    id: "maj_16",
    name: "塔",
    nameEn: "The Tower",
    imagePath: "/cards/maj_16.png",
    upright: {
      keywords: ["突然の変化", "崩壊", "啓示", "混乱"],
      meaning:
        "突然の変化や崩壊が訪れるかもしれません。しかし、それは必要な変容です。古い構造が壊れることで、より真実に近いものが現れます。混乱の中にも意味があります。",
    },
    reversed: {
      keywords: ["災害の回避", "変化への抵抗", "崩壊の恐れ"],
      meaning:
        "大きな変化を避けようとしているか、内部では崩壊が始まっています。変化を恐れずに受け入れる心の準備をしましょう。",
    },
  },
  {
    id: "maj_17",
    name: "星",
    nameEn: "The Star",
    imagePath: "/cards/maj_17.png",
    upright: {
      keywords: ["希望", "信念", "インスピレーション", "癒し"],
      meaning:
        "希望の光が差し込んでいます。困難な時期を経て、癒しと再生の時が訪れました。自分を信じ、夢を諦めないでください。星はあなたの道を照らし続けています。",
    },
    reversed: {
      keywords: ["絶望", "自己不信", "希望の喪失"],
      meaning:
        "希望を見失いそうになっています。でも、暗闇の中でこそ星は輝きます。小さな光を見つけることから始めましょう。必ず道は開けます。",
    },
  },
  {
    id: "maj_18",
    name: "月",
    nameEn: "The Moon",
    imagePath: "/cards/maj_18.png",
    upright: {
      keywords: ["幻想", "恐れ", "無意識", "直感"],
      meaning:
        "物事がはっきりしない、霧の中にいるような時期です。恐れや幻想に惑わされないよう注意しましょう。直感を大切にしながら、焦らず真実が明らかになるのを待ちましょう。",
    },
    reversed: {
      keywords: ["混乱の解消", "真実の発覚", "恐れの克服"],
      meaning:
        "霧が晴れ始め、隠されていた真実が明らかになろうとしています。恐れを乗り越え、現実をしっかりと見つめる準備ができてきました。",
    },
  },
  {
    id: "maj_19",
    name: "太陽",
    nameEn: "The Sun",
    imagePath: "/cards/maj_19.png",
    upright: {
      keywords: ["成功", "喜び", "活力", "楽観主義"],
      meaning:
        "明るく輝かしいエネルギーがあなたを包んでいます。成功と喜びの時です。自信を持って前進しましょう。あなたの才能と努力が、素晴らしい結果をもたらします。",
    },
    reversed: {
      keywords: ["楽観主義の過剰", "一時的な曇り", "エゴ"],
      meaning:
        "楽観的になりすぎているか、エゴが邪魔をしているかもしれません。輝きは続きますが、地に足をつけて現実的な視点も忘れずに。",
    },
  },
  {
    id: "maj_20",
    name: "審判",
    nameEn: "Judgement",
    imagePath: "/cards/maj_20.png",
    upright: {
      keywords: ["再生", "内なる呼びかけ", "赦し", "目覚め"],
      meaning:
        "魂の目覚めと再生の時です。過去を赦し、新しい自分として生まれ変わるチャンスです。内なる呼びかけに応え、本当の使命に向かって歩み出しましょう。",
    },
    reversed: {
      keywords: ["自己批判", "後悔", "判断の先延ばし"],
      meaning:
        "過度な自己批判や後悔に縛られています。過去の過ちを赦し、前を向くことが必要です。自分を裁くことをやめ、新たな一歩を踏み出しましょう。",
    },
  },
  {
    id: "maj_21",
    name: "世界",
    nameEn: "The World",
    imagePath: "/cards/maj_21.png",
    upright: {
      keywords: ["完成", "達成", "統合", "旅の完結"],
      meaning:
        "一つのサイクルが完成しました。努力が実を結び、大きな達成感を得られるときです。この経験があなたをより豊かにし、次の旅への準備を整えてくれています。",
    },
    reversed: {
      keywords: ["未完成", "近道を探す", "目標の先延ばし"],
      meaning:
        "もう少しで完成なのに、何かが足りていません。焦らず、残りのピースを丁寧に埋めていきましょう。完成は目の前です。",
    },
  },
];

export const spreadTypes = [
  {
    id: "one",
    name: "1枚引き",
    description: "今日のメッセージ・シンプルな問いに",
    cardCount: 1,
    positions: [{ label: "現在", x: 50, y: 50 }],
  },
  {
    id: "three",
    name: "3枚引き",
    description: "過去・現在・未来の流れを読む",
    cardCount: 3,
    positions: [
      { label: "過去", x: 20, y: 50 },
      { label: "現在", x: 50, y: 50 },
      { label: "未来", x: 80, y: 50 },
    ],
  },
];
