import type { NextPage } from "next";
import PageTemplate from "./../components/page-template/PageTemplate";
import SpottingTable from "../components/spotting-table/SpottingTable";

const List: NextPage = () => {
  return (
    <PageTemplate>
      <SpottingTable></SpottingTable>
    </PageTemplate>
  );
};
export default List;
