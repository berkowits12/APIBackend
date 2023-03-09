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
            "Authorization": `apikey 479afeaa6c1947be99bfa1b5915e6a13c4c51cdf9686473497ceb342eafebc85`
        }
    })
        .then(res => res.json())
        .catch(error => {
            console.log(error);
            throw new Error(error);
        });
}

module.exports = fetchCenters;