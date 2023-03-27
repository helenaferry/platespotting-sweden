import { SpottingType } from "./SpottingType";
import { TeamMemberType } from "./TeamMemberType";

export type NewOrModifiedSpottingType = {
  spotting: SpottingType;
  membersSeen: (TeamMemberType | undefined)[];
  membersSeenUpdated: boolean;
  database: any;
};
