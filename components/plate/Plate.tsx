import { PlateType } from '../../types/PlateType';

export default function Plate(props: PlateType) {
  return <div className="inline-block border-2 m-2 py-1 px-2 rounded text-2xl">{props && props.plateNumber ? props.plateNumber.toString().padStart(3, '0') : 'ladda om!'}</div>;
}