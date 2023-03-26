const fetch = require("node-fetch");
const ZENOTI_CONSTANTS = require('./constants');

const searchGuest = async (centerId, phone) => {
    return await fetch(
        `https://${ZENOTI_CONSTANTS.BASE_URL}/v1/guests/search?center_id=${centerId}&phone=${phone}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `apikey ${process.env.JDAPIKEY}`,
          },
        }
      )
        .then(res => res.json())
        .then(res => res)
        .catch(err => console.log(err));
}

module.exports = searchGuest;
