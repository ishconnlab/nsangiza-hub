export type Lang = 'en' | 'rw' | 'fr'

export interface LanguageOption {
  code: Lang
  label: string
  native: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'rw', label: 'Kinyarwanda', native: 'Ikinyarwanda' },
  { code: 'fr', label: 'French', native: 'Français' },
]

const en = {
  'nav.findSupport': 'Find support',
  'nav.howItWorks': 'How it works',
  'nav.resources': 'Resources',
  'nav.safety': 'Safety',
  'nav.forProfessionals': 'For professionals',
  'nav.login': 'Log in',
  'nav.getStarted': 'Get started',
  'nav.dashboard': 'My dashboard',
  'nav.language': 'Language',
  'nav.menu': 'Open menu',
  'nav.close': 'Close menu',

  'footer.tagline':
    'Nsangiza Hub connects people in Rwanda with safe, confidential psychological support — online and in person, in Kinyarwanda, English and French.',
  'footer.private': 'Private and confidential',
  'footer.explore': 'Explore',
  'footer.company': 'Company',
  'footer.findSupport': 'Find support',
  'footer.howItWorks': 'How it works',
  'footer.wellbeing': 'Wellbeing resources',
  'footer.emergency': 'Emergency contacts',
  'footer.forProfessionals': 'For professionals',
  'footer.safety': 'Safety & safeguarding',
  'footer.contact': 'Contact',
  'footer.privacy': 'Privacy policy',
  'footer.terms': 'Terms of service',
  'footer.crisis':
    'If you or someone you know is in crisis, contact Rwanda National Police (112) or the Ambulance Service (912).',

  'home.badge': "Rwanda's safe space to talk",
  'home.title.before': "You don't have to carry this",
  'home.title.accent': 'alone.',
  'home.subtitle':
    'Nsangiza Hub connects you with verified counsellors and psychologists for confidential support — online or in person, in Kinyarwanda, English or French. Private, affordable and made for Rwanda.',
  'home.cta.find': 'Find support',
  'home.cta.resources': 'Explore resources',
  'home.fact.confidential.t': 'Confidential',
  'home.fact.confidential.d': 'Private by default',
  'home.fact.verified.t': 'Verified',
  'home.fact.verified.d': 'Documented and reviewed',
  'home.fact.human.t': 'Human',
  'home.fact.human.d': 'Real people, real care',
  'home.card.title': 'Your private space',
  'home.card.lock': 'End-to-end private',
  'home.card.checkin': "Today's check-in",
  'home.card.checkinDesc': 'A small step that helps you see the bigger picture.',
  'home.card.talk': 'Secure conversation',
  'home.card.talkDesc': 'A gentle, judgement-free space to talk — kept private and off public search.',
  'home.card.verified': 'Verified professionals only',

  'home.trust.pro.t': 'Verified professionals',
  'home.trust.pro.d': 'Every listing is reviewed before it goes live.',
  'home.trust.private.t': 'Private by default',
  'home.trust.private.d': 'Your check-ins and chats stay yours.',
  'home.trust.lang.t': 'In your language',
  'home.trust.lang.d': 'Kinyarwanda, English and French.',
  'home.trust.mode.t': 'Online or in person',
  'home.trust.mode.d': 'Choose what feels comfortable for you.',

  'home.how.eyebrow': 'How it works',
  'home.how.title': 'Support in four gentle steps',
  'home.how.intro': 'There is no right way to start. Move at the pace that feels safe for you.',
  'home.step1.t': 'Tell us how you are',
  'home.step1.d': 'A short, private check-in shapes your space — at your own pace, in your language.',
  'home.step2.t': 'Find the right person',
  'home.step2.d': 'Browse verified professionals by what you are going through, your city and your budget.',
  'home.step3.t': 'Talk securely',
  'home.step3.d': 'Start with a confidential chat, then choose audio, video or in-person sessions.',
  'home.step4.t': 'Keep going, gently',
  'home.step4.d': 'Daily check-ins, follow-ups, community and resources help you stay supported.',

  'home.pros.title': 'Featured professionals',
  'home.pros.subtitle': 'Verified providers ready to support you.',
  'home.pros.seeAll': 'See all professionals',

  'home.sessions.eyebrow': 'Secure sessions',
  'home.sessions.title': 'Book what feels right — chat, call or in person',
  'home.sessions.intro':
    'Choose the format that suits you. Everything stays inside Nsangiza Hub, so your support is consistent, private and easy to return to.',
  'home.sessions.f1': 'Book in a few taps and reschedule when life changes.',
  'home.sessions.f2': 'Secure messaging that never leaves the platform.',
  'home.sessions.f3': 'Follow-ups after sessions so support does not stop.',
  'home.sessions.f4': 'Clear, simple pricing shown up front in RWF.',
  'home.sessions.cta': 'Learn how sessions work',
  'home.sessions.topic1': 'Stress and anxiety',
  'home.sessions.topic2': 'Grief and loss',
  'home.sessions.topic3': 'Academic pressure',
  'home.sessions.topic4': 'Family concerns',

  'home.checkin.eyebrow': 'Daily wellbeing',
  'home.checkin.title': 'Small check-ins, clearer patterns',
  'home.checkin.intro':
    'Notice how you are doing over time — without pressure. Your check-ins are private and stay between you and the care team you choose.',
  'home.checkin.p1': 'A 30-second daily mood check-in.',
  'home.checkin.p2': 'See your own wellbeing trend over time.',
  'home.checkin.p3': 'Shared only with you and the care team you choose.',
  'home.checkin.cta': 'Start with a private check-in',
  'home.checkin.mood': "Today's mood",
  'home.checkin.private': 'Private',
  'home.checkin.note': 'Your trend is yours. Only you and your chosen care team can see it.',
  'home.checkin.m1': 'Very hard',
  'home.checkin.m2': 'Hard',
  'home.checkin.m3': 'Okay',
  'home.checkin.m4': 'Good',
  'home.checkin.m5': 'Great',

  'home.community.eyebrow': 'Community',
  'home.community.title': 'You are not the only one',
  'home.community.intro':
    'Join moderated spaces where people share what they are going through — kindly, privately and without judgement.',
  'home.community.p1': 'Moderated groups with clear community rules.',
  'home.community.p2': 'Supportive, thoughtful and grateful reactions.',
  'home.community.p3': 'Report anything that feels unsafe — a human reviews it.',
  'home.community.cta': 'Read our community safety approach',
  'home.community.moderated': 'Moderated',
  'home.community.g1.t': 'Staying steady',
  'home.community.g1.d': 'A gentle space to share small wins and hard days.',
  'home.community.g2.t': 'Students and study stress',
  'home.community.g2.d': 'Balancing exams, expectations and rest.',
  'home.community.g3.t': 'Grief and loss',
  'home.community.g3.d': 'Walking through loss with others who understand.',

  'home.resources.title': 'Start with gentle reads',
  'home.resources.subtitle': 'Public wellbeing resources — no account needed.',
  'home.resources.seeAll': 'Browse all resources',

  'home.safety.title': 'Your safety comes first',
  'home.safety.body':
    'Nsangiza Hub is not an emergency service. If you are in immediate danger, contact emergency services or a trusted person right away.',
  'home.safety.emergency': 'Emergency guidance',
  'home.safety.safeguarding': 'Safety and safeguarding',

  'home.faq.title': 'Questions people ask',
  'home.faq.q1': 'Is Nsangiza Hub private and confidential?',
  'home.faq.a1':
    'Yes. Your check-ins, notes and conversations are private to you and the care team you choose. Professionals work on a least-privilege model and never see raw personal notes by default. We are transparent about what is stored and why.',
  'home.faq.q2': 'Who are the professionals?',
  'home.faq.a2':
    'Every professional submits their licence or degree documents for review. Their listing only appears once our safeguarding team has verified those documents. You can see their qualifications, languages, session types and pricing before you book.',
  'home.faq.q3': 'How much does it cost?',
  'home.faq.a3':
    'Exploring resources and the community is free. Session fees are set by each professional and shown in RWF up front, so there are no surprises.',
  'home.faq.q4': 'What if I am in crisis right now?',
  'home.faq.a4':
    'If you or someone else is in immediate danger, call Rwanda National Police on 112 or the Ambulance Service on 912, or go to your nearest health facility. Nsangiza Hub is not an emergency service.',
  'home.faq.q5': 'Can I use it on my phone?',
  'home.faq.a5':
    'Yes. Nsangiza Hub is designed to feel like a native app on phones and can be installed from your browser. It also works comfortably on tablets and larger screens.',

  'home.founder.eyebrow': 'A note from our founder',
  'home.founder.quote':
    'Nsangiza Hub began with a simple belief: no one should have to carry their hardest days alone. Support should feel close, private and human — in the language you think and feel in. If we help even one person feel a little less alone, this was worth building.',
  'home.founder.name': 'Yabesi',
  'home.founder.title': 'Founder & CEO, Nsangiza Hub',

  'home.cta.title': 'Ready when you are',
  'home.cta.body':
    'Take the first step today. Create a free account, complete a short check-in and find someone who understands.',
  'home.cta.create': 'Create your free account',
  'home.cta.browse': 'Browse professionals',
} as const

export type TranslationKey = keyof typeof en

const rw: Partial<Record<TranslationKey, string>> = {
  'nav.findSupport': 'Shaka ubufasha',
  'nav.howItWorks': 'Bikorwa gute',
  'nav.resources': 'Ibikoresho',
  'nav.safety': 'Umutekano',
  'nav.forProfessionals': 'Abaganga n’abajyanama',
  'nav.login': 'Injira',
  'nav.getStarted': 'Tangira',
  'nav.dashboard': 'Ikibaho cyanjye',
  'nav.language': 'Ururimi',
  'nav.menu': 'Fungura menu',
  'nav.close': 'Funga menu',

  'footer.tagline':
    'Nsangiza Hub ihuza abantu mu Rwanda n’ubufasha bw’ubuzima bwo mu mutwe bwizewe kandi bw’ibanga — kuri interineti cyangwa aho uhuye n’umuganga, mu Kinyarwanda, Icyongereza n’Igifaransa.',
  'footer.private': 'Ibanga kandi byizewe',
  'footer.explore': 'Shakisha',
  'footer.company': 'Ikigo',
  'footer.findSupport': 'Shaka ubufasha',
  'footer.howItWorks': 'Bikorwa gute',
  'footer.wellbeing': 'Ibikoresho by’ubuzima',
  'footer.emergency': 'Nimero z’ibyihutirwa',
  'footer.forProfessionals': 'Abaganga n’abajyanama',
  'footer.safety': 'Umutekano n’uburinde',
  'footer.contact': 'Twandikire',
  'footer.privacy': 'Politiki y’ibanga',
  'footer.terms': 'Amabwiriza y’ikoreshwa',
  'footer.crisis':
    'Niba wowe cyangwa undi muntu ari mu kaga gahutirwa, hamagara Polisi y’Igihugu (112) cyangwa Serivisi y’Ibitaro (912).',

  'home.badge': 'Ahantu hizewe ho kuvuga mu Rwanda',
  'home.title.before': 'Ntugomba kwikorera ibi',
  'home.title.accent': 'wenyine.',
  'home.subtitle':
    'Nsangiza Hub ihuza na ba mujyanama n’aba psychologues bizewe kubufasha bw’ibanga — kuri interineti cyangwa aho uhuye, mu Kinyarwanda, Icyongereza cyangwa Igifaransa. Ni ibanga, bihendutse kandi byakorewe u Rwanda.',
  'home.cta.find': 'Shaka ubufasha',
  'home.cta.resources': 'Reba ibikoresho',
  'home.fact.confidential.t': 'Ibanga',
  'home.fact.confidential.d': 'Ibanga ku buryo busanzwe',
  'home.fact.verified.t': 'Byizewe',
  'home.fact.verified.d': 'Byagenzuwe kandi byemejwe',
  'home.fact.human.t': 'Umuntu nyabo',
  'home.fact.human.d': 'Abantu nyabo, ubufasha nyabo',
  'home.card.title': 'Ahantu hawe hy’ibanga',
  'home.card.lock': 'Ibanga kuva umwanzi',
  'home.card.checkin': 'Isuzuma rya uyu munsi',
  'home.card.checkinDesc': 'Intambwe nto igufasha kubona ikintu kinini.',
  'home.card.talk': 'Ikiganiro kizewe',
  'home.card.talkDesc': 'Ahantu hatekanye ho kuvuga nta nkeka — hagumye mu ibanga kandi hataboneka ku rubuga rusanzwe.',
  'home.card.verified': 'Abaganga bizewe gusa',

  'home.trust.pro.t': 'Abaganga bizewe',
  'home.trust.pro.d': 'Buri muntu agenzurwa mbere y’uko agaragara.',
  'home.trust.private.t': 'Ibanga ku buryo busanzwe',
  'home.trust.private.d': 'Isuzuma n’ibiganiro byawe biguma ari ibyawe.',
  'home.trust.lang.t': 'Mu rurimi rwawe',
  'home.trust.lang.d': 'Kinyarwanda, Icyongereza n’Igifaransa.',
  'home.trust.mode.t': 'Kuri interineti cyangwa aho uhuye',
  'home.trust.mode.d': 'Hitamo uko wumva ari byiza kuri wowe.',

  'home.how.eyebrow': 'Bikorwa gute',
  'home.how.title': 'Ubufasha mu ntambwe enye zoroheje',
  'home.how.intro': 'Nta buryo bwiza bw’ukuri bwo gutangira. Genda ku rugero wumva ari umutekano kuri wowe.',
  'home.step1.t': 'Tubwire uko umeze',
  'home.step1.d': 'Isuzuma rigufi ry’ibanga ryubaka ahantu hawe — ku rugero rwawe, mu rurimi rwawe.',
  'home.step2.t': 'Shaka umuntu ukwiriye',
  'home.step2.d': 'Reba abaganga bizewe bitewe n’ibyo unyuramo, umujyi wawe n’ingengo y’imari yawe.',
  'home.step3.t': 'Vuga mu mutekano',
  'home.step3.d': 'Tangira n’ikiganiro cy’ibanga, hanyuma uhitemo amajwi, videwo cyangwa guhura.',
  'home.step4.t': 'Komeza buhoro',
  'home.step4.d': 'Isuzuma rya buri munsi, kwikurikirana, umuryango n’ibikoresho bigufasha kuguma ufashwe.',

  'home.pros.title': 'Abaganga bakomeye',
  'home.pros.subtitle': 'Abaganga bizewe biteguye kugufasha.',
  'home.pros.seeAll': 'Reba abaganga bose',

  'home.sessions.eyebrow': 'Ibiganiro bizewe',
  'home.sessions.title': 'Tegura ibyo wumva ari byiza — ikiganiro, guhamagara cyangwa guhura',
  'home.sessions.intro':
    'Hitamo uburyo bukwiriye. Ibintu byose biguma mu Nsangiza Hub, bityo ubufasha bwawe bugumana urutonde, ibanga kandi byoroshye kongera.',
  'home.sessions.f1': 'Fata ibihe mu kanya gato kandi uhindure igihe ubuzima buhinduka.',
  'home.sessions.f2': 'Ubutumwa bukomeye butava ku rubuga.',
  'home.sessions.f3': 'Ugakurikiranwa nyuma y’ibiganiro, ubufasha ntibuhagarare.',
  'home.sessions.f4': 'Ibiciro bigaragara mbere mu ma RWF.',
  'home.sessions.cta': 'Menya uko ibiganiro bikorwa',
  'home.sessions.topic1': 'Guhangayika n’ubwoba',
  'home.sessions.topic2': 'Agahinda n’igihombo',
  'home.sessions.topic3': 'Umuhangayiko w’ishuri',
  'home.sessions.topic4': 'Ibibazo by’umuryango',

  'home.checkin.eyebrow': 'Ubuzima bwa buri munsi',
  'home.checkin.title': 'Isuzuma rito, imiterere igaragara',
  'home.checkin.intro':
    'Menya uko umeze igihe gihita — nta gahato. Isuzuma ryawe ni ibanga kandi riguma hagati yawe n’itsinda ry’ubuvuzi watoranyije.',
  'home.checkin.p1': 'Isuzuma ry’amarangamutima rya masegonda 30 buri munsi.',
  'home.checkin.p2': 'Reba urugendo rw’ubuzima bwawe igihe gihita.',
  'home.checkin.p3': 'Bisangizwa gusa nawe n’itsinda ry’ubuvuzi watoranyije.',
  'home.checkin.cta': 'Tangira n’isuzuma ry’ibanga',
  'home.checkin.mood': 'Amarangamutima y’uyu munsi',
  'home.checkin.private': 'Ibanga',
  'home.checkin.note': 'Urugendo rwawe ni rwawe. Wowe n’itsinda watoranyije gusa nibo bashobora kubona.',
  'home.checkin.m1': 'Bigoye cyane',
  'home.checkin.m2': 'Bigoye',
  'home.checkin.m3': 'Bishyize mu gaciro',
  'home.checkin.m4': 'Byiza',
  'home.checkin.m5': 'Byiza cyane',

  'home.community.eyebrow': 'Umuryango',
  'home.community.title': 'Ntabwo ari wowe wenyine',
  'home.community.intro':
    'Injira mu matsinda agenzuwe aho abantu basangiza ibyo banyuramo — mu buryo bwiza, bw’ibanga kandi nta gucira urubanza.',
  'home.community.p1': 'Amatsinda agenzuwe n’amategeko asobanutse.',
  'home.community.p2': 'Ibisubizo bishyigikira, bitekerekuye kandi bishimira.',
  'home.community.p3': 'Tanga ikirego ku kintu cyose kitumvikana nk’umutekano — umuntu akigenzura.',
  'home.community.cta': 'Soma uko dukora ku mutekano w’umuryango',
  'home.community.moderated': 'Igenzurwa',
  'home.community.g1.t': 'Kuguma utekanye',
  'home.community.g1.d': 'Ahantu hatekanye ho gusangiza intsinzi nto n’iminsi igoye.',
  'home.community.g2.t': 'Abanyeshuri n’umuhangayiko w’ishuri',
  'home.community.g2.d': 'Guhuza ibizamini, ibiteganyijwe n’ikiruhuko.',
  'home.community.g3.t': 'Agahinda n’igihombo',
  'home.community.g3.d': 'Guhura n’agahinda hamwe n’abandi batahura.',

  'home.resources.title': 'Tangira n’ibisomwa byoroheje',
  'home.resources.subtitle': 'Ibikoresho rusange by’ubuzima — nta konti ikenewe.',
  'home.resources.seeAll': 'Reba ibikoresho byose',

  'home.safety.title': 'Umutekano wawe uza mbere',
  'home.safety.body':
    'Nsangiza Hub ntabwo ari serivisi y’ibihutirwa. Niba uri mu kaga gahutirwa, hamagara serivisi z’ibihutirwa cyangwa umuntu wizeye ako kanya.',
  'home.safety.emergency': 'Ubuyobozi bw’ibihutirwa',
  'home.safety.safeguarding': 'Umutekano n’uburinde',

  'home.faq.title': 'Ibibazo abantu babaza',
  'home.faq.q1': 'Ese Nsangiza Hub ni ibanga kandi yizewe?',
  'home.faq.a1':
    'Yego. Isuzuma, inyandiko n’ibiganiro byawe ni ibanga kuri wowe n’itsinda watoranyije. Abaganga bakorana amabwiriza y’uburenganzira buke kandi ntibabona inyandiko z’umuntu mu buryo bwa mbere. Turi mu mucyo ku byo tubika n’impamvu.',
  'home.faq.q2': 'Abaganga ni bande?',
  'home.faq.a2':
    'Buri muganga atanga impamyabumenyi cyangwa impapuro ze kugira ngo zigenzurwe. Agaragara gusa iyo itsinda ry’uburinde ryemeje izo nyandiko. Ushobora kubona ubumenyi bwe, indimi, ubwoko bw’ibiganiro n’ibiciro mbere yo gufata.',
  'home.faq.q3': 'Bitwara angahe?',
  'home.faq.a3':
    'Kureba ibikoresho n’umuryango ni ubuntu. Amafaranga y’ibiganiro ashyirwa n’umuganga wese kandi agaragara mu ma RWF mbere, nta gutungurwa.',
  'home.faq.q4': 'Bite se niba ndi mu kaga ubu?',
  'home.faq.a4':
    'Niba wowe cyangwa undi uri mu kaga gahutirwa, hamagara Polisi y’Igihugu kuri 112 cyangwa Serivisi y’Ibitaro kuri 912, cyangwa jya ku kigo nderabuzima kiri hafi. Nsangiza Hub ntabwo ari serivisi y’ibihutirwa.',
  'home.faq.q5': 'Nshobora kuyikoresha kuri telefone yanjye?',
  'home.faq.a5':
    'Yego. Nsangiza Hub yagenewe kumera nk’porogaramu ya telefone kandi ishobora kwishyirwaho binyuze muri mushakisha. Ikora neza no kuri tablet na ecran nini.',

  'home.founder.eyebrow': 'Ubutumwa buva ku washinze',
  'home.founder.quote':
    'Nsangiza Hub yatangiye ku kwizera kworoshye: nta muntu ugomba kwikorera iminsi ye igoye wenyine. Ubufasha bugomba kuba hafi, bw’ibanga kandi bw’umuntu — mu rurimi utekereza kandi wumva. Niba dufashije umuntu umwe kwumva atari wenyine, ibi byari bikwiye kubakwa.',
  'home.founder.name': 'Yabesi',
  'home.founder.title': 'Uwashinze akaba n’Umuyobozi Mukuru, Nsangiza Hub',

  'home.cta.title': 'Twiteguye igihe witeguye',
  'home.cta.body':
    'Fata intambwe ya mbere uyu munsi. Fungura konti kubuntu, kora isuzuma rigufi kandi ushake umuntu utahura.',
  'home.cta.create': 'Fungura konti yawe kubuntu',
  'home.cta.browse': 'Reba abaganga',
}

const fr: Partial<Record<TranslationKey, string>> = {
  'nav.findSupport': 'Trouver du soutien',
  'nav.howItWorks': 'Comment ça marche',
  'nav.resources': 'Ressources',
  'nav.safety': 'Sécurité',
  'nav.forProfessionals': 'Pour les professionnels',
  'nav.login': 'Se connecter',
  'nav.getStarted': 'Commencer',
  'nav.dashboard': 'Mon espace',
  'nav.language': 'Langue',
  'nav.menu': 'Ouvrir le menu',
  'nav.close': 'Fermer le menu',

  'footer.tagline':
    'Nsangiza Hub met en relation les personnes au Rwanda avec un soutien psychologique sûr et confidentiel — en ligne ou en personne, en kinyarwanda, anglais et français.',
  'footer.private': 'Privé et confidentiel',
  'footer.explore': 'Explorer',
  'footer.company': 'Société',
  'footer.findSupport': 'Trouver du soutien',
  'footer.howItWorks': 'Comment ça marche',
  'footer.wellbeing': 'Ressources de bien-être',
  'footer.emergency': 'Contacts d’urgence',
  'footer.forProfessionals': 'Pour les professionnels',
  'footer.safety': 'Sécurité et protection',
  'footer.contact': 'Contact',
  'footer.privacy': 'Politique de confidentialité',
  'footer.terms': 'Conditions d’utilisation',
  'footer.crisis':
    'Si vous ou une personne de votre entourage êtes en crise, contactez la Police nationale du Rwanda (112) ou le service d’ambulance (912).',

  'home.badge': 'L’espace sûr pour parler au Rwanda',
  'home.title.before': 'Vous n’avez pas à porter cela',
  'home.title.accent': 'seul.',
  'home.subtitle':
    'Nsangiza Hub vous met en relation avec des conseillers et psychologues vérifiés pour un soutien confidentiel — en ligne ou en personne, en kinyarwanda, anglais ou français. Privé, abordable et conçu pour le Rwanda.',
  'home.cta.find': 'Trouver du soutien',
  'home.cta.resources': 'Explorer les ressources',
  'home.fact.confidential.t': 'Confidentiel',
  'home.fact.confidential.d': 'Privé par défaut',
  'home.fact.verified.t': 'Vérifié',
  'home.fact.verified.d': 'Documenté et examiné',
  'home.fact.human.t': 'Humain',
  'home.fact.human.d': 'De vraies personnes, de vrais soins',
  'home.card.title': 'Votre espace privé',
  'home.card.lock': 'Privé de bout en bout',
  'home.card.checkin': 'Le point du jour',
  'home.card.checkinDesc': 'Un petit pas qui aide à voir l’ensemble.',
  'home.card.talk': 'Conversation sécurisée',
  'home.card.talkDesc':
    'Un espace bienveillant et sans jugement pour parler — gardé privé et hors des recherches publiques.',
  'home.card.verified': 'Professionnels vérifiés uniquement',

  'home.trust.pro.t': 'Professionnels vérifiés',
  'home.trust.pro.d': 'Chaque profil est examiné avant publication.',
  'home.trust.private.t': 'Privé par défaut',
  'home.trust.private.d': 'Vos points et vos échanges restent les vôtres.',
  'home.trust.lang.t': 'Dans votre langue',
  'home.trust.lang.d': 'Kinyarwanda, anglais et français.',
  'home.trust.mode.t': 'En ligne ou en personne',
  'home.trust.mode.d': 'Choisissez ce qui vous met à l’aise.',

  'home.how.eyebrow': 'Comment ça marche',
  'home.how.title': 'Un accompagnement en quatre étapes douces',
  'home.how.intro': 'Il n’y a pas de bonne façon de commencer. Avancez à votre rythme.',
  'home.step1.t': 'Dites-nous comment vous allez',
  'home.step1.d': 'Un court point privé façonne votre espace — à votre rythme, dans votre langue.',
  'home.step2.t': 'Trouvez la bonne personne',
  'home.step2.d': 'Parcourez des professionnels vérifiés selon votre situation, votre ville et votre budget.',
  'home.step3.t': 'Parlez en toute sécurité',
  'home.step3.d': 'Commencez par un chat confidentiel, puis choisissez l’audio, la vidéo ou en personne.',
  'home.step4.t': 'Continuez, en douceur',
  'home.step4.d': 'Points quotidiens, suivis, communauté et ressources vous soutiennent dans la durée.',

  'home.pros.title': 'Professionnels en vedette',
  'home.pros.subtitle': 'Des prestataires vérifiés prêts à vous soutenir.',
  'home.pros.seeAll': 'Voir tous les professionnels',

  'home.sessions.eyebrow': 'Séances sécurisées',
  'home.sessions.title': 'Réservez ce qui vous convient — chat, appel ou en personne',
  'home.sessions.intro':
    'Choisissez le format qui vous convient. Tout reste dans Nsangiza Hub, pour un soutien cohérent, privé et facile à reprendre.',
  'home.sessions.f1': 'Réservez en quelques gestes et reprogrammez quand la vie change.',
  'home.sessions.f2': 'Une messagerie sécurisée qui ne quitte jamais la plateforme.',
  'home.sessions.f3': 'Des suivis après les séances pour que le soutien ne s’arrête pas.',
  'home.sessions.f4': 'Des tarifs clairs, affichés à l’avance en RWF.',
  'home.sessions.cta': 'Découvrir comment se déroulent les séances',
  'home.sessions.topic1': 'Stress et anxiété',
  'home.sessions.topic2': 'Deuil et perte',
  'home.sessions.topic3': 'Pression scolaire',
  'home.sessions.topic4': 'Difficultés familiales',

  'home.checkin.eyebrow': 'Bien-être quotidien',
  'home.checkin.title': 'De petits points, des tendances plus claires',
  'home.checkin.intro':
    'Observez comment vous allez au fil du temps — sans pression. Vos points sont privés et restent entre vous et l’équipe choisie.',
  'home.checkin.p1': 'Un point d’humeur quotidien de 30 secondes.',
  'home.checkin.p2': 'Voyez votre propre tendance de bien-être au fil du temps.',
  'home.checkin.p3': 'Partagé uniquement avec vous et l’équipe que vous choisissez.',
  'home.checkin.cta': 'Commencer par un point privé',
  'home.checkin.mood': 'L’humeur du jour',
  'home.checkin.private': 'Privé',
  'home.checkin.note': 'Votre tendance vous appartient. Seuls vous et l’équipe choisie la voyez.',
  'home.checkin.m1': 'Très difficile',
  'home.checkin.m2': 'Difficile',
  'home.checkin.m3': 'Moyen',
  'home.checkin.m4': 'Bien',
  'home.checkin.m5': 'Très bien',

  'home.community.eyebrow': 'Communauté',
  'home.community.title': 'Vous n’êtes pas seul',
  'home.community.intro':
    'Rejoignez des espaces modérés où les gens partagent leur vécu — avec bienveillance, confidentialité et sans jugement.',
  'home.community.p1': 'Des groupes modérés avec des règles claires.',
  'home.community.p2': 'Des réactions bienveillantes, réfléchies et reconnaissantes.',
  'home.community.p3': 'Signalez tout ce qui semble dangereux — un humain l’examine.',
  'home.community.cta': 'Découvrir notre approche de la sécurité communautaire',
  'home.community.moderated': 'Modéré',
  'home.community.g1.t': 'Rester stable',
  'home.community.g1.d': 'Un espace doux pour partager les petites victoires et les jours difficiles.',
  'home.community.g2.t': 'Étudiants et stress des études',
  'home.community.g2.d': 'Concilier examens, attentes et repos.',
  'home.community.g3.t': 'Deuil et perte',
  'home.community.g3.d': 'Traverser le deuil avec d’autres qui comprennent.',

  'home.resources.title': 'Commencez par des lectures douces',
  'home.resources.subtitle': 'Ressources de bien-être publiques — sans compte.',
  'home.resources.seeAll': 'Parcourir toutes les ressources',

  'home.safety.title': 'Votre sécurité passe d’abord',
  'home.safety.body':
    'Nsangiza Hub n’est pas un service d’urgence. En cas de danger immédiat, contactez les services d’urgence ou une personne de confiance sans attendre.',
  'home.safety.emergency': 'Guide d’urgence',
  'home.safety.safeguarding': 'Sécurité et protection',

  'home.faq.title': 'Les questions fréquentes',
  'home.faq.q1': 'Nsangiza Hub est-il privé et confidentiel ?',
  'home.faq.a1':
    'Oui. Vos points, notes et conversations sont privés pour vous et l’équipe que vous choisissez. Les professionnels travaillent en accès restreint et ne voient pas vos notes brutes par défaut. Nous sommes transparents sur ce qui est stocké et pourquoi.',
  'home.faq.q2': 'Qui sont les professionnels ?',
  'home.faq.a2':
    'Chaque professionnel soumet sa licence ou son diplôme pour examen. Son profil n’apparaît qu’après vérification par notre équipe. Vous voyez leurs qualifications, langues, types de séances et tarifs avant de réserver.',
  'home.faq.q3': 'Combien cela coûte-t-il ?',
  'home.faq.a3':
    'Explorer les ressources et la communauté est gratuit. Les tarifs des séances sont fixés par chaque professionnel et affichés en RWF à l’avance, sans surprise.',
  'home.faq.q4': 'Et si je suis en crise maintenant ?',
  'home.faq.a4':
    'Si vous ou une autre personne êtes en danger immédiat, appelez la Police nationale du Rwanda au 112 ou l’ambulance au 912, ou rendez-vous au centre de santé le plus proche. Nsangiza Hub n’est pas un service d’urgence.',
  'home.faq.q5': 'Puis-je l’utiliser sur mon téléphone ?',
  'home.faq.a5':
    'Oui. Nsangiza Hub est conçu pour ressembler à une application sur téléphone et peut être installé depuis votre navigateur. Il fonctionne aussi sur tablette et grand écran.',

  'home.founder.eyebrow': 'Un mot de notre fondateur',
  'home.founder.quote':
    'Nsangiza Hub est né d’une conviction simple : personne ne devrait porter seul ses jours les plus difficiles. Le soutien doit être proche, privé et humain — dans la langue où vous pensez et ressentez. Si nous aidons ne serait-ce qu’une personne à se sentir un peu moins seule, cela valait la peine.',
  'home.founder.name': 'Yabesi',
  'home.founder.title': 'Fondateur et CEO, Nsangiza Hub',

  'home.cta.title': 'Prêt quand vous l’êtes',
  'home.cta.body':
    'Faites le premier pas aujourd’hui. Créez un compte gratuit, faites un court point et trouvez une personne qui comprend.',
  'home.cta.create': 'Créer votre compte gratuit',
  'home.cta.browse': 'Parcourir les professionnels',
}

export const dictionaries: Record<Lang, Partial<Record<TranslationKey, string>>> = { en, rw, fr }
export const englishDictionary = en
