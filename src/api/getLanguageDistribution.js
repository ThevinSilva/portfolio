// Get language distribution for a GitHub user
export default async function getLanguageDistribution(username) {
    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);

    if (!repoRes.ok) {
        throw new Error(`Failed to fetch repos for ${username}`);
    }

    const repos = await repoRes.json();

    const totals = {};

    for (const repo of repos) {
        const langRes = await fetch(repo.languages_url);

        if (!langRes.ok) continue;

        const langs = await langRes.json(); // { "JavaScript": 1234, "HTML": 567, ... }

        for (const [lang, bytes] of Object.entries(langs)) {
            totals[lang] = (totals[lang] || 0) + bytes;
        }
    }

    const totalBytes = Object.values(totals).reduce((sum, v) => sum + v, 0);

    const percentages = Object.fromEntries(Object.entries(totals).map(([lang, bytes]) => [lang, +((bytes / totalBytes) * 100).toFixed(2)]));

    return percentages;
}
