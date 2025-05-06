import LeoProfanity from 'https://cdn.skypack.dev/leo-profanity';

LeoProfanity.loadDictionary();

function stringSimilarity(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();

    if (a === b) return 1;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    const longerLength = longer.length;
    if (longerLength === 0) return 0;

    return (longerLength - editDistance(longer, shorter)) / longerLength;
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

const safePhrases = [
    "classy bitch", "bass ass", "bad ass", "pass the exam", "madarchess", "gandu phool", "assam state", "assignment submission", "class test", "assess the data", "assistant manager", "passion project", "classic move", "bass guitar", "mass communication", "grass field", "bitchu village", "kashi vishwanath", "kumari", "shashi",
    "mess hall", "hackathon", "shatabdi express", "assume role", "ashutosh", "mission report", "fakir", "rashid", "pushkar", "shivam", "raashan card", "rashtrapati bhavan", "assam state", "bishan", "ashram"
];

const hindiProfanity = ['aand', 'aandu', 'balatkar', 'balatkari', 'behen chod', 'beti chod', 'bhadva', 'bhadve', 'bhandve', 'bhangi', 'bhootni ke', 'bhosad', 'bhosadi ke', 'boobe', 'chakke', 'chinaal', 'chinki', 'chod', 'chodu', 'chodu bhagat', 'chooche', 'choochi', 'choope', 'choot', 'choot ke baal', 'chootia', 'chootiya',
    'chuche', 'chuchi', 'chudaap', 'chudai khanaa', 'chudam chudai', 'chude', 'chut', 'chut ka chuha', 'chut ka churan', 'chut ka mail', 'chut ke baal', 'chut ke dhakkan', 'chut maarli', 'chutad', 'chutadd', 'chutan', 'chutia', 'chutiya', 'gaand', 'gaandfat', 'gaandmasti', 'gaandufad', 'gandfattu', 'gandu', 'gashti', 'gasti',
    'ghassa', 'ghasti', 'gucchi', 'gucchu', 'harami', 'haramzade', 'hawas', 'hawas ke pujari', 'hijda', 'hijra', 'jhant', 'jhant chaatu', 'jhant ka keeda', 'jhant ke baal', 'jhant ke pissu', 'jhantu', 'kamine', 'kaminey', 'kanjar', 'kutta', 'kutta kamina', 'kutte ki aulad', 'kutte ki jat', 'kuttiya', 'loda', 'lodu', 'lund',
    'lund choos', 'lund ka bakkal', 'lund khajoor', 'lundtopi', 'lundure', 'maa ki chut', 'maal', 'madar chod', 'madarchod', 'madhavchod', 'mooh mein le', 'mutth', 'mutthal', 'najayaz', 'najayaz aulaad', 'najayaz paidaish', 'paki', 'pataka', 'patakha', 'raand', 'randaap', 'randi', 'randi rona', 'saala', 'saala kutta', 'saali kutti',
    'saali randi', 'suar', 'suar ke lund', 'suar ki aulad', 'tatte', 'tatti', 'teri maa ka bhosada', 'teri maa ka boba chusu', 'teri maa ki behenchod', 'teri maa ki chut', 'tharak', 'tharki', 'tu chuda', 'आंड', 'आंडू', 'बलात्कार', 'बलात्कारी', 'बहनचोद', 'बेटीचोद', 'भड़वा', 'भड़वे', 'भंड़वे', 'भंगी', 'भूतनी के', 'भोसड़', 'भोसड़ी के', 'बूबे', 'छक्के',
    'छिनाल', 'चिंकी', 'चोद', 'चोदू', 'चोदू भगत', 'चूचे', 'चूची', 'चूपे', 'चूत', 'चूत के बाल', 'चूतिया', 'चूतिया', 'चूचे', 'चूची', 'चुदाप', 'चुदाई खाना', 'चुदम चुदाई', 'चुदे', 'चुट', 'चुट का चूहा', 'चुट का चूरण', 'चुट का मैल', 'चुट के बाल', 'चुट के ढक्कन', 'चुट मारली', 'चूतड़', 'चूतड्ड', 'चुटन', 'चूतिया', 'चूतिया', 'गांड', 'गांडफट', 'गांडमस्ती', 'गांडुफाड़', 'गांडफट्टू', 'गांडू',
    'गश्ती', 'गस्ती', 'घसा', 'घस्टी', 'गुच्ची', 'गुच्चू', 'हरामी', 'हरामज़ादे', 'हवस', 'हवस के पुजारी', 'हिजड़ा', 'हिजड़ा', 'झंट', 'झंट चाटू', 'झंट का कीड़ा', 'झंट के बाल', 'झंट के पिस्सू', 'झंटू', 'कमीने', 'कमीने', 'कंजर', 'कुत्ता', 'कुत्ता कमीना', 'कुत्ते की औलाद', 'कुत्ते की जात', 'कुतिया', 'लोड़ा', 'लोडू', 'लंड', 'लंड चूस', 'लंड का बक्कल', 'लंड खजूर', 'लंडटोपी', 'लंडुरे',
    'माँ की चूत', 'माल', 'मादरचोद', 'मादरचोद', 'माधवचोद', 'मूँह में ले', 'मुठ', 'मुठल', 'नाजायज़', 'नाजायज़ औलाद', 'नाजायज़ पैदाइश', 'पाकी', 'पटाखा', 'पटाखा', 'रांड', 'रांडाप', 'रंडी', 'रंडी रोना', 'साला', 'साला कुत्ता', 'साली कुत्ती', 'साली रंडी', 'सुअर', 'सुअर के लंड', 'सुअर की औलाद', 'तत्ते', 'तट्टी', 'तेरी माँ का भोसड़ा', 'तेरी माँ का बोबा चूसू', 'तेरी माँ की बहनचोद',
    'तेरी माँ की चूत', 'थरक', 'थरकी', 'तू चूदा'];
const arabicProfanity = ['سكس', 'طيز', 'شرج', 'لعق', 'لحس', 'مص', 'تمص', 'بيضان', 'ثدي', 'بز', 'بزاز', 'حلمة', 'مفلقسة', 'بظر', 'كس', 'فرج', 'شهوة', 'شاذ', 'مبادل', 'عاهرة', 'جماع', 'قضيب', 'زب', 'لوطي', 'لواط', 'سحاق', 'سحاقية', 'اغتصاب', 'خنثي', 'احتلام', 'نيك', 'متناك', 'متناكة', 'شرموطة', 'عرص', 'خول', 'قحبة', 'لبوة'];
const customProfanity = ['admin', 'null', 'Shourya', 'god', 'developer', 'dev', 'bozo', 'simp', 'cringe', 'loser', 'beta', 'virgin', 'incel', 'femcel', 'weeb', 'karen', 'soyboy', 'chad', 'stacy', 'ok boomer', 'woke', 'beta', 'alpha', 'cuck', 'normie', 'toxic', 'dweeb', '2g1c', '2 girls 1 cup', 'acrotomophilia', 'alabama hot pocket', 'alaskan pipeline', 'anal', 'anilingus', 'anus', 'apeshit',
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
    'venus mound', 'viagra', 'vibrator', 'violet wand', 'vorarephilia', 'voyeur', 'voyeurweb', 'voyuer', 'vulva', 'wank', 'wetback', 'wet dream', 'white power', 'whore', 'worldsex', 'wrapping men', 'wrinkled starfish', 'xx', 'xxx', 'yaoi', 'yellow showers', 'yiffy', 'zoophilia', '🖕', '🍑', '💦', '😏', '😉', '😍', '😘', '🥰', '😗',
    '😙', '😚', '😛', '😜', '🤤', '😩', '🥵', '🤪', '🤬', '😽', '😻', '🫰', '🫶', '💏', '💑', '💍', '💎', '♥️', '🩷', '🧡', '💛', '💚', '💙', '🩵', '💜', '🤎', '🖤', '🩶', '🤍', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '🆖', '®️', '™️', '©️'];

function adaptiveThreshold(word) {
    return Math.max(0.55, 1 - (1 / (word.length + 1)));
}

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

export const filter = {
    normalizeLeetspeak(text) {
        return text
            .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
            .replace(/[@4^∆ªλα]/g, 'a')
            .replace(/[8ßƃ]/g, 'b')
            .replace(/[<\(\[{¢©¢]/g, 'c')
            .replace(/[|)\]>dÐ]/g, 'd')
            .replace(/[3€£εëēê]/g, 'e')
            .replace(/[ƒ]/g, 'f')
            .replace(/[69&]/g, 'g')
            .replace(/[#}{]/g, 'h')
            .replace(/[!¡1|iïîī]/g, 'i')
            .replace(/[¿_/\\\|]/g, 'l')
            .replace(/(\/|\\|1)/g, 'l')
            .replace(/[|\/\\/]/g, 'l')
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
    },

    isEffectivelyEmpty(text) {
        return text
            .replace(/[\u200B-\u200D\uFEFF\u2060\u2800\s]/g, '')
            .replace(/(.)\1+/g, '$1')
            .trim()
            .length === 0;
    },

    get normalizedSafePhrases() {
        return safePhrases.map(p => this.normalizeLeetspeak(p));
    },

    containsSafePhrase(text) {
        const normalized = this.normalizeLeetspeak(text);
        return this.normalizedSafePhrases.some(phrase =>
            normalized.includes(phrase.replace(/\s+/g, ''))
        );
    },

    stich(text) { return text.replace(/[^a-z\u0900-\u097F\u0600-\u06FF]/gi, ''); },

    hasRegexProfanity(text) {
        if (!text || typeof text !== 'string') return;

        return smartRegex.some(pattern => pattern.test(text));
    },

    hasPhoneNumber(text) {
        const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/g;
        return phoneRegex.test(text);
    },

    hasSocialHandle(text) {
        const socialRegex = /(?:@|https?:\/\/)?(?:instagram\.com|twitter\.com|t\.me|facebook\.com|snapchat\.com|linkedin\.com|@)[\w.]+/gi;
        return socialRegex.test(text);
    },

    containsSensitiveInfo(text) {
        if (!text || typeof text !== 'string') return false;

        return (
            this.hasPhoneNumber(text) ||
            this.hasSocialHandle(text)
        );
    },

    hasFuzzyMatch(text) {
        if (!text || typeof text !== 'string') return;
        
        const words = text.toLowerCase().split(/\s+|[.,!?;:()]+/g);

        const checkWord = (word) => {
            const allBanned = [...customProfanity, ...hindiProfanity, ...arabicProfanity];
            const maxLen = Math.max(...allBanned.map(w => w.length));

            if (word.length > maxLen) {
                for (let i = 0; i <= word.length - maxLen; i++) {
                    allSlices.push(word.slice(i, i + maxLen));
                }
            }

            return allSlices.some(chunk =>
                allBanned.some(banned =>
                    stringSimilarity(chunk, banned) > adaptiveThreshold(banned)
                )
            );
        };

        return words.some(checkWord);
    },

    isProfane(text) {
        if (!text || typeof text !== 'string') return false;

        const normalized = this.normalizeLeetspeak(text);
        const collapsed = normalized.replace(/[^a-z]/g, '');

        if (this.isEffectivelyEmpty(text)) return false;

        if (this.containsSafePhrase(text)) return false;

        return (
            LeoProfanity.check(normalized) ||
            LeoProfanity.check(collapsed) ||
            this.hasRegexProfanity(normalized) ||
            this.hasFuzzyMatch(normalized) ||
            this.containsSensitiveInfo(text)
        );
    },

    censorProfaneWords(text) {
        return text.split(/\b/).map(part => {
            if (/[a-zA-Z0-9\u0600-\u06FF\u0900-\u097F]+/.test(part)) {
                return this.isProfane(part)
                    ? '*'.repeat(part.length)
                    : part;
            }
            return part;
        }).join('');
    }
};