import { FORM_DATA_KEY } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setFormData = (formData: any, checkoutId: string) => {
  sessionStorage.setItem(
    `${FORM_DATA_KEY}-${checkoutId}`,
    JSON.stringify(formData)
  );
};

export default setFormData;
