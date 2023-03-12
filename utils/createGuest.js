const createGuest = async (data, guest_endpoint_url) => {
    const createGuestBody = JSON.stringify({
      center_id: data.center_id,
      personal_info: {
        mobile_phone: {
          phone_code: data.guest_phone,
          number: data.guest_phone
        },
        first_name: data.guestFirstName,
        last_name: data.guestLastName,
        email: data.guest_email,
        gender: data.guest_gender
      },
    });
  
    const createGuestHeader = {
      "Content-Type": "application/json",
      "Authorization": `apikey 479afeaa6c1947be99bfa1b5915e6a13c4c51cdf9686473497ceb342eafebc85`
    };
    
    console.log("guest_endpoint_url", guest_endpoint_url);
    return fetch(guest_endpoint_url, {
      method: "POST",
      headers: createGuestHeader,
      body: createGuestBody,
    })
      .then(res => res.json())
      .then((response) => {
        return { status: 'success', guestData: response };
      })
      .catch((error) => {
        console.log(error);
        return { status: 'error', error: error };
      });
};
  
module.exports = createGuest;
