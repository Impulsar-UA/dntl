// TypeScript types mirroring the backend DTOs (backend/Donatly.Application/DTOs).
// Keep these in sync with the C# records.

/** Role discriminator returned by the API (UserMapper.ToDto). */
export type UserType = 'Admin' | 'OrganizationRep' | 'Donor' | 'User';

/** Mirrors UserDto. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  userType: UserType;
}

/** Mirrors LoginDto. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors RegisterOrgRepDto. */
export interface RegisterOrgRepRequest {
  email: string;
  password: string;
  displayName: string;
  orgRegistryCode: string;
  contactPhone: string;
}

/** Mirrors RegisterAdminDto. */
export interface RegisterAdminRequest {
  email: string;
  password: string;
  displayName: string;
}

/** Roles selectable during web registration (donors register in the mobile app). */
export type RegistrableRole = 'Admin' | 'OrganizationRep';

/** Initiative lifecycle status (Donalty.Core.Domain.Enums.InitiativeStatus). */
export type InitiativeStatus = 'Pending' | 'Active' | 'Completed' | 'Rejected';

/** Mirrors InitiativeDto. */
export interface Initiative {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  progressPercentage: number;
  deadline: string; // ISO date string
  status: InitiativeStatus;
  isGovernmentSupported: boolean;
  organizationRepId: string;
}

/** Mirrors CreateInitiativeDto. */
export interface CreateInitiativeRequest {
  title: string;
  description: string;
  targetAmount: number;
  deadline: string;
  organizationRepId: string;
}

/** Mirrors UpdateInitiativeDto. */
export interface UpdateInitiativeRequest {
  title: string;
  description: string;
  targetAmount: number;
  deadline: string;
  status: InitiativeStatus;
  isGovernmentSupported: boolean;
}

/** Petition lifecycle status (Donalty.Core.Domain.Enums.PetitionStatus). */
export type PetitionStatus = 'Draft' | 'Active' | 'Successful' | 'Closed';

/** Mirrors PetitionDto. */
export interface Petition {
  id: string;
  title: string;
  body: string;
  targetVotes: number;
  currentVotes: number;
  deadline: string;
  status: PetitionStatus;
}

/** Mirrors CreatePetitionDto. */
export interface CreatePetitionRequest {
  title: string;
  body: string;
  targetVotes: number;
  deadline: string;
}

/** Mirrors UpdatePetitionDto. */
export interface UpdatePetitionRequest {
  title: string;
  body: string;
  targetVotes: number;
  deadline: string;
  status: PetitionStatus;
}
