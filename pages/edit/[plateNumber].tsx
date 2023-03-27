import type { NextPage } from "next";
import { useRouter } from "next/router";
import PageTemplate from "../../components/page-template/PageTemplate";
import AddForm from "../../components/add-form/AddForm";

import { selectAllSpottings } from "../../store/spottingsSlice";
import { useAppSelector, useAppDispatch } from "../../hooks";

const Edit: NextPage = () => {
  const router = useRouter();
  const { plateNumber } = router.query;

  const spottings = useAppSelector(selectAllSpottings);
  const spotting = spottings.find(
    (spotting) => spotting.plateNumber == parseInt(plateNumber + "")
  );
  return (
    <div>
      <PageTemplate>
        Edit edit edit {plateNumber} {spotting && spotting.plateNumber}
      </PageTemplate>
    </div>
  );
};
export default Edit;
