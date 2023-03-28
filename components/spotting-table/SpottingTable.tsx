import { useAppSelector } from "./../../hooks";
import { useState } from "react";
import { selectAllSpottings } from "./../../store/spottingsSlice";
import classNames from "classnames";
import Plate from "./../plate/Plate";
import MemberBadge from "./../member-badge/MemberBadge";
import AvatarGroup from "@mui/material/AvatarGroup";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
const SpottingTable = () => {
  const spottings = useAppSelector(selectAllSpottings);
  const hasTeamMembers = useAppSelector(
    (state) => state.settings.hasTeamMembers
  );
  const [expanded, setExpanded] = useState(() => new Set());

  const handleChange =
    (accordion: string) =>
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      if (isExpanded) {
        addToExpanded(accordion);
      } else {
        removeFromExpanded(accordion);
      }
    };

  function addToExpanded(accordion: string) {
    setExpanded((prev) => new Set(prev).add(accordion));
  }

  function removeFromExpanded(accordion: string) {
    setExpanded((prev) => {
      const newExpanded = new Set(prev);
      newExpanded.delete(accordion);
      return newExpanded;
    });
  }

  function expandAll() {
    let newExpanded = new Set();
    spottings.map((spotting) =>
      newExpanded.add("accordion" + spotting.plateNumber)
    );
    setExpanded(newExpanded);
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  function dayDiff(date1: string, date2: string) {
    let d1: Date = new Date(date1);
    let d2: Date = new Date(date2);
    let timeInMillisec: number = d1.getTime() - d2.getTime();
    let daysBetweenDates: number = Math.ceil(
      timeInMillisec / (1000 * 60 * 60 * 24)
    );
    let dayOrDays = daysBetweenDates === 1 ? " dag" : " dagar";
    return daysBetweenDates + dayOrDays;
  }

  return (
    <div>
      <p className="text-right">
        <Button
          onClick={collapseAll}
          className="normal-case font-normal text-xs"
          disabled={expanded.size === 0}
        >
          <ExpandLessIcon /> Fäll ihop alla
        </Button>
        <Button
          onClick={expandAll}
          className="normal-case font-normal text-xs"
          disabled={expanded.size === spottings.length}
        >
          Expandera alla
          <ExpandMoreIcon />
        </Button>
      </p>
      {spottings.map((spotting, index) => {
        return (
          <Accordion
            key={spotting.plateNumber}
            expanded={expanded.has("accordion" + spotting.plateNumber)}
            onChange={handleChange("accordion" + spotting.plateNumber)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`accordion-${spotting.plateNumber}-content`}
              id={`accordion-${spotting.plateNumber}-header`}
            >
              <div
                className={classNames(
                  "w-full",
                  "grid",
                  "items-center",
                  "grid-cols-3",
                  "md:grid-cols-4",
                  "md:grid-rows-1",
                  "gap-1",
                  {
                    "grid-rows-2": hasTeamMembers,
                    "grid-rows-1": !hasTeamMembers,
                  }
                )}
              >
                <div
                  className={classNames("m:row-span-1", {
                    "row-span-2": hasTeamMembers,
                    "row-span-1": !hasTeamMembers,
                  })}
                >
                  <Plate plateNumber={spotting.plateNumber} large={false} />
                </div>
                <div>{spotting.dateSpotted} </div>
                <div>
                  {index >= 0 &&
                    index < spottings.length - 1 &&
                    dayDiff(
                      spotting.dateSpotted,
                      spottings[index + 1].dateSpotted
                    )}
                </div>
                <div>
                  {hasTeamMembers && (
                    <AvatarGroup max={5} className="!justify-end">
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
                  )}
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div>[karta]</div>
              <div className="break-all">Anteckning: {spotting.note}</div>
              <div>
                <IconButton href={"/edit/" + spotting.plateNumber}>
                  <EditIcon className="pointer-events-none" />
                </IconButton>
              </div>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

export default SpottingTable;
