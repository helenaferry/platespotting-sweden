import { TeamMemberType } from './TeamMemberType'

export type SpottingType = {
    plateNumber: number,
    location_lat: number,
    location_lng: number,
    dateSpotted: string,
    note: string,
    profile: string | undefined,
    spottingTeamMembers: SpottingTeamMembersType[] | null
}

type SpottingTeamMembersType = {
    teamMembers: TeamMemberType
}