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

type AddNewSpottingType = {
    spotting: SpottingType,
    membersSeen: (TeamMemberType | undefined)[],
    database: any
}

export const addNewSpotting = createAsyncThunk("spottings/addNewSpotting",
    async (prop: AddNewSpottingType, { getState }) => {
        const state = getState();
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
                console.log('fetchSpottings succeeded', action.payload);
            })
            .addCase(fetchSpottings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || ''
            })
            // Add new spotting
            .addCase(addNewSpotting.pending, (state, action) => {
                console.log('addNewSpotting loading');
                state.status = 'loading'
            })
            .addCase(addNewSpotting.fulfilled, (state, action: PayloadAction<any>) => {
                console.log('addNewSpotting succeeded', action.payload[0]);
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

export default spottingsSlice.reducer