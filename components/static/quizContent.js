// Multilingual dataset of quiz items.
// Includes English (en), Malay (my), Chinese (cn), and Tamil (tm).
export const quizContent = {
  title: {
    en: 'Disaster Preparedness Quiz',
    cn: '灾难应对测验',
    my: 'Kuiz Persediaan Bencana',
    tm: 'விபத்து தயார் கணிப்பு',
  },
  questions: [
    //  Flood
    {
      id: 'q1',
      text: {
        en: 'What should you avoid doing during a flood?',
        cn: '洪水期间你应该避免做什么？',
        my: 'Apa yang harus anda elakkan semasa banjir?',
        tm: 'வெள்ளத்தின் போது நீங்கள் தவிர்க்க வேண்டியது என்ன?',
      },
      options: {
        en: [
          { text: 'Driving through floodwaters', correct: true },
          { text: 'Moving to higher ground', correct: false },
          { text: 'Listening to alerts', correct: false },
          { text: 'Staying informed', correct: false },
        ],
        cn: [
          { text: '驾车穿越洪水', correct: true },
          { text: '搬到高处', correct: false },
          { text: '收听警报', correct: false },
          { text: '保持信息通畅', correct: false },
        ],
        my: [
          { text: 'Memandu melalui air banjir', correct: true },
          { text: 'Berpindah ke kawasan tinggi', correct: false },
          { text: 'Mendengar amaran', correct: false },
          { text: 'Kekal dimaklumkan', correct: false },
        ],
        tm: [
          { text: 'வெள்ளத்தில் கார் ஓட்டுதல்', correct: true },
          { text: 'உயரமான இடத்துக்கு செல்லுதல்', correct: false },
          { text: 'எச்சரிக்கைகள் கேட்குதல்', correct: false },
          { text: 'தகவல் பெறுதல்', correct: false },
        ],
      },
    },
    {
      id: 'q2',
      text: {
        en: 'Which of the following is essential to carry during flood evacuation?',
        cn: '洪水撤离时必须携带下列哪项？',
        my: 'Apakah yang penting dibawa semasa pemindahan banjir?',
        tm: 'வெள்ளத்திலிருந்து வெளியேறும்போது அவசியமானது எது?',
      },
      options: {
        en: [
          { text: 'Important documents', correct: true },
          { text: 'Heavy furniture', correct: false },
          { text: 'Toys only', correct: false },
          { text: 'Garden tools', correct: false },
        ],
        cn: [
          { text: '重要文件', correct: true },
          { text: '重型家具', correct: false },
          { text: '只有玩具', correct: false },
          { text: '园艺工具', correct: false },
        ],
        my: [
          { text: 'Dokumen penting', correct: true },
          { text: 'Perabot berat', correct: false },
          { text: 'Mainan sahaja', correct: false },
          { text: 'Alat kebun', correct: false },
        ],
        tm: [
          { text: 'முக்கிய ஆவணங்கள்', correct: true },
          { text: 'கனமான மரம்', correct: false },
          { text: 'விளையாட்டுப் பொருட்கள் மட்டும்', correct: false },
          { text: 'தோட்ட உபகரணங்கள்', correct: false },
        ],
      },
    },

    // Tsunami
    {
      id: 'q3',
      text: {
        en: 'What is a warning sign of a potential tsunami?',
        cn: '可能发生海啸的警告信号是什么？',
        my: 'Apakah tanda amaran tsunami yang berkemungkinan berlaku?',
        tm: 'சுனாமிக்கு முன் எச்சரிக்கையாக எது இருக்க முடியும்?',
      },
      options: {
        en: [
          { text: 'Sudden retreat of the sea', correct: true },
          { text: 'Light rain', correct: false },
          { text: 'Strong wind', correct: false },
          { text: 'Cloudy sky', correct: false },
        ],
        cn: [
          { text: '海水突然退去', correct: true },
          { text: '小雨', correct: false },
          { text: '强风', correct: false },
          { text: '多云', correct: false },
        ],
        my: [
          { text: 'Laut tiba-tiba surut', correct: true },
          { text: 'Hujan ringan', correct: false },
          { text: 'Angin kuat', correct: false },
          { text: 'Langit mendung', correct: false },
        ],
        tm: [
          { text: 'கடல் திடீரென பின்னோக்கி செல்வது', correct: true },
          { text: 'இளஞ்சாரல்', correct: false },
          { text: 'கடுமையான காற்று', correct: false },
          { text: 'மேகமூட்டம்', correct: false },
        ],
      },
    },
    {
      id: 'q4',
      text: {
        en: 'Where is the safest place to go during a tsunami?',
        cn: '海啸期间最安全的地方是哪里？',
        my: 'Di manakah tempat paling selamat semasa tsunami?',
        tm: 'சுனாமி சமயத்தில் பாதுகாப்பான இடம் எது?',
      },
      options: {
        en: [
          { text: 'High ground', correct: true },
          { text: 'Beachfront', correct: false },
          { text: 'Underground', correct: false },
          { text: 'Open sea', correct: false },
        ],
        cn: [
          { text: '高地', correct: true },
          { text: '海滩', correct: false },
          { text: '地下', correct: false },
          { text: '公海', correct: false },
        ],
        my: [
          { text: 'Kawasan tinggi', correct: true },
          { text: 'Tepi pantai', correct: false },
          { text: 'Bawah tanah', correct: false },
          { text: 'Laut terbuka', correct: false },
        ],
        tm: [
          { text: 'உயரமான நிலம்', correct: true },
          { text: 'கடற்கரை', correct: false },
          { text: 'தாழ்நிலை', correct: false },
          { text: 'தெளிந்த கடல்', correct: false },
        ],
      },
    },

    // Earthquake
    {
      id: 'q5',
      text: {
        en: 'What should you do during an earthquake if indoors?',
        cn: '如果你在室内，地震时你应该做什么？',
        my: 'Apa yang harus anda lakukan semasa gempa bumi jika berada di dalam bangunan?',
        tm: 'நீங்கள் உள்ளே இருந்தால் நிலநடுக்கத்தின் போது என்ன செய்ய வேண்டும்?',
      },
      options: {
        en: [
          { text: 'Drop, cover, and hold on', correct: true },
          { text: 'Run outside', correct: false },
          { text: 'Use the elevator', correct: false },
          { text: 'Stand near windows', correct: false },
        ],
        cn: [
          { text: '趴下，掩护，抓牢', correct: true },
          { text: '跑到外面', correct: false },
          { text: '使用电梯', correct: false },
          { text: '靠近窗户站立', correct: false },
        ],
        my: [
          { text: 'Meniarap, lindungi, dan pegang erat', correct: true },
          { text: 'Lari keluar', correct: false },
          { text: 'Naik lif', correct: false },
          { text: 'Berdiri dekat tingkap', correct: false },
        ],
        tm: [
          { text: 'கீழே விழுந்து, மூடிய பின் பிடித்துக்கொள்ளவும்', correct: true },
          { text: 'வெளியில் ஓடுங்கள்', correct: false },
          { text: 'மின் எலிவேட்டரை பயன்படுத்துங்கள்', correct: false },
          { text: 'ஜன்னலின் அருகில் நின்றுகொள்ளுங்கள்', correct: false },
        ],
      },
    },
    {
      id: 'q6',
      text: {
        en: 'What should you prepare in case of earthquakes?',
        cn: '为应对地震你应该准备什么？',
        my: 'Apa yang harus anda sediakan sekiranya berlaku gempa bumi?',
        tm: 'நிலநடுக்கங்கள் ஏற்படும்போது எதை தயார் செய்ய வேண்டும்?',
      },
      options: {
        en: [
          { text: 'Emergency kit and evacuation plan', correct: true },
          { text: 'Swimming gear', correct: false },
          { text: 'Ski equipment', correct: false },
          { text: 'Barbecue set', correct: false },
        ],
        cn: [
          { text: '应急包和疏散计划', correct: true },
          { text: '游泳装备', correct: false },
          { text: '滑雪设备', correct: false },
          { text: '烧烤工具', correct: false },
        ],
        my: [
          { text: 'Kit kecemasan dan pelan pemindahan', correct: true },
          { text: 'Pakaian renang', correct: false },
          { text: 'Peralatan ski', correct: false },
          { text: 'Set barbeku', correct: false },
        ],
        tm: [
          { text: 'அவசர பொதியும் வெளியேறும் திட்டமும்', correct: true },
          { text: 'மிதவை ஆடை', correct: false },
          { text: 'ஸ்கீ உபகரணங்கள்', correct: false },
          { text: 'பார்பிக்யூ செட்', correct: false },
        ],
      },
    },

    // Landslide
    {
      id: 'q7',
      text: {
        en: 'What is a common cause of landslides?',
        cn: '滑坡的常见原因是什么？',
        my: 'Apakah punca biasa tanah runtuh?',
        tm: 'மண்ணசரிவுக்கு பொதுவான காரணம் என்ன?',
      },
      options: {
        en: [
          { text: 'Heavy rainfall', correct: true },
          { text: 'Sunny days', correct: false },
          { text: 'Mild breeze', correct: false },
          { text: 'Low humidity', correct: false },
        ],
        cn: [
          { text: '暴雨', correct: true },
          { text: '晴天', correct: false },
          { text: '微风', correct: false },
          { text: '低湿度', correct: false },
        ],
        my: [
          { text: 'Hujan lebat', correct: true },
          { text: 'Hari cerah', correct: false },
          { text: 'Angin sepoi', correct: false },
          { text: 'Kelembapan rendah', correct: false },
        ],
        tm: [
          { text: 'கனமழை', correct: true },
          { text: 'வெயிலான நாட்கள்', correct: false },
          { text: 'இளஞ்சாரல்', correct: false },
          { text: 'குறைந்த ஈரப்பதம்', correct: false },
        ],
      },
    },
    {
      id: 'q8',
      text: {
        en: 'What is a warning sign of a landslide?',
        cn: '滑坡的警告信号是什么？',
        my: 'Apakah tanda amaran tanah runtuh?',
        tm: 'மண்ணசரிவுக்கு எச்சரிக்கையான அறிகுறி என்ன?',
      },
      options: {
        en: [
          { text: 'Cracks on the ground or walls', correct: true },
          { text: 'Singing birds', correct: false },
          { text: 'Dry leaves', correct: false },
          { text: 'Clear skies', correct: false },
        ],
        cn: [
          { text: '地面或墙上的裂缝', correct: true },
          { text: '鸟儿在唱歌', correct: false },
          { text: '干叶子', correct: false },
          { text: '晴朗的天空', correct: false },
        ],
        my: [
          { text: 'Rekahan di tanah atau dinding', correct: true },
          { text: 'Burung bernyanyi', correct: false },
          { text: 'Daun kering', correct: false },
          { text: 'Langit cerah', correct: false },
        ],
        tm: [
          { text: 'தரையில் அல்லது சுவர்களில் பிளவுகள்', correct: true },
          { text: 'பாடும் பறவைகள்', correct: false },
          { text: 'உலர்ந்த இலைகள்', correct: false },
          { text: 'தெளிந்த வானம்', correct: false },
        ],
      },
    },
  ],
};
