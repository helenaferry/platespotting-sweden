import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { SpottingType } from '../types/SpottingType'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface SpottingsState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'refreshNeeded',
    loading: boolean,
    spottings: SpottingType[],
    error: string | null,
}

const initialState: SpottingsState = {
    status: 'idle',
    loading: false,
    spottings: [],
    error: '',
}

export const fetchSpottings = createAsyncThunk('spottings/fetchSpottings', async () => {
    let { data: spottings, error } = await useSupabaseClient()
        .from('spottings')
        .select('*')
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

export const spottingsSlice = createSlice({
    name: 'spottings',
    initialState,
    reducers: {
        addSpotting(state, action) {
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

export default spottingsSlice.reducer