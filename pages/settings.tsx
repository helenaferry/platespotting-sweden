import type { NextPage } from "next";
import React, { useState, useEffect, useRef } from "react";
import PageTemplate from "./../components/page-template/PageTemplate";
import MemberBadge from "./../components/member-badge/MemberBadge";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useAppSelector, useAppDispatch } from "./../hooks";
import {
  selectAllTeamMembers,
  addNewTeamMember,
  updateTeamMember,
} from "./../store/teamMemberSlice";
import { setHasTeamMembers, setName } from "../store/settingsSlice";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Button from "@mui/material/Button";

const Settings: NextPage = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const dispatch = useAppDispatch();
  const hasTeamMembers = useAppSelector(
    (state) => state.settings.hasTeamMembers
  );
  const name = useAppSelector((state) => state.settings.name);
  const teamMembers = useAppSelector(selectAllTeamMembers);
  const status = useAppSelector((state) => state.settings.status);
  const error = useAppSelector((state) => state.spottings.error);
  const teamMemberForm = useRef<HTMLFormElement>(null);
  const [editingTeamMember, setEditingTeamMember] = useState(0);
  const colors = useAppSelector((state) => state.settings.colors);

  const [hasTeam, setHasTeam] = useState(hasTeamMembers);
  const [newName, setNewName] = useState(name);

  const [newTeamMemberName, setNewTeamMemberName] = useState("");
  const [newTeamMemberColor, setNewTeamMemberColor] = useState("#000000");

  const [updatedTeamMemberName, setUpdatedTeamMemberName] = useState("");
  const [updatedTeamMemberColor, setUpdatedTeamMemberColor] =
    useState("#000000");

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const onChangeNewName = (event: any) => {
    setNewName(event.target.value);
  };

  const onChangeNewTeamMemberName = (event: any) => {
    setNewTeamMemberName(event.target.value);
  };

  const onChangeNewTeamMemberColor = (event: SelectChangeEvent) => {
    setNewTeamMemberColor(event.target.value);
  };

  const updateTeamMemberName = (event: any) => {
    setUpdatedTeamMemberName(event.target.value);
  };

  const updateTeamMemberColor = (event: SelectChangeEvent) => {
    setUpdatedTeamMemberColor(event.target.value);
  };

  const onChangeEditingTeamMember = (event: any) => {
    let tm = teamMembers.find((tm) => tm.id == event.target.value);
    if (!tm) return;
    setUpdatedTeamMemberColor(tm.color);
    setUpdatedTeamMemberName(tm.name);
    setEditingTeamMember(event.target.value);
  };

  const onSubmitTeamMember = (event: any) => {
    event.preventDefault();
    if (!newTeamMemberName) return;
    addTeamMember();
    if (teamMemberForm && teamMemberForm.current)
      teamMemberForm.current.reset();
  };

  const onSubmitName = (event: any) => {
    event.preventDefault();
    dispatch(
      setName({ name: newName, id: session?.user.id + "", database: supabase })
    );
  };

  const saveTeamMemberChanges = () => {
    setEditingTeamMember(0);
    dispatch(
      updateTeamMember({
        id: editingTeamMember,
        name: updatedTeamMemberName,
        color: updatedTeamMemberColor,
        database: supabase,
      })
    );
  };

  const deleteTeamMember = () => {
    console.log("TBD delete");
    alert("TBD delete");
  };

  async function addTeamMember() {
    dispatch(
      addNewTeamMember({
        teamMember: {
          name: newTeamMemberName,
          color: newTeamMemberColor,
          profile: session?.user.id,
          id: 0,
        },
        database: supabase,
      })
    );
  }

  function toggleHasTeam(e: any) {
    setHasTeam(e.target.checked);
    dispatch(
      setHasTeamMembers({
        hasTeamMembers: e.target.checked,
        id: session?.user.id + "",
        database: supabase,
      })
    );
  }

  function teamMembersList() {
    return (
      <table className="w-full mb-8">
        <tbody>
          {teamMembers &&
            teamMembers.map((member) => {
              return (
                <tr key={member.name}>
                  <td className="min-w-[50%]">
                    {editingTeamMember == member.id ? (
                      <div className="flex">
                        <FormControl sx={{ m: 1, minWidth: 100 }}>
                          <InputLabel id="updateTeamMemberColorLabel">
                            Välj...
                          </InputLabel>
                          <Select
                            labelId="updateTeamMemberColorLabel"
                            id="updateTeamMemberColor"
                            label="Färg"
                            defaultValue={member.color}
                            onChange={updateTeamMemberColor}
                          >
                            {colors.map((color, index) => (
                              <MenuItem value={color} key={index}>
                                <MemberBadge
                                  color={color}
                                  id={0}
                                  name={index + 1 + ""}
                                  profile=""
                                ></MemberBadge>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          id="updateTeamMemberName"
                          defaultValue={member.name}
                          onChange={updateTeamMemberName}
                          label="Namn"
                          variant="outlined"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-2 my-2">
                        <MemberBadge
                          name={member.name}
                          color={member.color}
                          profile={member.profile}
                          id={member.id}
                        />
                        {member.name}
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    {editingTeamMember == member.id ? (
                      <IconButton
                        onClick={saveTeamMemberChanges}
                        value={member.id}
                      >
                        <SaveIcon className="pointer-events-none" />
                      </IconButton>
                    ) : (
                      <div className="flex justify-end">
                        <IconButton
                          onClick={deleteTeamMember}
                          value={member.id}
                        >
                          <DeleteIcon className="pointer-events-none" />
                        </IconButton>
                        <IconButton
                          onClick={onChangeEditingTeamMember}
                          value={member.id}
                        >
                          <EditIcon className="pointer-events-none" />
                        </IconButton>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageTemplate>
        <Typography variant="h2" gutterBottom>
          Inställningar
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={hasTeam}
                onChange={toggleHasTeam}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label="Slå på teamfunktionalitet"
          />
        </FormGroup>
        <form onSubmit={onSubmitName} className="flex flex-col gap-8 py-8">
          <TextField
            id="name"
            defaultValue={name}
            onChange={onChangeNewName}
            label={hasTeam ? "Teamets namn" : "Mitt namn"}
            variant="outlined"
          />
          <Button type="submit" variant="contained">
            Spara namn
          </Button>
        </form>
        {hasTeam && (
          <section>
            <Typography variant="h2" gutterBottom>
              Teammedlemmar
            </Typography>
            {teamMembersList()}
            <Typography variant="h2" gutterBottom>
              Lägg till ny teammedlem
            </Typography>
            <form
              onSubmit={onSubmitTeamMember}
              ref={teamMemberForm}
              className="flex flex-col gap-8"
            >
              <TextField
                id="newTeamMemberName"
                defaultValue={newTeamMemberName}
                onChange={onChangeNewTeamMemberName}
                label="Teammedlemmens namn"
                variant="outlined"
              />
              <div>
                <p>Teammedlemmens favoritfärg</p>
                <FormControl sx={{ m: 1, minWidth: 100 }}>
                  <InputLabel id="newTeamMemberColorLabel">Välj...</InputLabel>
                  <Select
                    labelId="newTeamMemberColorLabel"
                    id="newTeamMemberColor"
                    label="Färg"
                    onChange={onChangeNewTeamMemberColor}
                  >
                    {colors.map((color, index) => (
                      <MenuItem value={color} key={index}>
                        <MemberBadge
                          color={color}
                          id={0}
                          name={index + 1 + ""}
                          profile=""
                        ></MemberBadge>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <Button type="submit" variant="contained">
                Lägg till teammedlem
              </Button>
            </form>
          </section>
        )}
      </PageTemplate>
    </div>
  );
};
export default Settings;
