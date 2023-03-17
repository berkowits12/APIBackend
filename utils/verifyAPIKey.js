const verifyApiKey = (userApiKey) => {
    if (!userApiKey) {
        return false;
    }
    const apiKeyParts = userApiKey.split(" ");
    if (apiKeyParts.length != 2 || apiKeyParts[0].toLowerCase() !== "apikey") {
        return false;
    }
    if (apiKeyParts[1] !== process.env.APP_API_KEY) {
        return false;
    }
    return true;
}

module.exports = verifyApiKey;