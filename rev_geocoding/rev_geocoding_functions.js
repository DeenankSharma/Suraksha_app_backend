import axios from "axios";

async function get_address(lat,long){
  // const api_key = await process.env.GEO_API;
  // const response = await axios.get(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}&api_key=${api_key}`)
  const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}`);
  return response.data.city;
}

export default get_address;