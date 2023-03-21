import type { NextPage } from "next";
import PageTemplate from "./../components/page-template/PageTemplate";
import dynamic from "next/dynamic";
const MarkerMap = dynamic(
  () => import("./../components/marker-map/MarkerMap.js"),
  { ssr: false }
);

const Map: NextPage = () => {
  return (
    <PageTemplate>
      <MarkerMap />
    </PageTemplate>
  );
};
export default Map;
