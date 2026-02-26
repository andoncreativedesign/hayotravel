import { FORM_DATA_KEY } from "../constants";

const clearFormData = (key: string) => {
  sessionStorage.removeItem(`${FORM_DATA_KEY}-${key}`);
};

export default clearFormData;
