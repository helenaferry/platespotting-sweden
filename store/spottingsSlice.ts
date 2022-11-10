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
    error: string | null,
}

const initialState: SpottingsState = {
    status: 'idle',
    teamMemberStatus: 'idle',
    loading: false,
    spottings: [],
    teamMembers: [],
    error: '',
}

export const fetchSpottings = createAsyncThunk('spottings/fetchSpottings', async () => {
    let { data: spottings, error } = await useSupabaseClient()
        .from('spottings')
        .select(`
        plateNumber,
        location_lat,
        location_lng,
        dateSpotted,
        note,
        spottingTeamMembers!fk_spotting_teammember (
          teamMember,
            teamMembers!fk_spotting_teammember2(
                name,
                color,
                id
            )
        )
      `)
        .order('plateNumber', { ascending: false })
    if (error) { console.log(error); }
    return spottings;
})

export const addNewSpotting = createAsyncThunk(
    "spottings/addNewSpotting",
    async (spotting: SpottingType) => {
        console.log('add', spotting);
        try {
            const response = await useSupabaseClient()
                .from('spottings')
                .insert(spotting)
            // return response.data;
            return spotting;
        } catch (err) {
            console.log(err);
        }
    }
);

export const fetchTeamMembers = createAsyncThunk('spottings/fetchTeamMembers', async () => {
    let { data: teamMembers, error } = await useSupabaseClient()
        .from('teamMembers')
        .select('*')
    if (error) { console.log(error); }
    return teamMembers;
})

export const spottingsSlice = createSlice({
    name: 'spottings',
    initialState,
    reducers: {
        addSpotting(state, action) {
            console.log('add spotting', action.payload);
            state.spottings.unshift(action.payload)
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchSpottings.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchSpottings.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.spottings = state.spottings.concat(action.payload)
            })
            .addCase(fetchSpottings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || ''
            })
            .addCase(fetchTeamMembers.pending, (state, action) => {
                state.teamMemberStatus = 'loading'
            })
            .addCase(fetchTeamMembers.fulfilled, (state, action: PayloadAction<any>) => {
                state.teamMemberStatus = 'succeeded'
                state.teamMembers = state.teamMembers.concat(action.payload)
            })
            .addCase(fetchTeamMembers.rejected, (state, action) => {
                state.teamMemberStatus = 'failed'
                state.error = action.error.message || ''
            })
            .addCase(addNewSpotting.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(addNewSpotting.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.spottings.unshift(action.payload)
            })
            .addCase(addNewSpotting.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
            })
    }
})

export const { addSpotting } = spottingsSlice.actions

export const selectNextPlate = (state: RootState) => {
    let latest = state.spottings.spottings[0] // state.spottings.spottings && state.spottings.spottings.reduce((x, y) => x.plateNumber > y.plateNumber ? x : y, { plateNumber: 0 })
    if (latest && latest.plateNumber != 0) {
        return latest.plateNumber + 1
    } else {
        return 1;
    }
};

export const selectAllSpottings = (state: RootState) => state.spottings.spottings

export const selectAllTeamMembers = (state: RootState) => state.spottings.teamMembers

export default spottingsSlice.reducer