export default async function getCountry(countryCode) {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    return await response.json();
}

// Mock location API
// export default function getCountry(countryCode) {
//     return Promise.resolve();
// }
