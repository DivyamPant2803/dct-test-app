// Utility to generate mock details for an entity and combination

export interface EntityDetails {
  output: 'OK' | 'OKC' | 'NOK';
  legalBusinessRequirements: string;
  endUserActions: string;
  remediation: string;
  contactPerson: string;
  dateGenerated: string;
  versionDate: string;
}

export interface Combination {
  infoCategory?: string;
  dataSubjectType?: string;
  recipientType?: string;
}

// Simple deterministic hash for demo
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getMockEntityDetails(entity: string, combination: Combination): EntityDetails {
  const types: EntityDetails['output'][] = ['OK', 'OKC', 'NOK'];
  const key = entity + (combination.infoCategory || '') + (combination.dataSubjectType || '') + (combination.recipientType || '');
  const output = types[hashString(key) % 3];

  // Generate more detailed, varied mock content
  const legalBusinessRequirements = output === 'OKC'
    ? `For entity "${entity}" and combination [${Object.values(combination).filter(Boolean).join(', ')}], you must fulfill the following legal/business requirements:

- Ensure all data transfer agreements are in place and reviewed by the legal team.
- Conduct a Data Protection Impact Assessment (DPIA) specific to the transfer scenario.
- Obtain explicit consent from the data subject(s) if required by local regulations.
- Ensure that the recipient has adequate safeguards in place, such as Standard Contractual Clauses (SCCs) or Binding Corporate Rules (BCRs).
- Maintain a record of processing activities for this transfer.
- Consult with the Data Protection Officer (DPO) for any cross-border transfer concerns.
`
    : '';

  const endUserActions = output === 'NOK'
    ? `No end user actions are allowed for this transfer scenario. Please review the compliance status and consult with your compliance team for further guidance.`
    : `For entity "${entity}" and combination [${Object.values(combination).filter(Boolean).join(', ')}], the following end user actions are required:

- Review the data transfer details and confirm the accuracy of the information provided.
- Acknowledge the legal/business requirements and confirm that all necessary steps have been taken.
- If you are the data owner, ensure that all stakeholders have been notified.
- Complete the end user attestation form and submit it to the compliance team.
- If any issues are identified, escalate to the DPO or legal team immediately.
`;

  const remediation = output === 'NOK'
    ? `Remediation required: Data transfer is not allowed for entity "${entity}" and combination [${Object.values(combination).filter(Boolean).join(', ')}].

- Review the reasons for non-compliance and address any outstanding legal or technical requirements.
- Update the data transfer documentation and resubmit for approval.
- If the transfer is urgent, seek an exception from the DPO or legal team, providing justification and risk assessment.
- Document all remediation steps taken and retain for audit purposes.
`
    : '';

  return {
    output,
    legalBusinessRequirements,
    endUserActions,
    remediation,
    contactPerson: 'John Doe',
    dateGenerated: '2024-06-01',
    versionDate: '2024-06-02',
  };
} 