import json
import random

input_json = """[
  {"id":1,"en":"Could you please tell me how to reach the nearest railway station?","ta":"அருகிலுள்ள ரயில் நிலையத்தை எப்படி அடைவது என்று தயவுசெய்து சொல்ல முடியுமா?","te":"దగ్గరలో ఉన్న రైల్వే స్టేషన్కు ఎలా వెళ్లాలో దయచేసి చెప్పగలరా?","tr":"daggaralo unna railway station-ku elaa vellaalo dayachesi cheppagalaraa?"},
  {"id":2,"en":"What time does the next bus to Hyderabad leave from here?","ta":"ஹைதராபாத் செல்லும் அடுத்த பேருந்து இங்கிருந்து எத்தனை மணிக்கு புறப்படும்?","te":"హైదరాబాద్ వెళ్లే తదుపరి బస్సు ఇక్కడి నుండి ఎన్ని గంటలకు బయలుదేరుతుంది?","tr":"hyderabad velle thadupari bassu ikkadi nundi enni gantalaku bayaluderuthundi?"},
  {"id":3,"en":"How much time will it take to reach the airport from this hotel?","ta":"இந்த ஹோட்டலில் இருந்து விமான நிலையத்தை அடைய எவ்வளவு நேரம் ஆகும்?","te":"ఈ హోటల్ నుండి విమానాశ్రయానికి చేరుకోవడానికి ఎంత సమయం పడుతుంది?","tr":"ee hotel nundi vimaanaashrayaaniki cherukovadaaniki entha samayam paduthundi?"},
  {"id":4,"en":"Do you know where I can find a good vegetarian restaurant?","ta":"நல்ல சைவ உணவகம் எங்கே கிடைக்கும் என்று உங்களுக்குத் தெரியுமா?","te":"మంచి శాఖాహార రెస్టారెంట్ ఎక్కడ దొరుకుతుందో మీకు తెలుసా?","tr":"manchi shaakhaahaara restaurant ekkada dorukuthundo meeku thelusaa?"},
  {"id":5,"en":"Why didn't you attend the important meeting at the office yesterday?","ta":"நேற்று அலுவலகத்தில் நடந்த முக்கியமான கூட்டத்தில் நீங்கள் ஏன் கலந்து கொள்ளவில்லை?","te":"నిన్న ఆఫీసులో జరిగిన ముఖ్యమైన మీటింగ్కు మీరు ఎందుకు హాజరు కాలేదు?","tr":"ninna aaphisulo jarigina mukhyamaina meeting-ku meeru enduku haajaru kaaledu?"},
  {"id":6,"en":"What are the documents required to open a new bank account?","ta":"புதிய வங்கிக் கணக்கைத் திறக்க என்னென்ன ஆவணங்கள் தேவை?","te":"కొత్త బ్యాంక్ అకౌంట్ తెరవడానికి ఏయే పత్రాలు కావాలి?","tr":"kottha bank account theravadaaniki yeye pathraalu kaavali?"},
  {"id":7,"en":"How much does a round-trip flight ticket to Delhi cost?","ta":"டெல்லிக்கு சென்று வர விமான டிக்கெட் எவ்வளவு செலவாகும்?","te":"ఢిల్లీకి వెళ్లి రావడానికి ఫ్లైట్ టికెట్ ఎంత ఖర్చవుతుంది?","tr":"dhilliki velli raavadaaniki flight ticket entha kharchavuthundi?"},
  {"id":8,"en":"Is there any medical shop nearby that is open late at night?","ta":"இரவு தாமதமாக திறந்திருக்கும் மருந்துக்கடை ஏதேனும் அருகில் உள்ளதா?","te":"రాత్రి పొద్దుపోయే వరకు తెరిచి ఉండే మెడికల్ షాప్ ఏదైనా దగ్గరలో ఉందా?","tr":"raathri poddupoye varaku therichi unde medical shop edainaa daggaralo undaa?"},
  {"id":9,"en":"Could you please translate this Telugu sentence into English for me?","ta":"தயவுசெய்து இந்த தெலுங்கு வாக்கியத்தை எனக்காக ஆங்கிலத்தில் மொழிபெயர்க்க முடியுமா?","te":"దయచేసి ఈ తెలుగు వాక్యాన్ని నా కోసం ఇంగ్లీషులోకి అనువదించగలరా?","tr":"dayachesi ee telugu vaakyanni naa kosam english-loki anuvadinchagalaraa?"},
  {"id":10,"en":"What is the best time of the year to visit this tourist place?","ta":"இந்த சுற்றுலாத் தலத்திற்குச் செல்ல ஆண்டின் சிறந்த நேரம் எது?","te":"ఈ పర్యాటక ప్రదేశాన్ని సందర్శించడానికి సంవత్సరంలో ఉత్తమ సమయం ఏది?","tr":"ee paryaataka pradeshaanni sandarshinchadaaniki samvathsaramlo utthama samayam yedi?"},
  {"id":11,"en":"Do you accept credit cards, or should I pay only in cash?","ta":"நீங்கள் கிரெடிட் கார்டுகளை ஏற்றுக்கொள்வீர்களா, அல்லது பணமாக மட்டுமே செலுத்த வேண்டுமா?","te":"మీరు క్రెడిట్ కార్డులు తీసుకుంటారా, లేదా నగదు మాత్రమే చెల్లించాలా?","tr":"meeru credit cardulu theesukuntaaraa, ledaa nagadu maathrame chellinchaalaa?"},
  {"id":12,"en":"Can you please show me some clothes in a smaller size?","ta":"தயவுசெய்து எனக்கு சிறிய அளவிலான சில துணிகளை காட்ட முடியுமா?","te":"దయచేసి నాకు చిన్న సైజులో కొన్ని బట్టలు చూపించగలరా?","tr":"dayachesi naaku chinna size-lo konni battalu choopinchagalaraa?"},
  {"id":13,"en":"What are the ingredients used to make this special dish?","ta":"இந்த சிறப்பு உணவை செய்ய என்னென்ன பொருட்கள் பயன்படுத்தப்படுகின்றன?","te":"ఈ ప్రత్యేక వంటకాన్ని తయారు చేయడానికి ఏయే పదార్థాలు ఉపయోగిస్తారు?","tr":"ee prathyeka vantakaanni thayaaru cheyadaaniki yeye padaarthaalu upayogisthaaru?"},
  {"id":14,"en":"Is it possible to get a discount if I buy in bulk?","ta":"நான் மொத்தமாக வாங்கினால் தள்ளுபடி பெற முடியுமா?","te":"నేను ఎక్కువ మొత్తంలో కొంటే డిస్కౌంట్ పొందడం సాధ్యమేనా?","tr":"nenu ekkuva motthamlo konte discount pondadam saadhyamenaa?"},
  {"id":15,"en":"Could you pack the leftover food in a parcel for me?","ta":"மீதமுள்ள உணவை எனக்காக ஒரு பார்சலில் பேக் செய்ய முடியுமா?","te":"మిగిలిపోయిన భోజనాన్ని నా కోసం పార్శిల్లో ప్యాక్ చేయగలరా?","tr":"migilipoyina bhojananni naa kosam parcel-lo pack cheyagalaraa?"},
  {"id":16,"en":"How many days will it take to deliver this package to Chennai?","ta":"இந்த பார்சலை சென்னைக்கு டெலிவரி செய்ய எத்தனை நாட்கள் ஆகும்?","te":"ఈ ప్యాకేజీని చెన్నైకి డెలివరీ చేయడానికి ఎన్ని రోజులు పడుతుంది?","tr":"ee package-ni chennai-ki delivery cheyadaaniki enni rojulu paduthundi?"},
  {"id":17,"en":"Are there any good schools located near our new apartment?","ta":"நமது புதிய குடியிருப்பின் அருகில் ஏதேனும் நல்ல பள்ளிகள் உள்ளதா?","te":"మన కొత్త అపార్ట్మెంట్ దగ్గరలో ఏవైనా మంచి పాఠశాలలు ఉన్నాయా?","tr":"mana kottha apartment daggaralo yevainaa manchi paathashaalalu unnaayaa?"},
  {"id":18,"en":"Why is the internet connection so slow in the office today?","ta":"இன்று அலுவலகத்தில் இணைய இணைப்பு ஏன் இவ்வளவு மெதுவாக உள்ளது?","te":"ఈరోజు ఆఫీసులో ఇంటర్నెట్ కనెక్షన్ ఎందుకు ఇంత నెమ్మదిగా ఉంది?","tr":"eeroju aaphisulo internet connection enduku intha nemmadigaa undi?"},
  {"id":19,"en":"At what time should we assemble for the annual team meeting?","ta":"ஆண்டு குழு கூட்டத்திற்கு நாம் எத்தனை மணிக்கு கூட வேண்டும்?","te":"వార్షిక జట్టు సమావేశం కోసం మనం ఎన్ని గంటలకు సమావేశం కావాలి?","tr":"vaarshika jattu samaavesham kosam manam enni gantalaku samaavesham kaavali?"},
  {"id":20,"en":"Who is the right person to contact regarding this technical issue?","ta":"இந்த தொழில்நுட்ப பிரச்சனை குறித்து யாரை தொடர்பு கொள்வது சரியானது?","te":"ఈ సాంకేతిక సమస్య గురించి సంప్రదించడానికి సరైన వ్యక్తి ఎవరు?","tr":"ee saankethika samasya gurinchi sampradinchadaaniki saraina vyakthi evaru?"},
  {"id":21,"en":"Have you prepared the monthly progress report for our upcoming presentation?","ta":"வரவிருக்கும் விளக்கக்காட்சிக்கான மாதாந்திர முன்னேற்ற அறிக்கையை தயார் செய்துவிட்டீர்களா?","te":"మన రాబోయే ప్రెజెంటేషన్ కోసం మీరు నెలవారీ పురోగతి నివేదికను సిద్ధం చేశారా?","tr":"mana raaboye presentation kosam meeru nelavaaree purogathi nivedikanu siddham chesaaraa?"},
  {"id":22,"en":"Can we reschedule our appointment to tomorrow evening at five o'clock?","ta":"நமது சந்திப்பை நாளை மாலை ஐந்து மணிக்கு மாற்றியமைக்க முடியுமா?","te":"మన అపాయింట్మెంట్ను రేపు సాయంత్రం ఐదు గంటలకు మార్చుకోగలమా?","tr":"mana appointment-nu repu saayanthram aidu gantalaku maarchukogalamaa?"},
  {"id":23,"en":"What kind of medicine should I take for a severe cold?","ta":"கடுமையான சளிக்கு நான் எந்த வகையான மருந்தை எடுத்துக்கொள்ள வேண்டும்?","te":"తీవ్రమైన జలుబు కోసం నేను ఎలాంటి మందు తీసుకోవాలి?","tr":"theevramaina jalubu kosam nenu elaanti mandu theesukovaali?"},
  {"id":24,"en":"Is it necessary to do a blood test for this fever?","ta":"இந்தக் காய்ச்சலுக்கு ரத்தப் பரிசோதனை செய்வது அவசியமா?","te":"ఈ జ్వరానికి రక్త పరీక్ష చేయడం అవసరమా?","tr":"ee jvaraaniki raktha pareeksha cheyadam avasaramaa?"},
  {"id":25,"en":"Could you please call an ambulance as quickly as possible?","ta":"தயவுசெய்து எவ்வளவு சீக்கிரம் முடியுமோ அவ்வளவு சீக்கிரம் ஆம்புலன்ஸை அழைக்க முடியுமா?","te":"దయచేసి వీలైనంత త్వరగా అంబులెన్స్ని పిలవగలరా?","tr":"dayachesi veelainantha thvaragaa ambulance-ni pilavagalaraa?"},
  {"id":26,"en":"How often should I bring my father to the hospital for checkups?","ta":"பரிசோதனைக்காக என் தந்தையை நான் எவ்வளவு அடிக்கடி மருத்துவமனைக்கு அழைத்து வர வேண்டும்?","te":"చెకప్ల కోసం నేను మా నాన్నను ఎంత తరచుగా ఆసుపత్రికి తీసుకురావాలి?","tr":"checkup-la kosam nenu maa naannanu entha tharachugaa aasupathriki theesukuraavaali?"},
  {"id":27,"en":"Do you know any good mechanic to repair my broken car?","ta":"எனது உடைந்த காரை பழுதுபார்க்க நல்ல மெக்கானிக் யாரையாவது உங்களுக்குத் தெரியுமா?","te":"నా పాడైన కారును రిపేర్ చేయడానికి మీకు తెలిసిన మంచి మెకానిక్ ఎవరైనా ఉన్నారా?","tr":"naa paadaina kaarunu repair cheyadaaniki meeku thelisina manchi mechanic evarainaa unnaaraa?"},
  {"id":28,"en":"What is the exact procedure to apply for a new passport?","ta":"புதிய பாஸ்போர்ட்டுக்கு விண்ணப்பிப்பதற்கான சரியான நடைமுறை என்ன?","te":"కొత్త పాస్పోర్ట్ కోసం దరఖాస్తు చేసుకోవడానికి కచ్చితమైన విధానం ఏమిటి?","tr":"kottha passport kosam darakhaasthu chesukovadaaniki kacchithamaina vidhaanam emiti?"},
  {"id":29,"en":"Can you suggest a good place to visit with family this weekend?","ta":"இந்த வார இறுதியில் குடும்பத்துடன் செல்ல ஒரு நல்ல இடத்தை பரிந்துரைக்க முடியுமா?","te":"ఈ వారాంతంలో కుటుంబంతో కలిసి వెళ్లడానికి ఏదైనా మంచి ప్రదేశాన్ని సూచించగలరా?","tr":"ee vaaraanthamlo kutumbamtho kalisi velladaaniki edainaa manchi pradeshaanni soochinchagalaraa?"},
  {"id":30,"en":"How long have you been studying the Telugu language using this application?","ta":"இந்த செயலியைப் பயன்படுத்தி நீங்கள் எவ்வளவு காலமாக தெலுங்கு மொழியைப் படிக்கிறீர்கள்?","te":"ఈ అప్లికేషన్ను ఉపయోగించి మీరు ఎంతకాలంగా తెలుగు భాషను నేర్చుకుంటున్నారు?","tr":"ee application-nu upayoginchi meeru enthakaalangaa telugu bhaashanu nerchukuntunnaaru?"},
  {"id":31,"en":"What is the meaning of the word you just said right now?","ta":"நீங்கள் இப்போது சொன்ன வார்த்தையின் அர்த்தம் என்ன?","te":"మీరు ఇప్పుడు చెప్పిన పదం యొక్క అర్థం ఏమిటి?","tr":"meeru ippudu cheppina padam yokka artham emiti?"},
  {"id":32,"en":"Did you understand everything that the teacher taught in the class today?","ta":"இன்று வகுப்பில் ஆசிரியர் கற்பித்த அனைத்தும் உங்களுக்குப் புரிந்ததா?","te":"ఈరోజు తరగతిలో టీచర్ చెప్పినదంతా మీకు అర్థమైందా?","tr":"eeroju tharagatilo teacher cheppinadanthaa meeku arthamaindaa?"},
  {"id":33,"en":"Why are there so many people gathered outside the main gate?","ta":"பிரதான வாயிலுக்கு வெளியே ஏன் இவ்வளவு பேர் கூடியிருக்கிறார்கள்?","te":"మెయిన్ గేట్ బయట ఎందుకు ఇంత మంది జనం గుమిగూడారు?","tr":"main gate bayata enduku intha mandi janam gumigoodaaru?"},
  {"id":34,"en":"Is it going to rain heavily today, according to the weather report?","ta":"வானிலை அறிக்கையின்படி இன்று பலத்த மழை பெய்யுமா?","te":"వాతావరణ నివేదిక ప్రకారం ఈరోజు భారీ వర్షం పడబోతోందా?","tr":"vaathaavarana nivedika prakaaram eeroju bhaaree varsham padabothondaa?"},
  {"id":35,"en":"Could you turn down the volume of the television, please?","ta":"தொலைக்காட்சியின் சத்தத்தை தயவுசெய்து குறைக்க முடியுமா?","te":"దయచేసి టీవీ వాల్యూమ్ను కొంచెం తగ్గించగలరా?","tr":"dayachesi TV volume-nu konchem thagginchagalaraa?"},
  {"id":36,"en":"Where can I find fresh vegetables and fruits in this new city?","ta":"இந்த புதிய நகரத்தில் புதிய காய்கறிகள் மற்றும் பழங்கள் எங்கே கிடைக்கும்?","te":"ఈ కొత్త నగరంలో తాజా కూరగాయలు మరియు పండ్లు ఎక్కడ దొరుకుతాయి?","tr":"ee kottha nagaramlo thaajaa kooragaayalu mariyu pandlu ekkada dorukuthaayi?"},
  {"id":37,"en":"Have you ever tried cooking this traditional dish at your home?","ta":"இந்த பாரம்பரிய உணவை நீங்கள் எப்போதாவது உங்கள் வீட்டில் சமைக்க முயற்சித்திருக்கிறீர்களா?","te":"మీరు ఎప్పుడైనా మీ ఇంట్లో ఈ సాంప్రదాయ వంటకాన్ని వండటానికి ప్రయత్నించారా?","tr":"meeru eppudainaa mee intlo ee saampradaaya vantakaanni vandataaniki prayathninchaaraa?"},
  {"id":38,"en":"What is your favorite memory from your childhood school days?","ta":"உங்கள் குழந்தைப்பருவ பள்ளி நாட்களில் உங்களுக்கு பிடித்தமான நினைவு எது?","te":"మీ చిన్ననాటి పాఠశాల రోజుల నుండి మీకు ఇష్టమైన జ్ఞాపకం ఏమిటి?","tr":"mee chinnanaati paathashaala rojula nundi meeku ishtamaina jnaapakam emiti?"},
  {"id":39,"en":"How many languages can you speak, read, and write fluently?","ta":"உங்களால் எத்தனை மொழிகளை சரளமாக பேச, படிக்க மற்றும் எழுத முடியும்?","te":"మీరు ఎన్ని భాషలను అనర్గళంగా మాట్లాడగలరు, చదవగలరు మరియు రాయగలరు?","tr":"meeru enni bhaashalanu anargalangaa maatlaadagalaru, chadavagalaru mariyu raayagalaru?"},
  {"id":40,"en":"Is there anyone who can guide me to the nearest petrol bunk?","ta":"அருகிலுள்ள பெட்ரோல் பங்கிற்கு என்னை வழிநடத்தக்கூடிய யாராவது இருக்கிறார்களா?","te":"దగ్గరలో ఉన్న పెట్రోల్ బంక్కు దారి చూపించే వారు ఎవరైనా ఉన్నారా?","tr":"daggaralo unna petrol bunk-ku daari choopinche vaaru evarainaa unnaaraa?"},
  {"id":41,"en":"Would you mind keeping an eye on my luggage for a minute?","ta":"ஒரு நிமிடம் எனது சாமான்களைப் பார்த்துக் கொள்ள முடியுமா?","te":"ఒక్క నిమిషం నా సామాను మీద కన్నేసి ఉంచగలరా?","tr":"okka nimisham naa saamaanu meeda kannesi unchagalaraa?"},
  {"id":42,"en":"How often do you visit your grandparents living in the village?","ta":"கிராமத்தில் வசிக்கும் உங்கள் தாத்தா பாட்டியை நீங்கள் எவ்வளவு அடிக்கடி சந்திக்கிறீர்கள்?","te":"గ్రామంలో నివసిస్తున్న మీ తాతయ్య, అమ్మమ్మలను మీరు ఎంత తరచుగా సందర్శిస్తారు?","tr":"graamamlo nivasistunna mee thaathayya, ammammalanu meeru entha tharachugaa sandarshisthaaru?"},
  {"id":43,"en":"Do you think it is a good idea to invest money in this business?","ta":"இந்த வியாபாரத்தில் பணம் முதலீடு செய்வது நல்ல யோசனை என்று நினைக்கிறீர்களா?","te":"ఈ వ్యాపారంలో డబ్బు పెట్టుబడి పెట్టడం మంచి ఆలోచన అని మీరు అనుకుంటున్నారా?","tr":"ee vyaapaaramlo dabbu pettubadi pettadam manchi aalochana ani meeru anukuntunnaaraa?"},
  {"id":44,"en":"Can you recommend a good book for beginners to read?","ta":"ஆரம்பநிலையாளர்கள் படிப்பதற்கு ஒரு நல்ல புத்தகத்தை பரிந்துரைக்க முடியுமா?","te":"ప్రారంభకులు చదవడానికి ఏదైనా మంచి పుస్తకాన్ని సిఫార్సు చేయగలరా?","tr":"praarambhakulu chadavadhaaniki edainaa manchi pustakaanni sifaarsu cheyagalaraa?"},
  {"id":45,"en":"What time does the supermarket close on Sunday evenings?","ta":"ஞாயிற்றுக்கிழமை மாலை பல்பொருள் அங்காடி எத்தனை மணிக்கு மூடப்படும்?","te":"ఆదివారం సాయంత్రం సూపర్ మార్కెట్ ఎన్ని గంటలకు మూసివేస్తారు?","tr":"aadivaaram saayanthram super market enni gantalaku moosivesthaaru?"},
  {"id":46,"en":"Are you entirely sure about the decision you made yesterday?","ta":"நேற்று நீங்கள் எடுத்த முடிவில் நீங்கள் முற்றிலும் உறுதியாக இருக்கிறீர்களா?","te":"నిన్న మీరు తీసుకున్న నిర్ణయం గురించి మీరు పూర్తిగా కచ్చితంగా ఉన్నారా?","tr":"ninna meeru theesukunna nirnayam gurinchi meeru poorthigaa kacchithangaa unnaaraa?"},
  {"id":47,"en":"How long does the battery of this mobile phone last on a full charge?","ta":"முழு சார்ஜில் இந்த மொபைல் போனின் பேட்டரி எவ்வளவு நேரம் நீடிக்கும்?","te":"పూర్తి ఛార్జింగ్తో ఈ మొబైల్ ఫోన్ బ్యాటరీ ఎంతసేపు వస్తుంది?","tr":"poorthi charging-tho ee mobile phone battery enthasepu vasthundi?"},
  {"id":48,"en":"Is it safe to travel alone at night in this neighborhood?","ta":"இந்த பகுதியில் இரவில் தனியாக பயணம் செய்வது பாதுகாப்பானதா?","te":"ఈ ప్రాంతంలో రాత్రిపూట ఒంటరిగా ప్రయాణించడం సురక్షితమేనా?","tr":"ee praanthamlo raathripoota ontarigaa prayaaninchadam surakshithamenaa?"},
  {"id":49,"en":"What should I do if I lose my debit card while traveling?","ta":"பயணம் செய்யும் போது எனது டெபிட் கார்டை தொலைத்துவிட்டால் நான் என்ன செய்ய வேண்டும்?","te":"ప్రయాణంలో నా డెబిట్ కార్డు పోగొట్టుకుంటే నేను ఏం చేయాలి?","tr":"prayaanamlo naa debit card pogottukunte nenu em cheyaali?"},
  {"id":50,"en":"Can we take a small break for ten minutes to drink tea?","ta":"தேநீர் அருந்துவதற்கு நாம் பத்து நிமிடம் சிறிய இடைவேளை எடுக்கலாமா?","te":"టీ తాగడానికి మనం పది నిమిషాల పాటు చిన్న విరామం తీసుకుందామా?","tr":"tea thaagadaaniki manam padi nimishaala paatu chinna viraamam theesukundaamaa?"}
]"""

data = json.loads(input_json)
formatted_data = []

base_id = 801
for i, item in enumerate(data):
    # Pick 3 random wrong answers
    wrong_options = random.sample([d for d in data if d['id'] != item['id']], 3)
    
    options = [
        {"te": item["te"], "tr": item["tr"], "ans": True},
        {"te": wrong_options[0]["te"], "tr": wrong_options[0]["tr"], "ans": False},
        {"te": wrong_options[1]["te"], "tr": wrong_options[1]["tr"], "ans": False},
        {"te": wrong_options[2]["te"], "tr": wrong_options[2]["tr"], "ans": False}
    ]
    random.shuffle(options)
    
    formatted_data.append({
        "id": base_id + i,
        "type": "mcq",
        "en": item["en"],
        "ta": item["ta"],
        "options": options
    })

# Now append this to teluguQuizData.js
js_file_path = r'c:\Users\shalika shahana\OneDrive\Documents\lingolive\frontend\src\data\teluguQuizData.js'
with open(js_file_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# The file ends with "  }\n];"
# We will inject the new formatted_data before the closing ];
formatted_json_str = json.dumps(formatted_data, ensure_ascii=False, indent=2)
# Remove the wrapping [] from formatted_json_str
formatted_json_str = formatted_json_str[1:-1]

if js_content.strip().endswith('];'):
    new_js_content = js_content.rsplit('];', 1)[0] + '  },' + formatted_json_str + '\n];'
    
    # We must be careful that there wasn't a trailing comma in the original array
    # Let's do a more robust approach. We can just replace '];' with '},' + formatted_json_str + '\n];'
    # Actually wait, rsplit splits from the right. If the last item ends with '}', the split will be '}' + '];'
    with open(js_file_path, 'w', encoding='utf-8') as f:
        # replace the last "}" with "},"
        # Wait, the easiest way is to just find the last "]" and insert the text there.
        last_bracket_idx = js_content.rfind(']')
        if last_bracket_idx != -1:
            # Check if there is a comma before it. If not, add one.
            content_before = js_content[:last_bracket_idx].strip()
            if content_before.endswith('}'):
                new_content = js_content[:last_bracket_idx] + ',' + formatted_json_str + js_content[last_bracket_idx:]
            else:
                new_content = js_content[:last_bracket_idx] + formatted_json_str + js_content[last_bracket_idx:]
            f.write(new_content)
        else:
            print("Could not find ]")
else:
    print("File does not end with ];")

print("Appended successfully.")
