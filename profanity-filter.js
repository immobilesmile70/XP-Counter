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
const customProfanity = ['bozo', 'simp', 'cringe', 'loser', 'beta', 'virgin', 'incel', 'femcel', 'weeb', 'karen', 'soyboy', 'chad', 'stacy', 'ok boomer', 'woke', 'beta', 'alpha', 'cuck', 'normie', 'toxic', 'dweeb', '2g1c', '2 girls 1 cup', 'acrotomophilia', 'alabama hot pocket', 'alaskan pipeline', 'anal', 'anilingus', 'anus', 'apeshit',
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
const fuzzyThreshold = 0.65;
const smartRegex = [
    /f+[\W_]*u+[\W_]*c+[\W_]*k+/gi,
    /s+[\W_]*h+[\W_]*i+[\W_]*t+/gi,
    /b+[\W_]*i+[\W_]*t+[\W_]*c+[\W_]*h+/gi,
    /a+[\W_]*s+[\W_]*s+/gi
];

export const filter = {
    normalizeLeetspeak(text) {
        return text
            .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
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
            .replace(/(.)\1{2,}/g, '$1');
    },

    hasRegexProfanity(text) {
        return smartRegex.some(pattern => pattern.test(text));
    },

    hasFuzzyMatch(text) {
        const words = text.toLowerCase().split(/\s+|[.,!?;:()]+/g);
        return words.some(word =>
            customProfanity.some(banned =>
                stringSimilarity(word, banned) > fuzzyThreshold
            ) ||
            hindiProfanity.some(banned =>
                stringSimilarity(word, banned) > fuzzyThreshold
            ) ||
            arabicProfanity.some(banned =>
                stringSimilarity(word, banned) > fuzzyThreshold
            )
        );
    },

    isProfane(text) {
        const normalized = this.normalizeLeetspeak(text);
        const collapsed = normalized.replace(/[^a-z]/g, '');

        return (
            LeoProfanity.check(normalized) ||
            LeoProfanity.check(collapsed) ||
            this.hasRegexProfanity(normalized) ||
            this.hasFuzzyMatch(normalized)
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