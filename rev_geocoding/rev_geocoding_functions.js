import axios from "axios";
// Note: 'xml2js' is no longer needed since we switched to JSON

async function get_address(lat, long) {
  try {
    // 1. Basic validation
    if (!lat || !long) return "Unknown Location";

    // 2. Request JSON data with required User-Agent headers
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: long,
        format: 'jsonv2' // Use JSONv2 for simpler structure
      },
      headers: {
        // CRITICAL: This fixes the 403 error. Nominatim requires a User-Agent.
        'User-Agent': 'Suraksha-App/1.0 (deenank.sharma@example.com)', 
        'Referer': 'https://github.com/DeenankSharma/Suraksha_App',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });


    const data = response.data;
    console.log("Geocoding Response Data:", data); // Debug log
    // 3. Extract the most relevant city/area name
    if (data && data.address) {
      // Prioritize City -> Town -> Village -> County
      const city = data.address.city || 
                   data.address.town || 
                   data.address.village || 
                   data.address.county || 
                   data.address.state_district;
                   
      if (city) return city;
      
      // Fallback to full address if no specific city found
      return data.display_name;
    }
    
    return "Unknown Location";

  } catch (error) {
    console.error("Geocoding Error:", error.message);
    
    // 4. Return coordinates as fallback string so the app doesn't crash
    return `Lat: ${lat}, Long: ${long}`;
  }
}

export default get_address;