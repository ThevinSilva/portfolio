export default async function getGreeting(countryCode) {
    const response = await fetch(`https://fourtonfish.com/hellosalut/?cc=${countryCode}`);
    return await response.json();
}

// Mock location API
// export default function getCountry(countryCode) {
//     return Promise.resolve([
//   {
//     "name": {
//       "common": "United Kingdom",
//       "official": "United Kingdom of Great Britain and Northern Ireland",
//       "nativeName": {
//         "eng": {
//           "official": "United Kingdom of Great Britain and Northern Ireland",
//           "common": "United Kingdom"
//         }
//       }
//     },
//     "tld": [
//       ".uk"
//     ],
//     "cca2": "GB",
//     "ccn3": "826",
//     "cioc": "GBR",
//     "independent": true,
//     "status": "officially-assigned",
//     "unMember": true,
//     "currencies": {
//       "GBP": {
//         "symbol": "£",
//         "name": "British pound"
//       }
//     },
//     "idd": {
//       "root": "+4",
//       "suffixes": [
//         "4"
//       ]
//     },
//     "capital": [
//       "London"
//     ],
//     "altSpellings": [
//       "GB",
//       "UK",
//       "Great Britain"
//     ],
//     "region": "Europe",
//     "subregion": "Northern Europe",
//     "languages": {
//       "eng": "English"
//     },
//     "latlng": [54, -2],
//     "landlocked": false,
//     "borders": [
//       "IRL"
//     ],
//     "area": 242900,
//     "demonyms": {
//       "eng": {
//         "f": "British",
//         "m": "British"
//       },
//       "fra": {
//         "f": "Britannique",
//         "m": "Britannique"
//       }
//     },
//     "cca3": "GBR",
//     "translations": {
//       "ara": {
//         "official": "المملكة المتحدة لبريطانيا العظمى وايرلندا الشمالية",
//         "common": "المملكة المتحدة"
//       },
//       "bre": {
//         "official": "Rouantelezh-Unanet Breizh-Veur ha Norzhiwerzhon",
//         "common": "Rouantelezh-Unanet"
//       },
//       "ces": {
//         "official": "Spojené království Velké Británie a Severního Irska",
//         "common": "Spojené království"
//       },
//       "cym": {
//         "official": "United Kingdom of Great Britain and Northern Ireland",
//         "common": "United Kingdom"
//       },
//       "deu": {
//         "official": "Vereinigtes Königreich Großbritannien und Nordirland",
//         "common": "Vereinigtes Königreich"
//       },
//       "est": {
//         "official": "Suurbritannia ja Põhja-Iiri Ühendkuningriik",
//         "common": "Suurbritannia"
//       },
//       "fin": {
//         "official": "Ison-Britannian ja Pohjois-Irlannin yhdistynyt kuningaskunta",
//         "common": "Yhdistynyt kuningaskunta"
//       },
//       "fra": {
//         "official": "Royaume-Uni de Grande-Bretagne et d'Irlande du Nord",
//         "common": "Royaume-Uni"
//       },
//       "hrv": {
//         "official": "Ujedinjeno Kraljevstvo Velike Britanije i Sjeverne Irske",
//         "common": "Ujedinjeno Kraljevstvo"
//       },
//       "hun": {
//         "official": "Nagy-Britannia és Észak-Írország Egyesült Királysága",
//         "common": "Egyesült Királyság"
//       },
//       "ind": {
//         "official": "Perserikatan Kerajaan Britania Raya dan Irlandia Utara",
//         "common": "Britania Raya"
//       },
//       "ita": {
//         "official": "Regno Unito di Gran Bretagna e Irlanda del Nord",
//         "common": "Regno Unito"
//       },
//       "jpn": {
//         "official": "グレート·ブリテンおよび北アイルランド連合王国",
//         "common": "イギリス"
//       },
//       "kor": {
//         "official": "그레이트브리튼 북아일랜드 연합 왕국",
//         "common": "영국"
//       },
//       "nld": {
//         "official": "Verenigd Koninkrijk van Groot-Brittannië en Noord-Ierland",
//         "common": "Verenigd Koninkrijk"
//       },
//       "per": {
//         "official": "پادشاهی متحد بریتانیای کبیر و ایرلند شمالی",
//         "common": "انگلیس"
//       },
//       "pol": {
//         "official": "Zjednoczone Królestwo Wielkiej Brytanii i Irlandii Północnej",
//         "common": "Zjednoczone Królestwo"
//       },
//       "por": {
//         "official": "Reino Unido da Grã-Bretanha e Irlanda do Norte",
//         "common": "Reino Unido"
//       },
//       "rus": {
//         "official": "Соединенное Королевство Великобритании и Северной Ирландии",
//         "common": "Великобритания"
//       },
//       "slk": {
//         "official": "Spojené kráľovstvo Veľkej Británie a SevernéhoÌrska",
//         "common": "Veľká Británia (Spojené kráľovstvo)"
//       },
//       "spa": {
//         "official": "Reino Unido de Gran Bretaña e Irlanda del Norte",
//         "common": "Reino Unido"
//       },
//       "srp": {
//         "official": "Уједињено Краљевство Велике Британије и Северне Ирске",
//         "common": "Уједињено Краљевство"
//       },
//       "swe": {
//         "official": "Förenade konungariket Storbritannien och Nordirland",
//         "common": "Storbritannien"
//       },
//       "tur": {
//         "official": "Büyük Britanya ve Kuzey İrlanda Birleşik Krallığı",
//         "common": "Birleşik Krallık"
//       },
//       "urd": {
//         "official": "مملکتِ متحدہ برطانیہ عظمی و شمالی آئرلینڈ",
//         "common": "مملکتِ متحدہ"
//       },
//       "zho": {
//         "official": "大不列颠及北爱尔兰联合王国",
//         "common": "英国"
//       }
//     },
//     "flag": "🇬🇧",
//     "maps": {
//       "googleMaps": "https://goo.gl/maps/FoDtc3UKMkFsXAjHA",
//       "openStreetMaps": "https://www.openstreetmap.org/relation/62149"
//     },
//     "population": 67215293,
//     "gini": {
//       "2017": 35.1
//     },
//     "car": {
//       "signs": [
//         "GB"
//       ],
//       "side": "left"
//     },
//     "timezones": [
//       "UTC-08:00",
//       "UTC-05:00",
//       "UTC-04:00",
//       "UTC-03:00",
//       "UTC-02:00",
//       "UTC",
//       "UTC+01:00",
//       "UTC+02:00",
//       "UTC+06:00"
//     ],
//     "continents": [
//       "Europe"
//     ],
//     "flags": {
//       "png": "https://flagcdn.com/w320/gb.png",
//       "svg": "https://flagcdn.com/gb.svg",
//       "alt": "The flag of the United Kingdom — the Union Jack — has a blue field. It features the white-edged red cross of Saint George superimposed on the diagonal red cross of Saint Patrick which is superimposed on the diagonal white cross of Saint Andrew."
//     },
//     "coatOfArms": {
//       "png": "https://mainfacts.com/media/images/coats_of_arms/gb.png",
//       "svg": "https://mainfacts.com/media/images/coats_of_arms/gb.svg"
//     },
//     "startOfWeek": "monday",
//     "capitalInfo": {
//       "latlng": [51.5, -0.08]
//     },
//     "postalCode": {
//       "format": "@# #@@|@## #@@|@@# #@@|@@## #@@|@#@ #@@|@@#@ #@@|GIR0AA",
//       "regex": "^(([A-Z]\\d{2}[A-Z]{2})|([A-Z]\\d{3}[A-Z]{2})|([A-Z]{2}\\d{2}[A-Z]{2})|([A-Z]{2}\\d{3}[A-Z]{2})|([A-Z]\\d[A-Z]\\d[A-Z]{2})|([A-Z]{2}\\d[A-Z]\\d[A-Z]{2})|(GIR0AA))$"
//     }
//   }
// ]);
// }
