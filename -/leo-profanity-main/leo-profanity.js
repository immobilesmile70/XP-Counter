import require$$1 from "/-/french-badwords/french-badwords-list.js";
import * as russianBadWords from "/-/russian-badwords/russian-bad-words.js";
function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }
  }, fn(module, module.exports), module.exports;
}
function getDefaultExportFromNamespaceIfNotNamed(n) {
  return n && Object.prototype.hasOwnProperty.call(n, "default") && Object.keys(n).length === 1 ? n["default"] : n;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var require$$0 = [
  "2g1c",
  "acrotomophilia",
  "anal",
  "anilingus",
  "anus",
  "apeshit",
  "arsehole",
  "ass",
  "asshole",
  "assmunch",
  "autoerotic",
  "babeland",
  "bangbros",
  "bareback",
  "barenaked",
  "bastard",
  "bastardo",
  "bastinado",
  "bbw",
  "bdsm",
  "beaner",
  "beaners",
  "bestiality",
  "bimbos",
  "birdlock",
  "bitch",
  "bitches",
  "blowjob",
  "blumpkin",
  "bollocks",
  "bondage",
  "boner",
  "boob",
  "boobs",
  "bukkake",
  "bulldyke",
  "bullshit",
  "bunghole",
  "busty",
  "butt",
  "buttcheeks",
  "butthole",
  "camgirl",
  "camslut",
  "camwhore",
  "carpetmuncher",
  "circlejerk",
  "clit",
  "clitoris",
  "clusterfuck",
  "cock",
  "cocks",
  "coprolagnia",
  "coprophilia",
  "cornhole",
  "coon",
  "coons",
  "creampie",
  "cum",
  "cumming",
  "cunnilingus",
  "cunt",
  "darkie",
  "daterape",
  "deepthroat",
  "dendrophilia",
  "dick",
  "dildo",
  "dingleberry",
  "dingleberries",
  "doggiestyle",
  "doggystyle",
  "dolcett",
  "domination",
  "dominatrix",
  "dommes",
  "dvda",
  "ecchi",
  "ejaculation",
  "erotic",
  "erotism",
  "escort",
  "eunuch",
  "faggot",
  "fecal",
  "felch",
  "fellatio",
  "feltch",
  "femdom",
  "figging",
  "fingerbang",
  "fingering",
  "fisting",
  "footjob",
  "frotting",
  "fuck",
  "fuckin",
  "fucking",
  "fucktards",
  "fudgepacker",
  "futanari",
  "genitals",
  "goatcx",
  "goatse",
  "gokkun",
  "goodpoop",
  "goregasm",
  "grope",
  "g-spot",
  "guro",
  "handjob",
  "hardcore",
  "hentai",
  "homoerotic",
  "honkey",
  "hooker",
  "humping",
  "incest",
  "intercourse",
  "jailbait",
  "jigaboo",
  "jiggaboo",
  "jiggerboo",
  "jizz",
  "juggs",
  "kike",
  "kinbaku",
  "kinkster",
  "kinky",
  "knobbing",
  "lolita",
  "lovemaking",
  "masturbate",
  "milf",
  "motherfucker",
  "muffdiving",
  "nambla",
  "nawashi",
  "negro",
  "neonazi",
  "nigga",
  "nigger",
  "nimphomania",
  "nipple",
  "nipples",
  "nude",
  "nudity",
  "nympho",
  "nymphomania",
  "octopussy",
  "omorashi",
  "orgasm",
  "orgy",
  "paedophile",
  "paki",
  "panties",
  "panty",
  "pedobear",
  "pedophile",
  "pegging",
  "penis",
  "pissing",
  "pisspig",
  "playboy",
  "ponyplay",
  "poof",
  "poon",
  "poontang",
  "punany",
  "poopchute",
  "porn",
  "porno",
  "pornography",
  "pthc",
  "pubes",
  "pussy",
  "queaf",
  "queef",
  "quim",
  "raghead",
  "rape",
  "raping",
  "rapist",
  "rectum",
  "rimjob",
  "rimming",
  "sadism",
  "santorum",
  "scat",
  "schlong",
  "scissoring",
  "semen",
  "sex",
  "sexo",
  "sexy",
  "shemale",
  "shibari",
  "shit",
  "shitblimp",
  "shitty",
  "shota",
  "shrimping",
  "skeet",
  "slanteye",
  "slut",
  "s&m",
  "smut",
  "snatch",
  "snowballing",
  "sodomize",
  "sodomy",
  "spic",
  "splooge",
  "spooge",
  "spunk",
  "strapon",
  "strappado",
  "suck",
  "sucks",
  "swastika",
  "swinger",
  "threesome",
  "throating",
  "tit",
  "tits",
  "titties",
  "titty",
  "topless",
  "tosser",
  "towelhead",
  "tranny",
  "tribadism",
  "tubgirl",
  "tushy",
  "twat",
  "twink",
  "twinkie",
  "undressing",
  "upskirt",
  "urophilia",
  "vagina",
  "vibrator",
  "vorarephilia",
  "voyeur",
  "vulva",
  "wank",
  "wetback",
  "xx",
  "xxx",
  "yaoi",
  "yiffy",
  "zoophilia"
];
var require$$2 = /* @__PURE__ */ getDefaultExportFromNamespaceIfNotNamed(russianBadWords);
var src = createCommonjsModule(function(module, exports) {
  var LeoProfanity = {
    wordDictionary: {},
    words: [],
    removeWord: function(str) {
      var index = this.words.indexOf(str);
      if (index !== -1) {
        this.words.splice(index, 1);
      }
      return this;
    },
    addWord: function(str) {
      if (this.words.indexOf(str) === -1) {
        this.words.push(str);
      }
      return this;
    },
    getReplacementWord: function(key, n) {
      var i = 0;
      var replacementWord = "";
      for (i = 0; i < n; i++) {
        replacementWord += key;
      }
      return replacementWord;
    },
    sanitize: function(str) {
      str = str.toLowerCase();
      str = str.replace(/\.|,/g, " ");
      return str;
    },
    list: function() {
      return this.words;
    },
    check: function(str) {
      if (!str)
        return false;
      var i = 0;
      var isFound = false;
      str = this.sanitize(str);
      var strs = str.match(/[^ ]+/g) || [];
      while (!isFound && i <= this.words.length - 1) {
        if (strs.includes(this.words[i]))
          isFound = true;
        i++;
      }
      return isFound;
    },
    proceed: function(str, replaceKey, nbLetters) {
      if (!str)
        return "";
      if (typeof replaceKey === "undefined")
        replaceKey = "*";
      if (typeof nbLetters === "undefined")
        nbLetters = 0;
      var self = this;
      var originalString = str;
      var result = str;
      var sanitizedStr = self.sanitize(originalString);
      var sanitizedArr = sanitizedStr.split(/(\s)/);
      var resultArr = result.split(/(\s|,|\.)/);
      var badWords = [];
      sanitizedArr.forEach(function(item, index) {
        if (self.words.includes(item)) {
          var replacementWord = item.slice(0, nbLetters) + self.getReplacementWord(replaceKey, item.length - nbLetters);
          badWords.push(resultArr[index]);
          resultArr[index] = replacementWord;
        }
      });
      result = resultArr.join("");
      return [result, badWords];
    },
    clean: function(str, replaceKey, nbLetters) {
      if (!str)
        return "";
      if (typeof replaceKey === "undefined")
        replaceKey = "*";
      if (typeof nbLetters === "undefined")
        nbLetters = 0;
      return this.proceed(str, replaceKey, nbLetters)[0];
    },
    badWordsUsed: function(str) {
      if (!str)
        return [];
      return this.proceed(str, "*")[1];
    },
    add: function(data) {
      var self = this;
      if (typeof data === "string") {
        self.addWord(data);
      } else if (data.constructor === Array) {
        data.forEach(function(word) {
          self.addWord(word);
        });
      }
      return this;
    },
    remove: function(data) {
      var self = this;
      if (typeof data === "string") {
        self.removeWord(data);
      } else if (data.constructor === Array) {
        data.forEach(function(word) {
          self.removeWord(word);
        });
      }
      return this;
    },
    reset: function() {
      this.loadDictionary("en");
      return this;
    },
    clearList: function() {
      this.words = [];
      return this;
    },
    getDictionary: function(name = "en") {
      name = name in this.wordDictionary ? name : "en";
      return this.wordDictionary[name];
    },
    loadDictionary: function(name = "en") {
      this.words = JSON.parse(JSON.stringify(this.getDictionary(name)));
    },
    addDictionary: function(name, words2) {
      this.wordDictionary[name] = words2;
      this.loadDictionary(name);
      return this;
    },
    removeDictionary: function(name) {
      delete this.wordDictionary[name];
      return this;
    }
  };
  if (module.exports != null) {
    LeoProfanity.wordDictionary["en"] = require$$0;
    try {
      LeoProfanity.wordDictionary["fr"] = require$$1.array;
    } catch (e) {
    }
    try {
      LeoProfanity.wordDictionary["ru"] = require$$2.flatWords;
    } catch (e) {
    }
    LeoProfanity.words = JSON.parse(JSON.stringify(LeoProfanity.wordDictionary ? LeoProfanity.wordDictionary["en"] : []));
    module.exports = LeoProfanity;
    exports.default = LeoProfanity;
  }
});
var add = src.add;
var addDictionary = src.addDictionary;
var addWord = src.addWord;
var badWordsUsed = src.badWordsUsed;
var check = src.check;
var clean = src.clean;
var clearList = src.clearList;
export default src;
var getDictionary = src.getDictionary;
var getReplacementWord = src.getReplacementWord;
var list = src.list;
var loadDictionary = src.loadDictionary;
var proceed = src.proceed;
var remove = src.remove;
var removeDictionary = src.removeDictionary;
var removeWord = src.removeWord;
var reset = src.reset;
var sanitize = src.sanitize;
var wordDictionary = src.wordDictionary;
var words = src.words;
export {src as __moduleExports, add, addDictionary, addWord, badWordsUsed, check, clean, clearList, getDictionary, getReplacementWord, list, loadDictionary, proceed, remove, removeDictionary, removeWord, reset, sanitize, wordDictionary, words};
