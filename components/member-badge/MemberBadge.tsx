import { TeamMemberType } from '../../types/TeamMemberType';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

export default function MemberBadge(props: TeamMemberType) {
  const backgroundStyle = {
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
  return <Tooltip title={props.name}><Avatar
    key={props.id}
    sx={{ color: wc_hex_is_light(props.color) ? '#000000' : '#FFFFFF', bgcolor: props.color, width: 24, height: 24 }}>
    {props.name[0]}
  </Avatar></Tooltip>

  // <div style={backgroundStyle} className="inline-flex justify-center border w-6 h-6 rounded-full text-center font-bold text-sm" title={props.name}><span>{props.name[0]}</span></div>;
}