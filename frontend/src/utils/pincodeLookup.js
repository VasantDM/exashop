// Embedded fast lookup dictionary for common Indian and US postal codes
const commonPincodes = {
  // India Common PINs
  '110001': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  '110002': { city: 'Central Delhi', state: 'Delhi', country: 'India' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  '400050': { city: 'Bandra West, Mumbai', state: 'Maharashtra', country: 'India' },
  '560001': { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  '560100': { city: 'Electronic City, Bengaluru', state: 'Karnataka', country: 'India' },
  '500001': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  '500081': { city: 'HITEC City, Hyderabad', state: 'Telangana', country: 'India' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  '700001': { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  '380015': { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', country: 'India' },
  '122001': { city: 'Gurugram', state: 'Haryana', country: 'India' },
  '411001': { city: 'Pune', state: 'Maharashtra', country: 'India' },
  '682001': { city: 'Kochi', state: 'Kerala', country: 'India' },

  // US Common ZIPs
  '94105': { city: 'San Francisco', state: 'CA', country: 'United States' },
  '94102': { city: 'San Francisco', state: 'CA', country: 'United States' },
  '90210': { city: 'Beverly Hills', state: 'CA', country: 'United States' },
  '10001': { city: 'New York', state: 'NY', country: 'United States' },
  '10002': { city: 'New York', state: 'NY', country: 'United States' },
  '60601': { city: 'Chicago', state: 'IL', country: 'United States' },
  '75001': { city: 'Dallas', state: 'TX', country: 'United States' },
  '77001': { city: 'Houston', state: 'TX', country: 'United States' },
  '98101': { city: 'Seattle', state: 'WA', country: 'United States' },
  '33101': { city: 'Miami', state: 'FL', country: 'United States' },
  '02101': { city: 'Boston', state: 'MA', country: 'United States' },
};

/**
 * Lookup City and State based on entered Pincode / Postal Code.
 * Supports India (6 digits), US (5 digits), and global lookups.
 * @param {string} rawPostalCode
 * @returns {Promise<{ success: boolean, city?: string, state?: string, country?: string }>}
 */
export const lookupPincode = async (rawPostalCode) => {
  if (!rawPostalCode) return { success: false };
  const pin = rawPostalCode.toString().trim().replace(/\s+/g, '');

  if (pin.length < 3) return { success: false };

  // 1. Instant Embedded Dictionary Match
  if (commonPincodes[pin]) {
    return { success: true, ...commonPincodes[pin], source: 'cache' };
  }

  // 2. Indian 6-Digit PIN Code Public API
  if (/^\d{6}$/.test(pin)) {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          return {
            success: true,
            city: po.District || po.Block || po.Circle || po.Name,
            state: po.State,
            country: 'India',
            source: 'in_postal_api',
          };
        }
      }
    } catch (err) {
      console.warn('Postal PIN API lookup failed:', err);
    }
  }

  // 3. US 5-Digit ZIP Code via Zippopotam
  if (/^\d{5}$/.test(pin)) {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${pin}`);
      if (response.ok) {
        const data = await response.json();
        if (data?.places?.length > 0) {
          const place = data.places[0];
          return {
            success: true,
            city: place['place name'],
            state: place['state abbreviation'] || place['state'],
            country: 'United States',
            source: 'us_zip_api',
          };
        }
      }
    } catch (err) {
      console.warn('US ZIP API lookup failed:', err);
    }
  }

  return { success: false };
};

export default lookupPincode;
