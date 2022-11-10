import { TeamMemberType } from '../../types/TeamMemberType';

export default function MemberBadge(props: TeamMemberType) {
  const backgroundStyle={
    backgroundColor: props.color,
    color: wc_hex_is_light(props.color) ? '#000000' : '#FFFFFF'
  }
  function wc_hex_is_light(color: string) {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 155;
}
  return <div style={backgroundStyle} className="inline-flex justify-center border w-6 h-6 rounded-full text-center font-bold text-sm" title={props.name}><span>{props.name[0]}</span></div>;
}