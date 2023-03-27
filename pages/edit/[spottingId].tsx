import type { NextPage } from "next";
import { useRouter } from "next/router";
import PageTemplate from "../../components/page-template/PageTemplate";
import AddForm from "../../components/add-form/AddForm";

const Edit: NextPage = () => {
  const router = useRouter();
  const { spottingId } = router.query;
  return (
    <div>
      <PageTemplate>Edit edit edit {spottingId}</PageTemplate>
    </div>
  );
};
export default Edit;
