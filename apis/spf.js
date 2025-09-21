const API_KEY = 'v2:076ed481f69bc648032716591536f265d302c7c8198128e27f1b4b8e375e9796:758NBzZcfJETdme2pyqU1y1DSfOmdzbK'; 

// Fetches SPF (Singapore Police Force) station locations using a two-step process
export const getSpfStations = async () => {
  try {
    console.log('Starting API fetch...');
    
    // Step 1: Get the temporary download URL for the GeoJSON
    const metaRes = await fetch(
      `https://api-open.data.gov.sg/v1/public/api/datasets/d_c69e6d27d72f765fabfbeea362299378/poll-download?api-key=${API_KEY}`
    );

    // If metadata fetch fails, log the error and return an empty array
    if (!metaRes.ok) {
      console.error('Meta API request failed:', metaRes.status, metaRes.statusText);
      return [];
    }

    // Parse metadata JSON
    const metaJson = await metaRes.json();
    console.log('Meta response:', metaJson);
    
    // Extract the temporary GeoJSON download URL
    const geoJsonUrl = metaJson?.data?.url;

    // If the URL is missing, log and exit early
    if (!geoJsonUrl) {
      console.error('GeoJSON download URL not found. Meta response:', metaJson);
      return [];
    }

    // Step 2: Use the download URL to fetch the actual GeoJSON data
    console.log('Fetching GeoJSON from:', geoJsonUrl);
    const geoRes = await fetch(geoJsonUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, application/geo+json, */*',
        'Cache-Control': 'no-cache',
      },
      mode: 'cors', 
    });
    
    // If GeoJSON fetch fails, log status and error body, then return empty
    if (!geoRes.ok) {
      console.error('GeoJSON request failed:', geoRes.status, geoRes.statusText);
      const errorText = await geoRes.text().catch(() => 'Could not read error response');
      console.error('Error response:', errorText);
      return [];
    }

    // Read raw response text
    const responseText = await geoRes.text();
    console.log('Raw response length:', responseText.length);
    console.log('Response preview:', responseText.substring(0, 200) + '...');
    
    // Parse JSON and extract features
    const geoJson = JSON.parse(responseText);
    console.log('GeoJSON response sample:', {
      type: geoJson.type,
      featuresCount: geoJson?.features?.length,
      firstFeature: geoJson?.features?.[0]
    });

    // Return array of station features, or empty array if not available
    return geoJson?.features || [];
  } catch (err) {
     // Catch-all error handler
    console.error('Failed to fetch SPF station data:', err);
    return [];
  }
};