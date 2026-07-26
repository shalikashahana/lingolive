const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/arabicSentencesData.json', 'utf8'));

// Complete mapping of Arabic text (after cleaning) to correct transliteration
const transliterationMap = {
  // Module 5 - conversation responses (after stripping ".نعم" and (رقم N))
  "أَهْلًا بِكَ، أَنَا بِخَيْرٍ والْحَمْدُ لِلَّهِ": "Ahlan bika, ana bi-khayrin wal-hamdu lillahi.",
  "اسْمِي مُحَمَّدٌ، وَمَا اسْمُكَ أَنْتَ؟": "Ismi Muhammadun, wa ma ismuka anta?",
  "أَنَا مِنَ الهِنْدِ، وَأَنْتَ مِنْ أَيْنَ؟": "Ana mina al-hindi, wa anta min ayna?",
  "نَعَمْ، أَسْكُنُ فِي هَذِهِ المَدِينَةِ مُنْذُ سَنَةٍ": "Na'am, askunu fi hadhihi al-madinati mundhu sanatin.",
  "نَعَمْ، أُحِبُّهَا كَثِيرًا لِأَنَّهَا لُغَةُ القُرْآنِ": "Na'am, uhibbuha kathiran li-annaha lughatu al-qur'ani.",
  "أَتَكَلَّمُ اللُّغَةَ العَرَبِيَّةَ والتَّامِيلِيَّةَ والإِنْجِلِيزِيَّةَ": "Atakallamu al-lughata al-'arabiyyata wat-tamiliyyata wal-injiliyyata.",
  "قَلِيلًا، مَا زِلْتُ أَتَعَلَّمُ القَوَاعِدَ الجَدِيدَةَ": "Qalilan, ma ziltu ata'allamu al-qawa'ida al-jadidah.",
  "أَنَا أَعْمَلُ مُهَنْدِسًا حَاسُوبِيًّا مَاهِرًا": "Ana a'amalu muhandisan hasibiyyan mahiran.",
  "سَأَذْهَبُ إِلَى السُّوقِ لأَشْتَرِيَ بَعْضَ الأَغْرَاضِ": "Sa-adhhabu ila as-suqi li-ashtariya ba'da al-aghradi.",
  "سَأَشْتَرِي خُضَارً وَفَوَاكِهَ طَازَجَةً لِلْبَيْتِ": "Sa-ashtarii khudara wa fawakiha tazajatan lil-bayti.",
  "نَعَمْ، عِنْدِي سَيَّارَةٌ جَدِيدَةٌ وَسَرِيعَةٌ": "Na'am, 'indi sayyaratun jadidatun wa sari'atun.",
  "سِعْرُهَا غَالٍ قَلِيلًا وَلَكِنَّهَا مُرِيحَةٌ": "Si'ruha ghalin qalilan wa lakinnaha murihatun.",
  "نَعَمْ، بِكُلِّ سُرُورٍ، أَنَا جَائِعٌ جِدًّا": "Na'am, bi-kulli sururin, ana ja'i'un jiddan.",
  "أَطْلُبُ الدَّجَاجَ المَشْوِيَّ مَعَ الأُرْزِ البَسْمَتِيِّ": "Atlubu ad-dajaja al-mashwiyya ma'a al-urzi al-basmatiyi.",
  "نَعْمْ، أُحِبُّ عَصِيرَ البُرْتُقَالِ الطَّازَجَ": "Na'am, uhibbu 'asira al-burtuqali at-tazaj.",
  "الحِسَابُ عَلَيَّ اليَوْمَ، لَا تَقْلَقْ أَبَدًا": "Al-hisabu 'alayya al-yawma, la taqlaq abadan.",
  "عَفْوًا يَا أَخِي، هَذَا وَاجِبِي بَيْنَنَا": "Afwan ya akhi, hadha wajibii baynana.",
  "نَعَمْ، الطَّرِيقُ سَهْلٌ وَيَسْتَغْرِقُ نِصْفَ سَاعَةٍ": "Na'am, at-tariqu sahlun wa yastaghriqu nisfa sa'atin.",
  "نَعَمْ، كُلُّ الأَوْرَاقِ المُهِمَّةِ فِي حَقِيبَتِي": "Na'am, kullu al-awraqi al-muhimmati fi haqibati.",
  "حَسَنًا، أَنَا جَاهِزٌ تَمَامًا لِلرِّحْلَةِ": "Hasanan, ana jahizun tamaman lir-rihlati.",
  "الجَوُّ مُشْرِقٌ جِدًّا وَلَكِنَّ الحَرَارَةَ عَالِيَةٌ": "Al-jawwu mushriqun jiddan wa lakinna al-hararata 'aliyatun.",
  "لَا أَعْتَقِدُ ذَلِكَ، فَالسَّمَاءُ صَافِيَةٌ": "La a'taqidu dhalika, fas-sama'u safiyatun.",
  "نَعَمْ، سَافَرْتُ إِلَيْهَا مَرَّتَيْنِ فِي السَّنَةِ المَاضِيَةِ": "Na'am, safartu ilayha marratayni fi as-sanati al-madiyati.",
  "إِنَّهَا مَدِينَةٌ رَائِعَةٌ تَمْلَؤُهَا نَاطِحَاتُ السَّحَابِ": "Innaha madinatun ra'i'atun tamla'uha natihatu as-sahabi.",
  "نَعَمْ، أُرِيدُ قِرَاءَةَ الأَخْبَارِ السِّيَاسِيَّةِ": "Na'am, uridu qira'ata al-akhbari as-siyasiyyati.",
  "هُوَ عَلَى المَكْتَبِ فِي غُرْفَةِ النَّوْمِ": "Huwa 'ala al-maktabi fi ghurfati an-nawmi.",
  "بِكُلِّ سُرُورٍ، مَا هِيَ المُشْكِلَةُ بَضْبْطٍ؟": "Bi-kulli sururin, ma hiya al-mushkilatu bid-dabti?",
  "أَنْصَحُكَ بِشِرَاءِ الهَاتِفِ المَعْرُوفِ فِي السُّوقِ": "Ansahuka bi-shira'i al-hatifi al-ma'rufi fi as-suqi.",
  "نَعَمْ، كَانَتْ مُبَارَاةً حَامِسَةً وَقَوِيَّةً جِدًّا": "Na'am, kanat mubaratan hamasiyatan wa qawiyyatan jiddan.",
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
      
      if (transliterationMap[arabicText]) {
        sentence.transliteration = transliterationMap[arabicText];
        fixedCount++;
      } else {
        // Try with cleaned text (remove periods at end)
        const cleanedText = arabicText.replace(/[.،?!؟]+$/, '').trim();
        if (transliterationMap[cleanedText]) {
          sentence.transliteration = transliterationMap[cleanedText];
          fixedCount++;
        }
      }
    }
  }
}

fs.writeFileSync('src/data/arabicSentencesData.json', JSON.stringify(data, null, 2));
console.log(`Fixed ${fixedCount} more transliterations.`);
console.log('Done!');
