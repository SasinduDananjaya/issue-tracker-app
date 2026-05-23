export interface User {
  uuid: string;
  name: string;
  email: string;
  organizationCode: string;
  isOrgOwner: boolean;
  createdAt?: string;
}
