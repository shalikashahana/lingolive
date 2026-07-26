const fs = require('fs');

// Arabic to transliteration mapping - comprehensive system
function arabicToTransliteration(arabic) {
  // Remove diacritics markers that are embedded in text like (رقم 1), (رقم 2) etc.
  // and also نعم. at the end
  let text = arabic
    .replace(/\s*\(رقم\s+\d+\)/g, '') // Remove "(رقم N)"
    .replace(/\.\s*نعم\s*\.?\s*$/g, '') // Remove trailing "نعم." 
    .replace(/\s*نعم\s*\.?\s*$/g, '')
    .trim();

  const charMap = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': "'", 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'h', 'ء': "'", 'ئ': 'i', 'ؤ': 'u',
    'لا': 'la', 'لأ': 'la', 'لإ': 'li', 'لآ': 'laa',
    // Vowels (diacritics)
    'َ': 'a', 'ِ': 'i', 'ُ': 'u',
    'ً': 'an', 'ٍ': 'in', 'ٌ': 'un',
    'ّ': '', // Shadda (double consonant - handled separately)
    'ْ': '', // Sukun
    'ـ': '', // Tatweel
  };

  // Definite article handling
  const sunLetters = ['ت','ث','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ل','ن'];
  
  // Simple transliteration
  let result = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    
    // Skip spaces
    if (ch === ' ') {
      result += ' ';
      i++;
      continue;
    }
    
    // Map character
    if (charMap[ch] !== undefined) {
      result += charMap[ch];
    } else if (ch.charCodeAt(0) > 127) {
      // Other Arabic chars - skip or keep as-is
    } else {
      result += ch;
    }
    i++;
  }
  
  return result.trim();
}

// Proper transliterations for Module 5 sentences based on their Arabic content
const module5Transliterations = {
  "أَهْلًا وَسَهْلًا، كَيْفَ حَالُكَ اليَوْمَ؟ (رقم 1)": "Ahlan wa sahlan, kayfa haluka al-yawma?",
  "أَهْلًا بِكَ، أَنَا بِخَيْرٍ والْحَمْدُ لِلَّهِ. نعم.": "Ahlan bika, ana bi-khayrin wal-hamdu lillahi.",
  "مَا اسْمُكَ الكَرِيمُ يَا أَخِي؟ (رقم 2)": "Ma ismuka al-karimu ya akhi?",
  "اسْمِي مُحَمَّدٌ، وَمَا اسْمُكَ أَنْتَ؟ نعم.": "Ismi Muhammadun, wa ma ismuka anta?",
  "أَنَا أَحْمَدُ. مِنْ أَيْنَ أَنْتَ؟ (رقم 3)": "Ana Ahmadu. Min ayna anta?",
  "أَنَا مِنَ الهِنْدِ، وَأَنْتَ مِنْ أَيْنَ؟ نعم.": "Ana mina al-hindi, wa anta min ayna?",
  "أَنَا مِنْ مِصْرَ. هَلْ تَسْكُنُ هُنَا؟ (رقم 4)": "Ana min misra. Hal taskunu huna?",
  "نَعَمْ، أَسْكُنُ فِي هَذِهِ المَدِينَةِ مُنْذُ سَنَةٍ. نعم.": "Na'am, askunu fi hadhihi al-madinati mundhu sanatin.",
  "هَلْ تُحِبُّ تَعَلُّمَ اللُّغَةِ العَرَبِيَّةِ؟ (رقم 5)": "Hal tuhibbu ta'alluma al-lughati al-'arabiyyati?",
  "نَعَمْ، أُحِبُّهَا كَثِيرًا لِأَنَّهَا لُغَةُ القُرْآنِ. نعم.": "Na'am, uhibbuha kathiran li-annaha lughatu al-qur'ani.",
  "كَمْ لُغَةً تَتَكَلَّمُ في حَيَاتِكَ؟ (رقم 6)": "Kam lughatan tatakallamu fi hayatika?",
  "أَتَكَلَّمُ اللُّغَةَ العَرَبِيَّةَ والتَّامِيلِيَّةَ والإِنْجِلِيزِيَّةَ. نعم.": "Atakallamu al-lughata al-'arabiyyata wat-tamiliyyata wal-injiliyyata.",
  "هَلْ تَتَكَلَّمُ العَرَبِيَّةَ بِطَلَاقَةٍ تَامَّةٍ؟ (رقم 7)": "Hal tatakallamu al-'arabiyyata bi-talaqatin tammatin?",
  "قَلِيلًا، مَا زِلْتُ أَتَعَلَّمُ القَوَاعِدَ الجَدِيدَةَ. نعم.": "Qalilan, ma ziltu ata'allamu al-qawa'ida al-jadidah.",
  "مَاذَا تَعْمَلُ في هَذِهِ الشَّرِكَةِ؟ (رقم 8)": "Madha ta'amalu fi hadhihi ash-sharikati?",
  "أَنَا أَعْمَلُ مُهَنْدِسًا حَاسُوبِيًّا مَاهِرًا. نعم.": "Ana a'amalu muhandisan hasibiyyan mahiran.",
  "أَيْنَ سَتَذْهَبُ بَعْدَ انْتِهَاءِ العَمَلِ؟ (رقم 9)": "Ayna satadhhabu ba'da intihaa'i al-amali?",
  "سَأَذْهَبُ إِلَى السُّوقِ لأَشْتَرِيَ بَعْضَ الأَغْرَاضِ. نعم.": "Sa-adhhabu ila as-suqi li-ashtariya ba'da al-aghradi.",
  "مَاذَا سَتَشْتَرِي مِنَ السُّوقِ اليَوْمَ؟ (رقم 10)": "Madha satashtarii mina as-suqi al-yawma?",
  "سَأَشْتَرِي خُضَارً وَفَوَاكِهَ طَازَجَةً لِلْبَيْتِ. نعم.": "Sa-ashtarii khudara wa fawakiha tazajatan lil-bayti.",
  "هَلْ عِنْدَكَ سَيَّارَةٌ خَاصَّةٌ بِكَ؟ (رقم 11)": "Hal 'indaka sayyaratun khassatun bika?",
  "نَعَمْ، عِنْدِي سَيَّارَةٌ جَدِيدَةٌ وَسَرِيعَةٌ. نعم.": "Na'am, 'indi sayyaratun jadidatun wa sari'atun.",
  "كَمْ سِعْرُ هَذِهِ السَّيَّارَةِ الجَمِيلَةِ؟ (رقم 12)": "Kam si'ru hadhihi as-sayyarati al-jamilati?",
  "سِعْرُهَا غَالٍ قَلِيلًا وَلَكِنَّهَا مُرِيحَةٌ. نعم.": "Si'ruha ghalin qalilan wa lakinnaha murihatun.",
  "هَلْ نَسْتَطِيعُ الذَّهَبَ إِلى المَطْعَمِ الآنَ؟ (رقم 13)": "Hal nastati'u adh-dhahaba ila al-mat'ami al-ana?",
  "نَعَمْ، بِكُلِّ سُرُورٍ، أَنَا جَائِعٌ جِدًّا. نعم.": "Na'am, bi-kulli sururin, ana ja'i'un jiddan.",
  "مَاذَا تُرِيدُ أَنْ تَطْلُبَ لِلْعَشَاءِ؟ (رقم 14)": "Madha turidu an tatlubu lil-'asha'i?",
  "أَطْلُبُ الدَّجَاجَ المَشْوِيَّ مَعَ الأُرْزِ البَسْمَتِيِّ. نعم.": "Atlubu ad-dajaja al-mashwiyya ma'a al-urzi al-basmatiyi.",
  "هَلْ تُحِبُّ شُرْبَ العَصِيرِ البَارِدِ؟ (رقم 15)": "Hal tuhibbu shurba al-'asiri al-baridi?",
  "نَعْمْ، أُحِبُّ عَصِيرَ البُرْتُقَالِ الطَّازَجَ. نعم.": "Na'am, uhibbu 'asira al-burtuqali at-tazaj.",
  "كَمْ حِسَابُ الوَجْبَةِ بِالْكَامِلِ؟ (رقم 16)": "Kam hisabu al-wajbati bil-kamili?",
  "الحِسَابُ عَلَيَّ اليَوْمَ، لَا تَقْلَقْ أَبَدًا. نعم.": "Al-hisabu 'alayya al-yawma, la taqlaq abadan.",
  "شُكْرًا جَزِيلًا لَكَ عَلى كَرَمِكَ البَالِغِ. (رقم 17)": "Shukran jazilan laka 'ala karamika al-balighi.",
  "عَفْوًا يَا أَخِي، هَذَا وَاجِبِي بَيْنَنَا. نعم.": "Afwan ya akhi, hadha wajibii baynana.",
  "هَلْ تَعْرِفُ طَرِيقَ المَطَارِ الدَّوْلِيِّ؟ (رقم 18)": "Hal ta'rifu tariqa al-matari ad-dawliyyi?",
  "نَعَمْ، الطَّرِيقُ سَهْلٌ وَيَسْتَغْرِقُ نِصْفَ سَاعَةٍ. نعم.": "Na'am, at-tariqu sahlun wa yastaghriqu nisfa sa'atin.",
  "هَلْ مَعَكَ جَوَازُ السَّفَرِ وَالتَّذْكِرَةُ؟ (رقم 19)": "Hal ma'aka jawazu as-safari wat-tadhkiratu?",
  "نَعَمْ، كُلُّ الأَوْرَاقِ المُهِمَّةِ فِي حَقِيبَتِي. نعم.": "Na'am, kullu al-awraqi al-muhimmati fi haqibati.",
  "إِذًا، لِنَذْهَبْ إِلَى المَطَارِ بِسُرْعَةٍ. (رقم 20)": "Idhan, li-nadhhhab ila al-matari bi-sur'atin.",
  "حَسَنًا، أَنَا جَاهِزٌ تَمَامًا لِلرِّحْلَةِ. نعم.": "Hasanan, ana jahizun tamaman lir-rihlati.",
  "هَلْ تَعْرِفُ حَالَةَ الطَّقْسِ لِهَذَا اليَوْمِ؟ (رقم 21)": "Hal ta'rifu halata at-taqsi li-hadha al-yawmi?",
  "الجَوُّ مُشْرِقٌ جِدًّا وَلَكِنَّ الحَرَارَةَ عَالِيَةٌ. نعم.": "Al-jawwu mushriqun jiddan wa lakinna al-hararata 'aliyatun.",
  "هَلْ سَيَنْزِلُ المَطَرُ هَذَا المَسَاءَ؟ (رقم 22)": "Hal sayanzilu al-mataru hadha al-masa'a?",
  "لَا أَعْتَقِدُ ذَلِكَ، فَالسَّمَاءُ صَافِيَةٌ. نعم.": "La a'taqidu dhalika, fas-sama'u safiyatun.",
  "هَلْ سَافَرْتَ مِنْ قَبْلُ إِلى دُبَيْ؟ (رقم 23)": "Hal safarta min qablu ila dubay?",
  "نَعَمْ، سَافَرْتُ إِلَيْهَا مَرَّتَيْنِ فِي السَّنَةِ المَاضِيَةِ. نعم.": "Na'am, safartu ilayha marratayni fi as-sanati al-madiyati.",
  "كَيْفَ وَجَدْتَ تِلْكَ المَدِينَةَ العَظِيمَةَ؟ (رقم 24)": "Kayfa wajadta tilka al-madinata al-'azimata?",
  "إِنَّهَا مَدِينَةٌ رَائِعَةٌ تَمْلَؤُهَا نَاطِحَاتُ السَّحَابِ. نعم.": "Innaha madinatun ra'i'atun tamla'uha natihatu as-sahabi.",
  "هَلْ تُرِيدُ أَنْ تَقْرَأَ الجَرِيدَةَ الصَّبَاحِيَّةَ؟ (رقم 25)": "Hal turidu an taqra'a al-jaridata as-sabahiyyata?",
  "نَعَمْ، أُرِيدُ قِرَاءَةَ الأَخْبَارِ السِّيَاسِيَّةِ. نعم.": "Na'am, uridu qira'ata al-akhbari as-siyasiyyati.",
  "أَيْنَ حَاسُوبُكَ الشَّخْصِيُّ اليَوْمَ؟ (رقم 26)": "Ayna hasibuka ash-shakhsiyyu al-yawma?",
  "هُوَ عَلَى المَكْتَبِ فِي غُرْفَةِ النَّوْمِ. نعم.": "Huwa 'ala al-maktabi fi ghurfati an-nawmi.",
  "هَلْ تُسَاعِدُنِي في حَلِّ هَذِهِ المُشْكِلَةِ؟ (رقم 27)": "Hal tusa'iduni fi halli hadhihi al-mushkilati?",
  "بِكُلِّ سُرُورٍ، مَا هِيَ المُشْكِلَةُ بَضْبْطٍ؟ نعم.": "Bi-kulli sururin, ma hiya al-mushkilatu bid-dabti?",
  "أُرِيدُ شِرَاءَ هَاتِفٍ ذَكِيٍّ جَدِيدٍ لِأَخِي. (رقم 28)": "Uridu shira'a hatifin dhakiyyin jadidin li-akhi.",
  "أَنْصَحُكَ بِشِرَاءِ الهَاتِفِ المَعْرُوفِ فِي السُّوقِ. نعم.": "Ansahuka bi-shira'i al-hatifi al-ma'rufi fi as-suqi.",
  "هَلْ شَاهَدْتَ مُبَارَاةَ كُرَةِ القَدَمِ أَمْسِ؟ (رقم 29)": "Hal shahadta mubara'ta kurati al-qadami amsi?",
  "نَعَمْ، كَانَتْ مُبَارَاةً حَامِسَةً وَقَوِيَّةً جِدًّا. نعم.": "Na'am, kanat mubaratan hamasiyatan wa qawiyyatan jiddan.",
  "مَنْ فَازَ بِتِلْكَ المُبَارَاةِ الصَّعْبَةِ؟ (رقم 30)": "Man faza bi-tilka al-mubarati as-sa'bati?",
  "فَازَ الفَرِيقُ الأَحْمَرُ بِثَلَاثَةِ أَهْدَافٍ. نعم.": "Faza al-fariqu al-ahmaru bi-thalathati ahdafin.",
};

// Generate transliterations for repeated blocks (31-200)
// The pattern in module 5 repeats every 30 dialogues
function getTransliterationForModule5(arabic) {
  // Clean Arabic text
  const cleanedArabic = arabic.replace(/\s*\(رقم\s+\d+\)\s*/g, '').trim();
  const cleanedKey = arabic.trim();
  
  // First check direct match
  if (module5Transliterations[cleanedKey]) {
    return module5Transliterations[cleanedKey];
  }
  
  // Find a matching key ignoring the number suffix
  const arabicBase = cleanedArabic.replace(/\.\s*نعم\s*\.?\s*$/g, '').replace(/\s*نعم\s*\.?\s*$/g, '').trim();
  
  for (const [key, val] of Object.entries(module5Transliterations)) {
    const keyBase = key
      .replace(/\s*\(رقم\s+\d+\)\s*/g, '')
      .replace(/\.\s*نعم\s*\.?\s*$/g, '')
      .replace(/\s*نعم\s*\.?\s*$/g, '')
      .trim();
    if (keyBase === arabicBase) {
      return val;
    }
  }
  
  return null;
}

const data = JSON.parse(fs.readFileSync('src/data/arabicSentencesData.json', 'utf8'));

let fixedCount = 0;

for (const module of data.modules) {
  if (!module.sentences) continue;
  
  for (const sentence of module.sentences) {
    // Check if transliteration is a placeholder (Turn N query/response statement)
    const isPlaceholder = /^Turn\s+\d+\s+(query|response)\s+statement\.?$/i.test(sentence.transliteration);
    const isEmpty = !sentence.transliteration || sentence.transliteration.trim() === '';
    
    if (isPlaceholder || isEmpty) {
      // Try to find a proper transliteration
      const transliteration = getTransliterationForModule5(sentence.arabic);
      if (transliteration) {
        sentence.transliteration = transliteration;
        fixedCount++;
      }
    }
    
    // Also clean up meaning_english and meaning_tamil
    if (sentence.meaning_english) {
      sentence.meaning_english = sentence.meaning_english
        .replace(/\s*\[Context\s+\d+\]/g, '')
        .replace(/\s*\[Response\s+\d+\]/g, '')
        .trim();
    }
    
    if (sentence.meaning_tamil) {
      sentence.meaning_tamil = sentence.meaning_tamil
        .replace(/\s*\(திருப்பூர்\s+உரையாடல்\s+\d+\)/g, '')
        .replace(/\s*\(பதில்\s+\d+\)/g, '')
        .trim();
    }
    
    // Also clean Arabic text of extra markers
    if (sentence.arabic) {
      sentence.arabic = sentence.arabic
        .replace(/\s*\(رقم\s+\d+\)\s*/g, '')
        .replace(/\.\s*نعم\s*\.?\s*$/g, '')
        .replace(/\s+نعم\s*\.?\s*$/g, '')
        .trim();
    }
  }
}

fs.writeFileSync('src/data/arabicSentencesData.json', JSON.stringify(data, null, 2));
console.log(`Fixed ${fixedCount} transliterations.`);
console.log(`Done!`);
