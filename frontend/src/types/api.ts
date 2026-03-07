export type DetectionResult = {
  label: string;
  confidence: number;
};

export type RecyclabilityResult = {
  is_recyclable: boolean;
  explanation: string;
};

export type APIResponse = {
  success: boolean;
  result: DetectionResult & RecyclabilityResult;
};

