/*
 * ITU country calling codes, keyed by ISO 3166-1 alpha-2.
 *
 * Only the code and the dial prefix live here. Country names come from
 * Intl.DisplayNames at render time, which gives the right name in Arabic and
 * English for free and leaves no translation table to drift.
 *
 * PREFERRED is what the picker offers first: home, then the Gulf and the
 * places travellers here come from and go to most.
 */

export interface DialCode {
  /** ISO 3166-1 alpha-2. Also drives the flag. */
  iso2: string;
  /** Without the leading "+". */
  dial: string;
}

export const PREFERRED_ISO2 = [
  "SA", "AE", "KW", "QA", "BH", "OM", "EG", "JO", "LB", "TR", "GB", "US",
] as const;

// prettier-ignore
export const DIAL_CODES: DialCode[] = [
  { iso2: "AF", dial: "93" },   { iso2: "AL", dial: "355" },  { iso2: "DZ", dial: "213" },
  { iso2: "AD", dial: "376" },  { iso2: "AO", dial: "244" },  { iso2: "AG", dial: "1268" },
  { iso2: "AR", dial: "54" },   { iso2: "AM", dial: "374" },  { iso2: "AU", dial: "61" },
  { iso2: "AT", dial: "43" },   { iso2: "AZ", dial: "994" },  { iso2: "BS", dial: "1242" },
  { iso2: "BH", dial: "973" },  { iso2: "BD", dial: "880" },  { iso2: "BB", dial: "1246" },
  { iso2: "BY", dial: "375" },  { iso2: "BE", dial: "32" },   { iso2: "BZ", dial: "501" },
  { iso2: "BJ", dial: "229" },  { iso2: "BT", dial: "975" },  { iso2: "BO", dial: "591" },
  { iso2: "BA", dial: "387" },  { iso2: "BW", dial: "267" },  { iso2: "BR", dial: "55" },
  { iso2: "BN", dial: "673" },  { iso2: "BG", dial: "359" },  { iso2: "BF", dial: "226" },
  { iso2: "BI", dial: "257" },  { iso2: "KH", dial: "855" },  { iso2: "CM", dial: "237" },
  { iso2: "CA", dial: "1" },    { iso2: "CV", dial: "238" },  { iso2: "TD", dial: "235" },
  { iso2: "CL", dial: "56" },   { iso2: "CN", dial: "86" },   { iso2: "CO", dial: "57" },
  { iso2: "KM", dial: "269" },  { iso2: "CG", dial: "242" },  { iso2: "CD", dial: "243" },
  { iso2: "CR", dial: "506" },  { iso2: "CI", dial: "225" },  { iso2: "HR", dial: "385" },
  { iso2: "CU", dial: "53" },   { iso2: "CY", dial: "357" },  { iso2: "CZ", dial: "420" },
  { iso2: "DK", dial: "45" },   { iso2: "DJ", dial: "253" },  { iso2: "DO", dial: "1809" },
  { iso2: "EC", dial: "593" },  { iso2: "EG", dial: "20" },   { iso2: "SV", dial: "503" },
  { iso2: "GQ", dial: "240" },  { iso2: "ER", dial: "291" },  { iso2: "EE", dial: "372" },
  { iso2: "ET", dial: "251" },  { iso2: "FJ", dial: "679" },  { iso2: "FI", dial: "358" },
  { iso2: "FR", dial: "33" },   { iso2: "GA", dial: "241" },  { iso2: "GM", dial: "220" },
  { iso2: "GE", dial: "995" },  { iso2: "DE", dial: "49" },   { iso2: "GH", dial: "233" },
  { iso2: "GR", dial: "30" },   { iso2: "GD", dial: "1473" }, { iso2: "GT", dial: "502" },
  { iso2: "GN", dial: "224" },  { iso2: "GY", dial: "592" },  { iso2: "HT", dial: "509" },
  { iso2: "HN", dial: "504" },  { iso2: "HK", dial: "852" },  { iso2: "HU", dial: "36" },
  { iso2: "IS", dial: "354" },  { iso2: "IN", dial: "91" },   { iso2: "ID", dial: "62" },
  { iso2: "IQ", dial: "964" },  { iso2: "IE", dial: "353" },  { iso2: "IT", dial: "39" },
  { iso2: "JM", dial: "1876" }, { iso2: "JP", dial: "81" },   { iso2: "JO", dial: "962" },
  { iso2: "KZ", dial: "7" },    { iso2: "KE", dial: "254" },  { iso2: "KW", dial: "965" },
  { iso2: "KG", dial: "996" },  { iso2: "LA", dial: "856" },  { iso2: "LV", dial: "371" },
  { iso2: "LB", dial: "961" },  { iso2: "LS", dial: "266" },  { iso2: "LR", dial: "231" },
  { iso2: "LY", dial: "218" },  { iso2: "LI", dial: "423" },  { iso2: "LT", dial: "370" },
  { iso2: "LU", dial: "352" },  { iso2: "MG", dial: "261" },  { iso2: "MW", dial: "265" },
  { iso2: "MY", dial: "60" },   { iso2: "MV", dial: "960" },  { iso2: "ML", dial: "223" },
  { iso2: "MT", dial: "356" },  { iso2: "MR", dial: "222" },  { iso2: "MU", dial: "230" },
  { iso2: "MX", dial: "52" },   { iso2: "MD", dial: "373" },  { iso2: "MC", dial: "377" },
  { iso2: "MN", dial: "976" },  { iso2: "ME", dial: "382" },  { iso2: "MA", dial: "212" },
  { iso2: "MZ", dial: "258" },  { iso2: "MM", dial: "95" },   { iso2: "NA", dial: "264" },
  { iso2: "NP", dial: "977" },  { iso2: "NL", dial: "31" },   { iso2: "NZ", dial: "64" },
  { iso2: "NI", dial: "505" },  { iso2: "NE", dial: "227" },  { iso2: "NG", dial: "234" },
  { iso2: "MK", dial: "389" },  { iso2: "NO", dial: "47" },   { iso2: "OM", dial: "968" },
  { iso2: "PK", dial: "92" },   { iso2: "PS", dial: "970" },  { iso2: "PA", dial: "507" },
  { iso2: "PG", dial: "675" },  { iso2: "PY", dial: "595" },  { iso2: "PE", dial: "51" },
  { iso2: "PH", dial: "63" },   { iso2: "PL", dial: "48" },   { iso2: "PT", dial: "351" },
  { iso2: "PR", dial: "1787" }, { iso2: "QA", dial: "974" },  { iso2: "RO", dial: "40" },
  { iso2: "RU", dial: "7" },    { iso2: "RW", dial: "250" },  { iso2: "WS", dial: "685" },
  { iso2: "SM", dial: "378" },  { iso2: "SA", dial: "966" },  { iso2: "SN", dial: "221" },
  { iso2: "RS", dial: "381" },  { iso2: "SC", dial: "248" },  { iso2: "SL", dial: "232" },
  { iso2: "SG", dial: "65" },   { iso2: "SK", dial: "421" },  { iso2: "SI", dial: "386" },
  { iso2: "SO", dial: "252" },  { iso2: "ZA", dial: "27" },   { iso2: "KR", dial: "82" },
  { iso2: "SS", dial: "211" },  { iso2: "ES", dial: "34" },   { iso2: "LK", dial: "94" },
  { iso2: "SD", dial: "249" },  { iso2: "SR", dial: "597" },  { iso2: "SE", dial: "46" },
  { iso2: "CH", dial: "41" },   { iso2: "SY", dial: "963" },  { iso2: "TW", dial: "886" },
  { iso2: "TJ", dial: "992" },  { iso2: "TZ", dial: "255" },  { iso2: "TH", dial: "66" },
  { iso2: "TG", dial: "228" },  { iso2: "TT", dial: "1868" }, { iso2: "TN", dial: "216" },
  { iso2: "TR", dial: "90" },   { iso2: "TM", dial: "993" },  { iso2: "UG", dial: "256" },
  { iso2: "UA", dial: "380" },  { iso2: "AE", dial: "971" },  { iso2: "GB", dial: "44" },
  { iso2: "US", dial: "1" },    { iso2: "UY", dial: "598" },  { iso2: "UZ", dial: "998" },
  { iso2: "VE", dial: "58" },   { iso2: "VN", dial: "84" },   { iso2: "YE", dial: "967" },
  { iso2: "ZM", dial: "260" },  { iso2: "ZW", dial: "263" },
];

/** The one the picker starts on. This is a Saudi agency. */
export const DEFAULT_ISO2 = "SA";

/* Some prefixes belong to more than one country. Which one is shown back to
   someone who pasted a full number is cosmetic — the stored number is the same
   either way — but showing a Canadian flag to an American caller looks broken. */
const PRIMARY_FOR_SHARED_DIAL: Record<string, string> = { "1": "US", "7": "RU" };

const BY_ISO2 = new Map(DIAL_CODES.map((entry) => [entry.iso2, entry]));

export function dialFor(iso2: string): string {
  return BY_ISO2.get(iso2)?.dial ?? "";
}

/**
 * The country a full international number belongs to.
 *
 * Longest prefix wins: "+1868" is Trinidad, not the United States, and "+9665"
 * must not match a hypothetical "+9" before it reaches Saudi Arabia.
 */
export function iso2ForNumber(international: string): DialCode | undefined {
  const digits = international.replace(/^\+/, "");
  let best: DialCode | undefined;
  for (const entry of DIAL_CODES) {
    if (digits.startsWith(entry.dial) && (!best || entry.dial.length > best.dial.length)) {
      best = entry;
    }
  }
  if (best) {
    const primary = PRIMARY_FOR_SHARED_DIAL[best.dial];
    if (primary) return BY_ISO2.get(primary) ?? best;
  }
  return best;
}
