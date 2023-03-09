// const BASE_URL = require('./constants.js');
// // Get center based on selection
// const get_centers_url = `https://${BASE_URL}/v1/centers`;

// response = requests.get(get_centers_url, headers=auth_header).json()
// centers = response["centers"]
// print('List of centers')
// [print('{0}. {1}'.format(str(i+1),centers[i]["name"])) for i in range(len(centers))]
// center_input = int(input("Select your center's number: "))

// center_id = centers[center_input-1]["id"]

// // Search or create guest
// guest_email = input("\nEnter guest email to search: ")
// guest_endpoint_url = "https://{0}/v1/guests".format(api_url);
// guest_search_url = "{0}/search?center_id={1}&email={2}".format(guest_endpoint_url, center_id, guest_email)

// guest_search_response = requests.get(guest_search_url, headers=auth_header).json()

// if(guest_search_response["page_Info"]["total"] > 0){
//     guest_list = guest_search_response["guests"]
//     if(len(guest_list) > 1){
//         print('List of guests')
//         [print('{0}. {1} - {2} {3}'.format(str(j+1), i["personal_info"]["user_name"], i["personal_info"]["first_name"], i["personal_info"]["last_name"])) for j,i in enumerate(guest_list)]
//         guest_id = guest_list[int(input("\nMultiple guests found. Select guest number: "))-1]["id"]
//     }
//     else {
//         guest_id = guest_list[0]["id"]
//         print("Guest found.\n")
//     }
// }

// const isGuestProfile = (reqBody) => {
//   return new Promise((resolve, reject) => {
//     let param1 = "param1Value";
//     let zenotiAPIURL = `https://${BASE_URL}/v1/centers?param1=${param1}`;
//     fetch(zenotiAPIURL)
//       .then((APIResponse) => {
//         if (APIResponse) {
//           resolve(APIResponse);
//         } else {
//           resolve({ newRequired: true });
//         }
//       })
//       .catch((err) => {
//         console.log(" Error in fetch data fron Zenoti API Name: ", err);
//         reject("Error in fetch data fron Zenoti API Name.");
//       });
//   });
// };