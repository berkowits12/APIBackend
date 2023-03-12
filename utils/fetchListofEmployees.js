const ZENOTI_CONSTANTS = require('./constants');

/**
 * Fetches all list of employees from zenoti
 * @returns centers
 */
const fetchListofEmplyees = async (center_id) => {
    return await fetch(`https://${ZENOTI_CONSTANTS.BASE_URL}/v1/centers/${center_id}/employees`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `apikey 479afeaa6c1947be99bfa1b5915e6a13c4c51cdf9686473497ceb342eafebc85`
        }
    })
        .then(res => res.json())
        .then(res => res)
        .catch(error => {
            console.log(error);
            throw new Error(error);
        });
}

module.exports = fetchListofEmplyees;