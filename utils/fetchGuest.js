// const ZENOTI_CONSTANTS = require('./constants');

// /**
//  * Fetches all centers from zenoti
//  * @returns centers
//  */

// const center_id = 'd858f57f-08fc-42ce-8e91-7550476acdb3';
// const guest_email = 'abc@gmail.com'

// let fullUrl = `https://${ZENOTI_CONSTANTS.BASE_URL}/v1/guests/search?center_id=${center_id}&email=${guest_email}`;
// console.log(fullUrl);

// const fetchData = async () => {
//   try {
//     const response = await fetch(`https://${ZENOTI_CONSTANTS.BASE_URL}/v1/guests/search?center_id=${center_id}&email=${guest_email}`, {
//       method: 'GET',
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `apikey 479afeaa6c1947be99bfa1b5915e6a13c4c51cdf9686473497ceb342eafebc85`
//       }
//     });
//     const jsonData = await response.json();
//     console.log(jsonData);

//     const guest_search_response = jsonData.data;
//     if (guest_search_response.page_info.total > 0) {
//       const guest_list = guest_search_response.guests;
//       if (guest_list.length > 1) {
//         console.log('List of guests');
//         guest_list.forEach((guest, j) => {
//           console.log(`${j + 1}. ${guest.personal_info.user_name} - ${guest.personal_info.first_name} ${guest.personal_info.last_name}`);
//         });
//         const guest_input = parseInt(prompt("\nMultiple guests found. Select guest number: "));
//         const guest_id = guest_list[guest_input - 1].id;
//       } else {
//         const guest_id = guest_list[0].id;
//         console.log("Guest found.\n");
//       }
//     } else {
//       console.log("Guest not found.\n\nEnter details to create the guest.");
//     }
    
//   } catch (error) {
//     console.log(error);
//   }
// }

// fetchData();
// module.exports = fetchData;