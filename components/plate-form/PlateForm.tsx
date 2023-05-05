import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import Plate from "./../plate/Plate";
import { LocationType } from "./../../types/LocationType";
import { useAppSelector, useAppDispatch } from "./../../hooks";
import {
  selectNextPlate,
  addNewSpotting,
  selectAllSpottings,
  updateSpotting,
  deleteSpotting,
} from "./../../store/spottingsSlice";
import { selectAllTeamMembers } from "./../../store/teamMemberSlice";
import dynamic from "next/dynamic";
import { TeamMemberType } from "../../types/TeamMemberType";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateValidationError } from "@mui/x-date-pickers/models";
import { SpottingType } from "../../types/SpottingType";
import { NewOrModifiedSpottingType } from "../../types/NewOrModifiedSpottingType";
import { format } from "date-fns";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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
  const todayString = format(new Date(), "yyyy-MM-dd");
  const teamMembers = useAppSelector(selectAllTeamMembers);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayString);
  const [membersSeen, setMembersSeen] = useState<
    (TeamMemberType | undefined)[] | undefined
  >([]);
  const [membersSeenUpdated, setMembersSeenUpdated] = useState(false);
  const [dateValid, setDateValid] = useState(true);
  const [location_lat, setLat] = useState(0);
  const [location_lng, setLng] = useState(0);
  const dispatch = useAppDispatch();
  const nextPlate = useAppSelector(selectNextPlate);
  const status = useAppSelector((state) => state.spottings.status);
  const supabase = useSupabaseClient();
  const [addSpottingStatus, setAddSpottingStatus] = useState("idle");
  const spottings = useAppSelector(selectAllSpottings);
  let editSpotting: SpottingType | undefined;
  let previousSpotting: SpottingType | undefined;
  let nextSpotting: SpottingType | undefined;
  const [error, setError] = useState<DateValidationError | null>(null);
  const datePickerRef = useRef(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  if (props.mode == "edit" && props.plateNumber && props.plateNumber > 0) {
    editSpotting = spottings.find(
      (spotting) => spotting.plateNumber == props.plateNumber
    );
    if (props.plateNumber > 1) {
      previousSpotting = spottings.find(
        (spotting) => spotting.plateNumber == (props.plateNumber || 1) - 1
      );
    }
  } else if (props.mode == "add") {
    previousSpotting = spottings.find(
      (spotting) => spotting.plateNumber == nextPlate - 1
    );
  }

  if (props.plateNumber && props.plateNumber < spottings.length) {
    nextSpotting = spottings.find(
      (spotting) => spotting.plateNumber == (props.plateNumber || 1) + 1
    );
  }

  useEffect(() => {
    if (editSpotting) {
      setDate(editSpotting.dateSpotted);
      setNote(editSpotting.note);
    }
  }, [editSpotting]);

  const onChangeDate = (value: Date | null, context: any) => {
    if (context.validationError || !value) {
      setDateValid(false);
      return;
    } else {
      setDateValid(true);
    }
    setDate(format(value, "yyyy-MM-dd"));
  };

  const errorMessage = useMemo(() => {
    switch (error) {
      case "maxDate": {
        return "Datumet kan inte vara efter att du såg nästa nummerskylt.";
      }
      case "minDate": {
        return "Datumet kan inte vara innan du såg den förra nummerskylten.";
      }
      case "disableFuture": {
        return "Datumet kan inte vara i framtiden.";
      }
      case "invalidDate": {
        return "Ogiltigt datum";
      }

      default: {
        return "";
      }
    }
  }, [error]);

  const onChangeNote = (event: any) => {
    console.log(datePickerRef.current);
    setNote(event.target.value);
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

  const canSave = addSpottingStatus === "idle";

  async function addSpotting(spotting: NewOrModifiedSpottingType) {
    if (canSave && dateValid) {
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

  const onOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const onCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  async function onDeleteSpotting() {
    if (!editSpotting || editSpotting.plateNumber != nextPlate - 1) {
      console.log("Kan ej ta bort");
      return;
    }
    const spotting = {
      spotting: editSpotting,
      database: supabase,
      membersSeenUpdated: false,
      membersSeen: [],
    };
    await dispatch(deleteSpotting(spotting));
    router.push("/list");
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
    <Box component="form" onSubmit={onSubmit} className="flex flex-col gap-8">
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
      <DatePicker
        ref={datePickerRef}
        format="yyyy-MM-dd"
        onChange={onChangeDate}
        label="Datum"
        disableFuture
        defaultValue={
          props.mode == "add"
            ? new Date(todayString)
            : editSpotting && new Date(editSpotting?.dateSpotted)
        }
        minDate={previousSpotting && new Date(previousSpotting.dateSpotted)}
        maxDate={nextSpotting && new Date(nextSpotting.dateSpotted)}
        onError={(newError) => setError(newError)}
        slotProps={{
          textField: {
            helperText: errorMessage,
          },
        }}
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
      <Button
        variant="contained"
        type="submit"
        disabled={!canSave || !dateValid}
      >
        {props.mode == "add" ? "Lägg till" : "Spara ändringar"}
      </Button>
      {props.mode == "edit" && editSpotting?.plateNumber == nextPlate - 1 && (
        <div className="flex flex-col">
          <Button
            variant="outlined"
            type="button"
            color="error"
            onClick={onOpenDeleteConfirm}
          >
            <DeleteIcon fontSize="small" className="mr-1" /> Ta bort denna
            observation
          </Button>
          <p className="my-2 italic text-sm">
            Obs! Det går endast att ta bort den senast tillagda observationen.
          </p>
          <Dialog
            open={deleteConfirmOpen}
            onClose={onCloseDeleteConfirm}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Vill du verkligen ta bort observationen för nummerplåten?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Du kan inte ångra detta.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={onCloseDeleteConfirm}>Avbryt</Button>
              <Button onClick={onDeleteSpotting} autoFocus>
                Ta bort denna observation
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </Box>
  ) : status == "failed" ? (
    <p>Något gick fel</p>
  ) : (
    <p>Laddar...</p>
  );
}
