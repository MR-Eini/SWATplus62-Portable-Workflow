// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
// This module was heavily inspired by ua-parser-js
// (https://www.npmjs.com/package/ua-parser-js) which is MIT licensed and
// Copyright (c) 2012-2024 Faisal Salman <f@faisalman.com>
/** Provides {@linkcode UserAgent} and related types to be able to provide a
 * structured understanding of a user agent string.
 *
 * @module
 */ var _computedKey, _computedKey1;
const ARCHITECTURE = "architecture";
const MODEL = "model";
const NAME = "name";
const TYPE = "type";
const VENDOR = "vendor";
const VERSION = "version";
const EMPTY = "";
const CONSOLE = "console";
const EMBEDDED = "embedded";
const MOBILE = "mobile";
const TABLET = "tablet";
const SMARTTV = "smarttv";
const WEARABLE = "wearable";
const PREFIX_MOBILE = "Mobile ";
const SUFFIX_BROWSER = " Browser";
const AMAZON = "Amazon";
const APPLE = "Apple";
const ASUS = "ASUS";
const BLACKBERRY = "BlackBerry";
const CHROME = "Chrome";
const EDGE = "Edge";
const FACEBOOK = "Facebook";
const FIREFOX = "Firefox";
const GOOGLE = "Google";
const HUAWEI = "Huawei";
const LG = "LG";
const MICROSOFT = "Microsoft";
const MOTOROLA = "Motorola";
const OPERA = "Opera";
const SAMSUNG = "Samsung";
const SHARP = "Sharp";
const SONY = "Sony";
const WINDOWS = "Windows";
const XIAOMI = "Xiaomi";
const ZEBRA = "Zebra";
function lowerize(str) {
  return str.toLowerCase();
}
function majorize(str) {
  return str ? str.replace(/[^\d\.]/g, EMPTY).split(".")[0] : undefined;
}
function trim(str) {
  return str.trimStart();
}
/** A map where the key is the common Windows version and the value is a string
 * or array of strings of potential values parsed from the user-agent string. */ const windowsVersionMap = new Map([
  [
    "ME",
    "4.90"
  ],
  [
    "NT 3.11",
    "NT3.51"
  ],
  [
    "NT 4.0",
    "NT4.0"
  ],
  [
    "2000",
    "NT 5.0"
  ],
  [
    "XP",
    [
      "NT 5.1",
      "NT 5.2"
    ]
  ],
  [
    "Vista",
    "NT 6.0"
  ],
  [
    "7",
    "NT 6.1"
  ],
  [
    "8",
    "NT 6.2"
  ],
  [
    "8.1",
    "NT 6.3"
  ],
  [
    "10",
    [
      "NT 6.4",
      "NT 10.0"
    ]
  ],
  [
    "RT",
    "ARM"
  ]
]);
function has(str1, str2) {
  if (Array.isArray(str1)) {
    for (const el of str1){
      if (lowerize(el) === lowerize(str2)) {
        return true;
      }
    }
    return false;
  }
  return lowerize(str2).indexOf(lowerize(str1)) !== -1;
}
function mapWinVer(str) {
  for (const [key, value] of windowsVersionMap){
    if (Array.isArray(value)) {
      for (const v of value){
        if (has(v, str)) {
          return key;
        }
      }
    } else if (has(value, str)) {
      return key;
    }
  }
  return str || undefined;
}
function mapper(// deno-lint-ignore no-explicit-any
target, ua, tuples) {
  let matches = null;
  for (const [matchers, processors] of tuples){
    let j = 0;
    let k = 0;
    while(j < matchers.length && !matches){
      if (!matchers[j]) {
        break;
      }
      matches = matchers[j++].exec(ua);
      if (matches) {
        for (const processor of processors){
          const match = matches[++k];
          if (Array.isArray(processor)) {
            if (processor.length === 2) {
              const [prop, value] = processor;
              if (typeof value === "function") {
                target[prop] = value.call(target, match);
              } else {
                target[prop] = value;
              }
            } else if (processor.length === 3) {
              const [prop, re, value] = processor;
              target[prop] = match ? match.replace(re, value) : undefined;
            } else {
              const [prop, re, value, fn] = processor;
              if (!fn) {
                throw new TypeError("Function must be defined in processor");
              }
              target[prop] = match ? fn.call(prop, match.replace(re, value)) : undefined;
            }
          } else {
            target[processor] = match ? match : undefined;
          }
        }
      }
    }
  }
}
/** An object with properties that are arrays of tuples which provide match
 * patterns and configuration on how to interpret the capture groups. */ const matchers = {
  browser: [
    [
      [
        /\b(?:crmo|crios)\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}${CHROME}`
        ]
      ]
    ],
    [
      [
        /edg(?:e|ios|a)?\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Edge"
        ]
      ]
    ],
    // Presto based
    [
      [
        /(opera mini)\/([-\w\.]+)/i,
        /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
        /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /opios[\/ ]+([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${OPERA} Mini`
        ]
      ]
    ],
    [
      [
        /\bopr\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          OPERA
        ]
      ]
    ],
    [
      [
        // Mixed
        /(kindle)\/([\w\.]+)/i,
        /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,
        // Trident based
        /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,
        /(ba?idubrowser)[\/ ]?([\w\.]+)/i,
        /(?:ms|\()(ie) ([\w\.]+)/i,
        // Webkit/KHTML based
        // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon/Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ//Vivaldi/DuckDuckGo
        /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
        /(heytap|ovi)browser\/([\d\.]+)/i,
        /(weibo)__([\d\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "UCBrowser"
        ]
      ]
    ],
    [
      [
        /microm.+\bqbcore\/([\w\.]+)/i,
        /\bqbcore\/([\w\.]+).+microm/i
      ],
      [
        VERSION,
        [
          NAME,
          "WeChat(Win) Desktop"
        ]
      ]
    ],
    [
      [
        /micromessenger\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "WeChat"
        ]
      ]
    ],
    [
      [
        /konqueror\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Konqueror"
        ]
      ]
    ],
    [
      [
        /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i
      ],
      [
        VERSION,
        [
          NAME,
          "IE"
        ]
      ]
    ],
    [
      [
        /ya(?:search)?browser\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Yandex"
        ]
      ]
    ],
    [
      [
        /(avast|avg)\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          /(.+)/,
          `$1 Secure${SUFFIX_BROWSER}`
        ],
        VERSION
      ]
    ],
    [
      [
        /\bfocus\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${FIREFOX} Focus`
        ]
      ]
    ],
    [
      [
        /\bopt\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${OPERA} Touch`
        ]
      ]
    ],
    [
      [
        /coc_coc\w+\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Coc Coc"
        ]
      ]
    ],
    [
      [
        /dolfin\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Dolphin"
        ]
      ]
    ],
    [
      [
        /coast\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${OPERA} Coast`
        ]
      ]
    ],
    [
      [
        /miuibrowser\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `MIUI${SUFFIX_BROWSER}`
        ]
      ]
    ],
    [
      [
        /fxios\/([\w\.-]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}${FIREFOX}`
        ]
      ]
    ],
    [
      [
        /\bqihu|(qi?ho?o?|360)browser/i
      ],
      [
        [
          NAME,
          `360${SUFFIX_BROWSER}`
        ]
      ]
    ],
    [
      [
        /(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          /(.+)/,
          "$1" + SUFFIX_BROWSER
        ],
        VERSION
      ]
    ],
    [
      [
        /(comodo_dragon)\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          /_/g,
          " "
        ],
        VERSION
      ]
    ],
    [
      [
        /(electron)\/([\w\.]+) safari/i,
        /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
        /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(metasr)[\/ ]?([\w\.]+)/i,
        /(lbbrowser)/i,
        /\[(linkedin)app\]/i
      ],
      [
        NAME
      ]
    ],
    [
      [
        /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i
      ],
      [
        [
          NAME,
          FACEBOOK
        ],
        VERSION
      ]
    ],
    [
      [
        /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
        /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
        /safari (line)\/([\w\.]+)/i,
        /\b(line)\/([\w\.]+)\/iab/i,
        /(chromium|instagram)[\/ ]([-\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /\bgsa\/([\w\.]+) .*safari\//i
      ],
      [
        VERSION,
        [
          NAME,
          "GSA"
        ]
      ]
    ],
    [
      [
        /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "TikTok"
        ]
      ]
    ],
    [
      [
        /headlesschrome(?:\/([\w\.]+)| )/i
      ],
      [
        VERSION,
        [
          NAME,
          `${CHROME} Headless`
        ]
      ]
    ],
    [
      [
        / wv\).+(chrome)\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          `${CHROME} WebView`
        ],
        VERSION
      ]
    ],
    [
      [
        /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i
      ],
      [
        VERSION,
        [
          NAME,
          `Android${SUFFIX_BROWSER}`
        ]
      ]
    ],
    [
      [
        /chrome\/([\w\.]+) mobile/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}${CHROME}`
        ]
      ]
    ],
    [
      [
        /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /version\/([\w\.\,]+) .*mobile(?:\/\w+ | ?)safari/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}Safari`
        ]
      ]
    ],
    [
      [
        /iphone .*mobile(?:\/\w+ | ?)safari/i
      ],
      [
        [
          NAME,
          `${PREFIX_MOBILE}Safari`
        ]
      ]
    ],
    [
      [
        /version\/([\w\.\,]+) .*(safari)/i
      ],
      [
        VERSION,
        NAME
      ]
    ],
    [
      [
        /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i
      ],
      [
        NAME,
        [
          VERSION,
          "1"
        ]
      ]
    ],
    [
      [
        /(webkit|khtml)\/([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(?:mobile|tablet);.*(firefox)\/([\w\.-]+)/i
      ],
      [
        [
          NAME,
          `${PREFIX_MOBILE}${FIREFOX}`
        ],
        VERSION
      ]
    ],
    [
      [
        /(navigator|netscape\d?)\/([-\w\.]+)/i
      ],
      [
        [
          NAME,
          "Netscape"
        ],
        VERSION
      ]
    ],
    [
      [
        /mobile vr; rv:([\w\.]+)\).+firefox/i
      ],
      [
        VERSION,
        [
          NAME,
          `${FIREFOX} Reality`
        ]
      ]
    ],
    [
      [
        /ekiohf.+(flow)\/([\w\.]+)/i,
        /(swiftfox)/i,
        /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
        // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
        /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
        // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
        /(firefox)\/([\w\.]+)/i,
        /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
        // Other
        /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
        // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
        /(links) \(([\w\.]+)/i,
        /panasonic;(viera)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(cobalt)\/([\w\.]+)/i
      ],
      [
        NAME,
        [
          VERSION,
          /[^\d\.]+./,
          EMPTY
        ]
      ]
    ]
  ],
  cpu: [
    [
      [
        /\b(?:(amd|x|x86[-_]?|wow|win)64)\b/i
      ],
      [
        [
          ARCHITECTURE,
          "amd64"
        ]
      ]
    ],
    [
      [
        /(ia32(?=;))/i,
        /((?:i[346]|x)86)[;\)]/i
      ],
      [
        [
          ARCHITECTURE,
          "ia32"
        ]
      ]
    ],
    [
      [
        /\b(aarch64|arm(v?8e?l?|_?64))\b/i
      ],
      [
        [
          ARCHITECTURE,
          "arm64"
        ]
      ]
    ],
    [
      [
        /windows (ce|mobile); ppc;/i
      ],
      [
        [
          ARCHITECTURE,
          "arm"
        ]
      ]
    ],
    [
      [
        /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i
      ],
      [
        [
          ARCHITECTURE,
          /ower/,
          EMPTY,
          lowerize
        ]
      ]
    ],
    [
      [
        /(sun4\w)[;\)]/i
      ],
      [
        [
          ARCHITECTURE,
          "sparc"
        ]
      ]
    ],
    [
      [
        /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
      ],
      [
        [
          ARCHITECTURE,
          lowerize
        ]
      ]
    ]
  ],
  device: [
    [
      [
        /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SAMSUNG
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
        /samsung[- ]([-\w]+)/i,
        /sec-(sgh\w+)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SAMSUNG
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\((ipad);[-\w\),; ]+apple/i,
        /applecoremedia\/[\w\.]+ \((ipad)/i,
        /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(macintosh);/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ]
      ]
    ],
    [
      [
        /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SHARP
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          HUAWEI
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(?:huawei|honor)([-\w ]+)[;\)]/i,
        /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          HUAWEI
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
        /\b; (\w+) build\/hm\1/i,
        /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
        /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
        /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i
      ],
      [
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          VENDOR,
          XIAOMI
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i
      ],
      [
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          VENDOR,
          XIAOMI
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /; (\w+) bui.+ oppo/i,
        /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "OPPO"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /vivo (\w+)(?: bui|\))/i,
        /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Vivo"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(rmx[12]\d{3})(?: bui|;|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Realme"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
        /\bmot(?:orola)?[- ](\w*)/i,
        /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          MOTOROLA
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(mz60\d|xoom[2 ]{0,2}) build\//i
      ],
      [
        MODEL,
        [
          VENDOR,
          MOTOROLA
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
      ],
      [
        MODEL,
        [
          VENDOR,
          LG
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
        /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
        /\blg-?([\d\w]+) bui/i
      ],
      [
        MODEL,
        [
          VENDOR,
          LG
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(ideatab[-\w ]+)/i,
        /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Lenovo"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(?:maemo|nokia).*(n900|lumia \d+)/i,
        /nokia[-_ ]?([-\w\.]*)/i
      ],
      [
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          VENDOR,
          "Nokia"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(pixel c)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /sony tablet [ps]/i,
        /\b(?:sony)?sgp\w+(?: bui|\))/i
      ],
      [
        [
          MODEL,
          "Xperia Tablet"
        ],
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        / (kb2005|in20[12]5|be20[12][59])\b/i,
        /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "OnePlus"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(alexa)webm/i,
        /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,
        /(kf[a-z]+)( bui|\)).+silk\//i
      ],
      [
        MODEL,
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i
      ],
      [
        [
          MODEL,
          /(.+)/g,
          "Fire Phone $1"
        ],
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(playbook);[-\w\),; ]+(rim)/i
      ],
      [
        MODEL,
        VENDOR,
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /\b((?:bb[a-f]|st[hv])100-\d)/i,
        /\(bb10; (\w+)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          BLACKBERRY
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ASUS
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ASUS
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(nexus 9)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "HTC"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
        /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
        /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i
      ],
      [
        VENDOR,
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Acer"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid.+; (m[1-5] note) bui/i,
        /\bmz-([-\w]{2,})/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Meizu"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
        // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
        /(hp) ([\w ]+\w)/i,
        /(asus)-?(\w+)/i,
        /(microsoft); (lumia[\w ]+)/i,
        /(lenovo)[-_ ]?([-\w]+)/i,
        /(jolla)/i,
        /(oppo) ?([\w ]+) bui/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(kobo)\s(ereader|touch)/i,
        /(archos) (gamepad2?)/i,
        /(hp).+(touchpad(?!.+tablet)|tablet)/i,
        /(kindle)\/([\w\.]+)/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(surface duo)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          MICROSOFT
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid [\d\.]+; (fp\du?)(?: b|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Fairphone"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(shield[\w ]+) b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Nvidia"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(sprint) (\w+)/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(kin\.[onetw]{3})/i
      ],
      [
        [
          MODEL,
          /\./g,
          " "
        ],
        [
          VENDOR,
          MICROSOFT
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid.+; ([c6]+|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ZEBRA
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ZEBRA
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /smart-tv.+(samsung)/i
      ],
      [
        VENDOR,
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /hbbtv.+maple;(\d+)/i
      ],
      [
        [
          MODEL,
          /^/,
          "SmartTV"
        ],
        [
          VENDOR,
          SAMSUNG
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i
      ],
      [
        [
          VENDOR,
          LG
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(apple) ?tv/i
      ],
      [
        VENDOR,
        [
          MODEL,
          `${APPLE} TV`
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /crkey/i
      ],
      [
        [
          MODEL,
          `${CHROME}cast`
        ],
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /droid.+aft(\w)( bui|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /\(dtv[\);].+(aquos)/i,
        /(aquos-tv[\w ]+)\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SHARP
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(bravia[\w ]+)( bui|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(mitv-\w{5}) bui/i
      ],
      [
        MODEL,
        [
          VENDOR,
          XIAOMI
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /Hbbtv.*(technisat) (.*);/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
        /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i
      ],
      [
        [
          VENDOR,
          trim
        ],
        [
          MODEL,
          trim
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i
      ],
      [
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(ouya)/i,
        /(nintendo) (\w+)/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /droid.+; (shield) bui/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Nvidia"
        ],
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /(playstation \w+)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /\b(xbox(?: one)?(?!; xbox))[\); ]/i
      ],
      [
        MODEL,
        [
          VENDOR,
          MICROSOFT
        ],
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /((pebble))app/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /droid.+; (glass) \d/i
      ],
      [
        MODEL,
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /droid.+; (wt63?0{2,3})\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ZEBRA
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /(quest( 2| pro)?)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          FACEBOOK
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i
      ],
      [
        VENDOR,
        [
          TYPE,
          EMBEDDED
        ]
      ]
    ],
    [
      [
        /(aeobc)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          EMBEDDED
        ]
      ]
    ],
    [
      [
        /droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i
      ],
      [
        MODEL,
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i
      ],
      [
        MODEL,
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i
      ],
      [
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i
      ],
      [
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(android[-\w\. ]{0,9});.+buil/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Generic"
        ]
      ]
    ]
  ],
  engine: [
    [
      [
        /windows.+ edge\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${EDGE}HTML`
        ]
      ]
    ],
    [
      [
        /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Blink"
        ]
      ]
    ],
    [
      [
        /(presto)\/([\w\.]+)/i,
        /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,
        /ekioh(flow)\/([\w\.]+)/i,
        /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
        /(icab)[\/ ]([23]\.[\d\.]+)/i,
        /\b(libweb)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /rv\:([\w\.]{1,9})\b.+(gecko)/i
      ],
      [
        VERSION,
        NAME
      ]
    ]
  ],
  os: [
    [
      [
        /microsoft (windows) (vista|xp)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(windows) nt 6\.2; (arm)/i,
        /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,
        /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i
      ],
      [
        NAME,
        [
          VERSION,
          mapWinVer
        ]
      ]
    ],
    [
      [
        /(win(?=3|9|n)|win 9x )([nt\d\.]+)/i
      ],
      [
        [
          NAME,
          WINDOWS
        ],
        [
          VERSION,
          mapWinVer
        ]
      ]
    ],
    [
      [
        /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
        /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
        /cfnetwork\/.+darwin/i
      ],
      [
        [
          VERSION,
          /_/g,
          "."
        ],
        [
          NAME,
          "iOS"
        ]
      ]
    ],
    [
      [
        /(mac os x) ?([\w\. ]*)/i,
        /(macintosh|mac_powerpc\b)(?!.+haiku)/i
      ],
      [
        [
          NAME,
          "macOS"
        ],
        [
          VERSION,
          /_/g,
          "."
        ]
      ]
    ],
    [
      [
        /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i
      ],
      [
        VERSION,
        NAME
      ]
    ],
    [
      [
        /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
        /(blackberry)\w*\/([\w\.]*)/i,
        /(tizen|kaios)[\/ ]([\w\.]+)/i,
        /\((series40);/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /\(bb(10);/i
      ],
      [
        VERSION,
        [
          NAME,
          BLACKBERRY
        ]
      ]
    ],
    [
      [
        /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Symbian"
        ]
      ]
    ],
    [
      [
        /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${FIREFOX} OS`
        ]
      ]
    ],
    [
      [
        /web0s;.+rt(tv)/i,
        /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "webOS"
        ]
      ]
    ],
    [
      [
        /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "watchOS"
        ]
      ]
    ],
    [
      [
        /crkey\/([\d\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${CHROME}cast`
        ]
      ]
    ],
    [
      [
        /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i
      ],
      [
        [
          NAME,
          "Chrome OS"
        ],
        VERSION
      ]
    ],
    [
      [
        /panasonic;(viera)/i,
        /(netrange)mmh/i,
        /(nettv)\/(\d+\.[\w\.]+)/i,
        // Console
        /(nintendo|playstation) (\w+)/i,
        /(xbox); +xbox ([^\);]+)/i,
        // Other
        /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
        /(mint)[\/\(\) ]?(\w*)/i,
        /(mageia|vectorlinux)[; ]/i,
        /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
        // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
        /(hurd|linux) ?([\w\.]*)/i,
        /(gnu) ?([\w\.]*)/i,
        /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
        /(haiku) (\w+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(sunos) ?([\w\.\d]*)/i
      ],
      [
        [
          NAME,
          "Solaris"
        ],
        VERSION
      ]
    ],
    [
      [
        /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
        /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
        /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
        /(unix) ?([\w\.]*)/i
      ],
      [
        NAME,
        VERSION
      ]
    ]
  ]
};
_computedKey = Symbol.for("Deno.customInspect"), _computedKey1 = Symbol.for("nodejs.util.inspect.custom");
/**
 * A representation of user agent string, which can be used to determine
 * environmental information represented by the string. All properties are
 * determined lazily.
 *
 * @example Usage
 * ```ts no-eval
 * import { UserAgent } from "@std/http/user-agent";
 *
 * Deno.serve((req) => {
 *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
 *   return new Response(`Hello, ${userAgent.browser.name}
 *     on ${userAgent.os.name} ${userAgent.os.version}!`);
 * });
 * ```
 */ export class UserAgent {
  #browser;
  #cpu;
  #device;
  #engine;
  #os;
  #ua;
  /**
   * Constructs a new instance.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.browser.name}
   *     on ${userAgent.os.name} ${userAgent.os.version}!`);
   * });
   * ```
   *
   * @param ua The user agent string to construct this instance with.
   */ constructor(ua){
    this.#ua = ua ?? "";
  }
  /**
   * The name and version of the browser extracted from the user agent
   * string.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.browser.name}!`);
   * });
   * ```
   *
   * @returns An object with information about the user agent's browser.
   */ get browser() {
    if (!this.#browser) {
      this.#browser = {
        name: undefined,
        version: undefined,
        major: undefined
      };
      mapper(this.#browser, this.#ua, matchers.browser);
      // deno-lint-ignore no-explicit-any
      this.#browser.major = majorize(this.#browser.version);
      Object.freeze(this.#browser);
    }
    return this.#browser;
  }
  /**
   * The architecture of the CPU extracted from the user agent string.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.cpu.architecture}!`);
   * });
   * ```
   *
   * @returns An object with information about the user agent's CPU.
   */ get cpu() {
    if (!this.#cpu) {
      this.#cpu = {
        architecture: undefined
      };
      mapper(this.#cpu, this.#ua, matchers.cpu);
      Object.freeze(this.#cpu);
    }
    return this.#cpu;
  }
  /**
   * The model, type, and vendor of a device if present in a user agent
   * string.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.device.model}!`);
   * });
   * ```
   *
   * @returns An object with information about the user agent's device.
   */ get device() {
    if (!this.#device) {
      this.#device = {
        model: undefined,
        type: undefined,
        vendor: undefined
      };
      mapper(this.#device, this.#ua, matchers.device);
      Object.freeze(this.#device);
    }
    return this.#device;
  }
  /**
   * The name and version of the browser engine in a user agent string.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.engine.name}!`);
   * });
   * ```
   *
   * @returns An object with information about the user agent's browser engine.
   */ get engine() {
    if (!this.#engine) {
      this.#engine = {
        name: undefined,
        version: undefined
      };
      mapper(this.#engine, this.#ua, matchers.engine);
      Object.freeze(this.#engine);
    }
    return this.#engine;
  }
  /**
   * The name and version of the operating system in a user agent string.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.os.name}!`);
   * });
   * ```
   *
   * @returns An object with information about the user agent's OS.
   */ get os() {
    if (!this.#os) {
      this.#os = {
        name: undefined,
        version: undefined
      };
      mapper(this.#os, this.#ua, matchers.os);
      Object.freeze(this.#os);
    }
    return this.#os;
  }
  /**
   * A read only version of the user agent string related to the instance.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.ua}!`);
   * });
   * ```
   *
   * @returns The user agent string.
   */ get ua() {
    return this.#ua;
  }
  /**
   * Converts the current instance to a JSON representation.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${JSON.stringify(userAgent.toJSON())}!`);
   * });
   * ```
   *
   * @returns A JSON representation on this user agent instance.
   */ toJSON() {
    const { browser, cpu, device, engine, os, ua } = this;
    return {
      browser,
      cpu,
      device,
      engine,
      os,
      ua
    };
  }
  /**
   * Converts the current instance to a string.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.toString()}!`);
   * });
   * ```
   *
   * @returns The user agent string.
   */ toString() {
    return this.#ua;
  }
  /**
   * Custom output for {@linkcode Deno.inspect}.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   Deno.inspect(userAgent);
   *   return new Response(`Hello, ${userAgent.ua}!`);
   * });
   * ```
   *
   * @param inspect internal inspect function.
   *
   * @returns The custom value to inspect.
   */ [_computedKey](inspect) {
    const { browser, cpu, device, engine, os, ua } = this;
    return `${this.constructor.name} ${inspect({
      browser,
      cpu,
      device,
      engine,
      os,
      ua
    })}`;
  }
  /**
   * Custom output for Node's
   * {@linkcode https://nodejs.org/api/util.html#utilinspectobject-options | util.inspect}.
   *
   * @example Usage
   * ```ts no-eval
   * import { UserAgent } from "@std/http/user-agent";
   * import { inspect } from "node:util";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   inspect(userAgent);
   *   return new Response(`Hello, ${userAgent.ua}!`);
   * });
   * ```
   *
   * @param depth internal inspect depth.
   * @param options internal inspect option.
   * @param inspect internal inspect function.
   *
   * @returns The custom value to inspect.
   */ [_computedKey1](depth, // deno-lint-ignore no-explicit-any
  options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { browser, cpu, device, engine, os, ua } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      browser,
      cpu,
      device,
      engine,
      os,
      ua
    }, newOptions)}`;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvaHR0cC8wLjIyNC41L3VzZXJfYWdlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLy8gVGhpcyBtb2R1bGUgd2FzIGhlYXZpbHkgaW5zcGlyZWQgYnkgdWEtcGFyc2VyLWpzXG4vLyAoaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvdWEtcGFyc2VyLWpzKSB3aGljaCBpcyBNSVQgbGljZW5zZWQgYW5kXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTItMjAyNCBGYWlzYWwgU2FsbWFuIDxmQGZhaXNhbG1hbi5jb20+XG5cbi8qKiBQcm92aWRlcyB7QGxpbmtjb2RlIFVzZXJBZ2VudH0gYW5kIHJlbGF0ZWQgdHlwZXMgdG8gYmUgYWJsZSB0byBwcm92aWRlIGFcbiAqIHN0cnVjdHVyZWQgdW5kZXJzdGFuZGluZyBvZiBhIHVzZXIgYWdlbnQgc3RyaW5nLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5jb25zdCBBUkNISVRFQ1RVUkUgPSBcImFyY2hpdGVjdHVyZVwiO1xuY29uc3QgTU9ERUwgPSBcIm1vZGVsXCI7XG5jb25zdCBOQU1FID0gXCJuYW1lXCI7XG5jb25zdCBUWVBFID0gXCJ0eXBlXCI7XG5jb25zdCBWRU5ET1IgPSBcInZlbmRvclwiO1xuY29uc3QgVkVSU0lPTiA9IFwidmVyc2lvblwiO1xuY29uc3QgRU1QVFkgPSBcIlwiO1xuXG5jb25zdCBDT05TT0xFID0gXCJjb25zb2xlXCI7XG5jb25zdCBFTUJFRERFRCA9IFwiZW1iZWRkZWRcIjtcbmNvbnN0IE1PQklMRSA9IFwibW9iaWxlXCI7XG5jb25zdCBUQUJMRVQgPSBcInRhYmxldFwiO1xuY29uc3QgU01BUlRUViA9IFwic21hcnR0dlwiO1xuY29uc3QgV0VBUkFCTEUgPSBcIndlYXJhYmxlXCI7XG5cbmNvbnN0IFBSRUZJWF9NT0JJTEUgPSBcIk1vYmlsZSBcIjtcbmNvbnN0IFNVRkZJWF9CUk9XU0VSID0gXCIgQnJvd3NlclwiO1xuXG5jb25zdCBBTUFaT04gPSBcIkFtYXpvblwiO1xuY29uc3QgQVBQTEUgPSBcIkFwcGxlXCI7XG5jb25zdCBBU1VTID0gXCJBU1VTXCI7XG5jb25zdCBCTEFDS0JFUlJZID0gXCJCbGFja0JlcnJ5XCI7XG5jb25zdCBDSFJPTUUgPSBcIkNocm9tZVwiO1xuY29uc3QgRURHRSA9IFwiRWRnZVwiO1xuY29uc3QgRkFDRUJPT0sgPSBcIkZhY2Vib29rXCI7XG5jb25zdCBGSVJFRk9YID0gXCJGaXJlZm94XCI7XG5jb25zdCBHT09HTEUgPSBcIkdvb2dsZVwiO1xuY29uc3QgSFVBV0VJID0gXCJIdWF3ZWlcIjtcbmNvbnN0IExHID0gXCJMR1wiO1xuY29uc3QgTUlDUk9TT0ZUID0gXCJNaWNyb3NvZnRcIjtcbmNvbnN0IE1PVE9ST0xBID0gXCJNb3Rvcm9sYVwiO1xuY29uc3QgT1BFUkEgPSBcIk9wZXJhXCI7XG5jb25zdCBTQU1TVU5HID0gXCJTYW1zdW5nXCI7XG5jb25zdCBTSEFSUCA9IFwiU2hhcnBcIjtcbmNvbnN0IFNPTlkgPSBcIlNvbnlcIjtcbmNvbnN0IFdJTkRPV1MgPSBcIldpbmRvd3NcIjtcbmNvbnN0IFhJQU9NSSA9IFwiWGlhb21pXCI7XG5jb25zdCBaRUJSQSA9IFwiWmVicmFcIjtcblxudHlwZSBQcm9jZXNzaW5nRm4gPSAodmFsdWU6IHN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG50eXBlIE1hdGNoaW5nVHVwbGUgPSBbbWF0Y2hlcnM6IFtSZWdFeHAsIC4uLlJlZ0V4cFtdXSwgcHJvY2Vzc29yczogKFxuICBzdHJpbmcgfCBbc3RyaW5nLCBzdHJpbmddIHwgW3N0cmluZywgUHJvY2Vzc2luZ0ZuXSB8IFtcbiAgICBzdHJpbmcsXG4gICAgUmVnRXhwLFxuICAgIHN0cmluZyxcbiAgICBQcm9jZXNzaW5nRm4/LFxuICBdXG4pW11dO1xuXG5pbnRlcmZhY2UgTWF0Y2hlcnMge1xuICBicm93c2VyOiBNYXRjaGluZ1R1cGxlW107XG4gIGNwdTogTWF0Y2hpbmdUdXBsZVtdO1xuICBkZXZpY2U6IE1hdGNoaW5nVHVwbGVbXTtcbiAgZW5naW5lOiBNYXRjaGluZ1R1cGxlW107XG4gIG9zOiBNYXRjaGluZ1R1cGxlW107XG59XG5cbi8qKiBUaGUgYnJvd3NlciBhcyBkZXNjcmliZWQgYnkgYSB1c2VyIGFnZW50IHN0cmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnJvd3NlciB7XG4gIC8qKiBUaGUgbWFqb3IgdmVyc2lvbiBvZiBhIGJyb3dzZXIuICovXG4gIHJlYWRvbmx5IG1ham9yOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIC8qKiBUaGUgbmFtZSBvZiBhIGJyb3dzZXIuICovXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB2ZXJzaW9uIG9mIGEgYnJvd3Nlci4gKi9cbiAgcmVhZG9ubHkgdmVyc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xufVxuXG4vKiogVGhlIGRldmljZSBhcyBkZXNjcmliZWQgYnkgYSB1c2VyIGFnZW50IHN0cmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGV2aWNlIHtcbiAgLyoqIFRoZSBtb2RlbCBvZiB0aGUgZGV2aWNlLiAqL1xuICByZWFkb25seSBtb2RlbDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIHR5cGUgb2YgZGV2aWNlLiAqL1xuICByZWFkb25seSB0eXBlOlxuICAgIHwgXCJjb25zb2xlXCJcbiAgICB8IFwibW9iaWxlXCJcbiAgICB8IFwidGFibGVcIlxuICAgIHwgXCJzbWFydHZcIlxuICAgIHwgXCJ3ZWFyYWJsZVwiXG4gICAgfCBcImVtYmVkZGVkXCJcbiAgICB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB2ZW5kb3Igb2YgdGhlIGRldmljZS4gKi9cbiAgcmVhZG9ubHkgdmVuZG9yOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59XG5cbi8qKiBUaGUgYnJvd3NlciBlbmdpbmUgYXMgZGVzY3JpYmVkIGJ5IGEgdXNlciBhZ2VudCBzdHJpbmcuICovXG5leHBvcnQgaW50ZXJmYWNlIEVuZ2luZSB7XG4gIC8qKiBUaGUgYnJvd3NlciBlbmdpbmUgbmFtZS4gKi9cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIGJyb3dzZXIgZW5naW5lIHZlcnNpb24uICovXG4gIHJlYWRvbmx5IHZlcnNpb246IHN0cmluZyB8IHVuZGVmaW5lZDtcbn1cblxuLyoqIFRoZSBPUyBhcyBkZXNjcmliZWQgYnkgYSB1c2VyIGFnZW50IHN0cmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3Mge1xuICAvKiogVGhlIE9TIG5hbWUuICovXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSBPUyB2ZXJzaW9uLiAqL1xuICByZWFkb25seSB2ZXJzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59XG5cbi8qKiBUaGUgQ1BVIGluZm9ybWF0aW9uIGFzIGRlc2NyaWJlZCBieSBhIHVzZXIgYWdlbnQgc3RyaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDcHUge1xuICAvKiogVGhlIENQVSBhcmNoaXRlY3R1cmUuICAqL1xuICByZWFkb25seSBhcmNoaXRlY3R1cmU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gbG93ZXJpemUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIG1ham9yaXplKHN0cjogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHN0ciA/IHN0ci5yZXBsYWNlKC9bXlxcZFxcLl0vZywgRU1QVFkpLnNwbGl0KFwiLlwiKVswXSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gdHJpbShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIudHJpbVN0YXJ0KCk7XG59XG5cbi8qKiBBIG1hcCB3aGVyZSB0aGUga2V5IGlzIHRoZSBjb21tb24gV2luZG93cyB2ZXJzaW9uIGFuZCB0aGUgdmFsdWUgaXMgYSBzdHJpbmdcbiAqIG9yIGFycmF5IG9mIHN0cmluZ3Mgb2YgcG90ZW50aWFsIHZhbHVlcyBwYXJzZWQgZnJvbSB0aGUgdXNlci1hZ2VudCBzdHJpbmcuICovXG5jb25zdCB3aW5kb3dzVmVyc2lvbk1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT4oW1xuICBbXCJNRVwiLCBcIjQuOTBcIl0sXG4gIFtcIk5UIDMuMTFcIiwgXCJOVDMuNTFcIl0sXG4gIFtcIk5UIDQuMFwiLCBcIk5UNC4wXCJdLFxuICBbXCIyMDAwXCIsIFwiTlQgNS4wXCJdLFxuICBbXCJYUFwiLCBbXCJOVCA1LjFcIiwgXCJOVCA1LjJcIl1dLFxuICBbXCJWaXN0YVwiLCBcIk5UIDYuMFwiXSxcbiAgW1wiN1wiLCBcIk5UIDYuMVwiXSxcbiAgW1wiOFwiLCBcIk5UIDYuMlwiXSxcbiAgW1wiOC4xXCIsIFwiTlQgNi4zXCJdLFxuICBbXCIxMFwiLCBbXCJOVCA2LjRcIiwgXCJOVCAxMC4wXCJdXSxcbiAgW1wiUlRcIiwgXCJBUk1cIl0sXG5dKTtcblxuZnVuY3Rpb24gaGFzKHN0cjE6IHN0cmluZyB8IHN0cmluZ1tdLCBzdHIyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3RyMSkpIHtcbiAgICBmb3IgKGNvbnN0IGVsIG9mIHN0cjEpIHtcbiAgICAgIGlmIChsb3dlcml6ZShlbCkgPT09IGxvd2VyaXplKHN0cjIpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGxvd2VyaXplKHN0cjIpLmluZGV4T2YobG93ZXJpemUoc3RyMSkpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gbWFwV2luVmVyKHN0cjogc3RyaW5nKSB7XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHdpbmRvd3NWZXJzaW9uTWFwKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWUpIHtcbiAgICAgICAgaWYgKGhhcyh2LCBzdHIpKSB7XG4gICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGFzKHZhbHVlLCBzdHIpKSB7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyIHx8IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gbWFwcGVyKFxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICB0YXJnZXQ6IGFueSxcbiAgdWE6IHN0cmluZyxcbiAgdHVwbGVzOiBNYXRjaGluZ1R1cGxlW10sXG4pOiB2b2lkIHtcbiAgbGV0IG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IFttYXRjaGVycywgcHJvY2Vzc29yc10gb2YgdHVwbGVzKSB7XG4gICAgbGV0IGogPSAwO1xuICAgIGxldCBrID0gMDtcbiAgICB3aGlsZSAoaiA8IG1hdGNoZXJzLmxlbmd0aCAmJiAhbWF0Y2hlcykge1xuICAgICAgaWYgKCFtYXRjaGVyc1tqXSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG1hdGNoZXMgPSBtYXRjaGVyc1tqKytdIS5leGVjKHVhKTtcblxuICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBwcm9jZXNzb3Igb2YgcHJvY2Vzc29ycykge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gbWF0Y2hlc1srK2tdITtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm9jZXNzb3IpKSB7XG4gICAgICAgICAgICBpZiAocHJvY2Vzc29yLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICBjb25zdCBbcHJvcCwgdmFsdWVdID0gcHJvY2Vzc29yO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZS5jYWxsKFxuICAgICAgICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgbWF0Y2gsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzb3IubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IFtwcm9wLCByZSwgdmFsdWVdID0gcHJvY2Vzc29yO1xuICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBtYXRjaCA/IG1hdGNoLnJlcGxhY2UocmUsIHZhbHVlKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IFtwcm9wLCByZSwgdmFsdWUsIGZuXSA9IHByb2Nlc3NvcjtcbiAgICAgICAgICAgICAgaWYgKCFmbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGdW5jdGlvbiBtdXN0IGJlIGRlZmluZWQgaW4gcHJvY2Vzc29yXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IG1hdGNoXG4gICAgICAgICAgICAgICAgPyBmbi5jYWxsKHByb3AsIG1hdGNoLnJlcGxhY2UocmUsIHZhbHVlKSlcbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W3Byb2Nlc3Nvcl0gPSBtYXRjaCA/IG1hdGNoIDogdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKiogQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IGFyZSBhcnJheXMgb2YgdHVwbGVzIHdoaWNoIHByb3ZpZGUgbWF0Y2hcbiAqIHBhdHRlcm5zIGFuZCBjb25maWd1cmF0aW9uIG9uIGhvdyB0byBpbnRlcnByZXQgdGhlIGNhcHR1cmUgZ3JvdXBzLiAqL1xuY29uc3QgbWF0Y2hlcnM6IE1hdGNoZXJzID0ge1xuICBicm93c2VyOiBbXG4gICAgW1xuICAgICAgWy9cXGIoPzpjcm1vfGNyaW9zKVxcLyhbXFx3XFwuXSspL2ldLCAvLyBDaHJvbWUgZm9yIEFuZHJvaWQvaU9TXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIGAke1BSRUZJWF9NT0JJTEV9JHtDSFJPTUV9YF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9lZGcoPzplfGlvc3xhKT9cXC8oW1xcd1xcLl0rKS9pXSwgLy8gTWljcm9zb2Z0IEVkZ2VcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgXCJFZGdlXCJdXSxcbiAgICBdLFxuXG4gICAgLy8gUHJlc3RvIGJhc2VkXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvKG9wZXJhIG1pbmkpXFwvKFstXFx3XFwuXSspL2ksIC8vIE9wZXJhIE1pbmlcbiAgICAgICAgLyhvcGVyYSBbbW9iaWxldGFiXXszLDZ9KVxcYi4rdmVyc2lvblxcLyhbLVxcd1xcLl0rKS9pLCAvLyBPcGVyYSBNb2JpL1RhYmxldFxuICAgICAgICAvKG9wZXJhKSg/Oi4rdmVyc2lvblxcL3xbXFwvIF0rKShbXFx3XFwuXSspL2ksIC8vIE9wZXJhXG4gICAgICBdLFxuICAgICAgW05BTUUsIFZFUlNJT05dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9vcGlvc1tcXC8gXSsoW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgYCR7T1BFUkF9IE1pbmlgXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL1xcYm9wclxcLyhbXFx3XFwuXSspL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBPUEVSQV1dLFxuICAgIF0sXG5cbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8vIE1peGVkXG4gICAgICAgIC8oa2luZGxlKVxcLyhbXFx3XFwuXSspL2ksIC8vIEtpbmRsZVxuICAgICAgICAvKGx1bmFzY2FwZXxtYXh0aG9ufG5ldGZyb250fGphc21pbmV8YmxhemVyKVtcXC8gXT8oW1xcd1xcLl0qKS9pLCAvLyBMdW5hc2NhcGUvTWF4dGhvbi9OZXRmcm9udC9KYXNtaW5lL0JsYXplclxuICAgICAgICAvLyBUcmlkZW50IGJhc2VkXG4gICAgICAgIC8oYXZhbnQgfGllbW9iaWxlfHNsaW0pKD86YnJvd3Nlcik/W1xcLyBdPyhbXFx3XFwuXSopL2ksIC8vIEF2YW50L0lFTW9iaWxlL1NsaW1Ccm93c2VyXG4gICAgICAgIC8oYmE/aWR1YnJvd3NlcilbXFwvIF0/KFtcXHdcXC5dKykvaSwgLy8gQmFpZHUgQnJvd3NlclxuICAgICAgICAvKD86bXN8XFwoKShpZSkgKFtcXHdcXC5dKykvaSwgLy8gSW50ZXJuZXQgRXhwbG9yZXJcblxuICAgICAgICAvLyBXZWJraXQvS0hUTUwgYmFzZWRcbiAgICAgICAgLy8gRmxvY2svUm9ja01lbHQvTWlkb3JpL0VwaXBoYW55L1NpbGsvU2t5ZmlyZS9Cb2x0L0lyb24vSXJpZGl1bS9QaGFudG9tSlMvQm93c2VyL1F1cFppbGxhL0ZhbGtvbi9SZWtvbnEvUHVmZmluL0JyYXZlL1doYWxlL1FRQnJvd3NlckxpdGUvUVEvL1ZpdmFsZGkvRHVja0R1Y2tHb1xuICAgICAgICAvKGZsb2NrfHJvY2ttZWx0fG1pZG9yaXxlcGlwaGFueXxzaWxrfHNreWZpcmV8b3ZpYnJvd3Nlcnxib2x0fGlyb258dml2YWxkaXxpcmlkaXVtfHBoYW50b21qc3xib3dzZXJ8cXVhcmt8cXVwemlsbGF8ZmFsa29ufHJla29ucXxwdWZmaW58YnJhdmV8d2hhbGUoPyEuK25hdmVyKXxxcWJyb3dzZXJsaXRlfHFxfGR1Y2tkdWNrZ28pXFwvKFstXFx3XFwuXSspL2ksXG4gICAgICAgIC8oaGV5dGFwfG92aSlicm93c2VyXFwvKFtcXGRcXC5dKykvaSwgLy8gSGV5VGFwL092aVxuICAgICAgICAvKHdlaWJvKV9fKFtcXGRcXC5dKykvaSwgLy8gV2VpYm9cbiAgICAgIF0sXG4gICAgICBbTkFNRSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyg/OlxcYnVjPyA/YnJvd3NlcnwoPzpqdWMuKyl1Y3dlYilbXFwvIF0/KFtcXHdcXC5dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIFwiVUNCcm93c2VyXCJdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFtcbiAgICAgICAgL21pY3JvbS4rXFxicWJjb3JlXFwvKFtcXHdcXC5dKykvaSwgLy8gV2VDaGF0IERlc2t0b3AgZm9yIFdpbmRvd3MgQnVpbHQtaW4gQnJvd3NlclxuICAgICAgICAvXFxicWJjb3JlXFwvKFtcXHdcXC5dKykuK21pY3JvbS9pLFxuICAgICAgXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgXCJXZUNoYXQoV2luKSBEZXNrdG9wXCJdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvbWljcm9tZXNzZW5nZXJcXC8oW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgXCJXZUNoYXRcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9rb25xdWVyb3JcXC8oW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgXCJLb25xdWVyb3JcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy90cmlkZW50Litydls6IF0oW1xcd1xcLl17MSw5fSlcXGIuK2xpa2UgZ2Vja28vaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIFwiSUVcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy95YSg/OnNlYXJjaCk/YnJvd3NlclxcLyhbXFx3XFwuXSspL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBcIllhbmRleFwiXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyhhdmFzdHxhdmcpXFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbW05BTUUsIC8oLispLywgYCQxIFNlY3VyZSR7U1VGRklYX0JST1dTRVJ9YF0sIFZFUlNJT05dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXGJmb2N1c1xcLyhbXFx3XFwuXSspL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBgJHtGSVJFRk9YfSBGb2N1c2BdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFxib3B0XFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIGAke09QRVJBfSBUb3VjaGBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvY29jX2NvY1xcdytcXC8oW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgXCJDb2MgQ29jXCJdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZG9sZmluXFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIFwiRG9scGhpblwiXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL2NvYXN0XFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIGAke09QRVJBfSBDb2FzdGBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvbWl1aWJyb3dzZXJcXC8oW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgYE1JVUkke1NVRkZJWF9CUk9XU0VSfWBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZnhpb3NcXC8oW1xcd1xcLi1dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIGAke1BSRUZJWF9NT0JJTEV9JHtGSVJFRk9YfWBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFxicWlodXwocWk/aG8/bz98MzYwKWJyb3dzZXIvaV0sXG4gICAgICBbW05BTUUsIGAzNjAke1NVRkZJWF9CUk9XU0VSfWBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKG9jdWx1c3xzYW1zdW5nfHNhaWxmaXNofGh1YXdlaSlicm93c2VyXFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbW05BTUUsIC8oLispLywgXCIkMVwiICsgU1VGRklYX0JST1dTRVJdLCBWRVJTSU9OXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKGNvbW9kb19kcmFnb24pXFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbW05BTUUsIC9fL2csIFwiIFwiXSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8oZWxlY3Ryb24pXFwvKFtcXHdcXC5dKykgc2FmYXJpL2ksIC8vIEVsZWN0cm9uLWJhc2VkIEFwcFxuICAgICAgICAvKHRlc2xhKSg/OiBxdGNhcmJyb3dzZXJ8XFwvKDIwXFxkXFxkXFwuWy1cXHdcXC5dKykpL2ksIC8vIFRlc2xhXG4gICAgICAgIC9tPyhxcWJyb3dzZXJ8YmFpZHVib3hhcHB8MjM0NUV4cGxvcmVyKVtcXC8gXT8oW1xcd1xcLl0rKS9pLFxuICAgICAgXSxcbiAgICAgIFtOQU1FLCBWRVJTSU9OXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFtcbiAgICAgICAgLyhtZXRhc3IpW1xcLyBdPyhbXFx3XFwuXSspL2ksIC8vIFNvdUdvdUJyb3dzZXJcbiAgICAgICAgLyhsYmJyb3dzZXIpL2ksIC8vIExpZUJhbyBCcm93c2VyXG4gICAgICAgIC9cXFsobGlua2VkaW4pYXBwXFxdL2ksIC8vIExpbmtlZEluIEFwcCBmb3IgaU9TICYgQW5kcm9pZFxuICAgICAgXSxcbiAgICAgIFtOQU1FXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKCg/OmZiYW5cXC9mYmlvc3xmYl9pYWJcXC9mYjRhKSg/IS4rZmJhdil8O2ZiYXZcXC8oW1xcd1xcLl0rKTspL2ldLFxuICAgICAgW1tOQU1FLCBGQUNFQk9PS10sIFZFUlNJT05dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvKGtha2FvKD86dGFsa3xzdG9yeSkpW1xcLyBdKFtcXHdcXC5dKykvaSwgLy8gS2FrYW8gQXBwXG4gICAgICAgIC8obmF2ZXIpXFwoLio/KFxcZCtcXC5bXFx3XFwuXSspLipcXCkvaSwgLy8gTmF2ZXIgSW5BcHBcbiAgICAgICAgL3NhZmFyaSAobGluZSlcXC8oW1xcd1xcLl0rKS9pLCAvLyBMaW5lIEFwcCBmb3IgaU9TXG4gICAgICAgIC9cXGIobGluZSlcXC8oW1xcd1xcLl0rKVxcL2lhYi9pLCAvLyBMaW5lIEFwcCBmb3IgQW5kcm9pZFxuICAgICAgICAvKGNocm9taXVtfGluc3RhZ3JhbSlbXFwvIF0oWy1cXHdcXC5dKykvaSwgLy8gQ2hyb21pdW0vSW5zdGFncmFtXG4gICAgICBdLFxuICAgICAgW05BTUUsIFZFUlNJT05dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXGJnc2FcXC8oW1xcd1xcLl0rKSAuKnNhZmFyaVxcLy9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgXCJHU0FcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9tdXNpY2FsX2x5KD86LithcHBfP3ZlcnNpb25cXC98XykoW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgXCJUaWtUb2tcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9oZWFkbGVzc2Nocm9tZSg/OlxcLyhbXFx3XFwuXSspfCApL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBgJHtDSFJPTUV9IEhlYWRsZXNzYF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8gd3ZcXCkuKyhjaHJvbWUpXFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbW05BTUUsIGAke0NIUk9NRX0gV2ViVmlld2BdLCBWRVJTSU9OXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZHJvaWQuKyB2ZXJzaW9uXFwvKFtcXHdcXC5dKylcXGIuKyg/Om1vYmlsZSBzYWZhcml8c2FmYXJpKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgYEFuZHJvaWQke1NVRkZJWF9CUk9XU0VSfWBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvY2hyb21lXFwvKFtcXHdcXC5dKykgbW9iaWxlL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBgJHtQUkVGSVhfTU9CSUxFfSR7Q0hST01FfWBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKGNocm9tZXxvbW5pd2VifGFyb3JhfFt0aXplbm9rYV17NX0gP2Jyb3dzZXIpXFwvdj8oW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtOQU1FLCBWRVJTSU9OXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvdmVyc2lvblxcLyhbXFx3XFwuXFwsXSspIC4qbW9iaWxlKD86XFwvXFx3KyB8ID8pc2FmYXJpL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBgJHtQUkVGSVhfTU9CSUxFfVNhZmFyaWBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvaXBob25lIC4qbW9iaWxlKD86XFwvXFx3KyB8ID8pc2FmYXJpL2ldLFxuICAgICAgW1tOQU1FLCBgJHtQUkVGSVhfTU9CSUxFfVNhZmFyaWBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvdmVyc2lvblxcLyhbXFx3XFwuXFwsXSspIC4qKHNhZmFyaSkvaV0sXG4gICAgICBbVkVSU0lPTiwgTkFNRV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL3dlYmtpdC4rPyhtb2JpbGUgP3NhZmFyaXxzYWZhcmkpKFxcL1tcXHdcXC5dKykvaV0sXG4gICAgICBbTkFNRSwgW1ZFUlNJT04sIFwiMVwiXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyh3ZWJraXR8a2h0bWwpXFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbTkFNRSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyg/Om1vYmlsZXx0YWJsZXQpOy4qKGZpcmVmb3gpXFwvKFtcXHdcXC4tXSspL2ldLFxuICAgICAgW1tOQU1FLCBgJHtQUkVGSVhfTU9CSUxFfSR7RklSRUZPWH1gXSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyhuYXZpZ2F0b3J8bmV0c2NhcGVcXGQ/KVxcLyhbLVxcd1xcLl0rKS9pXSxcbiAgICAgIFtbTkFNRSwgXCJOZXRzY2FwZVwiXSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL21vYmlsZSB2cjsgcnY6KFtcXHdcXC5dKylcXCkuK2ZpcmVmb3gvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIGAke0ZJUkVGT1h9IFJlYWxpdHlgXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC9la2lvaGYuKyhmbG93KVxcLyhbXFx3XFwuXSspL2ksIC8vIEZsb3dcbiAgICAgICAgLyhzd2lmdGZveCkvaSwgLy8gU3dpZnRmb3hcbiAgICAgICAgLyhpY2VkcmFnb258aWNld2Vhc2VsfGNhbWlub3xjaGltZXJhfGZlbm5lY3xtYWVtbyBicm93c2VyfG1pbmltb3xjb25rZXJvcnxrbGFyKVtcXC8gXT8oW1xcd1xcLlxcK10rKS9pLFxuICAgICAgICAvLyBJY2VEcmFnb24vSWNld2Vhc2VsL0NhbWluby9DaGltZXJhL0Zlbm5lYy9NYWVtby9NaW5pbW8vQ29ua2Vyb3IvS2xhclxuICAgICAgICAvKHNlYW1vbmtleXxrLW1lbGVvbnxpY2VjYXR8aWNlYXBlfGZpcmViaXJkfHBob2VuaXh8cGFsZW1vb258YmFzaWxpc2t8d2F0ZXJmb3gpXFwvKFstXFx3XFwuXSspJC9pLFxuICAgICAgICAvLyBGaXJlZm94L1NlYU1vbmtleS9LLU1lbGVvbi9JY2VDYXQvSWNlQXBlL0ZpcmViaXJkL1Bob2VuaXhcbiAgICAgICAgLyhmaXJlZm94KVxcLyhbXFx3XFwuXSspL2ksIC8vIE90aGVyIEZpcmVmb3gtYmFzZWRcbiAgICAgICAgLyhtb3ppbGxhKVxcLyhbXFx3XFwuXSspIC4rcnZcXDouK2dlY2tvXFwvXFxkKy9pLCAvLyBNb3ppbGxhXG5cbiAgICAgICAgLy8gT3RoZXJcbiAgICAgICAgLyhwb2xhcmlzfGx5bnh8ZGlsbG98aWNhYnxkb3Jpc3xhbWF5YXx3M218bmV0c3VyZnxzbGVpcG5pcnxvYmlnb3xtb3NhaWN8KD86Z298aWNlfHVwKVtcXC4gXT9icm93c2VyKVstXFwvIF0/dj8oW1xcd1xcLl0rKS9pLFxuICAgICAgICAvLyBQb2xhcmlzL0x5bngvRGlsbG8vaUNhYi9Eb3Jpcy9BbWF5YS93M20vTmV0U3VyZi9TbGVpcG5pci9PYmlnby9Nb3NhaWMvR28vSUNFL1VQLkJyb3dzZXJcbiAgICAgICAgLyhsaW5rcykgXFwoKFtcXHdcXC5dKykvaSwgLy8gTGlua3NcbiAgICAgICAgL3BhbmFzb25pYzsodmllcmEpL2ksXG4gICAgICBdLFxuICAgICAgW05BTUUsIFZFUlNJT05dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oY29iYWx0KVxcLyhbXFx3XFwuXSspL2ldLFxuICAgICAgW05BTUUsIFtWRVJTSU9OLCAvW15cXGRcXC5dKy4vLCBFTVBUWV1dLFxuICAgIF0sXG4gIF0sXG4gIGNwdTogW1xuICAgIFtcbiAgICAgIFsvXFxiKD86KGFtZHx4fHg4NlstX10/fHdvd3x3aW4pNjQpXFxiL2ldLFxuICAgICAgW1tBUkNISVRFQ1RVUkUsIFwiYW1kNjRcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvKGlhMzIoPz07KSkvaSwgLy8gSUEzMiAocXVpY2t0aW1lKVxuICAgICAgICAvKCg/OmlbMzQ2XXx4KTg2KVs7XFwpXS9pLFxuICAgICAgXSxcbiAgICAgIFtbQVJDSElURUNUVVJFLCBcImlhMzJcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXGIoYWFyY2g2NHxhcm0odj84ZT9sP3xfPzY0KSlcXGIvaV0sXG4gICAgICBbW0FSQ0hJVEVDVFVSRSwgXCJhcm02NFwiXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL3dpbmRvd3MgKGNlfG1vYmlsZSk7IHBwYzsvaV0sXG4gICAgICBbW0FSQ0hJVEVDVFVSRSwgXCJhcm1cIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oKD86cHBjfHBvd2VycGMpKD86NjQpPykoPzogbWFjfDt8XFwpKS9pXSxcbiAgICAgIFtbQVJDSElURUNUVVJFLCAvb3dlci8sIEVNUFRZLCBsb3dlcml6ZV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oc3VuNFxcdylbO1xcKV0vaV0sXG4gICAgICBbW0FSQ0hJVEVDVFVSRSwgXCJzcGFyY1wiXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLygoPzphdnIzMnxpYTY0KD89OykpfDY4ayg/PVxcKSl8XFxiYXJtKD89dig/OlsxLTddfFs1LTddMSlsP3w7fGVhYmkpfCg/PWF0bWVsIClhdnJ8KD86aXJpeHxtaXBzfHNwYXJjKSg/OjY0KT9cXGJ8cGEtcmlzYykvaV0sXG4gICAgICBbW0FSQ0hJVEVDVFVSRSwgbG93ZXJpemVdXSxcbiAgICBdLFxuICBdLFxuICBkZXZpY2U6IFtcbiAgICBbXG4gICAgICBbL1xcYihzY2gtaVs4OV0wXFxkfHNody1tMzgwc3xzbS1bcHR4XVxcd3syLDR9fGd0LVtwbl1cXGR7Miw0fXxzZ2gtdDhbNTZdOXxuZXh1cyAxMCkvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIFNBTVNVTkddLCBbVFlQRSwgVEFCTEVUXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC9cXGIoKD86c1tjZ3BdaHxndHxzbSktXFx3K3xzY1tnLV0/W1xcZF0rYT98Z2FsYXh5IG5leHVzKS9pLFxuICAgICAgICAvc2Ftc3VuZ1stIF0oWy1cXHddKykvaSxcbiAgICAgICAgL3NlYy0oc2doXFx3KykvaSxcbiAgICAgIF0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIFNBTVNVTkddLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyg/OlxcL3xcXCgpKGlwKD86aG9uZXxvZClbXFx3LCBdKikoPzpcXC98OykvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIEFQUExFXSwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvXFwoKGlwYWQpO1stXFx3XFwpLDsgXSthcHBsZS9pLCAvLyBpUGFkXG4gICAgICAgIC9hcHBsZWNvcmVtZWRpYVxcL1tcXHdcXC5dKyBcXCgoaXBhZCkvaSxcbiAgICAgICAgL1xcYihpcGFkKVxcZFxcZD8sXFxkXFxkP1s7XFxdXS4raW9zL2ksXG4gICAgICBdLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBBUFBMRV0sIFtUWVBFLCBUQUJMRVRdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKG1hY2ludG9zaCk7L2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBBUFBMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXGIoc2gtP1thbHR2el0/XFxkXFxkW2EtZWttXT8pL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBTSEFSUF0sIFtUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFxiKCg/OmFnW3JzXVsyM10/fGJhaDI/fHNodD98YnR2KS1hP1tsd11cXGR7Mn0pXFxiKD8hLitkXFwvcykvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIEhVQVdFSV0sIFtUWVBFLCBUQUJMRVRdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFtcbiAgICAgICAgLyg/Omh1YXdlaXxob25vcikoWy1cXHcgXSspWztcXCldL2ksXG4gICAgICAgIC9cXGIobmV4dXMgNnB8XFx3ezIsNH1lPy1bYXR1XT9bbG5dW1xcZHhdWzAxMjM1OWNdW2Fkbl0/KVxcYig/IS4rZFxcL3MpL2ksXG4gICAgICBdLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBIVUFXRUldLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC9cXGIocG9jb1tcXHcgXSt8bTJcXGR7M31qXFxkXFxkW2Etel17Mn0pKD86IGJ1aXxcXCkpL2ksIC8vIFhpYW9taSBQT0NPXG4gICAgICAgIC9cXGI7IChcXHcrKSBidWlsZFxcL2htXFwxL2ksIC8vIFhpYW9taSBIb25nbWkgJ251bWVyaWMnIG1vZGVsc1xuICAgICAgICAvXFxiKGhtWy1fIF0/bm90ZT9bXyBdPyg/OlxcZFxcdyk/KSBidWkvaSwgLy8gWGlhb21pIEhvbmdtaVxuICAgICAgICAvXFxiKHJlZG1pW1xcLV8gXT8oPzpub3RlfGspP1tcXHdfIF0rKSg/OiBidWl8XFwpKS9pLCAvLyBYaWFvbWkgUmVkbWlcbiAgICAgICAgL1xcYihtaVstXyBdPyg/OmFcXGR8b25lfG9uZVtfIF1wbHVzfG5vdGUgbHRlfG1heHxjYyk/W18gXT8oPzpcXGQ/XFx3PylbXyBdPyg/OnBsdXN8c2V8bGl0ZSk/KSg/OiBidWl8XFwpKS9pLFxuICAgICAgXSxcbiAgICAgIFtbTU9ERUwsIC9fL2csIFwiIFwiXSwgW1ZFTkRPUiwgWElBT01JXSwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXGIobWlbLV8gXT8oPzpwYWQpKD86W1xcd18gXSspKSg/OiBidWl8XFwpKS9pXSxcbiAgICAgIFtbTU9ERUwsIC9fL2csIFwiIFwiXSwgW1ZFTkRPUiwgWElBT01JXSwgW1RZUEUsIFRBQkxFVF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvOyAoXFx3KykgYnVpLisgb3Bwby9pLFxuICAgICAgICAvXFxiKGNwaFsxMl1cXGR7M318cCg/OmFmfGNbYWxdfGRcXHd8ZVthcl0pW210XVxcZDB8eDkwMDd8YTEwMW9wKVxcYi9pLFxuICAgICAgXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgXCJPUFBPXCJdLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL3Zpdm8gKFxcdyspKD86IGJ1aXxcXCkpL2ksIC9cXGIodlsxMl1cXGR7M31cXHc/W2F0XSkoPzogYnVpfDspL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBcIlZpdm9cIl0sIFtUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFxiKHJteFsxMl1cXGR7M30pKD86IGJ1aXw7fFxcKSkvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIFwiUmVhbG1lXCJdLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC9cXGIobWlsZXN0b25lfGRyb2lkKD86WzItNHhdfCAoPzpiaW9uaWN8eDJ8cHJvfHJhenIpKT86PyggNGcpPylcXGJbXFx3IF0rYnVpbGRcXC8vaSxcbiAgICAgICAgL1xcYm1vdCg/Om9yb2xhKT9bLSBdKFxcdyopL2ksXG4gICAgICAgIC8oKD86bW90b1tcXHdcXChcXCkgXSt8eHRcXGR7Myw0fXxuZXh1cyA2KSg/PSBidWl8XFwpKSkvaSxcbiAgICAgIF0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIE1PVE9ST0xBXSwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXGIobXo2MFxcZHx4b29tWzIgXXswLDJ9KSBidWlsZFxcLy9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgTU9UT1JPTEFdLCBbVFlQRSwgVEFCTEVUXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLygoPz1sZyk/W3ZsXWtcXC0/XFxkezN9KSBidWl8IDNcXC5bLVxcdzsgXXsxMH1sZz8tKFswNmN2OV17Myw0fSkvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIExHXSwgW1RZUEUsIFRBQkxFVF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvKGxtKD86LT9mMTAwW252XT98LVtcXHdcXC5dKykoPz0gYnVpfFxcKSl8bmV4dXMgWzQ1XSkvaSxcbiAgICAgICAgL1xcYmxnWy1lO1xcLyBdKygoPyFicm93c2VyfG5ldGNhc3R8YW5kcm9pZCB0dilcXHcrKS9pLFxuICAgICAgICAvXFxibGctPyhbXFxkXFx3XSspIGJ1aS9pLFxuICAgICAgXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgTEddLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8oaWRlYXRhYlstXFx3IF0rKS9pLFxuICAgICAgICAvbGVub3ZvID8oc1s1Nl0wMDBbLVxcd10rfHRhYig/OltcXHcgXSspfHl0Wy1cXGRcXHddezZ9fHRiWy1cXGRcXHddezZ9KS9pLFxuICAgICAgXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgXCJMZW5vdm9cIl0sIFtUWVBFLCBUQUJMRVRdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKD86bWFlbW98bm9raWEpLioobjkwMHxsdW1pYSBcXGQrKS9pLCAvbm9raWFbLV8gXT8oWy1cXHdcXC5dKikvaV0sXG4gICAgICBbW01PREVMLCAvXy9nLCBcIiBcIl0sIFtWRU5ET1IsIFwiTm9raWFcIl0sIFtUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKHBpeGVsIGMpXFxiL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBHT09HTEVdLCBbVFlQRSwgVEFCTEVUXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL2Ryb2lkLis7IChwaXhlbFtcXGRheGwgXXswLDZ9KSg/OiBidWl8XFwpKS9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9kcm9pZC4rIChhP1xcZFswLTJdezJ9c298W2MtZ11cXGR7NH18c29bLWdsXVxcdyt8eHEtYVxcd1s0LTddWzEyXSkoPz0gYnVpfFxcKS4rY2hyb21lXFwvKD8hWzEtNl17MCwxfVxcZFxcLikpL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9zb255IHRhYmxldCBbcHNdL2ksIC9cXGIoPzpzb255KT9zZ3BcXHcrKD86IGJ1aXxcXCkpL2ldLFxuICAgICAgW1tNT0RFTCwgXCJYcGVyaWEgVGFibGV0XCJdLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIFRBQkxFVF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvIChrYjIwMDV8aW4yMFsxMl01fGJlMjBbMTJdWzU5XSlcXGIvaSxcbiAgICAgICAgLyg/Om9uZSk/KD86cGx1cyk/IChhXFxkMFxcZFxcZCkoPzogYnxcXCkpL2ksXG4gICAgICBdLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBcIk9uZVBsdXNcIl0sIFtUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFtcbiAgICAgICAgLyhhbGV4YSl3ZWJtL2ksXG4gICAgICAgIC8oa2ZbYS16XXsyfXdpfGFlb1tjLXJdezJ9KSggYnVpfFxcKSkvaSwgLy8gS2luZGxlIEZpcmUgd2l0aG91dCBTaWxrIC8gRWNobyBTaG93XG4gICAgICAgIC8oa2ZbYS16XSspKCBidWl8XFwpKS4rc2lsa1xcLy9pLFxuICAgICAgXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIFRBQkxFVF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oKD86c2R8a2YpWzAzNDloaWpvcnN0dXddKykoIGJ1aXxcXCkpLitzaWxrXFwvL2ldLFxuICAgICAgW1tNT0RFTCwgLyguKykvZywgXCJGaXJlIFBob25lICQxXCJdLCBbVkVORE9SLCBBTUFaT05dLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyhwbGF5Ym9vayk7Wy1cXHdcXCksOyBdKyhyaW0pL2ldLFxuICAgICAgW01PREVMLCBWRU5ET1IsIFtUWVBFLCBUQUJMRVRdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFxiKCg/OmJiW2EtZl18c3RbaHZdKTEwMC1cXGQpL2ksIC9cXChiYjEwOyAoXFx3KykvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIEJMQUNLQkVSUlldLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyg/OlxcYnxhc3VzXykodHJhbnNmb1twcmltZSBdezQsMTB9IFxcdyt8ZWVlcGN8c2xpZGVyIFxcdyt8bmV4dXMgN3xwYWRmb25lfHAwMFtjal0pL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBBU1VTXSwgW1RZUEUsIFRBQkxFVF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8gKHpbYmVzXTZbMDI3XVswMTJdW2ttXVtsc118emVuZm9uZSBcXGRcXHc/KVxcYi9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgQVNVU10sIFtUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKG5leHVzIDkpL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBcIkhUQ1wiXSwgW1RZUEUsIFRBQkxFVF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvKGh0YylbLTtfIF17MSwyfShbXFx3IF0rKD89XFwpfCBidWkpfFxcdyspL2ksIC8vIEhUQ1xuICAgICAgICAvKHp0ZSlbLSBdKFtcXHcgXSs/KSg/OiBidWl8XFwvfFxcKSkvaSxcbiAgICAgICAgLyhhbGNhdGVsfGdlZWtzcGhvbmV8bmV4aWFufHBhbmFzb25pYyg/ISg/Ojt8XFwuKSl8c29ueSg/IS1icmEpKVstXyBdPyhbLVxcd10qKS9pLFxuICAgICAgXSxcbiAgICAgIFtWRU5ET1IsIFtNT0RFTCwgL18vZywgXCIgXCJdLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL2Ryb2lkLis7IChbYWJdWzEtN10tP1swMTc4YV1cXGRcXGQ/KS9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgXCJBY2VyXCJdLCBbVFlQRSwgVEFCTEVUXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC9kcm9pZC4rOyAobVsxLTVdIG5vdGUpIGJ1aS9pLFxuICAgICAgICAvXFxibXotKFstXFx3XXsyLH0pL2ksXG4gICAgICBdLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBcIk1laXp1XCJdLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8oYmxhY2tiZXJyeXxiZW5xfHBhbG0oPz1cXC0pfHNvbnllcmljc3NvbnxhY2VyfGFzdXN8ZGVsbHxtZWl6dXxtb3Rvcm9sYXxwb2x5dHJvbnxpbmZpbml4fHRlY25vKVstXyBdPyhbLVxcd10qKS9pLFxuICAgICAgICAvLyBCbGFja0JlcnJ5L0JlblEvUGFsbS9Tb255LUVyaWNzc29uL0FjZXIvQXN1cy9EZWxsL01laXp1L01vdG9yb2xhL1BvbHl0cm9uXG4gICAgICAgIC8oaHApIChbXFx3IF0rXFx3KS9pLCAvLyBIUCBpUEFRXG4gICAgICAgIC8oYXN1cyktPyhcXHcrKS9pLCAvLyBBc3VzXG4gICAgICAgIC8obWljcm9zb2Z0KTsgKGx1bWlhW1xcdyBdKykvaSwgLy8gTWljcm9zb2Z0IEx1bWlhXG4gICAgICAgIC8obGVub3ZvKVstXyBdPyhbLVxcd10rKS9pLCAvLyBMZW5vdm9cbiAgICAgICAgLyhqb2xsYSkvaSwgLy8gSm9sbGFcbiAgICAgICAgLyhvcHBvKSA/KFtcXHcgXSspIGJ1aS9pLFxuICAgICAgXSxcbiAgICAgIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8oa29ibylcXHMoZXJlYWRlcnx0b3VjaCkvaSwgLy8gS29ib1xuICAgICAgICAvKGFyY2hvcykgKGdhbWVwYWQyPykvaSwgLy8gQXJjaG9zXG4gICAgICAgIC8oaHApLisodG91Y2hwYWQoPyEuK3RhYmxldCl8dGFibGV0KS9pLCAvLyBIUCBUb3VjaFBhZFxuICAgICAgICAvKGtpbmRsZSlcXC8oW1xcd1xcLl0rKS9pLFxuICAgICAgXSxcbiAgICAgIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgVEFCTEVUXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyhzdXJmYWNlIGR1bykvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIE1JQ1JPU09GVF0sIFtUWVBFLCBUQUJMRVRdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZHJvaWQgW1xcZFxcLl0rOyAoZnBcXGR1PykoPzogYnxcXCkpL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBcIkZhaXJwaG9uZVwiXSwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oc2hpZWxkW1xcdyBdKykgYi9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgXCJOdmlkaWFcIl0sIFtUWVBFLCBUQUJMRVRdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKHNwcmludCkgKFxcdyspL2ldLFxuICAgICAgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKGtpblxcLltvbmV0d117M30pL2ldLFxuICAgICAgW1tNT0RFTCwgL1xcLi9nLCBcIiBcIl0sIFtWRU5ET1IsIE1JQ1JPU09GVF0sIFtUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZHJvaWQuKzsgKFtjNl0rfGV0NVsxNl18bWNbMjM5XVsyM114P3x2YzhbMDNdeD8pXFwpL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBaRUJSQV0sIFtUWVBFLCBUQUJMRVRdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZHJvaWQuKzsgKGVjMzB8cHMyMHx0Y1syLThdXFxkW2t4XSlcXCkvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIFpFQlJBXSwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9zbWFydC10di4rKHNhbXN1bmcpL2ldLFxuICAgICAgW1ZFTkRPUiwgW1RZUEUsIFNNQVJUVFZdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvaGJidHYuK21hcGxlOyhcXGQrKS9pXSxcbiAgICAgIFtbTU9ERUwsIC9eLywgXCJTbWFydFRWXCJdLCBbVkVORE9SLCBTQU1TVU5HXSwgW1RZUEUsIFNNQVJUVFZdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKG51eDsgbmV0Y2FzdC4rc21hcnR0dnxsZyAobmV0Y2FzdFxcLnR2LTIwMVxcZHxhbmRyb2lkIHR2KSkvaV0sXG4gICAgICBbW1ZFTkRPUiwgTEddLCBbVFlQRSwgU01BUlRUVl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oYXBwbGUpID90di9pXSxcbiAgICAgIFtWRU5ET1IsIFtNT0RFTCwgYCR7QVBQTEV9IFRWYF0sIFtUWVBFLCBTTUFSVFRWXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL2Nya2V5L2ldLFxuICAgICAgW1tNT0RFTCwgYCR7Q0hST01FfWNhc3RgXSwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIFNNQVJUVFZdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZHJvaWQuK2FmdChcXHcpKCBidWl8XFwpKS9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIFNNQVJUVFZdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFwoZHR2W1xcKTtdLisoYXF1b3MpL2ksIC8oYXF1b3MtdHZbXFx3IF0rKVxcKS9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgU0hBUlBdLCBbVFlQRSwgU01BUlRUVl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oYnJhdmlhW1xcdyBdKykoIGJ1aXxcXCkpL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIFNNQVJUVFZdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKG1pdHYtXFx3ezV9KSBidWkvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIFhJQU9NSV0sIFtUWVBFLCBTTUFSVFRWXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL0hiYnR2LioodGVjaG5pc2F0KSAoLiopOy9pXSxcbiAgICAgIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgU01BUlRUVl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvXFxiKHJva3UpW1xcZHhdKltcXClcXC9dKCg/OmR2cC0pP1tcXGRcXC5dKikvaSwgLy8gUm9rdVxuICAgICAgICAvaGJidHZcXC9cXGQrXFwuXFxkK1xcLlxcZCsgK1xcKFtcXHdcXCsgXSo7ICooW1xcd1xcZF1bXjtdKik7KFteO10qKS9pLFxuICAgICAgXSxcbiAgICAgIFtbVkVORE9SLCB0cmltXSwgW01PREVMLCB0cmltXSwgW1RZUEUsIFNNQVJUVFZdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFxiKGFuZHJvaWQgdHZ8c21hcnRbLSBdP3R2fG9wZXJhIHR2fHR2OyBydjopXFxiL2ldLFxuICAgICAgW1tUWVBFLCBTTUFSVFRWXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8ob3V5YSkvaSwgLy8gT3V5YVxuICAgICAgICAvKG5pbnRlbmRvKSAoXFx3KykvaSxcbiAgICAgIF0sXG4gICAgICBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIENPTlNPTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZHJvaWQuKzsgKHNoaWVsZCkgYnVpL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBcIk52aWRpYVwiXSwgW1RZUEUsIENPTlNPTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKHBsYXlzdGF0aW9uIFxcdyspL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIENPTlNPTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvXFxiKHhib3goPzogb25lKT8oPyE7IHhib3gpKVtcXCk7IF0vaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIE1JQ1JPU09GVF0sIFtUWVBFLCBDT05TT0xFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLygocGViYmxlKSlhcHAvaV0sXG4gICAgICBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIFdFQVJBQkxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyh3YXRjaCkoPzogP29zWyxcXC9dfFxcZCxcXGRcXC8pW1xcZFxcLl0rL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBBUFBMRV0sIFtUWVBFLCBXRUFSQUJMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9kcm9pZC4rOyAoZ2xhc3MpIFxcZC9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIFdFQVJBQkxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL2Ryb2lkLis7ICh3dDYzPzB7MiwzfSlcXCkvaV0sXG4gICAgICBbTU9ERUwsIFtWRU5ET1IsIFpFQlJBXSwgW1RZUEUsIFdFQVJBQkxFXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyhxdWVzdCggMnwgcHJvKT8pL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBGQUNFQk9PS10sIFtUWVBFLCBXRUFSQUJMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8odGVzbGEpKD86IHF0Y2FyYnJvd3NlcnxcXC9bLVxcd1xcLl0rKS9pXSxcbiAgICAgIFtWRU5ET1IsIFtUWVBFLCBFTUJFRERFRF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oYWVvYmMpXFxiL2ldLFxuICAgICAgW01PREVMLCBbVkVORE9SLCBBTUFaT05dLCBbVFlQRSwgRU1CRURERURdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvZHJvaWQgLis/OyAoW147XSs/KSg/OiBidWl8XFwpIGFwcGxldykuKz8gbW9iaWxlIHNhZmFyaS9pXSxcbiAgICAgIFtNT0RFTCwgW1RZUEUsIE1PQklMRV1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9kcm9pZCAuKz87IChbXjtdKz8pKD86IGJ1aXxcXCkgYXBwbGV3KS4rPyg/ISBtb2JpbGUpIHNhZmFyaS9pXSxcbiAgICAgIFtNT0RFTCwgW1RZUEUsIFRBQkxFVF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXGIoKHRhYmxldHx0YWIpWztcXC9dfGZvY3VzXFwvXFxkKD8hLittb2JpbGUpKS9pXSxcbiAgICAgIFtbVFlQRSwgVEFCTEVUXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyhwaG9uZXxtb2JpbGUoPzpbO1xcL118IFsgXFx3XFwvXFwuXSpzYWZhcmkpfHBkYSg/PS4rd2luZG93cyBjZSkpL2ldLFxuICAgICAgW1tUWVBFLCBNT0JJTEVdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKGFuZHJvaWRbLVxcd1xcLiBdezAsOX0pOy4rYnVpbC9pXSxcbiAgICAgIFtNT0RFTCwgW1ZFTkRPUiwgXCJHZW5lcmljXCJdXSxcbiAgICBdLFxuICBdLFxuICBlbmdpbmU6IFtcbiAgICBbXG4gICAgICBbL3dpbmRvd3MuKyBlZGdlXFwvKFtcXHdcXC5dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIGAke0VER0V9SFRNTGBdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvd2Via2l0XFwvNTM3XFwuMzYuK2Nocm9tZVxcLyg/ITI3KShbXFx3XFwuXSspL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBcIkJsaW5rXCJdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFtcbiAgICAgICAgLyhwcmVzdG8pXFwvKFtcXHdcXC5dKykvaSwgLy8gUHJlc3RvXG4gICAgICAgIC8od2Via2l0fHRyaWRlbnR8bmV0ZnJvbnR8bmV0c3VyZnxhbWF5YXxseW54fHczbXxnb2FubmEpXFwvKFtcXHdcXC5dKykvaSwgLy8gV2ViS2l0L1RyaWRlbnQvTmV0RnJvbnQvTmV0U3VyZi9BbWF5YS9MeW54L3czbS9Hb2FubmFcbiAgICAgICAgL2VraW9oKGZsb3cpXFwvKFtcXHdcXC5dKykvaSwgLy8gRmxvd1xuICAgICAgICAvKGtodG1sfHRhc21hbnxsaW5rcylbXFwvIF1cXCg/KFtcXHdcXC5dKykvaSwgLy8gS0hUTUwvVGFzbWFuL0xpbmtzXG4gICAgICAgIC8oaWNhYilbXFwvIF0oWzIzXVxcLltcXGRcXC5dKykvaSwgLy8gaUNhYlxuICAgICAgICAvXFxiKGxpYndlYikvaSxcbiAgICAgIF0sXG4gICAgICBbTkFNRSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL3J2XFw6KFtcXHdcXC5dezEsOX0pXFxiLisoZ2Vja28pL2ldLFxuICAgICAgW1ZFUlNJT04sIE5BTUVdLFxuICAgIF0sXG4gIF0sXG4gIG9zOiBbXG4gICAgW1xuICAgICAgWy9taWNyb3NvZnQgKHdpbmRvd3MpICh2aXN0YXx4cCkvaV0sXG4gICAgICBbTkFNRSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8od2luZG93cykgbnQgNlxcLjI7IChhcm0pL2ksIC8vIFdpbmRvd3MgUlRcbiAgICAgICAgLyh3aW5kb3dzICg/OnBob25lKD86IG9zKT98bW9iaWxlKSlbXFwvIF0/KFtcXGRcXC5cXHcgXSopL2ksIC8vIFdpbmRvd3MgUGhvbmVcbiAgICAgICAgLyh3aW5kb3dzKVtcXC8gXT8oW250Y2VcXGRcXC4gXStcXHcpKD8hLit4Ym94KS9pLFxuICAgICAgXSxcbiAgICAgIFtOQU1FLCBbVkVSU0lPTiwgbWFwV2luVmVyXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyh3aW4oPz0zfDl8bil8d2luIDl4ICkoW250XFxkXFwuXSspL2ldLFxuICAgICAgW1tOQU1FLCBXSU5ET1dTXSwgW1ZFUlNJT04sIG1hcFdpblZlcl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgW1xuICAgICAgICAvaXBbaG9uZWFkXXsyLDR9XFxiKD86LipvcyAoW1xcd10rKSBsaWtlIG1hY3w7IG9wZXJhKS9pLCAvLyBpT1NcbiAgICAgICAgLyg/OmlvcztmYnN2XFwvfGlwaG9uZS4raW9zW1xcLyBdKShbXFxkXFwuXSspL2ksXG4gICAgICAgIC9jZm5ldHdvcmtcXC8uK2Rhcndpbi9pLFxuICAgICAgXSxcbiAgICAgIFtbVkVSU0lPTiwgL18vZywgXCIuXCJdLCBbTkFNRSwgXCJpT1NcIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8obWFjIG9zIHgpID8oW1xcd1xcLiBdKikvaSwgLyhtYWNpbnRvc2h8bWFjX3Bvd2VycGNcXGIpKD8hLitoYWlrdSkvaV0sXG4gICAgICBbW05BTUUsIFwibWFjT1NcIl0sIFtWRVJTSU9OLCAvXy9nLCBcIi5cIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9kcm9pZCAoW1xcd1xcLl0rKVxcYi4rKGFuZHJvaWRbLSBdeDg2fGhhcm1vbnlvcykvaV0sXG4gICAgICBbVkVSU0lPTiwgTkFNRV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8oYW5kcm9pZHx3ZWJvc3xxbnh8YmFkYXxyaW0gdGFibGV0IG9zfG1hZW1vfG1lZWdvfHNhaWxmaXNoKVstXFwvIF0/KFtcXHdcXC5dKikvaSxcbiAgICAgICAgLyhibGFja2JlcnJ5KVxcdypcXC8oW1xcd1xcLl0qKS9pLCAvLyBCbGFja2JlcnJ5XG4gICAgICAgIC8odGl6ZW58a2Fpb3MpW1xcLyBdKFtcXHdcXC5dKykvaSwgLy8gVGl6ZW4vS2FpT1NcbiAgICAgICAgL1xcKChzZXJpZXM0MCk7L2ksXG4gICAgICBdLFxuICAgICAgW05BTUUsIFZFUlNJT05dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9cXChiYigxMCk7L2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBCTEFDS0JFUlJZXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbLyg/OnN5bWJpYW4gP29zfHN5bWJvc3xzNjAoPz07KXxzZXJpZXM2MClbLVxcLyBdPyhbXFx3XFwuXSopL2ldLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBcIlN5bWJpYW5cIl1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy9tb3ppbGxhXFwvW1xcZFxcLl0rIFxcKCg/Om1vYmlsZXx0YWJsZXR8dHZ8bW9iaWxlOyBbXFx3IF0rKTsgcnY6LisgZ2Vja29cXC8oW1xcd1xcLl0rKS9pXSxcbiAgICAgIFtWRVJTSU9OLCBbTkFNRSwgYCR7RklSRUZPWH0gT1NgXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC93ZWIwczsuK3J0KHR2KS9pLFxuICAgICAgICAvXFxiKD86aHApP3dvcyg/OmJyb3dzZXIpP1xcLyhbXFx3XFwuXSspL2ksXG4gICAgICBdLFxuICAgICAgW1ZFUlNJT04sIFtOQU1FLCBcIndlYk9TXCJdXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvd2F0Y2goPzogP29zWyxcXC9dfFxcZCxcXGRcXC8pKFtcXGRcXC5dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIFwid2F0Y2hPU1wiXV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbL2Nya2V5XFwvKFtcXGRcXC5dKykvaV0sXG4gICAgICBbVkVSU0lPTiwgW05BTUUsIGAke0NIUk9NRX1jYXN0YF1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgWy8oY3JvcykgW1xcd10rKD86XFwpfCAoW1xcd1xcLl0rKVxcYikvaV0sXG4gICAgICBbW05BTUUsIFwiQ2hyb21lIE9TXCJdLCBWRVJTSU9OXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFtcbiAgICAgICAgL3BhbmFzb25pYzsodmllcmEpL2ksIC8vIFBhbmFzb25pYyBWaWVyYVxuICAgICAgICAvKG5ldHJhbmdlKW1taC9pLCAvLyBOZXRyYW5nZVxuICAgICAgICAvKG5ldHR2KVxcLyhcXGQrXFwuW1xcd1xcLl0rKS9pLCAvLyBOZXRUVlxuXG4gICAgICAgIC8vIENvbnNvbGVcbiAgICAgICAgLyhuaW50ZW5kb3xwbGF5c3RhdGlvbikgKFxcdyspL2ksIC8vIE5pbnRlbmRvL1BsYXlzdGF0aW9uXG4gICAgICAgIC8oeGJveCk7ICt4Ym94IChbXlxcKTtdKykvaSwgLy8gTWljcm9zb2Z0IFhib3ggKDM2MCwgT25lLCBYLCBTLCBTZXJpZXMgWCwgU2VyaWVzIFMpXG5cbiAgICAgICAgLy8gT3RoZXJcbiAgICAgICAgL1xcYihqb2xpfHBhbG0pXFxiID8oPzpvcyk/XFwvPyhbXFx3XFwuXSopL2ksIC8vIEpvbGkvUGFsbVxuICAgICAgICAvKG1pbnQpW1xcL1xcKFxcKSBdPyhcXHcqKS9pLCAvLyBNaW50XG4gICAgICAgIC8obWFnZWlhfHZlY3RvcmxpbnV4KVs7IF0vaSwgLy8gTWFnZWlhL1ZlY3RvckxpbnV4XG4gICAgICAgIC8oW2t4bG5dP3VidW50dXxkZWJpYW58c3VzZXxvcGVuc3VzZXxnZW50b298YXJjaCg/PSBsaW51eCl8c2xhY2t3YXJlfGZlZG9yYXxtYW5kcml2YXxjZW50b3N8cGNsaW51eG9zfHJlZCA/aGF0fHplbndhbGt8bGlucHVzfHJhc3BiaWFufHBsYW4gOXxtaW5peHxyaXNjIG9zfGNvbnRpa2l8ZGVlcGlufG1hbmphcm98ZWxlbWVudGFyeSBvc3xzYWJheW9ufGxpbnNwaXJlKSg/OiBnbnVcXC9saW51eCk/KD86IGVudGVycHJpc2UpPyg/OlstIF1saW51eCk/KD86LWdudSk/Wy1cXC8gXT8oPyFjaHJvbXxwYWNrYWdlKShbLVxcd1xcLl0qKS9pLFxuICAgICAgICAvLyBVYnVudHUvRGViaWFuL1NVU0UvR2VudG9vL0FyY2gvU2xhY2t3YXJlL0ZlZG9yYS9NYW5kcml2YS9DZW50T1MvUENMaW51eE9TL1JlZEhhdC9aZW53YWxrL0xpbnB1cy9SYXNwYmlhbi9QbGFuOS9NaW5peC9SSVNDT1MvQ29udGlraS9EZWVwaW4vTWFuamFyby9lbGVtZW50YXJ5L1NhYmF5b24vTGluc3BpcmVcbiAgICAgICAgLyhodXJkfGxpbnV4KSA/KFtcXHdcXC5dKikvaSwgLy8gSHVyZC9MaW51eFxuICAgICAgICAvKGdudSkgPyhbXFx3XFwuXSopL2ksIC8vIEdOVVxuICAgICAgICAvXFxiKFstZnJlbnRvcGNnaHNdezAsNX1ic2R8ZHJhZ29uZmx5KVtcXC8gXT8oPyFhbWR8W2l4MzQ2XXsxLDJ9ODYpKFtcXHdcXC5dKikvaSwgLy8gRnJlZUJTRC9OZXRCU0QvT3BlbkJTRC9QQy1CU0QvR2hvc3RCU0QvRHJhZ29uRmx5XG4gICAgICAgIC8oaGFpa3UpIChcXHcrKS9pLFxuICAgICAgXSxcbiAgICAgIFtOQU1FLCBWRVJTSU9OXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsvKHN1bm9zKSA/KFtcXHdcXC5cXGRdKikvaV0sXG4gICAgICBbW05BTUUsIFwiU29sYXJpc1wiXSwgVkVSU0lPTl0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbXG4gICAgICAgIC8oKD86b3Blbik/c29sYXJpcylbLVxcLyBdPyhbXFx3XFwuXSopL2ksIC8vIFNvbGFyaXNcbiAgICAgICAgLyhhaXgpICgoXFxkKSg/PVxcLnxcXCl8IClbXFx3XFwuXSkqL2ksIC8vIEFJWFxuICAgICAgICAvXFxiKGJlb3N8b3NcXC8yfGFtaWdhb3N8bW9ycGhvc3xvcGVudm1zfGZ1Y2hzaWF8aHAtdXh8c2VyZW5pdHlvcykvaSwgLy8gQmVPUy9PUzIvQW1pZ2FPUy9Nb3JwaE9TL09wZW5WTVMvRnVjaHNpYS9IUC1VWC9TZXJlbml0eU9TXG4gICAgICAgIC8odW5peCkgPyhbXFx3XFwuXSopL2ksXG4gICAgICBdLFxuICAgICAgW05BTUUsIFZFUlNJT05dLFxuICAgIF0sXG4gIF0sXG59O1xuLyoqXG4gKiBBIHJlcHJlc2VudGF0aW9uIG9mIHVzZXIgYWdlbnQgc3RyaW5nLCB3aGljaCBjYW4gYmUgdXNlZCB0byBkZXRlcm1pbmVcbiAqIGVudmlyb25tZW50YWwgaW5mb3JtYXRpb24gcmVwcmVzZW50ZWQgYnkgdGhlIHN0cmluZy4gQWxsIHByb3BlcnRpZXMgYXJlXG4gKiBkZXRlcm1pbmVkIGxhemlseS5cbiAqXG4gKiBAZXhhbXBsZSBVc2FnZVxuICogYGBgdHMgbm8tZXZhbFxuICogaW1wb3J0IHsgVXNlckFnZW50IH0gZnJvbSBcIkBzdGQvaHR0cC91c2VyLWFnZW50XCI7XG4gKlxuICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gKiAgIGNvbnN0IHVzZXJBZ2VudCA9IG5ldyBVc2VyQWdlbnQocmVxLmhlYWRlcnMuZ2V0KFwidXNlci1hZ2VudFwiKSA/PyBcIlwiKTtcbiAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShgSGVsbG8sICR7dXNlckFnZW50LmJyb3dzZXIubmFtZX1cbiAqICAgICBvbiAke3VzZXJBZ2VudC5vcy5uYW1lfSAke3VzZXJBZ2VudC5vcy52ZXJzaW9ufSFgKTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBVc2VyQWdlbnQge1xuICAjYnJvd3Nlcj86IEJyb3dzZXI7XG4gICNjcHU/OiBDcHU7XG4gICNkZXZpY2U/OiBEZXZpY2U7XG4gICNlbmdpbmU/OiBFbmdpbmU7XG4gICNvcz86IE9zO1xuICAjdWE6IHN0cmluZztcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBpbnN0YW5jZS5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBVc2VyQWdlbnQgfSBmcm9tIFwiQHN0ZC9odHRwL3VzZXItYWdlbnRcIjtcbiAgICpcbiAgICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gICAqICAgY29uc3QgdXNlckFnZW50ID0gbmV3IFVzZXJBZ2VudChyZXEuaGVhZGVycy5nZXQoXCJ1c2VyLWFnZW50XCIpID8/IFwiXCIpO1xuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEhlbGxvLCAke3VzZXJBZ2VudC5icm93c2VyLm5hbWV9XG4gICAqICAgICBvbiAke3VzZXJBZ2VudC5vcy5uYW1lfSAke3VzZXJBZ2VudC5vcy52ZXJzaW9ufSFgKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gdWEgVGhlIHVzZXIgYWdlbnQgc3RyaW5nIHRvIGNvbnN0cnVjdCB0aGlzIGluc3RhbmNlIHdpdGguXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih1YTogc3RyaW5nIHwgbnVsbCkge1xuICAgIHRoaXMuI3VhID0gdWEgPz8gXCJcIjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbmFtZSBhbmQgdmVyc2lvbiBvZiB0aGUgYnJvd3NlciBleHRyYWN0ZWQgZnJvbSB0aGUgdXNlciBhZ2VudFxuICAgKiBzdHJpbmcuXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWV2YWxcbiAgICogaW1wb3J0IHsgVXNlckFnZW50IH0gZnJvbSBcIkBzdGQvaHR0cC91c2VyLWFnZW50XCI7XG4gICAqXG4gICAqIERlbm8uc2VydmUoKHJlcSkgPT4ge1xuICAgKiAgIGNvbnN0IHVzZXJBZ2VudCA9IG5ldyBVc2VyQWdlbnQocmVxLmhlYWRlcnMuZ2V0KFwidXNlci1hZ2VudFwiKSA/PyBcIlwiKTtcbiAgICogICByZXR1cm4gbmV3IFJlc3BvbnNlKGBIZWxsbywgJHt1c2VyQWdlbnQuYnJvd3Nlci5uYW1lfSFgKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdXNlciBhZ2VudCdzIGJyb3dzZXIuXG4gICAqL1xuICBnZXQgYnJvd3NlcigpOiBCcm93c2VyIHtcbiAgICBpZiAoIXRoaXMuI2Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuI2Jyb3dzZXIgPSB7IG5hbWU6IHVuZGVmaW5lZCwgdmVyc2lvbjogdW5kZWZpbmVkLCBtYWpvcjogdW5kZWZpbmVkIH07XG4gICAgICBtYXBwZXIodGhpcy4jYnJvd3NlciwgdGhpcy4jdWEsIG1hdGNoZXJzLmJyb3dzZXIpO1xuICAgICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICAgICh0aGlzLiNicm93c2VyIGFzIGFueSkubWFqb3IgPSBtYWpvcml6ZSh0aGlzLiNicm93c2VyLnZlcnNpb24pO1xuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzLiNicm93c2VyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuI2Jyb3dzZXI7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGFyY2hpdGVjdHVyZSBvZiB0aGUgQ1BVIGV4dHJhY3RlZCBmcm9tIHRoZSB1c2VyIGFnZW50IHN0cmluZy5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBVc2VyQWdlbnQgfSBmcm9tIFwiQHN0ZC9odHRwL3VzZXItYWdlbnRcIjtcbiAgICpcbiAgICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gICAqICAgY29uc3QgdXNlckFnZW50ID0gbmV3IFVzZXJBZ2VudChyZXEuaGVhZGVycy5nZXQoXCJ1c2VyLWFnZW50XCIpID8/IFwiXCIpO1xuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEhlbGxvLCAke3VzZXJBZ2VudC5jcHUuYXJjaGl0ZWN0dXJlfSFgKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdXNlciBhZ2VudCdzIENQVS5cbiAgICovXG4gIGdldCBjcHUoKTogQ3B1IHtcbiAgICBpZiAoIXRoaXMuI2NwdSkge1xuICAgICAgdGhpcy4jY3B1ID0geyBhcmNoaXRlY3R1cmU6IHVuZGVmaW5lZCB9O1xuICAgICAgbWFwcGVyKHRoaXMuI2NwdSwgdGhpcy4jdWEsIG1hdGNoZXJzLmNwdSk7XG4gICAgICBPYmplY3QuZnJlZXplKHRoaXMuI2NwdSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiNjcHU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1vZGVsLCB0eXBlLCBhbmQgdmVuZG9yIG9mIGEgZGV2aWNlIGlmIHByZXNlbnQgaW4gYSB1c2VyIGFnZW50XG4gICAqIHN0cmluZy5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBVc2VyQWdlbnQgfSBmcm9tIFwiQHN0ZC9odHRwL3VzZXItYWdlbnRcIjtcbiAgICpcbiAgICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gICAqICAgY29uc3QgdXNlckFnZW50ID0gbmV3IFVzZXJBZ2VudChyZXEuaGVhZGVycy5nZXQoXCJ1c2VyLWFnZW50XCIpID8/IFwiXCIpO1xuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEhlbGxvLCAke3VzZXJBZ2VudC5kZXZpY2UubW9kZWx9IWApO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSB1c2VyIGFnZW50J3MgZGV2aWNlLlxuICAgKi9cbiAgZ2V0IGRldmljZSgpOiBEZXZpY2Uge1xuICAgIGlmICghdGhpcy4jZGV2aWNlKSB7XG4gICAgICB0aGlzLiNkZXZpY2UgPSB7IG1vZGVsOiB1bmRlZmluZWQsIHR5cGU6IHVuZGVmaW5lZCwgdmVuZG9yOiB1bmRlZmluZWQgfTtcbiAgICAgIG1hcHBlcih0aGlzLiNkZXZpY2UsIHRoaXMuI3VhLCBtYXRjaGVycy5kZXZpY2UpO1xuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzLiNkZXZpY2UpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jZGV2aWNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBuYW1lIGFuZCB2ZXJzaW9uIG9mIHRoZSBicm93c2VyIGVuZ2luZSBpbiBhIHVzZXIgYWdlbnQgc3RyaW5nLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0cyBuby1ldmFsXG4gICAqIGltcG9ydCB7IFVzZXJBZ2VudCB9IGZyb20gXCJAc3RkL2h0dHAvdXNlci1hZ2VudFwiO1xuICAgKlxuICAgKiBEZW5vLnNlcnZlKChyZXEpID0+IHtcbiAgICogICBjb25zdCB1c2VyQWdlbnQgPSBuZXcgVXNlckFnZW50KHJlcS5oZWFkZXJzLmdldChcInVzZXItYWdlbnRcIikgPz8gXCJcIik7XG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShgSGVsbG8sICR7dXNlckFnZW50LmVuZ2luZS5uYW1lfSFgKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdXNlciBhZ2VudCdzIGJyb3dzZXIgZW5naW5lLlxuICAgKi9cbiAgZ2V0IGVuZ2luZSgpOiBFbmdpbmUge1xuICAgIGlmICghdGhpcy4jZW5naW5lKSB7XG4gICAgICB0aGlzLiNlbmdpbmUgPSB7IG5hbWU6IHVuZGVmaW5lZCwgdmVyc2lvbjogdW5kZWZpbmVkIH07XG4gICAgICBtYXBwZXIodGhpcy4jZW5naW5lLCB0aGlzLiN1YSwgbWF0Y2hlcnMuZW5naW5lKTtcbiAgICAgIE9iamVjdC5mcmVlemUodGhpcy4jZW5naW5lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuI2VuZ2luZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbmFtZSBhbmQgdmVyc2lvbiBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbSBpbiBhIHVzZXIgYWdlbnQgc3RyaW5nLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0cyBuby1ldmFsXG4gICAqIGltcG9ydCB7IFVzZXJBZ2VudCB9IGZyb20gXCJAc3RkL2h0dHAvdXNlci1hZ2VudFwiO1xuICAgKlxuICAgKiBEZW5vLnNlcnZlKChyZXEpID0+IHtcbiAgICogICBjb25zdCB1c2VyQWdlbnQgPSBuZXcgVXNlckFnZW50KHJlcS5oZWFkZXJzLmdldChcInVzZXItYWdlbnRcIikgPz8gXCJcIik7XG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShgSGVsbG8sICR7dXNlckFnZW50Lm9zLm5hbWV9IWApO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSB1c2VyIGFnZW50J3MgT1MuXG4gICAqL1xuICBnZXQgb3MoKTogT3Mge1xuICAgIGlmICghdGhpcy4jb3MpIHtcbiAgICAgIHRoaXMuI29zID0geyBuYW1lOiB1bmRlZmluZWQsIHZlcnNpb246IHVuZGVmaW5lZCB9O1xuICAgICAgbWFwcGVyKHRoaXMuI29zLCB0aGlzLiN1YSwgbWF0Y2hlcnMub3MpO1xuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzLiNvcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiNvcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHJlYWQgb25seSB2ZXJzaW9uIG9mIHRoZSB1c2VyIGFnZW50IHN0cmluZyByZWxhdGVkIHRvIHRoZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBVc2VyQWdlbnQgfSBmcm9tIFwiQHN0ZC9odHRwL3VzZXItYWdlbnRcIjtcbiAgICpcbiAgICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gICAqICAgY29uc3QgdXNlckFnZW50ID0gbmV3IFVzZXJBZ2VudChyZXEuaGVhZGVycy5nZXQoXCJ1c2VyLWFnZW50XCIpID8/IFwiXCIpO1xuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEhlbGxvLCAke3VzZXJBZ2VudC51YX0hYCk7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgVGhlIHVzZXIgYWdlbnQgc3RyaW5nLlxuICAgKi9cbiAgZ2V0IHVhKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI3VhO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBjdXJyZW50IGluc3RhbmNlIHRvIGEgSlNPTiByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBVc2VyQWdlbnQgfSBmcm9tIFwiQHN0ZC9odHRwL3VzZXItYWdlbnRcIjtcbiAgICpcbiAgICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gICAqICAgY29uc3QgdXNlckFnZW50ID0gbmV3IFVzZXJBZ2VudChyZXEuaGVhZGVycy5nZXQoXCJ1c2VyLWFnZW50XCIpID8/IFwiXCIpO1xuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEhlbGxvLCAke0pTT04uc3RyaW5naWZ5KHVzZXJBZ2VudC50b0pTT04oKSl9IWApO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIEEgSlNPTiByZXByZXNlbnRhdGlvbiBvbiB0aGlzIHVzZXIgYWdlbnQgaW5zdGFuY2UuXG4gICAqL1xuICB0b0pTT04oKToge1xuICAgIGJyb3dzZXI6IEJyb3dzZXI7XG4gICAgY3B1OiBDcHU7XG4gICAgZGV2aWNlOiBEZXZpY2U7XG4gICAgZW5naW5lOiBFbmdpbmU7XG4gICAgb3M6IE9zO1xuICAgIHVhOiBzdHJpbmc7XG4gIH0ge1xuICAgIGNvbnN0IHsgYnJvd3NlciwgY3B1LCBkZXZpY2UsIGVuZ2luZSwgb3MsIHVhIH0gPSB0aGlzO1xuICAgIHJldHVybiB7IGJyb3dzZXIsIGNwdSwgZGV2aWNlLCBlbmdpbmUsIG9zLCB1YSB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBjdXJyZW50IGluc3RhbmNlIHRvIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAZXhhbXBsZSBVc2FnZVxuICAgKiBgYGB0cyBuby1ldmFsXG4gICAqIGltcG9ydCB7IFVzZXJBZ2VudCB9IGZyb20gXCJAc3RkL2h0dHAvdXNlci1hZ2VudFwiO1xuICAgKlxuICAgKiBEZW5vLnNlcnZlKChyZXEpID0+IHtcbiAgICogICBjb25zdCB1c2VyQWdlbnQgPSBuZXcgVXNlckFnZW50KHJlcS5oZWFkZXJzLmdldChcInVzZXItYWdlbnRcIikgPz8gXCJcIik7XG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShgSGVsbG8sICR7dXNlckFnZW50LnRvU3RyaW5nKCl9IWApO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB1c2VyIGFnZW50IHN0cmluZy5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI3VhO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1c3RvbSBvdXRwdXQgZm9yIHtAbGlua2NvZGUgRGVuby5pbnNwZWN0fS5cbiAgICpcbiAgICogQGV4YW1wbGUgVXNhZ2VcbiAgICogYGBgdHMgbm8tZXZhbFxuICAgKiBpbXBvcnQgeyBVc2VyQWdlbnQgfSBmcm9tIFwiQHN0ZC9odHRwL3VzZXItYWdlbnRcIjtcbiAgICpcbiAgICogRGVuby5zZXJ2ZSgocmVxKSA9PiB7XG4gICAqICAgY29uc3QgdXNlckFnZW50ID0gbmV3IFVzZXJBZ2VudChyZXEuaGVhZGVycy5nZXQoXCJ1c2VyLWFnZW50XCIpID8/IFwiXCIpO1xuICAgKiAgIERlbm8uaW5zcGVjdCh1c2VyQWdlbnQpO1xuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEhlbGxvLCAke3VzZXJBZ2VudC51YX0hYCk7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIGluc3BlY3QgaW50ZXJuYWwgaW5zcGVjdCBmdW5jdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGN1c3RvbSB2YWx1ZSB0byBpbnNwZWN0LlxuICAgKi9cbiAgW1N5bWJvbC5mb3IoXCJEZW5vLmN1c3RvbUluc3BlY3RcIildKFxuICAgIGluc3BlY3Q6ICh2YWx1ZTogdW5rbm93bikgPT4gc3RyaW5nLFxuICApOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgYnJvd3NlciwgY3B1LCBkZXZpY2UsIGVuZ2luZSwgb3MsIHVhIH0gPSB0aGlzO1xuICAgIHJldHVybiBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9ICR7XG4gICAgICBpbnNwZWN0KHsgYnJvd3NlciwgY3B1LCBkZXZpY2UsIGVuZ2luZSwgb3MsIHVhIH0pXG4gICAgfWA7XG4gIH1cblxuICAvKipcbiAgICogQ3VzdG9tIG91dHB1dCBmb3IgTm9kZSdzXG4gICAqIHtAbGlua2NvZGUgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS91dGlsLmh0bWwjdXRpbGluc3BlY3RvYmplY3Qtb3B0aW9ucyB8IHV0aWwuaW5zcGVjdH0uXG4gICAqXG4gICAqIEBleGFtcGxlIFVzYWdlXG4gICAqIGBgYHRzIG5vLWV2YWxcbiAgICogaW1wb3J0IHsgVXNlckFnZW50IH0gZnJvbSBcIkBzdGQvaHR0cC91c2VyLWFnZW50XCI7XG4gICAqIGltcG9ydCB7IGluc3BlY3QgfSBmcm9tIFwibm9kZTp1dGlsXCI7XG4gICAqXG4gICAqIERlbm8uc2VydmUoKHJlcSkgPT4ge1xuICAgKiAgIGNvbnN0IHVzZXJBZ2VudCA9IG5ldyBVc2VyQWdlbnQocmVxLmhlYWRlcnMuZ2V0KFwidXNlci1hZ2VudFwiKSA/PyBcIlwiKTtcbiAgICogICBpbnNwZWN0KHVzZXJBZ2VudCk7XG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShgSGVsbG8sICR7dXNlckFnZW50LnVhfSFgKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gZGVwdGggaW50ZXJuYWwgaW5zcGVjdCBkZXB0aC5cbiAgICogQHBhcmFtIG9wdGlvbnMgaW50ZXJuYWwgaW5zcGVjdCBvcHRpb24uXG4gICAqIEBwYXJhbSBpbnNwZWN0IGludGVybmFsIGluc3BlY3QgZnVuY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBjdXN0b20gdmFsdWUgdG8gaW5zcGVjdC5cbiAgICovXG4gIFtTeW1ib2wuZm9yKFwibm9kZWpzLnV0aWwuaW5zcGVjdC5jdXN0b21cIildKFxuICAgIGRlcHRoOiBudW1iZXIsXG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICBvcHRpb25zOiBhbnksXG4gICAgaW5zcGVjdDogKHZhbHVlOiB1bmtub3duLCBvcHRpb25zPzogdW5rbm93bikgPT4gc3RyaW5nLFxuICApOiBzdHJpbmcge1xuICAgIGlmIChkZXB0aCA8IDApIHtcbiAgICAgIHJldHVybiBvcHRpb25zLnN0eWxpemUoYFske3RoaXMuY29uc3RydWN0b3IubmFtZX1dYCwgXCJzcGVjaWFsXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld09wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG4gICAgICBkZXB0aDogb3B0aW9ucy5kZXB0aCA9PT0gbnVsbCA/IG51bGwgOiBvcHRpb25zLmRlcHRoIC0gMSxcbiAgICB9KTtcbiAgICBjb25zdCB7IGJyb3dzZXIsIGNwdSwgZGV2aWNlLCBlbmdpbmUsIG9zLCB1YSB9ID0gdGhpcztcbiAgICByZXR1cm4gYCR7b3B0aW9ucy5zdHlsaXplKHRoaXMuY29uc3RydWN0b3IubmFtZSwgXCJzcGVjaWFsXCIpfSAke1xuICAgICAgaW5zcGVjdChcbiAgICAgICAgeyBicm93c2VyLCBjcHUsIGRldmljZSwgZW5naW5lLCBvcywgdWEgfSxcbiAgICAgICAgbmV3T3B0aW9ucyxcbiAgICAgIClcbiAgICB9YDtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsbURBQW1EO0FBQ25ELHlFQUF5RTtBQUN6RSwwREFBMEQ7QUFFMUQ7Ozs7Q0FJQztBQUVELE1BQU0sZUFBZTtBQUNyQixNQUFNLFFBQVE7QUFDZCxNQUFNLE9BQU87QUFDYixNQUFNLE9BQU87QUFDYixNQUFNLFNBQVM7QUFDZixNQUFNLFVBQVU7QUFDaEIsTUFBTSxRQUFRO0FBRWQsTUFBTSxVQUFVO0FBQ2hCLE1BQU0sV0FBVztBQUNqQixNQUFNLFNBQVM7QUFDZixNQUFNLFNBQVM7QUFDZixNQUFNLFVBQVU7QUFDaEIsTUFBTSxXQUFXO0FBRWpCLE1BQU0sZ0JBQWdCO0FBQ3RCLE1BQU0saUJBQWlCO0FBRXZCLE1BQU0sU0FBUztBQUNmLE1BQU0sUUFBUTtBQUNkLE1BQU0sT0FBTztBQUNiLE1BQU0sYUFBYTtBQUNuQixNQUFNLFNBQVM7QUFDZixNQUFNLE9BQU87QUFDYixNQUFNLFdBQVc7QUFDakIsTUFBTSxVQUFVO0FBQ2hCLE1BQU0sU0FBUztBQUNmLE1BQU0sU0FBUztBQUNmLE1BQU0sS0FBSztBQUNYLE1BQU0sWUFBWTtBQUNsQixNQUFNLFdBQVc7QUFDakIsTUFBTSxRQUFRO0FBQ2QsTUFBTSxVQUFVO0FBQ2hCLE1BQU0sUUFBUTtBQUNkLE1BQU0sT0FBTztBQUNiLE1BQU0sVUFBVTtBQUNoQixNQUFNLFNBQVM7QUFDZixNQUFNLFFBQVE7QUFzRWQsU0FBUyxTQUFTLEdBQVc7RUFDM0IsT0FBTyxJQUFJLFdBQVc7QUFDeEI7QUFFQSxTQUFTLFNBQVMsR0FBdUI7RUFDdkMsT0FBTyxNQUFNLElBQUksT0FBTyxDQUFDLFlBQVksT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRztBQUM5RDtBQUVBLFNBQVMsS0FBSyxHQUFXO0VBQ3ZCLE9BQU8sSUFBSSxTQUFTO0FBQ3RCO0FBRUE7OEVBQzhFLEdBQzlFLE1BQU0sb0JBQW9CLElBQUksSUFBK0I7RUFDM0Q7SUFBQztJQUFNO0dBQU87RUFDZDtJQUFDO0lBQVc7R0FBUztFQUNyQjtJQUFDO0lBQVU7R0FBUTtFQUNuQjtJQUFDO0lBQVE7R0FBUztFQUNsQjtJQUFDO0lBQU07TUFBQztNQUFVO0tBQVM7R0FBQztFQUM1QjtJQUFDO0lBQVM7R0FBUztFQUNuQjtJQUFDO0lBQUs7R0FBUztFQUNmO0lBQUM7SUFBSztHQUFTO0VBQ2Y7SUFBQztJQUFPO0dBQVM7RUFDakI7SUFBQztJQUFNO01BQUM7TUFBVTtLQUFVO0dBQUM7RUFDN0I7SUFBQztJQUFNO0dBQU07Q0FDZDtBQUVELFNBQVMsSUFBSSxJQUF1QixFQUFFLElBQVk7RUFDaEQsSUFBSSxNQUFNLE9BQU8sQ0FBQyxPQUFPO0lBQ3ZCLEtBQUssTUFBTSxNQUFNLEtBQU07TUFDckIsSUFBSSxTQUFTLFFBQVEsU0FBUyxPQUFPO1FBQ25DLE9BQU87TUFDVDtJQUNGO0lBQ0EsT0FBTztFQUNUO0VBQ0EsT0FBTyxTQUFTLE1BQU0sT0FBTyxDQUFDLFNBQVMsV0FBVyxDQUFDO0FBQ3JEO0FBRUEsU0FBUyxVQUFVLEdBQVc7RUFDNUIsS0FBSyxNQUFNLENBQUMsS0FBSyxNQUFNLElBQUksa0JBQW1CO0lBQzVDLElBQUksTUFBTSxPQUFPLENBQUMsUUFBUTtNQUN4QixLQUFLLE1BQU0sS0FBSyxNQUFPO1FBQ3JCLElBQUksSUFBSSxHQUFHLE1BQU07VUFDZixPQUFPO1FBQ1Q7TUFDRjtJQUNGLE9BQU8sSUFBSSxJQUFJLE9BQU8sTUFBTTtNQUMxQixPQUFPO0lBQ1Q7RUFDRjtFQUNBLE9BQU8sT0FBTztBQUNoQjtBQUVBLFNBQVMsT0FDUCxtQ0FBbUM7QUFDbkMsTUFBVyxFQUNYLEVBQVUsRUFDVixNQUF1QjtFQUV2QixJQUFJLFVBQWtDO0VBQ3RDLEtBQUssTUFBTSxDQUFDLFVBQVUsV0FBVyxJQUFJLE9BQVE7SUFDM0MsSUFBSSxJQUFJO0lBQ1IsSUFBSSxJQUFJO0lBQ1IsTUFBTyxJQUFJLFNBQVMsTUFBTSxJQUFJLENBQUMsUUFBUztNQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtRQUNoQjtNQUNGO01BQ0EsVUFBVSxRQUFRLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQztNQUU5QixJQUFJLFNBQVM7UUFDWCxLQUFLLE1BQU0sYUFBYSxXQUFZO1VBQ2xDLE1BQU0sUUFBUSxPQUFPLENBQUMsRUFBRSxFQUFFO1VBQzFCLElBQUksTUFBTSxPQUFPLENBQUMsWUFBWTtZQUM1QixJQUFJLFVBQVUsTUFBTSxLQUFLLEdBQUc7Y0FDMUIsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHO2NBQ3RCLElBQUksT0FBTyxVQUFVLFlBQVk7Z0JBQy9CLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQ3ZCLFFBQ0E7Y0FFSixPQUFPO2dCQUNMLE1BQU0sQ0FBQyxLQUFLLEdBQUc7Y0FDakI7WUFDRixPQUFPLElBQUksVUFBVSxNQUFNLEtBQUssR0FBRztjQUNqQyxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sR0FBRztjQUMxQixNQUFNLENBQUMsS0FBSyxHQUFHLFFBQVEsTUFBTSxPQUFPLENBQUMsSUFBSSxTQUFTO1lBQ3BELE9BQU87Y0FDTCxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sR0FBRyxHQUFHO2NBQzlCLElBQUksQ0FBQyxJQUFJO2dCQUNQLE1BQU0sSUFBSSxVQUFVO2NBQ3RCO2NBQ0EsTUFBTSxDQUFDLEtBQUssR0FBRyxRQUNYLEdBQUcsSUFBSSxDQUFDLE1BQU0sTUFBTSxPQUFPLENBQUMsSUFBSSxVQUNoQztZQUNOO1VBQ0YsT0FBTztZQUNMLE1BQU0sQ0FBQyxVQUFVLEdBQUcsUUFBUSxRQUFRO1VBQ3RDO1FBQ0Y7TUFDRjtJQUNGO0VBQ0Y7QUFDRjtBQUVBO3NFQUNzRSxHQUN0RSxNQUFNLFdBQXFCO0VBQ3pCLFNBQVM7SUFDUDtNQUNFO1FBQUM7T0FBK0I7TUFDaEM7UUFBQztRQUFTO1VBQUM7VUFBTSxHQUFHLGdCQUFnQixRQUFRO1NBQUM7T0FBQztLQUMvQztJQUNEO01BQ0U7UUFBQztPQUE4QjtNQUMvQjtRQUFDO1FBQVM7VUFBQztVQUFNO1NBQU87T0FBQztLQUMxQjtJQUVELGVBQWU7SUFDZjtNQUNFO1FBQ0U7UUFDQTtRQUNBO09BQ0Q7TUFDRDtRQUFDO1FBQU07T0FBUTtLQUNoQjtJQUNEO01BQ0U7UUFBQztPQUF3QjtNQUN6QjtRQUFDO1FBQVM7VUFBQztVQUFNLEdBQUcsTUFBTSxLQUFLLENBQUM7U0FBQztPQUFDO0tBQ25DO0lBQ0Q7TUFDRTtRQUFDO09BQW9CO01BQ3JCO1FBQUM7UUFBUztVQUFDO1VBQU07U0FBTTtPQUFDO0tBQ3pCO0lBRUQ7TUFDRTtRQUNFLFFBQVE7UUFDUjtRQUNBO1FBQ0EsZ0JBQWdCO1FBQ2hCO1FBQ0E7UUFDQTtRQUVBLHFCQUFxQjtRQUNyQixnS0FBZ0s7UUFDaEs7UUFDQTtRQUNBO09BQ0Q7TUFDRDtRQUFDO1FBQU07T0FBUTtLQUNoQjtJQUNEO01BQ0U7UUFBQztPQUFvRDtNQUNyRDtRQUFDO1FBQVM7VUFBQztVQUFNO1NBQVk7T0FBQztLQUMvQjtJQUNEO01BQ0U7UUFDRTtRQUNBO09BQ0Q7TUFDRDtRQUFDO1FBQVM7VUFBQztVQUFNO1NBQXNCO09BQUM7S0FDekM7SUFDRDtNQUNFO1FBQUM7T0FBNkI7TUFDOUI7UUFBQztRQUFTO1VBQUM7VUFBTTtTQUFTO09BQUM7S0FDNUI7SUFDRDtNQUNFO1FBQUM7T0FBd0I7TUFDekI7UUFBQztRQUFTO1VBQUM7VUFBTTtTQUFZO09BQUM7S0FDL0I7SUFDRDtNQUNFO1FBQUM7T0FBOEM7TUFDL0M7UUFBQztRQUFTO1VBQUM7VUFBTTtTQUFLO09BQUM7S0FDeEI7SUFDRDtNQUNFO1FBQUM7T0FBbUM7TUFDcEM7UUFBQztRQUFTO1VBQUM7VUFBTTtTQUFTO09BQUM7S0FDNUI7SUFDRDtNQUNFO1FBQUM7T0FBMEI7TUFDM0I7UUFBQztVQUFDO1VBQU07VUFBUSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0I7U0FBQztRQUFFO09BQVE7S0FDeEQ7SUFDRDtNQUNFO1FBQUM7T0FBc0I7TUFDdkI7UUFBQztRQUFTO1VBQUM7VUFBTSxHQUFHLFFBQVEsTUFBTSxDQUFDO1NBQUM7T0FBQztLQUN0QztJQUNEO01BQ0U7UUFBQztPQUFvQjtNQUNyQjtRQUFDO1FBQVM7VUFBQztVQUFNLEdBQUcsTUFBTSxNQUFNLENBQUM7U0FBQztPQUFDO0tBQ3BDO0lBQ0Q7TUFDRTtRQUFDO09BQXlCO01BQzFCO1FBQUM7UUFBUztVQUFDO1VBQU07U0FBVTtPQUFDO0tBQzdCO0lBQ0Q7TUFDRTtRQUFDO09BQXFCO01BQ3RCO1FBQUM7UUFBUztVQUFDO1VBQU07U0FBVTtPQUFDO0tBQzdCO0lBQ0Q7TUFDRTtRQUFDO09BQW9CO01BQ3JCO1FBQUM7UUFBUztVQUFDO1VBQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQztTQUFDO09BQUM7S0FDcEM7SUFDRDtNQUNFO1FBQUM7T0FBMEI7TUFDM0I7UUFBQztRQUFTO1VBQUM7VUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0I7U0FBQztPQUFDO0tBQzNDO0lBQ0Q7TUFDRTtRQUFDO09BQXFCO01BQ3RCO1FBQUM7UUFBUztVQUFDO1VBQU0sR0FBRyxnQkFBZ0IsU0FBUztTQUFDO09BQUM7S0FDaEQ7SUFDRDtNQUNFO1FBQUM7T0FBZ0M7TUFDakM7UUFBQztVQUFDO1VBQU0sQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCO1NBQUM7T0FBQztLQUNqQztJQUNEO01BQ0U7UUFBQztPQUFzRDtNQUN2RDtRQUFDO1VBQUM7VUFBTTtVQUFRLE9BQU87U0FBZTtRQUFFO09BQVE7S0FDakQ7SUFDRDtNQUNFO1FBQUM7T0FBOEI7TUFDL0I7UUFBQztVQUFDO1VBQU07VUFBTTtTQUFJO1FBQUU7T0FBUTtLQUM3QjtJQUNEO01BQ0U7UUFDRTtRQUNBO1FBQ0E7T0FDRDtNQUNEO1FBQUM7UUFBTTtPQUFRO0tBQ2hCO0lBQ0Q7TUFDRTtRQUNFO1FBQ0E7UUFDQTtPQUNEO01BQ0Q7UUFBQztPQUFLO0tBQ1A7SUFDRDtNQUNFO1FBQUM7T0FBOEQ7TUFDL0Q7UUFBQztVQUFDO1VBQU07U0FBUztRQUFFO09BQVE7S0FDNUI7SUFDRDtNQUNFO1FBQ0U7UUFDQTtRQUNBO1FBQ0E7UUFDQTtPQUNEO01BQ0Q7UUFBQztRQUFNO09BQVE7S0FDaEI7SUFDRDtNQUNFO1FBQUM7T0FBK0I7TUFDaEM7UUFBQztRQUFTO1VBQUM7VUFBTTtTQUFNO09BQUM7S0FDekI7SUFDRDtNQUNFO1FBQUM7T0FBNkM7TUFDOUM7UUFBQztRQUFTO1VBQUM7VUFBTTtTQUFTO09BQUM7S0FDNUI7SUFDRDtNQUNFO1FBQUM7T0FBbUM7TUFDcEM7UUFBQztRQUFTO1VBQUM7VUFBTSxHQUFHLE9BQU8sU0FBUyxDQUFDO1NBQUM7T0FBQztLQUN4QztJQUNEO01BQ0U7UUFBQztPQUE4QjtNQUMvQjtRQUFDO1VBQUM7VUFBTSxHQUFHLE9BQU8sUUFBUSxDQUFDO1NBQUM7UUFBRTtPQUFRO0tBQ3ZDO0lBQ0Q7TUFDRTtRQUFDO09BQTBEO01BQzNEO1FBQUM7UUFBUztVQUFDO1VBQU0sQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCO1NBQUM7T0FBQztLQUM5QztJQUNEO01BQ0U7UUFBQztPQUE0QjtNQUM3QjtRQUFDO1FBQVM7VUFBQztVQUFNLEdBQUcsZ0JBQWdCLFFBQVE7U0FBQztPQUFDO0tBQy9DO0lBQ0Q7TUFDRTtRQUFDO09BQThEO01BQy9EO1FBQUM7UUFBTTtPQUFRO0tBQ2hCO0lBQ0Q7TUFDRTtRQUFDO09BQW9EO01BQ3JEO1FBQUM7UUFBUztVQUFDO1VBQU0sR0FBRyxjQUFjLE1BQU0sQ0FBQztTQUFDO09BQUM7S0FDNUM7SUFDRDtNQUNFO1FBQUM7T0FBc0M7TUFDdkM7UUFBQztVQUFDO1VBQU0sR0FBRyxjQUFjLE1BQU0sQ0FBQztTQUFDO09BQUM7S0FDbkM7SUFDRDtNQUNFO1FBQUM7T0FBbUM7TUFDcEM7UUFBQztRQUFTO09BQUs7S0FDaEI7SUFDRDtNQUNFO1FBQUM7T0FBK0M7TUFDaEQ7UUFBQztRQUFNO1VBQUM7VUFBUztTQUFJO09BQUM7S0FDdkI7SUFDRDtNQUNFO1FBQUM7T0FBNkI7TUFDOUI7UUFBQztRQUFNO09BQVE7S0FDaEI7SUFDRDtNQUNFO1FBQUM7T0FBNkM7TUFDOUM7UUFBQztVQUFDO1VBQU0sR0FBRyxnQkFBZ0IsU0FBUztTQUFDO1FBQUU7T0FBUTtLQUNoRDtJQUNEO01BQ0U7UUFBQztPQUF1QztNQUN4QztRQUFDO1VBQUM7VUFBTTtTQUFXO1FBQUU7T0FBUTtLQUM5QjtJQUNEO01BQ0U7UUFBQztPQUFzQztNQUN2QztRQUFDO1FBQVM7VUFBQztVQUFNLEdBQUcsUUFBUSxRQUFRLENBQUM7U0FBQztPQUFDO0tBQ3hDO0lBQ0Q7TUFDRTtRQUNFO1FBQ0E7UUFDQTtRQUNBLHVFQUF1RTtRQUN2RTtRQUNBLDREQUE0RDtRQUM1RDtRQUNBO1FBRUEsUUFBUTtRQUNSO1FBQ0EsMEZBQTBGO1FBQzFGO1FBQ0E7T0FDRDtNQUNEO1FBQUM7UUFBTTtPQUFRO0tBQ2hCO0lBQ0Q7TUFDRTtRQUFDO09BQXVCO01BQ3hCO1FBQUM7UUFBTTtVQUFDO1VBQVM7VUFBYTtTQUFNO09BQUM7S0FDdEM7R0FDRjtFQUNELEtBQUs7SUFDSDtNQUNFO1FBQUM7T0FBc0M7TUFDdkM7UUFBQztVQUFDO1VBQWM7U0FBUTtPQUFDO0tBQzFCO0lBQ0Q7TUFDRTtRQUNFO1FBQ0E7T0FDRDtNQUNEO1FBQUM7VUFBQztVQUFjO1NBQU87T0FBQztLQUN6QjtJQUNEO01BQ0U7UUFBQztPQUFtQztNQUNwQztRQUFDO1VBQUM7VUFBYztTQUFRO09BQUM7S0FDMUI7SUFDRDtNQUNFO1FBQUM7T0FBNkI7TUFDOUI7UUFBQztVQUFDO1VBQWM7U0FBTTtPQUFDO0tBQ3hCO0lBQ0Q7TUFDRTtRQUFDO09BQXlDO01BQzFDO1FBQUM7VUFBQztVQUFjO1VBQVE7VUFBTztTQUFTO09BQUM7S0FDMUM7SUFDRDtNQUNFO1FBQUM7T0FBaUI7TUFDbEI7UUFBQztVQUFDO1VBQWM7U0FBUTtPQUFDO0tBQzFCO0lBQ0Q7TUFDRTtRQUFDO09BQTBIO01BQzNIO1FBQUM7VUFBQztVQUFjO1NBQVM7T0FBQztLQUMzQjtHQUNGO0VBQ0QsUUFBUTtJQUNOO01BQ0U7UUFBQztPQUFrRjtNQUNuRjtRQUFDO1FBQU87VUFBQztVQUFRO1NBQVE7UUFBRTtVQUFDO1VBQU07U0FBTztPQUFDO0tBQzNDO0lBQ0Q7TUFDRTtRQUNFO1FBQ0E7UUFDQTtPQUNEO01BQ0Q7UUFBQztRQUFPO1VBQUM7VUFBUTtTQUFRO1FBQUU7VUFBQztVQUFNO1NBQU87T0FBQztLQUMzQztJQUNEO01BQ0U7UUFBQztPQUEyQztNQUM1QztRQUFDO1FBQU87VUFBQztVQUFRO1NBQU07UUFBRTtVQUFDO1VBQU07U0FBTztPQUFDO0tBQ3pDO0lBQ0Q7TUFDRTtRQUNFO1FBQ0E7UUFDQTtPQUNEO01BQ0Q7UUFBQztRQUFPO1VBQUM7VUFBUTtTQUFNO1FBQUU7VUFBQztVQUFNO1NBQU87T0FBQztLQUN6QztJQUNEO01BQ0U7UUFBQztPQUFnQjtNQUNqQjtRQUFDO1FBQU87VUFBQztVQUFRO1NBQU07T0FBQztLQUN6QjtJQUNEO01BQ0U7UUFBQztPQUFnQztNQUNqQztRQUFDO1FBQU87VUFBQztVQUFRO1NBQU07UUFBRTtVQUFDO1VBQU07U0FBTztPQUFDO0tBQ3pDO0lBQ0Q7TUFDRTtRQUFDO09BQThEO01BQy9EO1FBQUM7UUFBTztVQUFDO1VBQVE7U0FBTztRQUFFO1VBQUM7VUFBTTtTQUFPO09BQUM7S0FDMUM7SUFDRDtNQUNFO1FBQ0U7UUFDQTtPQUNEO01BQ0Q7UUFBQztRQUFPO1VBQUM7VUFBUTtTQUFPO1FBQUU7VUFBQztVQUFNO1NBQU87T0FBQztLQUMxQztJQUNEO01BQ0U7UUFDRTtRQUNBO1FBQ0E7UUFDQTtRQUNBO09BQ0Q7TUFDRDtRQUFDO1VBQUM7VUFBTztVQUFNO1NBQUk7UUFBRTtVQUFDO1VBQVE7U0FBTztRQUFFO1VBQUM7VUFBTTtTQUFPO09BQUM7S0FDdkQ7SUFDRDtNQUNFO1FBQUM7T0FBNkM7TUFDOUM7UUFBQztVQUFDO1VBQU87VUFBTTtTQUFJO1FBQUU7VUFBQztVQUFRO1NBQU87UUFBRTtVQUFDO1VBQU07U0FBTztPQUFDO0tBQ3ZEO0lBQ0Q7TUFDRTtRQUNFO1FBQ0E7T0FDRDtNQUNEO1FBQUM7UUFBTztVQUFDO1VBQVE7U0FBTztRQUFFO1VBQUM7VUFBTTtTQUFPO09BQUM7S0FDMUM7SUFDRDtNQUNFO1FBQUM7UUFBMEI7T0FBbUM7TUFDOUQ7UUFBQztRQUFP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
// denoCacheMetadata=5921586032620846555,17080142456834557876