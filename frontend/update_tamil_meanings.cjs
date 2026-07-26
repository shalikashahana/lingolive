const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/arabicSentencesData.json', 'utf8'));

const englishToTamilMap = {
  "Welcome, how are you today?": "நல்வரவு, இன்று நீங்கள் எப்படி இருக்கிறீர்கள்?",
  "Welcome to you, I am fine, praise be to Allah.": "உங்களுக்கும் நல்வரவு, நான் நன்றாக இருக்கிறேன், இறைவனுக்கே புகழ் அனைத்தும்.",
  "What is your honorable name, my brother?": "என் சகோதரரே, உங்கள் நற்பெயர் என்ன?",
  "My name is Muhammad, and what is your name?": "என் பெயர் முகம்மது, உங்கள் பெயர் என்ன?",
  "I am Ahmad. Where are you from?": "நான் அஹ்மத். நீங்கள் எங்கிருந்து வருகிறீர்கள்?",
  "I am from India, and where are you from?": "நான் இந்தியாவிலிருந்து வருகிறேன், நீங்கள் எங்கிருந்து வருகிறீர்கள்?",
  "I am from Egypt. Do you live here?": "நான் எகிப்திலிருந்து வருகிறேன். நீங்கள் இங்கு வசிக்கிறீர்களா?",
  "Yes, I have been living in this city for a year.": "ஆம், நான் இந்த நகரத்தில் ஒரு வருடமாக வசித்து வருகிறேன்.",
  "Do you like learning the Arabic language?": "உங்களுக்கு அரபு மொழி கற்பது பிடிக்குமா?",
  "Yes, I like it very much because it is the language of the Quran.": "ஆம், குர்ஆனின் மொழி என்பதால் எனக்கு இது மிகவும் பிடிக்கும்.",
  "How many languages do you speak in your life?": "உங்கள் வாழ்வில் நீங்கள் எத்தனை மொழிகள் பேசுகிறீர்கள்?",
  "I speak Arabic, Tamil, and English.": "நான் அரபு, தமிழ் மற்றும் ஆங்கிலம் பேசுகிறேன்.",
  "Do you speak Arabic fluently?": "நீங்கள் அரபு மொழியை சரளமாகப் பேசுவீர்களா?",
  "A little, I am still learning new grammar.": "கொஞ்சம், நான் இன்னும் புதிய இலக்கணங்களைக் கற்றுக் கொண்டிருக்கிறேன்.",
  "What do you do in this company?": "நீங்கள் இந்த நிறுவனத்தில் என்ன வேலை செய்கிறீர்கள்?",
  "I work as a skilled computer engineer.": "நான் ஒரு திறமையான கணினி பொறியாளராக வேலை செய்கிறேன்.",
  "Where will you go after work?": "வேலை முடிந்த பிறகு எங்கே செல்வீர்கள்?",
  "I will go to the market to buy some things.": "சில பொருட்கள் வாங்க நான் சந்தைக்கு செல்வேன்.",
  "What will you buy from the market today?": "இன்று சந்தையில் என்ன வாங்குவீர்கள்?",
  "I will buy fresh vegetables and fruits for the house.": "வீட்டிற்காக புதிய காய்கறிகள் மற்றும் பழங்களை வாங்குவேன்.",
  "Do you have your own car?": "உங்களுக்குச் சொந்தமாக கார் இருக்கிறதா?",
  "Yes, I have a new and fast car.": "ஆம், என்னிடம் புதிய மற்றும் வேகமான கார் உள்ளது.",
  "How much is this beautiful car?": "இந்த அழகான காரின் விலை எவ்வளவு?",
  "It is a bit expensive but comfortable.": "இது சற்று விலை உயர்ந்தது, ஆனால் வசதியானது.",
  "Can we go to the restaurant now?": "நாம் இப்போது உணவகத்திற்கு செல்லலாமா?",
  "Yes, with pleasure, I am very hungry.": "ஆம், மகிழ்ச்சியுடன், எனக்கு மிகவும் பசிக்கிறது.",
  "What do you want to order for dinner?": "இரவு உணவிற்கு என்ன ஆர்டர் செய்ய விரும்புகிறீர்கள்?",
  "I will order grilled chicken with basmati rice.": "நான் பாஸ்மதி சாதத்துடன் கிரில் சிக்கன் ஆர்டர் செய்வேன்.",
  "Do you like drinking cold juice?": "உங்களுக்கு குளிர்ந்த ஜூஸ் குடிக்க பிடிக்குமா?",
  "Yes, I like fresh orange juice.": "ஆம், எனக்கு புதிய ஆரஞ்சு ஜூஸ் பிடிக்கும்.",
  "How much is the entire meal bill?": "முழு உணவின் கட்டணம் எவ்வளவு?",
  "The bill is on me today, don't worry at all.": "இன்று பில் நான் கட்டுகிறேன், நீங்கள் கவலைப்பட வேண்டாம்.",
  "Thank you very much for your great generosity.": "உங்கள் பெருந்தன்மைக்கு மிகவும் நன்றி.",
  "You're welcome my brother, this is my duty between us.": "வரவேற்கிறேன் என் சகோதரரே, இது நமக்கிடையிலான எனது கடமை.",
  "Do you know the way to the international airport?": "சர்வதேச விமான நிலையத்திற்கு செல்லும் வழி உங்களுக்குத் தெரியுமா?",
  "Yes, the way is easy and takes half an hour.": "ஆம், வழி எளிதானது மற்றும் அரை மணி நேரம் ஆகும்.",
  "Do you have your passport and ticket?": "உங்களிடம் பாஸ்போர்ட் மற்றும் டிக்கெட் உள்ளதா?",
  "Yes, all the important papers are in my bag.": "ஆம், முக்கியமான தாள்கள் அனைத்தும் என் பையில் உள்ளன.",
  "Then let's go to the airport quickly.": "அப்படியானால் சீக்கிரம் விமான நிலையத்திற்கு செல்வோம்.",
  "Okay, I am completely ready for the trip.": "சரி, நான் பயணத்திற்கு முழுமையாக தயாராக இருக்கிறேன்.",
  "Do you know the weather forecast for today?": "இன்றைய வானிலை நிலவரம் உங்களுக்குத் தெரியுமா?",
  "The weather is very sunny but the temperature is high.": "வானிலை மிகவும் வெயிலாக இருக்கிறது, ஆனால் வெப்பநிலை அதிகமாக உள்ளது.",
  "Will it rain this evening?": "இன்று மாலை மழை பெய்யுமா?",
  "I don't think so, the sky is clear.": "அப்படித் தெரியவில்லை, வானம் தெளிவாக உள்ளது.",
  "Have you traveled to Dubai before?": "நீங்கள் இதற்கு முன் துபாய்க்கு பயணம் செய்திருக்கிறீர்களா?",
  "Yes, I traveled there twice last year.": "ஆம், கடந்த ஆண்டு நான் இரண்டு முறை அங்கு சென்றுள்ளேன்.",
  "How did you find that great city?": "அந்த சிறந்த நகரத்தை நீங்கள் எப்படி உணர்ந்தீர்கள்?",
  "It is a wonderful city filled with skyscrapers.": "இது வானளாவிய கட்டிடங்கள் நிறைந்த ஒரு அற்புதமான நகரம்.",
  "Do you want to read the morning newspaper?": "நீங்கள் காலை நாளிதழைப் படிக்க விரும்புகிறீர்களா?",
  "Yes, I want to read the political news.": "ஆம், நான் அரசியல் செய்திகளைப் படிக்க விரும்புகிறேன்.",
  "Where is your personal computer today?": "இன்று உங்களது தனிப்பட்ட கணினி எங்கே?",
  "It is on the desk in the bedroom.": "அது படுக்கையறையில் மேஜை மீது உள்ளது.",
  "Can you help me solve this problem?": "இந்த சிக்கலை தீர்க்க நீங்கள் எனக்கு உதவ முடியுமா?",
  "With pleasure, what exactly is the problem?": "மகிழ்ச்சியுடன், உண்மையாக என்ன பிரச்சனை?",
  "I want to buy a new smartphone for my brother.": "என் சகோதரனுக்கு புதிய ஸ்மார்ட்போன் வாங்க விரும்புகிறேன்.",
  "I advise you to buy the well-known phone in the market.": "சந்தையில் நன்கு அறியப்பட்ட தொலைபேசியை வாங்க நான் உங்களுக்கு அறிவுறுத்துகிறேன்.",
  "Did you watch yesterday's football match?": "நேற்றைய கால்பந்து போட்டியைப் பார்த்தீர்களா?",
  "Yes, it was a very enthusiastic and strong match.": "ஆம், இது மிகவும் உற்சாகமான மற்றும் கடுமையான போட்டியாக அமைந்தது.",
  "Who won that difficult match?": "அந்த கடினமான போட்டியில் யார் வெற்றி பெற்றார்கள்?",
  "The red team won with three goals.": "சிவப்பு அணி மூன்று கோல்கள் அடித்து வெற்றி பெற்றது."
};

let count = 0;
for (const module of data.modules) {
  if (module.module === "5") {
    for (const sentence of module.sentences) {
      const englishMeaning = sentence.meaning_english;
      if (englishToTamilMap[englishMeaning]) {
        sentence.meaning_tamil = englishToTamilMap[englishMeaning];
        count++;
      }
    }
  }
}

fs.writeFileSync('src/data/arabicSentencesData.json', JSON.stringify(data, null, 2));
console.log(`Updated ${count} Tamil meanings in Module 5.`);
