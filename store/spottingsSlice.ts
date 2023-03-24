import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { SpottingType } from '../types/SpottingType'
import { TeamMemberType } from '../types/TeamMemberType'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface SpottingsState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    teamMemberStatus: 'idle' | 'loading' | 'succeeded' | 'failed',
    loading: boolean,
    spottings: SpottingType[],
    teamMembers: TeamMemberType[],
    error: string | null
}

const initialState: SpottingsState = {
    status: 'idle',
    teamMemberStatus: 'idle',
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
                    id
                )
        `)
        .order('plateNumber', { ascending: false })
    if (error) { console.log(error); }
    console.log(spottings);
    return spottings;
})

type AddNewSpottingType = {
    spotting: SpottingType,
    membersSeen: (TeamMemberType | undefined)[],
    database: any
}

export const addNewSpotting = createAsyncThunk("spottings/addNewSpotting",
    async (prop: AddNewSpottingType) => {
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
        })
        return spottingData;
    })

type UpdateSpottingType = {
    id: number,
    profile: string,
    dateSpotted: string,
    note: string,
    membersSeenUpdated: boolean;
    membersSeen: (TeamMemberType | undefined)[],
    database: any
}

export const updateSpotting = createAsyncThunk("spottings/updateSpotting",
    async (prop: UpdateSpottingType) => {

        if (!prop.id) return;

        if (prop.membersSeenUpdated) {
            const { data: deleteMappingsData, error: deleteMappingsError } = await prop.database
                .from('spottingTeamMembers')
                .delete()
                .eq('spotting', prop.id)
            if (deleteMappingsError) {
                console.log(deleteMappingsError);
                return;
            }
            if (prop.membersSeen && prop.membersSeen.length > 0) {
                prop.membersSeen.map(async member => {
                    if (!member) return;
                    const { data, error: tmError } = await prop.database
                        .from('spottingTeamMembers')
                        .insert({ teamMember: member.id, spotting: prop.id, profile: prop.profile })
                    if (tmError) {
                        console.log(tmError);
                        return;
                    }
                })
            }
        }

        const { data: updatedData, error: updateError } = await prop.database
            .from('spottings')
            .update({ dateSpotted: prop.dateSpotted, note: prop.note })
            .eq('id', prop.id)
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
                        id
                    )
            `)
        if (updateError) {
            console.log(updateError);
            return;
        }
        console.log(updatedData);
        return updatedData;

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
                // console.log('addNewSpotting failed', action.error.message);
                state.status = 'failed'
                state.error = action.error.message || '';
            })
            // Update spotting
            .addCase(updateSpotting.pending, (state, action) => {
                console.log('updateSpotting loading');
                state.status = 'loading'
            })
            .addCase(updateSpotting.fulfilled, (state, action: PayloadAction<any>) => {
                console.log('updateSpotting succeeded', action.payload);
                state.status = 'succeeded'
                if (!action.payload) return
                const updatedSpotting = action.payload[0];
                if (!updatedSpotting) return;
                const index = state.spottings.findIndex(spotting => spotting.plateNumber === updatedSpotting.plateNumber);
                if (index < 0) return;
                state.spottings[index] = updatedSpotting;
                // location.reload(); // for now...
            })
            .addCase(updateSpotting.rejected, (state, action) => {
                console.log('updateSpotting failed', action.error.message);
                state.status = 'failed'
                state.error = action.error.message || '';
            })
    }
})

// export const {  } = spottingsSlice.actions

export const selectNextPlate = (state: RootState) => {
    let latest = state.spottings.spottings[0] // state.spottings.spottings && state.spottings.spottings.reduce((x, y) => x.plateNumber > y.plateNumber ? x : y, { plateNumber: 0 })
    if (latest && latest.plateNumber != 0) {
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