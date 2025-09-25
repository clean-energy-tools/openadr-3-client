import * as Types from './openadr-types.js';
import type { OADR3Config, OAuth2Token, APIResponse } from './types.js';

export class OADR3 {
  private config: OADR3Config;
  private token: OAuth2Token | null = null;

  constructor(config: OADR3Config) {
    this.config = config;
    
    // Ensure baseUrl doesn't end with slash
    if (this.config.baseUrl.endsWith('/')) {
      this.config.baseUrl = this.config.baseUrl.slice(0, -1);
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }

    // Request new token using OAuth2 Client Credentials flow
    const tokenUrl = `${this.config.baseUrl}/auth/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      ...(this.config.scope && { scope: this.config.scope })
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`OAuth2 token request failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json() as OAuth2Token;
    
    // Calculate expiration time (subtract 30 seconds for buffer)
    tokenData.expires_at = Date.now() + (tokenData.expires_in - 30) * 1000;
    
    this.token = tokenData;
    return tokenData.access_token;
  }

  private async makeRequest<T>(
    method: string,
    path: string,
    params?: Record<string, any>,
    body?: any
  ): Promise<APIResponse<T>> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Build URL with query parameters
      let url = `${this.config.baseUrl}${path}`;
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => searchParams.append(key, String(v)));
            } else {
              searchParams.append(key, String(value));
            }
          }
        }
        url += `?${searchParams.toString()}`;
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) })
      });

      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (response.ok) {
        return {
          status: response.status,
          response: responseData as T
        };
      } else {
        return {
          status: response.status,
          problem: responseData
        };
      }
    } catch (error) {
      throw new Error(`API request failed: ${error}`);
    }
  }

  // Programs API
  async searchAllPrograms(
    targets?: Types.Target[],
    skip?: number,
    limit?: number
  ): Promise<APIResponse<Types.Program[]>> {
    // Validate inputs
    if (targets) {
      for (const target of targets) {
        const validation = Types.Validators.validateTarget(target);
        if (!validation.valid) {
          throw new Error(`Invalid target: ${JSON.stringify(validation.errors)}`);
        }
      }
    }

    if (skip !== undefined && (skip < 0 || !Number.isInteger(skip))) {
      throw new Error('Skip must be a non-negative integer');
    }

    if (limit !== undefined && (limit < 0 || limit > 50 || !Number.isInteger(limit))) {
      throw new Error('Limit must be an integer between 0 and 50');
    }

    const params: Record<string, any> = {};
    if (targets) params.targets = targets;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const result = await this.makeRequest<Types.Program[]>('GET', '/programs', params);
    
    // Validate response if successful
    if (result.response && Array.isArray(result.response)) {
      for (const program of result.response) {
        const validation = Types.Validators.validateProgram(program);
        if (!validation.valid) {
          throw new Error(`Invalid program in response: ${JSON.stringify(validation.errors)}`);
        }
      }
    }

    return result;
  }

  async createProgram(program: Types.ProgramRequest): Promise<APIResponse<Types.Program>> {
    // Validate input
    const validation = Types.Validators.validateProgramRequest(program);
    if (!validation.valid) {
      throw new Error(`Invalid program request: ${JSON.stringify(validation.errors)}`);
    }

    const result = await this.makeRequest<Types.Program>('POST', '/programs', undefined, program);
    
    // Validate response if successful
    if (result.response) {
      const responseValidation = Types.Validators.validateProgram(result.response);
      if (!responseValidation.valid) {
        throw new Error(`Invalid program in response: ${JSON.stringify(responseValidation.errors)}`);
      }
    }

    return result;
  }

  async searchProgramByProgramId(programID: string): Promise<APIResponse<Types.Program>> {
    if (!programID) {
      throw new Error('programID is required');
    }

    const result = await this.makeRequest<Types.Program>('GET', `/programs/${programID}`);
    
    // Validate response if successful
    if (result.response) {
      const validation = Types.Validators.validateProgram(result.response);
      if (!validation.valid) {
        throw new Error(`Invalid program in response: ${JSON.stringify(validation.errors)}`);
      }
    }

    return result;
  }

  async updateProgram(programID: string, program: Types.ProgramRequest): Promise<APIResponse<Types.Program>> {
    if (!programID) {
      throw new Error('programID is required');
    }

    // Validate input
    const validation = Types.Validators.validateProgramRequest(program);
    if (!validation.valid) {
      throw new Error(`Invalid program request: ${JSON.stringify(validation.errors)}`);
    }

    const result = await this.makeRequest<Types.Program>('PUT', `/programs/${programID}`, undefined, program);
    
    // Validate response if successful
    if (result.response) {
      const responseValidation = Types.Validators.validateProgram(result.response);
      if (!responseValidation.valid) {
        throw new Error(`Invalid program in response: ${JSON.stringify(responseValidation.errors)}`);
      }
    }

    return result;
  }

  async deleteProgram(programID: string): Promise<APIResponse<void>> {
    if (!programID) {
      throw new Error('programID is required');
    }

    return await this.makeRequest<void>('DELETE', `/programs/${programID}`);
  }

  // Reports API
  async searchAllReports(
    programID?: string,
    clientName?: string,
    reportRequestID?: string,
    reportSpecifierID?: string,
    skip?: number,
    limit?: number
  ): Promise<APIResponse<Types.Report[]>> {
    // Validate inputs
    if (skip !== undefined && (skip < 0 || !Number.isInteger(skip))) {
      throw new Error('Skip must be a non-negative integer');
    }

    if (limit !== undefined && (limit < 0 || limit > 50 || !Number.isInteger(limit))) {
      throw new Error('Limit must be an integer between 0 and 50');
    }

    const params: Record<string, any> = {};
    if (programID) params.programID = programID;
    if (clientName) params.clientName = clientName;
    if (reportRequestID) params.reportRequestID = reportRequestID;
    if (reportSpecifierID) params.reportSpecifierID = reportSpecifierID;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const result = await this.makeRequest<Types.Report[]>('GET', '/reports', params);
    
    // Validate response if successful
    if (result.response && Array.isArray(result.response)) {
      for (const report of result.response) {
        const validation = Types.Validators.validateReport(report);
        if (!validation.valid) {
          throw new Error(`Invalid report in response: ${JSON.stringify(validation.errors)}`);
        }
      }
    }

    return result;
  }

  async createReport(report: Types.ReportRequest): Promise<APIResponse<Types.Report>> {
    // Validate input
    const validation = Types.Validators.validateReportRequest(report);
    if (!validation.valid) {
      throw new Error(`Invalid report request: ${JSON.stringify(validation.errors)}`);
    }

    const result = await this.makeRequest<Types.Report>('POST', '/reports', undefined, report);
    
    // Validate response if successful
    if (result.response) {
      const responseValidation = Types.Validators.validateReport(result.response);
      if (!responseValidation.valid) {
        throw new Error(`Invalid report in response: ${JSON.stringify(responseValidation.errors)}`);
      }
    }

    return result;
  }

  // Events API  
  async searchAllEvents(
    programID?: string,
    targetType?: string,
    targetValues?: string[],
    skip?: number,
    limit?: number
  ): Promise<APIResponse<Types.Event[]>> {
    // Validate inputs
    if (skip !== undefined && (skip < 0 || !Number.isInteger(skip))) {
      throw new Error('Skip must be a non-negative integer');
    }

    if (limit !== undefined && (limit < 0 || limit > 50 || !Number.isInteger(limit))) {
      throw new Error('Limit must be an integer between 0 and 50');
    }

    const params: Record<string, any> = {};
    if (programID) params.programID = programID;
    if (targetType) params.targetType = targetType;
    if (targetValues) params.targetValues = targetValues;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const result = await this.makeRequest<Types.Event[]>('GET', '/events', params);
    
    // Validate response if successful
    if (result.response && Array.isArray(result.response)) {
      for (const event of result.response) {
        const validation = Types.Validators.validateEvent(event);
        if (!validation.valid) {
          throw new Error(`Invalid event in response: ${JSON.stringify(validation.errors)}`);
        }
      }
    }

    return result;
  }

  async createEvent(event: Types.EventRequest): Promise<APIResponse<Types.Event>> {
    // Validate input
    const validation = Types.Validators.validateEventRequest(event);
    if (!validation.valid) {
      throw new Error(`Invalid event request: ${JSON.stringify(validation.errors)}`);
    }

    const result = await this.makeRequest<Types.Event>('POST', '/events', undefined, event);
    
    // Validate response if successful
    if (result.response) {
      const responseValidation = Types.Validators.validateEvent(result.response);
      if (!responseValidation.valid) {
        throw new Error(`Invalid event in response: ${JSON.stringify(responseValidation.errors)}`);
      }
    }

    return result;
  }

  // VENs API
  async searchVens(
    venName?: string,
    skip?: number,
    limit?: number
  ): Promise<APIResponse<Types.Ven[]>> {
    // Validate inputs
    if (skip !== undefined && (skip < 0 || !Number.isInteger(skip))) {
      throw new Error('Skip must be a non-negative integer');
    }

    if (limit !== undefined && (limit < 0 || limit > 50 || !Number.isInteger(limit))) {
      throw new Error('Limit must be an integer between 0 and 50');
    }

    const params: Record<string, any> = {};
    if (venName) params.venName = venName;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const result = await this.makeRequest<Types.Ven[]>('GET', '/vens', params);
    
    // Validate response if successful
    if (result.response && Array.isArray(result.response)) {
      for (const ven of result.response) {
        const validation = Types.Validators.validateVen(ven);
        if (!validation.valid) {
          throw new Error(`Invalid ven in response: ${JSON.stringify(validation.errors)}`);
        }
      }
    }

    return result;
  }

  async createVen(ven: Types.VenRequest): Promise<APIResponse<Types.Ven>> {
    // Validate input
    const validation = Types.Validators.validateVenRequest(ven);
    if (!validation.valid) {
      throw new Error(`Invalid ven request: ${JSON.stringify(validation.errors)}`);
    }

    const result = await this.makeRequest<Types.Ven>('POST', '/vens', undefined, ven);
    
    // Validate response if successful
    if (result.response) {
      const responseValidation = Types.Validators.validateVen(result.response);
      if (!responseValidation.valid) {
        throw new Error(`Invalid ven in response: ${JSON.stringify(responseValidation.errors)}`);
      }
    }

    return result;
  }

  // Auth API
  async fetchToken(): Promise<APIResponse<OAuth2Token>> {
    return await this.makeRequest<OAuth2Token>('POST', '/auth/token');
  }
}