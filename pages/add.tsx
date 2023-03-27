import type { NextPage } from "next";
import PageTemplate from "./../components/page-template/PageTemplate";
import PlateForm from "./../components/plate-form/PlateForm";

const Add: NextPage = () => {
  return (
    <div>
      <PageTemplate>
        <PlateForm mode="add" />
      </PageTemplate>
    </div>
  );
};
export default Add;
