// get location data from https://ip-api.io/json
export default async function getLocation() {
    const res = await fetch("https://ip-api.io/json");
    return await res.json();
}
