import type { NextPage } from "next";
import { useRouter } from "next/router";
import PageTemplate from "../../components/page-template/PageTemplate";
import PlateForm from "../../components/plate-form/PlateForm";

const Edit: NextPage = () => {
  const router = useRouter();
  const { plateNumber } = router.query;

  return (
    <div>
      <PageTemplate>
        <PlateForm mode="edit" plateNumber={parseInt(plateNumber + "")} />
      </PageTemplate>
    </div>
  );
};
export default Edit;
