import { useAppSelector } from "./../../hooks";
import { selectAllSpottings } from "./../../store/spottingsSlice";
import Plate from "./../plate/Plate";
import MemberBadge from "./../member-badge/MemberBadge";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import AvatarGroup from "@mui/material/AvatarGroup";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";

const SpottingTable = () => {
  const spottings = useAppSelector(selectAllSpottings);
  const hasTeamMembers = useAppSelector(
    (state) => state.settings.hasTeamMembers
  );

  function dayDiff(date1: string, date2: string) {
    let d1: Date = new Date(date1);
    let d2: Date = new Date(date2);
    let timeInMillisec: number = d1.getTime() - d2.getTime();
    let daysBetweenDates: number = Math.ceil(
      timeInMillisec / (1000 * 60 * 60 * 24)
    );
    return daysBetweenDates;
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table" padding="none">
        <TableHead>
          <TableRow>
            <TableCell>Nummerplåt</TableCell>
            <TableCell>Datum</TableCell>
            <TableCell>Dagar</TableCell>
            {hasTeamMembers && (
              <TableCell align="center">Teammedlemmar</TableCell>
            )}
            <TableCell>Anteckning</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spottings.map((spotting, index) => {
            return (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <Plate plateNumber={spotting.plateNumber} large={false} />
                </TableCell>
                <TableCell>{spotting.dateSpotted}</TableCell>
                <TableCell>
                  {index >= 0 &&
                    index < spottings.length - 1 &&
                    dayDiff(
                      spotting.dateSpotted,
                      spottings[index + 1].dateSpotted
                    )}
                </TableCell>
                {hasTeamMembers && (
                  <TableCell>
                    <AvatarGroup max={5}>
                      {spotting.teamMembers &&
                        spotting.teamMembers
                          // .sort((a, b) => a.id - b.id)
                          .map((tm) => (
                            <MemberBadge
                              key={tm.id}
                              id={tm.id}
                              name={tm.name}
                              color={tm.color}
                              profile={undefined}
                            />
                          ))}
                    </AvatarGroup>
                  </TableCell>
                )}
                <TableCell className={"w-48"}>{spotting.note}</TableCell>
                <TableCell align="right" className="pr-2">
                  <IconButton href={"/edit/" + spotting.plateNumber}>
                    <EditIcon className="pointer-events-none" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SpottingTable;
