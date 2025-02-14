export const blocksWithoutProfile = [
  'Block',
  'CVS',
  'CVType',
  'CommunicationType',
  'CompanyType',
  'Content',
  'ContentType',
  'DocumentType',
  'EditProgress',
  'EntityBlock',
  'EntityType',
  'Field',
  'Format',
  'Frequency',
  'InterviewType',
  'JaCommunication',
  'JobSitePricings',
  'LanguageLevel',
  'Link',
  'LinkDestination',
  'Message',
  'MessageType',
  'PasswordResetToken',
  'Permission',
  'PermissionRole',
  'PermissionType',
  'PlacementType',
  'PricingType',
  'Priority',
  'ProfessionPrice',
  'Rate',
  'Salary',
  'SalaryType',
  'Shift',
  'SmtpSettings',
  'Status',
  'Step',
  'TalentPrice',
  'TalentProfession',
  'TalentRate',
  'Token',
  'Currency',
];

export const createModelForURL = (model: string): string => {
  const dashedModel = model.replace(/([a-z])([A-Z])/g, '$1-$2');

  if (dashedModel.endsWith('y')) {
    return dashedModel.slice(0, -1) + 'ies';
  }

  if (dashedModel.endsWith('s')) {
    return dashedModel;
  }

  return dashedModel + 's';
};
