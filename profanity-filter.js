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

const customProfanity = ['bozo', 'simp', 'cringe'];
const fuzzyThreshold = 0.8;
const smartRegex = [
    /f+[\W_]*u+[\W_]*c+[\W_]*k+/gi,
    /s+[\W_]*h+[\W_]*i+[\W_]*t+/gi,
    /b+[\W_]*i+[\W_]*t+[\W_]*c+[\W_]*h+/gi,
    /a+[\W_]*s+[\W_]*s+/gi
];

export const filter = {
    normalizeLeetspeak(text) {
        return text
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
        const words = text.split(/[^a-z]/g);
        return words.some(word =>
            customProfanity.some(banned =>
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
    }
};