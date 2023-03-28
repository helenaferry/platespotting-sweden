import type { NextPage } from "next";
import PageTemplate from "./../components/page-template/PageTemplate";
import AllSpottings from "../components/all-spottings/AllSpottings";

const List: NextPage = () => {
  return (
    <PageTemplate>
      <AllSpottings></AllSpottings>
    </PageTemplate>
  );
};
export default List;
