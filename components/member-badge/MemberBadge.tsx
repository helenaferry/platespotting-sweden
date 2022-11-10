import { TeamMemberType } from '../../types/TeamMemberType';

export default function MemberBadge(props: TeamMemberType) {
  return <div className="inline-block rounded bg-[#1da1f2] text-white">{props.name[0]}</div>;
}