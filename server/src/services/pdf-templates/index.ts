export type { TemplateData, QuestionData, TemplateFunction } from './types.js';
export { containsArabic, escapeHtml, prepareTemplateData } from './utils.js';
export { frenchTemplate } from './fr/template.js';
export { arabicTemplate } from './ar/template.js';

import type { TemplateFunction } from './types.js';
import { frenchTemplate } from './fr/template.js';
import { arabicTemplate } from './ar/template.js';

export function getTemplate(isArabic: boolean): TemplateFunction {
  return isArabic ? arabicTemplate : frenchTemplate;
}
