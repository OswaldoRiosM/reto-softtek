import axios from "axios";
export const getLastMission = async (): Promise<string | null> => {
  try {
    const baseUrl = process.env.API_NINJAS_URL;
    const response = await axios.get(baseUrl,
      {
        headers: {
          "X-Api-Key": process.env.API_NINJAS_KEY || "",
        },
      }
    );
    console.log("Response from API Ninjas:", response.data);
    if (response.data && response.data.item) {
        return response.data.item || "Unknown mission";
      }
    return "No mission found";
    
  } catch (error) {
    console.error("Error fetching mission from API Ninjas:", error);
    return null;
  }
};
