import * as LeoProfanity from 'https://cdn.skypack.dev/leo-profanity';

LeoProfanity.getDictionary();

function stringSimilarity(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a === b) return 1;
    if (a.length < 4 || b.length < 4) {
        const longer = a.length > b.length ? a : b;
        const shorter = a.length > b.length ? b : a;
        const longerLength = longer.length;
        if (longerLength === 0) return 0;
        return (longerLength - editDistance(longer, shorter)) / longerLength;
    }
    function jaro(s1, s2) {
        const m = Math.max(s1.length, s2.length);
        if (m === 0) return 1;
        const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
        let s1Matches = new Array(s1.length).fill(false);
        let s2Matches = new Array(s2.length).fill(false);
        let matches = 0;
        let transpositions = 0;

        for (let i = 0; i < s1.length; i++) {
            const start = Math.max(0, i - matchDistance);
            const end = Math.min(i + matchDistance + 1, s2.length);
            for (let j = start; j < end; j++) {
                if (s2Matches[j]) continue;
                if (s1[i] !== s2[j]) continue;
                s1Matches[i] = true;
                s2Matches[j] = true;
                matches++;
                break;
            }
        }
        if (matches === 0) return 0;
        let k = 0;
        for (let i = 0; i < s1.length; i++) {
            if (!s1Matches[i]) continue;
            while (!s2Matches[k]) k++;
            if (s1[i] !== s2[k]) transpositions++;
            k++;
        }
        transpositions = transpositions / 2;
        return ((matches / s1.length) + (matches / s2.length) + ((matches - transpositions) / matches)) / 3;
    }
    function jaroWinkler(s1, s2) {
        const j = jaro(s1, s2);
        let prefix = 0;
        for (let i = 0; i < Math.min(4, s1.length, s2.length); i++) {
            if (s1[i] === s2[i]) prefix++;
            else break;
        }
        return j + prefix * 0.1 * (1 - j);
    }
    return jaroWinkler(a, b);
}

function editDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

LeoProfanity.remove([
    "sussy", "sus", "classy bitch", "bass ass", "bad ass", "pass the exam", "madarchess", "gandu phool", "assam state", "assignment submission", "class test", "assess the data", "assistant manager", "passion project", "classic move", "bass guitar", "mass communication", "grass field", "bitchu village", "kashi vishwanath", "kumari", "shashi",
    "mess hall", "hackathon", "shatabdi express", "assume role", "ashutosh", "mission report", "fakir", "rashid", "pushkar", "shivam", "raashan card", "rashtrapati bhavan", "assam state", "bishan", "ashram"
]);

LeoProfanity.add(['aand', 'aandu', 'balatkar', 'balatkari', 'behen chod', 'beti chod', 'bhadva', 'bhadve', 'bhandve', 'bhangi', 'bhootni ke', 'bhosad', 'bhosadi ke', 'boobe', 'chakke', 'chinaal', 'chinki', 'chod', 'chodu', 'chodu bhagat', 'chooche', 'choochi', 'choope', 'choot', 'choot ke baal', 'chootia', 'chootiya',
    'chuche', 'chuchi', 'chudaap', 'chudai khanaa', 'chudam chudai', 'chude', 'chut', 'chut ka chuha', 'chut ka churan', 'chut ka mail', 'chut ke baal', 'chut ke dhakkan', 'chut maarli', 'chutad', 'chutadd', 'chutan', 'chutia', 'chutiya', 'gaand', 'gaandfat', 'gaandmasti', 'gaandufad', 'gandfattu', 'gandu', 'gashti', 'gasti',
    'ghassa', 'ghasti', 'gucchi', 'gucchu', 'harami', 'haramzade', 'hawas', 'hawas ke pujari', 'hijda', 'hijra', 'jhant', 'jhant chaatu', 'jhant ka keeda', 'jhant ke baal', 'jhant ke pissu', 'jhantu', 'kamine', 'kaminey', 'kanjar', 'kutta', 'kutta kamina', 'kutte ki aulad', 'kutte ki jat', 'kuttiya', 'loda', 'lodu', 'lund',
    'lund choos', 'lund ka bakkal', 'lund khajoor', 'lundtopi', 'lundure', 'maa ki chut', 'maal', 'madar chod', 'madarchod', 'madhavchod', 'mooh mein le', 'mutth', 'mutthal', 'najayaz', 'najayaz aulaad', 'najayaz paidaish', 'paki', 'pataka', 'patakha', 'raand', 'randaap', 'randi', 'randi rona', 'saala', 'saala kutta', 'saali kutti',
    'saali randi', 'suar', 'suar ke lund', 'suar ki aulad', 'tatte', 'tatti', 'teri maa ka bhosada', 'teri maa ka boba chusu', 'teri maa ki behenchod', 'teri maa ki chut', 'tharak', 'tharki', 'tu chuda', 'आंड', 'आंडू', 'बलात्कार', 'बलात्कारी', 'बहनचोद', 'बेटीचोद', 'भड़वा', 'भड़वे', 'भंड़वे', 'भंगी', 'भूतनी के', 'भोसड़', 'भोसड़ी के', 'बूबे', 'छक्के',
    'छिनाल', 'चिंकी', 'चोद', 'चोदू', 'चोदू भगत', 'चूचे', 'चूची', 'चूपे', 'चूत', 'चूत के बाल', 'चूतिया', 'चूतिया', 'चूचे', 'चूची', 'चुदाप', 'चुदाई खाना', 'चुदम चुदाई', 'चुदे', 'चुट', 'चुट का चूहा', 'चुट का चूरण', 'चुट का मैल', 'चुट के बाल', 'चुट के ढक्कन', 'चुट मारली', 'चूतड़', 'चूतड्ड', 'चुटन', 'चूतिया', 'चूतिया', 'गांड', 'गांडफट', 'गांडमस्ती', 'गांडुफाड़', 'गांडफट्टू', 'गांडू',
    'गश्ती', 'गस्ती', 'घसा', 'घस्टी', 'गुच्ची', 'गुच्चू', 'हरामी', 'हरामज़ादे', 'हवस', 'हवस के पुजारी', 'हिजड़ा', 'हिजड़ा', 'झंट', 'झंट चाटू', 'झंट का कीड़ा', 'झंट के बाल', 'झंट के पिस्सू', 'झंटू', 'कमीने', 'कमीने', 'कंजर', 'कुत्ता', 'कुत्ता कमीना', 'कुत्ते की औलाद', 'कुत्ते की जात', 'कुतिया', 'लोड़ा', 'लोडू', 'लंड', 'लंड चूस', 'लंड का बक्कल', 'लंड खजूर', 'लंडटोपी', 'लंडुरे',
    'माँ की चूत', 'माल', 'मादरचोद', 'मादरचोद', 'माधवचोद', 'मूँह में ले', 'मुठ', 'मुठल', 'नाजायज़', 'नाजायज़ औलाद', 'नाजायज़ पैदाइश', 'पाकी', 'पटाखा', 'पटाखा', 'रांड', 'रांडाप', 'रंडी', 'रंडी रोना', 'साला', 'साला कुत्ता', 'साली कुत्ती', 'साली रंडी', 'सुअर', 'सुअर के लंड', 'सुअर की औलाद', 'तत्ते', 'तट्टी', 'तेरी माँ का भोसड़ा', 'तेरी माँ का बोबा चूसू', 'तेरी माँ की बहनचोद',
    'तेरी माँ की चूत', 'थरक', 'थरकी', 'तू चूदा', 'سكس', 'طيز', 'شرج', 'لعق', 'لحس', 'مص', 'تمص', 'بيضان', 'ثدي', 'بز', 'بزاز', 'حلمة', 'مفلقسة', 'بظر', 'كس', 'فرج', 'شهوة', 'شاذ', 'مبادل', 'عاهرة', 'جماع', 'قضيب', 'زب', 'لوطي', 'لواط', 'سحاق', 'سحاقية', 'اغتصاب', 'خنثي', 'احتلام', 'نيك', 'متناك', 'متناكة', 'شرموطة', 'عرص', 'خول', 'قحبة', 'لبوة',
    "balls", "null", "admin", "con", "aux", "prn", "com1", "lpt1", "com2", "nul", "sys", "sys1", "config", "boot", "temp", "root", "support", "user", "guest", "localhost", "test",
    "database", "backup", "system", "web", "localhost", "mail", "ftp", "db", "bin", 'Shourya', 'god', 'developer', 'dev', 'bozo', 'simp', 'cringe', 'loser', 'beta', 'virgin', 'incel', 'femcel', 'weeb', 'karen', 'soyboy', 'chad', 'stacy', 'ok boomer', 'woke', 'beta', 'alpha', 'cuck', 'normie', 'toxic', 'dweeb', '2g1c', '2 girls 1 cup', 'acrotomophilia', 'alabama hot pocket', 'alaskan pipeline', 'anal', 'anilingus', 'anus', 'apeshit',
    'arsehole', 'ass', 'asshole', 'assmunch', 'auto erotic', 'autoerotic', 'babeland', 'baby batter', 'baby juice', 'ball gag', 'ball gravy', 'ball kicking', 'ball licking', 'ball sack', 'ball sucking', 'bangbros', 'bangbus', 'bareback', 'barely legal', 'barenaked', 'bastard', 'bastardo', 'bastinado', 'bbw', 'bdsm', 'beaner',
    'beaners', 'beaver cleaver', 'beaver lips', 'beastiality', 'bestiality', 'big black', 'big breasts', 'big knockers', 'big tits', 'bimbos', 'birdlock', 'bitch', 'bitches', 'black cock', 'blonde action', 'blonde on blonde action', 'blowjob', 'blow job', 'blow your load', 'blue waffle', 'blumpkin', 'bollocks', 'bondage',
    'boner', 'boob', 'boobs', 'booty call', 'brown showers', 'brunette action', 'bukkake', 'bulldyke', 'bullet vibe', 'bullshit', 'bung hole', 'bunghole', 'busty', 'butt', 'buttcheeks', 'butthole', 'camel toe', 'camgirl', 'camslut', 'camwhore', 'carpet muncher', 'carpetmuncher', 'chocolate rosebuds', 'cialis', 'circlejerk',
    'cleveland steamer', 'clit', 'clitoris', 'clover clamps', 'clusterfuck', 'cock', 'cocks', 'coprolagnia', 'coprophilia', 'cornhole', 'coon', 'coons', 'creampie', 'cum', 'cumming', 'cumshot', 'cumshots', 'cunnilingus', 'cunt', 'darkie', 'date rape', 'daterape', 'deep throat', 'deepthroat', 'dendrophilia', 'dick', 'dildo',
    'dingleberry', 'dingleberries', 'dirty pillows', 'dirty sanchez', 'doggie style', 'doggiestyle', 'doggy style', 'doggystyle', 'dog style', 'dolcett', 'domination', 'dominatrix', 'dommes', 'donkey punch', 'double dong', 'double penetration', 'dp action', 'dry hump', 'dvda', 'eat my ass', 'ecchi', 'ejaculation', 'erotic',
    'erotism', 'escort', 'eunuch', 'fag', 'faggot', 'fecal', 'felch', 'fellatio', 'feltch', 'female squirting', 'femdom', 'figging', 'fingerbang', 'fingering', 'fisting', 'foot fetish', 'footjob', 'frotting', 'fuck', 'fuck buttons', 'fuckin', 'fucking', 'fucktards', 'fudge packer', 'fudgepacker', 'futanari', 'gangbang',
    'gang bang', 'gay sex', 'genitals', 'giant cock', 'girl on', 'girl on top', 'girls gone wild', 'goatcx', 'goatse', 'god damn', 'gokkun', 'golden shower', 'goodpoop', 'goo girl', 'goregasm', 'grope', 'group sex', 'g-spot', 'guro', 'hand job', 'handjob', 'hard core', 'hardcore', 'hentai', 'homoerotic', 'honkey', 'hooker',
    'horny', 'hot carl', 'hot chick', 'how to kill', 'how to murder', 'huge fat', 'humping', 'incest', 'intercourse', 'jack off', 'jail bait', 'jailbait', 'jelly donut', 'jerk off', 'jigaboo', 'jiggaboo', 'jiggerboo', 'jizz', 'juggs', 'kike', 'kinbaku', 'kinkster', 'kinky', 'knobbing', 'leather restraint', 'leather straight jacket',
    'lemon party', 'livesex', 'lolita', 'lovemaking', 'make me come', 'male squirting', 'masturbate', 'masturbating', 'masturbation', 'menage a trois', 'milf', 'missionary position', 'mong', 'motherfucker', 'mound of venus', 'mr hands', 'muff diver', 'muffdiving', 'nambla', 'nawashi', 'negro', 'neonazi', 'nigga', 'nigger', 'nig nog',
    'nimphomania', 'nipple', 'nipples', 'nsfw', 'nsfw images', 'nude', 'nudity', 'nutten', 'nympho', 'nymphomania', 'octopussy', 'omorashi', 'one cup two girls', 'one guy one jar', 'orgasm', 'orgy', 'paedophile', 'paki', 'panties', 'panty', 'pedobear', 'pedophile', 'pegging', 'penis', 'phone sex', 'piece of shit', 'pikey', 'pissing',
    'piss pig', 'pisspig', 'playboy', 'pleasure chest', 'pole smoker', 'ponyplay', 'poof', 'poon', 'poontang', 'punany', 'poop chute', 'poopchute', 'porn', 'porno', 'pornography', 'prince albert piercing', 'pthc', 'pubes', 'pussy', 'queaf', 'queef', 'quim', 'raghead', 'raging boner', 'rape', 'raping', 'rapist', 'rectum', 'reverse cowgirl',
    'rimjob', 'rimming', 'rosy palm', 'rosy palm and her 5 sisters', 'rusty trombone', 'sadism', 'santorum', 'scat', 'schlong', 'scissoring', 'semen', 'sex', 'sexcam', 'sexo', 'sexy', 'sexual', 'sexually', 'sexuality', 'shaved beaver', 'shaved pussy', 'shemale', 'shibari', 'shit', 'shitblimp', 'shitty', 'shota', 'shrimping', 'skeet',
    'slanteye', 'slut', 's&m', 'smut', 'snatch', 'snowballing', 'sodomize', 'sodomy', 'spastic', 'spic', 'splooge', 'splooge moose', 'spooge', 'spread legs', 'spunk', 'strap on', 'strapon', 'strappado', 'strip club', 'style doggy', 'suck', 'sucks', 'suicide girls', 'sultry women', 'swastika', 'swinger', 'tainted love', 'taste my',
    'tea bagging', 'threesome', 'throating', 'thumbzilla', 'tied up', 'tight white', 'tit', 'tits', 'titties', 'titty', 'tongue in a', 'topless', 'tosser', 'towelhead', 'tranny', 'tribadism', 'tub girl', 'tubgirl', 'tushy', 'twat', 'twink', 'twinkie', 'two girls one cup', 'undressing', 'upskirt', 'urethra play', 'urophilia', 'vagina',
    'venus mound', 'viagra', 'vibrator', 'violet wand', 'vorarephilia', 'voyeur', 'voyeurweb', 'voyuer', 'vulva', 'wank', 'wetback', 'wet dream', 'white power', 'whore', 'worldsex', 'wrapping men', 'wrinkled starfish', 'xx', 'xxx', 'yaoi', 'yellow showers', 'yiffy', 'zoophilia', "braz", "porn", "hub", "xxx", "cam", "fetish", "nsfw",
    "erotic", "xhamster", "xvideos", "pornos", "milf", "bbw", "escort", "hentai", "adultsite", "sexshop", "lesbian", "gay", '🖕', '🍑', '💦', '😏', '😉', '😍', '😘', '🥰', '😗', '😙', '😚', '😛', '😜', '🤤', '😩', '🥵', '🤪', '🤬', '😽', '😻', '🫰', '🫶', '💏', '💑', '💍', '💎', '♥️', '🩷', '🧡', '💛', '💚', '💙', '🩵',
    '💜', '🤎', '🖤', '🩶', '🤍', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '🆖', '®️', '™️', '©️']);

const smartRegex = [
    /f+[\W_]*u+[\W_]*c+[\W_]*k+/gi,
    /s+[\W_]*h+[\W_]*i+[\W_]*t+/gi,
    /b+[\W_]*i+[\W_]*t+[\W_]*c+[\W_]*h+/gi,
    /a+[\W_]*s+[\W_]*s+/gi,
    /d+[\W_]*a+[\W_]*m+[\W_]*n+/gi,
    /h+[\W_]*e+[\W_]*l+[\W_]*l+/gi,
    /c+[\W_]*u+[\W_]*n+[\W_]*t+/gi,
    /p+[\W_]*u+[\W_]*s+[\W_]*s+[\W_]*y+/gi,
    /d+[\W_]*i+[\W_]*c+[\W_]*k+/gi,
    /c+[\W_]*o+[\W_]*c+[\W_]*k+/gi,
    /b+[\W_]*a+[\W_]*s+[\W_]*t+[\W_]*a+[\W_]*r+[\W_]*d+/gi,
    /m+[\W_]*o+[\W_]*t+[\W_]*h+[\W_]*e+[\W_]*r+[\W_]*f+[\W_]*u+[\W_]*c+[\W_]*k+[\W_]*e+[\W_]*r+/gi,
    /n+[\W_]*i+[\W_]*g+[\W_]*g+[\W_]*e+[\W_]*r+/gi,
    /n+[\W_]*i+[\W_]*g+[\W_]*g+[\W_]*a+/gi,
    /b+[\W_]*h+[\W_]*e+[\W_]*n+[\W_]*c+[\W_]*h+[\W_]*o+d+/gi,
    /m+[\W_]*a+[\W_]*d+[\W_]*a+[\W_]*r+[\W_]*c+[\W_]*h+[\W_]*o+d+/gi,
    /c+[\W_]*h+[\W_]*u+[\W_]*t+[\W_]*i+[\W_]*y+a+/gi,
    /b+[\W_]*h+[\W_]*o+s+[\W_]*a+d+k+[\W_]*e+/gi,
    /r+[\W_]*a+[\W_]*n+[\W_]*d+[\W_]*i+/gi,
    /l+[\W_]*o+[\W_]*d+[\W_]*e+/gi,
    /g+[\W_]*a+[\W_]*n+d+[\W_]*u+/gi,
    /भ[\W_]*ो[\W_]*स[\W_]*ड[\W_]*ी/gi,
    /च[\W_]*ु[\W_]*त[\W_]*ि[\W_]*य[\W_]*ा/gi,
    /म[\W_]*ा[\W_]*द[\W_]*र[\W_]*च[\W_]*ो[\W_]*द/gi,
    /भ[\W_]*े[\W_]*न[\W_]*च[\W_]*ो[\W_]*द/gi,
    /ग[\W_]*ा[\W_]*ं[\W_]*ड[\W_]*ू/gi,
    /ल[\W_]*ो[\W_]*ड[\W_]*े/gi,
    /र[\W_]*ं[\W_]*ड[\W_]*ी/gi
];

function normalizeLeetspeak(text) {
    const emojiRegex = /([\u231A-\u231B]|[\u23E9-\u23EC]|[\u23F0-\u23F4]|[\u25FD-\u25FE]|[\u2600-\u27BF]|[\u2B50]|[\u2B55]|[\u2934-\u2935]|[\u2B06-\u2B07]|[\u2B1B-\u2B1C]|[\u2B05-\u2B07]|[\u3030]|[\u303D]|[\u3297]|[\u3299]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g;

    return text
        .replace(emojiRegex, '')
        .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
        .replace(/[\u0430\u03B1]/g, 'a')
        .replace(/[\u0435\u03B5]/g, 'e')
        .replace(/[\u0441\u03F2]/g, 'c')
        .replace(/[\u043E\u03BF]/g, 'o')
        .replace(/[\u0440\u03C1]/g, 'p')
        .replace(/[\u0445\u03C5]/g, 'x')
        .replace(/[@4^∆ªλα]/g, 'a')
        .replace(/[8ßƃ]/g, 'b')
        .replace(/[<\(\[{¢©¢]/g, 'c')
        .replace(/[|)\]>dÐ]/g, 'd')
        .replace(/[3€£εëēê]/g, 'e')
        .replace(/[ƒ]/g, 'f')
        .replace(/[69&]/g, 'g')
        .replace(/[#}{]/g, 'h')
        .replace(/[!¡1|iïîī]/g, 'i')
        .replace(/[¿_/\\|\/1l]/g, 'l')
        .replace(/[₥m]/g, 'm')
        .replace(/[nηñ]/g, 'n')
        .replace(/[0º¤øöôō]/g, 'o')
        .replace(/[ρp¶þ]/g, 'p')
        .replace(/[q]/g, 'q')
        .replace(/[®rЯ]/g, 'r')
        .replace(/[5$§ŝ]/g, 's')
        .replace(/[7+†]/g, 't')
        .replace(/[µüûū]/g, 'u')
        .replace(/[v]/g, 'v')
        .replace(/[wωvv]/g, 'w')
        .replace(/[×χ]/g, 'x')
        .replace(/[¥γy]/g, 'y')
        .replace(/[2ž]/g, 'z')
        .replace(/\s+/g, '')
        .replace(/(.)\1{1,}/g, '$1');
}

const normalizedBannedWords = LeoProfanity.getDictionary().map(w => normalizeLeetspeak(w));

const rawHomophones = {
    'beech': 'bitch',
    'sheet': 'shit',
    'fork': 'fuck',
    'witch': 'bitch',
    'ash': 'ass',
    'duck': 'fuck',
    'ditch': 'bitch',
    'pitch': 'bitch',
    'ship': 'shit',
    'batch': 'bitch',
    'fact': 'fucked',
    'flock': 'fuck',
    'frick': 'fuck',
    'shut': 'shit',
    'fit': 'shit',
    'sass': 'ass',
    'pass': 'ass',
    'luck': 'fuck',
    'muck': 'fuck',
    'fudge': 'fuck',
    'witches': 'bitches',
    'shoot': 'shit',
    'hell': 'hail',
    'beep': 'bitch',
    'motherforker': 'motherfucker',
    'forking': 'fucking',
    'beetch': 'bitch',
    'bish': 'bitch',
    'fuq': 'fuck',
    'phuq': 'fuck',
    'azz': 'ass',
    'shiit': 'shit',
    'shiet': 'shit'
};
const normalizedHomophones = {};
for (const [k, v] of Object.entries(rawHomophones)) {
    normalizedHomophones[normalizeLeetspeak(k)] = normalizeLeetspeak(v);
}

export const filter = {
    normalizeLeetspeak,

    isEffectivelyEmpty(text) {
        return text
            .replace(/[\u200B-\u200D\uFEFF\u2060\u2800\s]/g, '')
            .replace(/(.)\1+/g, '$1')
            .trim()
            .length === 0;
    },

    stich(text) { return text.replace(/[^a-z\u0900-\u097F\u0600-\u06FF]/gi, ''); },

    hasRegexProfanity(text) {
        return smartRegex.some(pattern => {
            pattern.lastIndex = 0;
            return pattern.test(text);
        });
    },

    hasPhoneNumber(text) {
        const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/g;
        return phoneRegex.test(text);
    },

    hasSocialHandle(text) {
        const socialRegex = /(?:https?:\/\/)?(?:instagram\.com|twitter\.com|t\.me|facebook\.com|snapchat\.com|linkedin\.com)[\w.]+/gi;
        return socialRegex.test(text);
    },

    hasCreditCard(text) {
        const ccRegex = /\b(?:\d[ -]*?){13,16}\b/;
        return ccRegex.test(text);
    },

    containsSensitiveInfo(text) {
        return (
            this.hasPhoneNumber(text) ||
            this.hasSocialHandle(text) ||
            this.hasCreditCard(text)
        );
    },

    hasFuzzyMatch(text) {
        const normalizedText = normalizeLeetspeak(text);
        const words = normalizedText.split(/\s+|[.,!?;:()]+/g).filter(w => w.length > 2);
        if (words.length === 0) return false;
        function adaptiveThreshold(word) {
            if (word.length <= 3) return 0.85;
            if (word.length <= 5) return 0.80;
            if (word.length <= 7) return 0.78;
            return 0.75;
        }
        const maxLen = Math.max(...normalizedBannedWords.map(w => w.length));
        function checkWord(word) {
            if (!word) return false;
            let allSlices = [];
            if (word.length > maxLen) {
                for (let i = 0; i <= word.length - maxLen; i++) {
                    allSlices.push(word.slice(i, i + maxLen));
                }
            } else {
                allSlices.push(word);
            }
            return allSlices.some(chunk =>
                normalizedBannedWords.some(bannedWord =>
                    stringSimilarity(chunk, bannedWord) >= adaptiveThreshold(bannedWord)
                )
            );
        }
        return words.some(checkWord) || checkWord(normalizedText.replace(/\s+/g, ''));
    },

    hasHomophones(text) {
        const words = text.toLowerCase().split(/\s+|[.,!?;:()]+/g);
        return words.some(word => {
            const normWord = normalizeLeetspeak(word);
            const mapped = normalizedHomophones[normWord];
            return mapped && normalizedBannedWords.includes(mapped);
        });
    },

    isProfane(text) {
        const normalized = normalizeLeetspeak(text);
        const collapsed = normalized.replace(/[^a-z]/g, '');

        if (this.isEffectivelyEmpty(text)) return false;

        console.log('normalized text: ' + normalized);
        console.log('collapsed text: ' + collapsed);

        return (
            LeoProfanity.check(text) ||
            LeoProfanity.check(normalized) ||
            LeoProfanity.check(collapsed) ||
            this.hasRegexProfanity(normalized) ||
            this.hasFuzzyMatch(normalized) ||
            this.hasHomophones(text) ||
            this.containsSensitiveInfo(text)
        );
    },

    censorProfaneWords(text) {
        const emojiRegex = /([\u231A-\u231B]|[\u23E9-\u23EC]|[\u23F0-\u23F4]|[\u25FD-\u25FE]|[\u2600-\u27BF]|[\u2B50]|[\u2B55]|[\u2934-\u2935]|[\u2B06-\u2B07]|[\u2B1B-\u2B1C]|[\u2B05-\u2B07]|[\u3030]|[\u303D]|[\u3297]|[\u3299]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g;
        const cleanText = text.replace(emojiRegex, '');

        return cleanText.split(/\b/).map(part => {
            if (/[a-zA-Z0-9\u0600-\u06FF\u0900-\u097F]+/.test(part)) {
                return this.isProfane(part)
                    ? '*'.repeat(part.length)
                    : part;
            }
            return part;
        }).join('');
    }
};