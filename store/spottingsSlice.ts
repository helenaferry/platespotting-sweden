import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { SpottingType } from '../types/SpottingType'
import { TeamMemberType } from '../types/TeamMemberType'
import { NewOrModifiedSpottingType } from "../types/NewOrModifiedSpottingType";
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface SpottingsState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    loading: boolean,
    spottings: SpottingType[],
    teamMembers: TeamMemberType[],
    error: string | null
}

const initialState: SpottingsState = {
    status: 'idle',
    loading: false,
    spottings: [],
    teamMembers: [],
    error: ''
}

export const fetchSpottings = createAsyncThunk('spottings/fetchSpottings', async () => {
    let { data: spottings, error } = await useSupabaseClient()
        .from('spottings')
        .select(`
            id,
            plateNumber,
            location_lat,
            location_lng,
            dateSpotted,
            note,
            teamMembers(
                    name,
                    color,
                    id,
                    deleted
                )
        `)
        .order('plateNumber', { ascending: false })
    if (error) { console.log(error); }
    return spottings;
})

export const addNewSpotting = createAsyncThunk("spottings/addNewSpotting",
    async (prop: NewOrModifiedSpottingType) => {
        const { data: spottingData, error: spottingError } = await prop.database
            .from('spottings')
            .insert(
                prop.spotting
            )
            .select('*')
        if (spottingError) {
            console.log(spottingError)
        }
        if (!prop.membersSeen || prop.membersSeen.length < 1) {
            return spottingData;
        }
        prop.membersSeen.map(async member => {
            if (!member) return;
            const { data, error: tmError } = await prop.database
                .from('spottingTeamMembers')
                .insert({ teamMember: member.id, spotting: spottingData[0].id, profile: prop.spotting.profile })
                .select()
            if (tmError) {
                console.log(tmError);
                return;
            }
        });
        if (spottingData[0] && prop.membersSeen && prop.membersSeen.length > 0) {
            spottingData[0].teamMembers = prop.membersSeen;
        }
        return spottingData;
    })

export const updateSpotting = createAsyncThunk("spottings/updateSpotting",
    async (prop: NewOrModifiedSpottingType) => {

        if (!prop.spotting.id) return;

        const { data: updatedData, error: updateError } = await prop.database
            .from('spottings')
            .update({ dateSpotted: prop.spotting.dateSpotted, note: prop.spotting.note, location_lat: prop.spotting.location_lat, location_lng: prop.spotting.location_lng })
            .eq('id', prop.spotting.id)
            .select()
        if (updateError) {
            console.log(updateError);
            return;
        }

        if (prop.membersSeenUpdated) {
            const { data, error: deleteMappingsError } = await prop.database
                .from('spottingTeamMembers')
                .delete()
                .eq('spotting', prop.spotting.id)
            if (deleteMappingsError) {
                console.log(deleteMappingsError);
                return;
            }
            if (prop.membersSeen && prop.membersSeen.length > 0) {
                prop.membersSeen.map(async member => {
                    if (!member) return;
                    const { data, error: tmError } = await prop.database
                        .from('spottingTeamMembers')
                        .insert({ teamMember: member.id, spotting: prop.spotting.id, profile: prop.spotting.profile })
                    if (tmError) {
                        console.log(tmError);
                        return;
                    }
                })
            }
        }
        if (updatedData[0] && prop.membersSeen && prop.membersSeen.length > 0) {
            updatedData[0].teamMembers = prop.membersSeen;
        }
        return updatedData;

    })

export const deleteSpotting = createAsyncThunk("spottings/deleteSpotting", async (prop: NewOrModifiedSpottingType) => {
    const { stmData, stmError } = await prop.database
        .from('spottingTeamMembers')
        .delete()
        .eq('spotting', prop.spotting.id)

    if (stmError) {
        console.log(stmError);
        return;
    }

    const { data, error } = await prop.database
        .from('spottings')
        .delete()
        .eq('id', prop.spotting.id).select();
    if (error) {
        console.log(error);
    }
    return data;
})

export const spottingsSlice = createSlice({
    name: 'spottings',
    initialState,
    reducers: {
    },
    extraReducers(builder) {
        builder
            // Fetch spottings
            .addCase(fetchSpottings.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchSpottings.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.spottings = state.spottings.concat(action.payload)
                // console.log('fetchSpottings succeeded', action.payload);
            })
            .addCase(fetchSpottings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || ''
            })
            // Add new spotting
            .addCase(addNewSpotting.pending, (state, action) => {
                // console.log('addNewSpotting loading');
                state.status = 'loading'
            })
            .addCase(addNewSpotting.fulfilled, (state, action: PayloadAction<any>) => {
                // console.log('addNewSpotting succeeded', action.payload[0]);
                state.status = 'succeeded'
                if (!action.payload) return
                const newSpotting = action.payload[0];
                state.spottings.unshift(newSpotting)

            })
            .addCase(addNewSpotting.rejected, (state, action) => {
                console.log('addNewSpotting failed', action.error.message);
                state.status = 'failed'
                state.error = action.error.message || '';
            })
            // Update spotting
            .addCase(updateSpotting.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(updateSpotting.fulfilled, (state, action: PayloadAction<any>) => {
                // console.log('updateSpotting succeeded', action.payload);
                state.status = 'succeeded'
                if (!action.payload) return
                const updatedSpotting = action.payload[0];
                if (!updatedSpotting) return;
                const index = state.spottings.findIndex(spotting => spotting.plateNumber === updatedSpotting.plateNumber);
                if (index < 0) return;
                state.spottings[index] = updatedSpotting;
            })
            .addCase(updateSpotting.rejected, (state, action) => {
                console.log('updateSpotting failed', action.error.message);
                state.status = 'failed'
                state.error = action.error.message || '';
            })
            // Delete spotting
            .addCase(deleteSpotting.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(deleteSpotting.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                if (!action.payload) return
                const deletedSpotting = action.payload[0];
                if (!deletedSpotting) return;
                const index = state.spottings.findIndex(spotting => spotting.plateNumber === deletedSpotting.plateNumber);
                if (index < 0) return;
                state.spottings.splice(index, 1);
            })
            .addCase(deleteSpotting.rejected, (state, action) => {
                console.log('deleteSpotting failed', action.error.message);
                state.status = 'failed'
                state.error = action.error.message || '';
            })
    }
})

// export const {  } = spottingsSlice.actions

export const selectNextPlate = (state: RootState) => {
    let latest = state.spottings.spottings[0] // state.spottings.spottings && state.spottings.spottings.reduce((x, y) => x.plateNumber > y.plateNumber ? x : y, { plateNumber: 0 })
    if (latest && latest.plateNumber && latest.plateNumber != 0) {
        return latest.plateNumber + 1
    } else {
        return 1;
    }
};

export const selectAllSpottings = (state: RootState) => state.spottings.spottings

function dayDiff(date1: string, date2: string) {
    let d1: Date = new Date(date1);
    let d2: Date = new Date(date2);
    let timeInMillisec: number = d1.getTime() - d2.getTime();
    let daysBetweenDates: number = Math.ceil(timeInMillisec / (1000 * 60 * 60 * 24));
    return daysBetweenDates;
}

export const selectDaysSince = (state: RootState) => state.spottings.spottings.map((sp, index) => {
    let plateBefore = (state.spottings.spottings.length > index) ? state.spottings.spottings[index + 1] : null;
    let plateNumberBefore = (plateBefore) ? plateBefore.plateNumber : '';
    let dateBefore = (plateBefore) ? plateBefore.dateSpotted : '';
    let daysSince = (plateBefore) ? dayDiff(sp.dateSpotted, plateBefore.dateSpotted) : -1;

    return { plateNumber: sp.plateNumber, plateBefore: plateNumberBefore, date: sp.dateSpotted, dateBefore: dateBefore, daysSince: daysSince }
})

export default spottingsSlice.reducer