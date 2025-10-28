// get location data from https://ip-api.io/json
export default async function getLocation() {
    const res = await fetch(`https://ipwho.is/`);
    return await res.json();
}

// Mock location API
// export default function getLocation() {
//     return Promise.resolve({
//         city: "Bristol",
//         countryName: "United Kingdom",
//         ip: "192.168.1.1",
//         latitude: 51.4545,
//         longitude: -2.5879,
//     });
// }
