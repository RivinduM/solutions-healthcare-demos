export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Reference {
  reference?: string;
}

export interface Attachment {
  contentType?: string;
  language?: string;
  title?: string;
  url?: string;
}

export interface DiagnosticReport {
  resourceType: "DiagnosticReport";
  id?: string;
  status?: string;
  category?: Array<{ coding?: Coding[] }>;
  code?: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  issued?: string;
  result?: Reference[];
  presentedForm?: Attachment[];
  conclusion?: string;
}
