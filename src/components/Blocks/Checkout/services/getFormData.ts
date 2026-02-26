import { FormPassengerFields } from "../components/EnhancedTravelerForm/utils/formSchema";
import { FORM_DATA_KEY } from "../constants";

const getFormData = (
  key: string
): {
  form?: FormPassengerFields;
  currentStep: number;
} => {
  const rawFormData = sessionStorage.getItem(`${FORM_DATA_KEY}-${key}`);

  if (rawFormData === null || rawFormData === undefined) {
    return { currentStep: 1 };
  }

  return JSON.parse(rawFormData) as {
    form: FormPassengerFields;
    currentStep: number;
  };
};

export default getFormData;
