const ZENOTI_CONSTANTS = require('./constants');

/**
 * Fetches all centers from zenoti
 * @returns centers
 */
const fetchCenters = async () => {
    return await fetch(`https://${ZENOTI_CONSTANTS.BASE_URL}/v1/centers`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `apikey ${process.env.JDAPIKEY}`
        }
    })
        .then(res => res.json())
        .then(res => res)
        .catch(error => {
            console.log(error);
            throw new Error(error);
        });
}

// const res = await fetchCenters();
// console.log(res);

module.exports = fetchCenters;