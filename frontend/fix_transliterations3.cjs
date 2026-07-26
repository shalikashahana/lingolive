const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/arabicSentencesData.json', 'utf8'));

// Complete mapping - keyed by the cleaned Arabic text (no رقم, no نعم)
const transliterationMap = {
  "أَهْلًا وَسَهْلًا، كَيْفَ حَالُكَ اليَوْمَ؟": "Ahlan wa sahlan, kayfa haluka al-yawma?",
  "أَهْلًا بِكَ، أَنَا بِخَيْرٍ والْحَمْدُ لِلَّهِ": "Ahlan bika, ana bi-khayrin wal-hamdu lillahi.",
  "مَا اسْمُكَ الكَرِيمُ يَا أَخِي؟": "Ma ismuka al-karimu ya akhi?",
  "اسْمِي مُحَمَّدٌ، وَمَا اسْمُكَ أَنْتَ؟": "Ismi Muhammadun, wa ma ismuka anta?",
  "أَنَا أَحْمَدُ. مِنْ أَيْنَ أَنْتَ؟": "Ana Ahmadu. Min ayna anta?",
  "أَنَا مِنَ الهِنْدِ، وَأَنْتَ مِنْ أَيْنَ؟": "Ana mina al-hindi, wa anta min ayna?",
  "أَنَا مِنْ مِصْرَ. هَلْ تَسْكُنُ هُنَا؟": "Ana min misra. Hal taskunu huna?",
  "نَعَمْ، أَسْكُنُ فِي هَذِهِ المَدِينَةِ مُنْذُ سَنَةٍ": "Na'am, askunu fi hadhihi al-madinati mundhu sanatin.",
  "هَلْ تُحِبُّ تَعَلُّمَ اللُّغَةِ العَرَبِيَّةِ؟": "Hal tuhibbu ta'alluma al-lughati al-'arabiyyati?",
  "نَعَمْ، أُحِبُّهَا كَثِيرًا لِأَنَّهَا لُغَةُ القُرْآنِ": "Na'am, uhibbuha kathiran li-annaha lughatu al-qur'ani.",
  "كَمْ لُغَةً تَتَكَلَّمُ في حَيَاتِكَ؟": "Kam lughatan tatakallamu fi hayatika?",
  "أَتَكَلَّمُ اللُّغَةَ العَرَبِيَّةَ والتَّامِيلِيَّةَ والإِنْجِلِيزِيَّةَ": "Atakallamu al-lughata al-'arabiyyata wat-tamiliyyata wal-injiliyyata.",
  "هَلْ تَتَكَلَّمُ العَرَبِيَّةَ بِطَلَاقَةٍ تَامَّةٍ؟": "Hal tatakallamu al-'arabiyyata bi-talaqatin tammatin?",
  "قَلِيلًا، مَا زِلْتُ أَتَعَلَّمُ القَوَاعِدَ الجَدِيدَةَ": "Qalilan, ma ziltu ata'allamu al-qawa'ida al-jadidah.",
  "مَاذَا تَعْمَلُ في هَذِهِ الشَّرِكَةِ؟": "Madha ta'amalu fi hadhihi ash-sharikati?",
  "أَنَا أَعْمَلُ مُهَنْدِسًا حَاسُوبِيًّا مَاهِرًا": "Ana a'amalu muhandisan hasibiyyan mahiran.",
  "أَيْنَ سَتَذْهَبُ بَعْدَ انْتِهَاءِ العَمَلِ؟": "Ayna satadhhabu ba'da intihaa'i al-amali?",
  "سَأَذْهَبُ إِلَى السُّوقِ لأَشْتَرِيَ بَعْضَ الأَغْرَاضِ": "Sa-adhhabu ila as-suqi li-ashtariya ba'da al-aghradi.",
  "مَاذَا سَتَشْتَرِي مِنَ السُّوقِ اليَوْمَ؟": "Madha satashtarii mina as-suqi al-yawma?",
  "سَأَشْتَرِي خُضَارً وَفَوَاكِهَ طَازَجَةً لِلْبَيْتِ": "Sa-ashtarii khudara wa fawakiha tazajatan lil-bayti.",
  "هَلْ عِنْدَكَ سَيَّارَةٌ خَاصَّةٌ بِكَ؟": "Hal 'indaka sayyaratun khassatun bika?",
  "نَعَمْ، عِنْدِي سَيَّارَةٌ جَدِيدَةٌ وَسَرِيعَةٌ": "Na'am, 'indi sayyaratun jadidatun wa sari'atun.",
  "كَمْ سِعْرُ هَذِهِ السَّيَّارَةِ الجَمِيلَةِ؟": "Kam si'ru hadhihi as-sayyarati al-jamilati?",
  "سِعْرُهَا غَالٍ قَلِيلًا وَلَكِنَّهَا مُرِيحَةٌ": "Si'ruha ghalin qalilan wa lakinnaha murihatun.",
  "هَلْ نَسْتَطِيعُ الذَّهَبَ إِلى المَطْعَمِ الآنَ؟": "Hal nastati'u adh-dhahaba ila al-mat'ami al-ana?",
  "نَعَمْ، بِكُلِّ سُرُورٍ، أَنَا جَائِعٌ جِدًّا": "Na'am, bi-kulli sururin, ana ja'i'un jiddan.",
  "مَاذَا تُرِيدُ أَنْ تَطْلُبَ لِلْعَشَاءِ؟": "Madha turidu an tatlubu lil-'asha'i?",
  "أَطْلُبُ الدَّجَاجَ المَشْوِيَّ مَعَ الأُرْزِ البَسْمَتِيِّ": "Atlubu ad-dajaja al-mashwiyya ma'a al-urzi al-basmatiyi.",
  "هَلْ تُحِبُّ شُرْبَ العَصِيرِ البَارِدِ؟": "Hal tuhibbu shurba al-'asiri al-baridi?",
  "نَعْمْ، أُحِبُّ عَصِيرَ البُرْتُقَالِ الطَّازَجَ": "Na'am, uhibbu 'asira al-burtuqali at-tazaj.",
  "كَمْ حِسَابُ الوَجْبَةِ بِالْكَامِلِ؟": "Kam hisabu al-wajbati bil-kamili?",
  "الحِسَابُ عَلَيَّ اليَوْمَ، لَا تَقْلَقْ أَبَدًا": "Al-hisabu 'alayya al-yawma, la taqlaq abadan.",
  "شُكْرًا جَزِيلًا لَكَ عَلى كَرَمِكَ البَالِغِ.": "Shukran jazilan laka 'ala karamika al-balighi.",
  "عَفْوًا يَا أَخِي، هَذَا وَاجِبِي بَيْنَنَا": "Afwan ya akhi, hadha wajibii baynana.",
  "هَلْ تَعْرِفُ طَرِيقَ المَطَارِ الدَّوْلِيِّ؟": "Hal ta'rifu tariqa al-matari ad-dawliyyi?",
  "نَعَمْ، الطَّرِيقُ سَهْلٌ وَيَسْتَغْرِقُ نِصْفَ سَاعَةٍ": "Na'am, at-tariqu sahlun wa yastaghriqu nisfa sa'atin.",
  "هَلْ مَعَكَ جَوَازُ السَّفَرِ وَالتَّذْكِرَةُ؟": "Hal ma'aka jawazu as-safari wat-tadhkiratu?",
  "نَعَمْ، كُلُّ الأَوْرَاقِ المُهِمَّةِ فِي حَقِيبَتِي": "Na'am, kullu al-awraqi al-muhimmati fi haqibati.",
  "إِذًا، لِنَذْهَبْ إِلَى المَطَارِ بِسُرْعَةٍ.": "Idhan, li-nadhhhab ila al-matari bi-sur'atin.",
  "حَسَنًا، أَنَا جَاهِزٌ تَمَامًا لِلرِّحْلَةِ": "Hasanan, ana jahizun tamaman lir-rihlati.",
  "هَلْ تَعْرِفُ حَالَةَ الطَّقْسِ لِهَذَا اليَوْمِ؟": "Hal ta'rifu halata at-taqsi li-hadha al-yawmi?",
  "الجَوُّ مُشْرِقٌ جِدًّا وَلَكِنَّ الحَرَارَةَ عَالِيَةٌ": "Al-jawwu mushriqun jiddan wa lakinna al-hararata 'aliyatun.",
  "هَلْ سَيَنْزِلُ المَطَرُ هَذَا المَسَاءَ؟": "Hal sayanzilu al-mataru hadha al-masa'a?",
  "لَا أَعْتَقِدُ ذَلِكَ، فَالسَّمَاءُ صَافِيَةٌ": "La a'taqidu dhalika, fas-sama'u safiyatun.",
  "هَلْ سَافَرْتَ مِنْ قَبْلُ إِلى دُبَيْ؟": "Hal safarta min qablu ila dubay?",
  "نَعَمْ، سَافَرْتُ إِلَيْهَا مَرَّتَيْنِ فِي السَّنَةِ المَاضِيَةِ": "Na'am, safartu ilayha marratayni fi as-sanati al-madiyati.",
  "كَيْفَ وَجَدْتَ تِلْكَ المَدِينَةَ العَظِيمَةَ؟": "Kayfa wajadta tilka al-madinata al-'azimata?",
  "إِنَّهَا مَدِينَةٌ رَائِعَةٌ تَمْلَؤُهَا نَاطِحَاتُ السَّحَابِ": "Innaha madinatun ra'i'atun tamla'uha natihatu as-sahabi.",
  "هَلْ تُرِيدُ أَنْ تَقْرَأَ الجَرِيدَةَ الصَّبَاحِيَّةَ؟": "Hal turidu an taqra'a al-jaridata as-sabahiyyata?",
  "نَعَمْ، أُرِيدُ قِرَاءَةَ الأَخْبَارِ السِّيَاسِيَّةِ": "Na'am, uridu qira'ata al-akhbari as-siyasiyyati.",
  "أَيْنَ حَاسُوبُكَ الشَّخْصِيُّ اليَوْمَ؟": "Ayna hasibuka ash-shakhsiyyu al-yawma?",
  "هُوَ عَلَى المَكْتَبِ فِي غُرْفَةِ النَّوْمِ": "Huwa 'ala al-maktabi fi ghurfati an-nawmi.",
  "هَلْ تُسَاعِدُنِي في حَلِّ هَذِهِ المُشْكِلَةِ؟": "Hal tusa'iduni fi halli hadhihi al-mushkilati?",
  "بِكُلِّ سُرُورٍ، مَا هِيَ المُشْكِلَةُ بَضْبْطٍ؟": "Bi-kulli sururin, ma hiya al-mushkilatu bid-dabti?",
  "أُرِيدُ شِرَاءَ هَاتِفٍ ذَكِيٍّ جَدِيدٍ لِأَخِي.": "Uridu shira'a hatifin dhakiyyin jadidin li-akhi.",
  "أَنْصَحُكَ بِشِرَاءِ الهَاتِفِ المَعْرُوفِ فِي السُّوقِ": "Ansahuka bi-shira'i al-hatifi al-ma'rufi fi as-suqi.",
  "هَلْ شَاهَدْتَ مُبَارَاةَ كُرَةِ القَدَمِ أَمْسِ؟": "Hal shahadta mubara'ta kurati al-qadami amsi?",
  "نَعَمْ، كَانَتْ مُبَارَاةً حَامِسَةً وَقَوِيَّةً جِدًّا": "Na'am, kanat mubaratan hamasiyatan wa qawiyyatan jiddan.",
  "مَنْ فَازَ بِتِلْكَ المُبَارَاةِ الصَّعْبَةِ؟": "Man faza bi-tilka al-mubarati as-sa'bati?",
  "فَازَ الفَرِيقُ الأَحْمَرُ بِثَلَاثَةِ أَهْدَافٍ": "Faza al-fariqu al-ahmaru bi-thalathati ahdafin.",
};

let fixedCount = 0;

for (const module of data.modules) {
  if (!module.sentences) continue;
  
  for (const sentence of module.sentences) {
    const isPlaceholder = /^Turn\s+\d+\s+(query|response)\s+statement\.?$/i.test(sentence.transliteration || '');
    const isEmpty = !sentence.transliteration || sentence.transliteration.trim() === '';
    
    if (isPlaceholder || isEmpty) {
      const arabicText = (sentence.arabic || '').trim();
      
      // Try direct match first
      if (transliterationMap[arabicText]) {
        sentence.transliteration = transliterationMap[arabicText];
        fixedCount++;
        continue;
      }
      
      // Try normalized match (strip trailing punctuation variants)
      const normalized = arabicText.replace(/[.،?!؟،]+$/, '').trim();
      for (const [key, val] of Object.entries(transliterationMap)) {
        const keyNorm = key.replace(/[.،?!؟،]+$/, '').trim();
        if (keyNorm === normalized || key === normalized) {
          sentence.transliteration = val;
          fixedCount++;
          break;
        }
      }
    }
  }
}

fs.writeFileSync('src/data/arabicSentencesData.json', JSON.stringify(data, null, 2));
console.log(`Fixed ${fixedCount} more transliterations.`);

// Report remaining
let remaining = 0;
for (const m of data.modules) {
  if (!m.sentences) continue;
  for (const s of m.sentences) {
    if (/^Turn\s+\d+\s+(query|response)\s+statement/i.test(s.transliteration || '')) {
      remaining++;
    }
  }
}
console.log(`Still remaining: ${remaining}`);
