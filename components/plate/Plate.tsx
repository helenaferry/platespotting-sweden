import { PlateType } from '../../types/PlateType';

export default function Plate(props: PlateType) {
  return <div className={"self-center inline-block border-2 m-2 px-4 py-2 rounded-lg " + (props.large ? 'text-plate' : 'text-2xl')}>{props && props.plateNumber ? props.plateNumber.toString().padStart(3, '0') : 'ladda om!'}</div>;
}