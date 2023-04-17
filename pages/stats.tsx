import type { NextPage } from "next";
import PageTemplate from "./../components/page-template/PageTemplate";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useAppSelector, useAppDispatch } from "./../hooks";
import { selectAllSpottings, selectDaysSince } from "./../store/spottingsSlice";
import { selectAllTeamMembers } from "./../store/teamMemberSlice";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  LabelList,
} from "recharts";
import MemberBadge from "../components/member-badge/MemberBadge";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import {
  intervalToDuration,
  differenceInCalendarDays,
  addDays,
  format,
  isFuture,
} from "date-fns";

const Stats: NextPage = () => {
  const spottings = useAppSelector(selectAllSpottings);
  const daysSince = useAppSelector(selectDaysSince);
  const hasTeamMembers = useAppSelector(
    (state) => state.settings.hasTeamMembers
  );
  const colors = useAppSelector((state) => state.settings.colors);
  const dispatch = useAppDispatch();
  const supabase = useSupabaseClient();
  const teamMembers = useAppSelector(selectAllTeamMembers);

  const teamMemberData = teamMembers.map((teamMember) => {
    return {
      name: teamMember.name,
      antal: getCountForTeamMember(teamMember.id),
      color: teamMember.color,
      teamMember: teamMember,
    };
  });

  function getCountForTeamMember(id: number) {
    if (!hasTeamMembers) return;
    const hm = spottings.filter((spotting) =>
      spotting.teamMembers?.find((teamMember) => teamMember.id == id)
    );
    return hm.length;
  }

  const findsPerYear = spottings
    .map((spotting) => {
      return spotting.dateSpotted.substring(0, 4);
    })
    .reduce(function (acc: any, curr: string) {
      return (
        acc.findIndex((o: any) => o.name === curr) > -1
          ? acc[acc.findIndex((o: any) => o.name === curr)].value++
          : acc.push({ name: curr, value: 1 }),
        acc
      );
    }, []);

  const findsPerDate = spottings
    .map((spotting) => {
      return spotting.dateSpotted;
    })
    .reduce(function (acc: any, curr: string) {
      return (
        acc.findIndex((o: any) => o.date === curr) > -1
          ? acc[acc.findIndex((o: any) => o.date === curr)].count++
          : acc.push({ date: curr, count: 1 }),
        acc
      );
    }, []);

  const dayWithMostFinds = findsPerDate.reduce(
    (acc: any, curr: any) => {
      return curr.count > acc.count ? curr : acc;
    },
    { count: 0 }
  );

  const longestPeriodBetween = () => {
    const result =
      daysSince && daysSince.length > 1
        ? daysSince.reduce((a, b) => (a.daysSince > b.daysSince ? a : b))
        : null;
    return result ? result.daysSince : "N/A";
  };

  const shortestPeriodBetween = () => {
    const result =
      daysSince && daysSince.length > 1
        ? daysSince
            .filter((d) => d.daysSince >= 0)
            .reduce((a, b) => (a.daysSince < b.daysSince ? a : b))
        : null;
    return result ? result.daysSince : "N/A";
  };

  const totalDuration = () => {
    const first = spottings[spottings.length - 1];
    if (!first) {
      return "n/a";
    }
    const duration = intervalToDuration({
      start: new Date(first.dateSpotted),
      end: new Date(),
    });

    return durationToString(duration);
  };

  const durationToString = (duration: Duration) => {
    let durationArray: string[] = [];
    if (duration.years && duration.years > 0) {
      durationArray.push(duration.years + " år");
    }
    if (duration.months && duration.months > 0) {
      durationArray.push(duration.months + " månader");
    }
    if (duration.days && duration.days > 0) {
      durationArray.push(duration.days + " dagar");
    }
    let durationString: string = "";
    durationArray.map((a, index) => {
      if (durationArray.length > 1 && index == durationArray.length - 1) {
        durationString += " och ";
      }
      durationString += a;
      if (durationArray.length > 2 && index < durationArray.length - 2) {
        durationString += ", ";
      }
    });
    return durationString;
  };

  const totalDurationInDays = () => {
    const first = spottings[spottings.length - 1];
    if (!first) return -1;
    const result = differenceInCalendarDays(
      new Date(),
      new Date(first.dateSpotted)
    );
    return result ? result : -1;
  };

  const percentDone = () => {
    const result = Math.round((spottings.length / 999) * 100);
    return result ? result : 0;
  };

  const daysLeft = () => {
    const daysPassed: number = totalDurationInDays();
    const donePercent: number = percentDone();
    if (daysPassed < 0 || donePercent <= 0) return -1;
    const result = Math.round((daysPassed / donePercent) * (100 - donePercent));
    return result ? result : -1;
  };

  const projectedFinishDate = () => {
    const daysToGo: number = daysLeft();
    if (daysToGo < 0) return "n/a";
    const date = addDays(new Date(), daysToGo);
    return date ? format(date, "yyy-MM-dd") : "";
  };

  const projectedFinishDuration = () => {
    const finishDateString = projectedFinishDate();
    const finishDate = new Date(finishDateString);
    if (!finishDate || !isFuture(finishDate)) return "";
    const duration = intervalToDuration({
      start: new Date(),
      end: finishDate,
    });
    return durationToString(duration);
  };

  return (
    <PageTemplate>
      {spottings.length > 1 ? (
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <Typography variant="h2">Tidsåtgång</Typography>
            <p>
              {hasTeamMembers ? "Ni" : "Du"} har letat i {totalDuration()}.
            </p>
            <p>Antal dagar med fynd: {findsPerDate.length}</p>
            {spottings.length > 4 ? (
              <>
                <p>
                  {hasTeamMembers ? "Ni" : "Du"} är {percentDone()}% klar
                  {hasTeamMembers ? "a" : ""}.
                </p>

                <p>
                  Fortsätter {hasTeamMembers ? "ni" : "du"} i samma takt
                  återstår {projectedFinishDuration()}.
                </p>
                <p>
                  Då är {hasTeamMembers ? "ni" : "du"} färdig
                  {hasTeamMembers ? "a" : ""} {projectedFinishDate()}.
                </p>
              </>
            ) : (
              <p className="italic">
                Statistik för beräknat slutdatum m.m. kommer vid 5 fynd.
              </p>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h2">Tid till fynd</Typography>
            <p>Kortaste tid till fynd: {shortestPeriodBetween()} dagar</p>
            <p>Längsta tid till fynd: {longestPeriodBetween()} dagar</p>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h2">Bästa dagen</Typography>
            <p>
              Flest fynd på samma dag: {dayWithMostFinds.count} fynd{" "}
              {dayWithMostFinds.date}{" "}
            </p>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h2">Fynd per år</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>År</TableCell>
                        <TableCell>Antal fynd</TableCell>
                        <TableCell>Andel fynd</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {findsPerYear.map((fpy: any) => (
                        <TableRow key={fpy.name}>
                          <TableCell>{fpy.name}</TableCell>
                          <TableCell>{fpy.value}</TableCell>
                          <TableCell>
                            {fpy.value &&
                              Math.round(100 * (fpy.value / spottings.length))}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={findsPerYear}
                        fill="#8884d8"
                        label
                        isAnimationActive={true}
                      >
                        {findsPerYear.map((find: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                          ></Cell>
                        ))}
                      </Pie>
                      <Legend></Legend>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Grid>
            </Grid>
          </Grid>

          {hasTeamMembers && (
            <Grid item xs={12}>
              <Typography variant="h2">Teamstatistik</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell colSpan={2}>Teammedlem</TableCell>
                          <TableCell>Antal sedda</TableCell>
                          <TableCell>Andel sedda</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teamMemberData.map((tmd) => (
                          <TableRow key={tmd.name}>
                            <TableCell>
                              <MemberBadge
                                name={tmd.name}
                                color={tmd.color}
                                id={tmd.teamMember.id}
                                profile={tmd.teamMember.profile}
                              />
                            </TableCell>
                            <TableCell>{tmd.name}</TableCell>
                            <TableCell>{tmd.antal}</TableCell>
                            <TableCell>
                              {tmd.antal &&
                                Math.round(
                                  100 * (tmd.antal / spottings.length)
                                )}
                              %
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart width={730} height={250} data={teamMemberData}>
                        <XAxis dataKey="name" />
                        <YAxis>
                          <Label angle={-90}>Antal sedda</Label>
                        </YAxis>
                        <Tooltip />
                        <Bar dataKey="antal">
                          {teamMemberData.map((teamMember, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={teamMember.color}
                            />
                          ))}
                          <LabelList dataKey="antal" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      ) : (
        <p>Statistiken blir tillgänglig när du gjort mer än ett fynd</p>
      )}
    </PageTemplate>
  );
};
export default Stats;
