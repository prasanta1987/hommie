export async function getAuthenticatedUID(apiKey) {
    if (!apiKey) return null;
    try {
        const fbBase = "https://hommily-default-rtdb.firebaseio.com";
        const secret = process.env.FIREBASE_DATABASE_SECRET;
        const authUrl = `${fbBase}/userCred/APItoUID/${apiKey}/fbUID.json?auth=${secret}`;
        const res = await fetch(authUrl);
        return await res.json();
    } catch (e) {
        return null;
    }
}