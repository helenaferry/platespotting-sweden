import { TeamMemberType } from "./TeamMemberType";

export type SpottingType = {
  id: number | undefined;
  plateNumber: number | undefined;
  location_lat: number;
  location_lng: number;
  dateSpotted: string;
  note: string;
  profile: string | undefined;
  teamMembers: TeamMemberType[] | undefined;
};
