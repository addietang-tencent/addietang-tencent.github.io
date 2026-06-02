/**
 * @/types/api - 通用 API 类型声明
 * 为 Security 模块提供类型支持
 */

export interface RuleSetResponse {
  RuleSetId?: string;
  RuleSetName?: string;
  Rules?: any[];
  [key: string]: any;
}

export interface CreateRuleSetParams {
  RuleSetName: string;
  [key: string]: any;
}

export interface CreateRuleSetResponse {
  RuleSetId?: string;
  [key: string]: any;
}

export interface UpdateRuleSetRulesParams {
  RuleSetId: string;
  Rules: any[];
  [key: string]: any;
}

export interface UpdateRuleSetRulesResponse {
  [key: string]: any;
}

export interface ImportRulesFromSgParams {
  SecurityGroupId: string;
  [key: string]: any;
}

export interface ImportRulesFromSgResponse {
  [key: string]: any;
}
