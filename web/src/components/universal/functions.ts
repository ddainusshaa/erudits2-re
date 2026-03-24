import { constants } from "../../constants";

export const getCurrentUser = async () => {
  if (!localStorage.getItem(constants.localStorage.TOKEN)) {
    return false;
  }
  try {
    const response = await fetch(`${constants.baseApiUrl}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return false;
  }
};

export const formatText = (text: string, maxLength: number) => {
  if (text) {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }
  return "";
};
