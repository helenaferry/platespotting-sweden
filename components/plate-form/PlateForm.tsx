import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Plate from "./../plate/Plate";
import { LocationType } from "./../../types/LocationType";
import { useAppSelector, useAppDispatch } from "./../../hooks";
import {
  selectNextPlate,
  addNewSpotting,
  selectAllSpottings,
  updateSpotting,
} from "./../../store/spottingsSlice";
import { selectAllTeamMembers } from "./../../store/teamMemberSlice";
import dynamic from "next/dynamic";
import { TeamMemberType } from "../../types/TeamMemberType";
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { SpottingType } from "../../types/SpottingType";
import { NewOrModifiedSpottingType } from "../../types/NewOrModifiedSpottingType";

const LocationSelectorMap = dynamic(
  () => import("./../location-selector-map/LocationSelectorMap.js"),
  { ssr: false }
);

type PlateFormProps = {
  mode: "edit" | "add";
  plateNumber?: number;
};

export default function PlateForm(props: PlateFormProps) {
  const session = useSession();
  const router = useRouter();
  const todayString = getTodayString();
  const teamMembers = useAppSelector(selectAllTeamMembers);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayString);
  const [membersSeen, setMembersSeen] = useState<
    (TeamMemberType | undefined)[] | undefined
  >([]);
  const [membersSeenUpdated, setMembersSeenUpdated] = useState(false);
  const [location_lat, setLat] = useState(0);
  const [location_lng, setLng] = useState(0);
  const dispatch = useAppDispatch();
  const nextPlate = useAppSelector(selectNextPlate);
  const status = useAppSelector((state) => state.spottings.status);
  const supabase = useSupabaseClient();
  const [addSpottingStatus, setAddSpottingStatus] = useState("idle");
  const spottings = useAppSelector(selectAllSpottings);
  let editSpotting: SpottingType | undefined;

  if (props.mode == "edit" && props.plateNumber && props.plateNumber > 0) {
    editSpotting = spottings.find(
      (spotting) => spotting.plateNumber == props.plateNumber
    );
  }

  useEffect(() => {
    if (editSpotting) {
      setDate(editSpotting.dateSpotted);
      setNote(editSpotting.note);
    }
  }, [editSpotting]);

  const onChangeNote = (event: any) => {
    setNote(event.target.value);
  };

  const onChangeDate = (event: any) => {
    setDate(event.target.value);
  };

  const onChangeMembersSeen = () => {
    setMembersSeenUpdated(true);
    setMembersSeen(
      Array.from(
        document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      )
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) =>
          teamMembers.find((tm) => tm.id == parseInt(checkbox.value))
        )
    );
  };

  const onSubmit = (event: any) => {
    event.preventDefault();
    const spotting = {
      spotting: {
        plateNumber:
          props.mode === "add" ? nextPlate : editSpotting?.plateNumber,
        dateSpotted: date,
        note: note,
        profile: session?.user.id,
        location_lat: location_lat,
        location_lng: location_lng,
        teamMembers: undefined,
        id: props.mode === "add" ? undefined : editSpotting?.id,
      },
      membersSeen: membersSeenUpdated
        ? membersSeen
        : editSpotting
        ? editSpotting.teamMembers
        : [],
      membersSeenUpdated: props.mode === "add" ? false : membersSeenUpdated,
      database: supabase,
    };
    if (props.mode === "add") {
      addSpotting(spotting);
    } else if (props.mode === "edit") {
      updateThisSpotting(spotting);
    }
  };

  function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const monthString = month < 10 ? "0" + month : month;
    const dayString = day < 10 ? "0" + day : day;
    return year + "-" + monthString + "-" + dayString;
  }

  const canSave = addSpottingStatus === "idle";

  async function addSpotting(spotting: NewOrModifiedSpottingType) {
    if (canSave) {
      setAddSpottingStatus("pending");
      await dispatch(addNewSpotting(spotting));
      setAddSpottingStatus("idle");
      router.push("/list");
    }
  }

  async function updateThisSpotting(spotting: NewOrModifiedSpottingType) {
    //if (canSave) {
    //setAddSpottingStatus("pending");
    await dispatch(updateSpotting(spotting));
    //setAddSpottingStatus("idle");
    router.push("/list");
    //}
  }

  function updateLocationHandler(data: LocationType) {
    setLat(data.lat);
    setLng(data.lng);
  }

  const teamMembersSection = () => {
    return (
      <section>
        <FormControl sx={{ m: 3 }} variant="standard">
          <FormLabel>Vilka teammedlemmar såg den?</FormLabel>
          <FormGroup row>
            {teamMembers.map((teamMember) => (
              <FormControlLabel
                key={teamMember.id}
                control={
                  <Checkbox
                    value={teamMember.id}
                    onChange={onChangeMembersSeen}
                    name="membersSeen"
                    defaultChecked={
                      props.mode === "edit" &&
                      editSpotting &&
                      editSpotting.teamMembers &&
                      editSpotting.teamMembers.findIndex(
                        (tm) => tm.id == teamMember.id
                      ) > -1
                    }
                  />
                }
                label={teamMember.name}
              />
            ))}
          </FormGroup>
        </FormControl>
      </section>
    );
  };

  return status == "succeeded" && addSpottingStatus == "idle" ? (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="text-center">
        {props.mode == "add" && <p>Lägg till observation för:</p>}
        {props.mode == "edit" && <p>Redigera observation för:</p>}
        <Plate
          plateNumber={
            props.mode == "add"
              ? nextPlate
              : editSpotting
              ? editSpotting.plateNumber
              : 0
          }
          large={true}
        />
      </div>
      <TextField
        type="date"
        id="date"
        defaultValue={
          props.mode == "add" ? todayString : editSpotting?.dateSpotted
        }
        onChange={onChangeDate}
        label="Datum"
        variant="outlined"
      />
      <div>
        <p>
          Var såg du nummerplåten?
          <br />
          <small>
            Välj position på kartan. Sök fram rätt plats om kartan visar fel. Du
            kan flytta markören för att finjustera.
          </small>
        </p>
        <LocationSelectorMap
          initialPosition={
            editSpotting
              ? {
                  lat: editSpotting.location_lat,
                  lng: editSpotting.location_lng,
                }
              : null
          }
          updateLocation={updateLocationHandler}
        />
      </div>
      <div className="flex gap-8">
        <TextField
          className="flex-1"
          value={location_lat}
          label="Latitud"
          variant="outlined"
          disabled
          helperText="Uppdateras automatiskt när du väljer kartposition"
        />
        <TextField
          className="flex-1"
          value={location_lng}
          label="Longitud"
          variant="outlined"
          disabled
        />
      </div>
      <TextField
        id="note"
        onChange={onChangeNote}
        label="Anteckning"
        variant="outlined"
        multiline
        minRows={3}
        defaultValue={props.mode == "edit" ? editSpotting?.note : ""}
      />
      {teamMembers.length > 0 && teamMembersSection()}
      <Button variant="contained" type="submit" disabled={!canSave}>
        {props.mode == "add" ? "Lägg till" : "Spara ändringar"}
      </Button>
    </form>
  ) : status == "failed" ? (
    <p>Något gick fel</p>
  ) : (
    <p>Laddar...</p>
  );
}
