import type { NextPage } from "next";
import { useRouter } from "next/router";
import PageTemplate from "../../components/page-template/PageTemplate";
import PlateForm from "../../components/plate-form/PlateForm";
import { useAppSelector } from "./../../hooks";
import { selectAllSpottings } from "./../../store/spottingsSlice";

const Edit: NextPage = () => {
  const router = useRouter();
  const { plateNumber } = router.query;
  const spottings = useAppSelector(selectAllSpottings);
  return (
    <PageTemplate>
      {spottings.find((spotting) => spotting.plateNumber == plateNumber) && (
        <PlateForm mode="edit" plateNumber={parseInt(plateNumber + "")} />
      )}
    </PageTemplate>
  );
};

export default Edit;
