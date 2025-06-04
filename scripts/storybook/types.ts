export interface ComponentInfo {
  componentName: string;
  componentCode: string;
  filePath: string;
}

export interface ExampleStory {
  name: string;
  content: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
