/* eslint-disable @typescript-eslint/no-explicit-any */

export const tryParseJSON = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

export const isWorkflowFormat = (firstOption: any): boolean => {
  const isWorkflow = (
    firstOption &&
    typeof firstOption === "object" &&
    "status" in firstOption &&
    "data" in firstOption
  );
  
  if (isWorkflow) {
    console.log('Detected workflow format for option:', {
      id: firstOption.id,
      status: firstOption.status,
      hasData: !!firstOption.data,
      actionName: firstOption.data?.action_name
    });
  }
  
  return isWorkflow;
};

export const isFlattenedFormat = (firstOption: any): boolean => {
  return (
    firstOption &&
    typeof firstOption === "object" &&
    "slices.0.id" in firstOption
  );
};
