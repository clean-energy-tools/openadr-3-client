// Basic OpenADR 3 types for the client
// This is a simplified version for initial implementation

export interface Target {
  type: string;
  values: string[];
}

export interface Program {
  id: string;
  createdDateTime: string;
  modificationDateTime: string;
  programName: string;
  programLongName?: string;
  retailerName?: string;
  retailerLongName?: string;
  programType?: string;
  country?: string;
  principalSubdivision?: string;
  timeZoneOffset?: string;
  peakDirectionType?: string;
  programDescriptions?: any[];
  bindingEvents?: boolean;
  localPrice?: boolean;
  payloadDescriptors?: any[];
  targets?: Target[];
}

export interface ProgramRequest {
  programName: string;
  programLongName?: string;
  retailerName?: string;
  retailerLongName?: string;
  programType?: string;
  country?: string;
  principalSubdivision?: string;
  timeZoneOffset?: string;
  peakDirectionType?: string;
  programDescriptions?: any[];
  bindingEvents?: boolean;
  localPrice?: boolean;
  payloadDescriptors?: any[];
  targets?: Target[];
}

export interface Event {
  id: string;
  createdDateTime: string;
  modificationDateTime: string;
  programID: string;
  eventName: string;
  priority: number;
  targets?: Target[];
  reportDescriptors?: any[];
  payloadDescriptors?: any[];
  intervalPeriod: {
    start: string;
    duration?: string;
    randomizeStart?: string;
  };
}

export interface EventRequest {
  programID: string;
  eventName: string;
  priority: number;
  targets?: Target[];
  reportDescriptors?: any[];
  payloadDescriptors?: any[];
  intervalPeriod: {
    start: string;
    duration?: string;
    randomizeStart?: string;
  };
}

export interface Report {
  id: string;
  createdDateTime: string;
  modificationDateTime: string;
  programID: string;
  eventID?: string;
  clientName: string;
  reportName: string;
  payloadDescriptors?: any[];
  resources: any[];
}

export interface ReportRequest {
  programID: string;
  eventID?: string;
  clientName: string;
  reportName: string;
  payloadDescriptors?: any[];
  resources: any[];
}

export interface Ven {
  id: string;
  createdDateTime: string;
  modificationDateTime: string;
  venName: string;
  attributes?: any[];
  targets?: Target[];
  resources?: any[];
}

export interface VenRequest {
  venName: string;
  attributes?: any[];
  targets?: Target[];
  resources?: any[];
}

// Simple validation placeholder functions
export const Validators = {
  validateTarget: (target: any): { valid: boolean; errors?: any } => {
    if (!target || typeof target !== 'object') {
      return { valid: false, errors: ['Target must be an object'] };
    }
    if (!target.type || !target.values) {
      return { valid: false, errors: ['Target must have type and values'] };
    }
    return { valid: true };
  },

  validateProgram: (program: any): { valid: boolean; errors?: any } => {
    if (!program || typeof program !== 'object') {
      return { valid: false, errors: ['Program must be an object'] };
    }
    return { valid: true };
  },

  validateProgramRequest: (programRequest: any): { valid: boolean; errors?: any } => {
    if (!programRequest || typeof programRequest !== 'object') {
      return { valid: false, errors: ['ProgramRequest must be an object'] };
    }
    if (!programRequest.programName) {
      return { valid: false, errors: ['ProgramRequest must have programName'] };
    }
    return { valid: true };
  },

  validateEvent: (event: any): { valid: boolean; errors?: any } => {
    if (!event || typeof event !== 'object') {
      return { valid: false, errors: ['Event must be an object'] };
    }
    return { valid: true };
  },

  validateEventRequest: (eventRequest: any): { valid: boolean; errors?: any } => {
    if (!eventRequest || typeof eventRequest !== 'object') {
      return { valid: false, errors: ['EventRequest must be an object'] };
    }
    if (!eventRequest.programID || !eventRequest.eventName) {
      return { valid: false, errors: ['EventRequest must have programID and eventName'] };
    }
    return { valid: true };
  },

  validateReport: (report: any): { valid: boolean; errors?: any } => {
    if (!report || typeof report !== 'object') {
      return { valid: false, errors: ['Report must be an object'] };
    }
    return { valid: true };
  },

  validateReportRequest: (reportRequest: any): { valid: boolean; errors?: any } => {
    if (!reportRequest || typeof reportRequest !== 'object') {
      return { valid: false, errors: ['ReportRequest must be an object'] };
    }
    return { valid: true };
  },

  validateVen: (ven: any): { valid: boolean; errors?: any } => {
    if (!ven || typeof ven !== 'object') {
      return { valid: false, errors: ['Ven must be an object'] };
    }
    return { valid: true };
  },

  validateVenRequest: (venRequest: any): { valid: boolean; errors?: any } => {
    if (!venRequest || typeof venRequest !== 'object') {
      return { valid: false, errors: ['VenRequest must be an object'] };
    }
    if (!venRequest.venName) {
      return { valid: false, errors: ['VenRequest must have venName'] };
    }
    return { valid: true };
  }
};