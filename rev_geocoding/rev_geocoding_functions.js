import axios from "axios";
import { parseStringPromise } from "xml2js"; 

async function get_address(lat, long) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=xml`);
    const parsedData = await parseStringPromise(response.data);
    const county = parsedData.reversegeocode.addressparts[0].city[0];
    return county;
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
    throw error;
  }
}

export default get_address;
