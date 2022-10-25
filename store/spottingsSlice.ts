import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { SpottingType } from '../types/SpottingType'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

interface SpottingsState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    loading: boolean,
    spottings: SpottingType[],
    error: string | null,
}

const initialState: SpottingsState = {
    status: 'idle',
    loading: false,
    spottings: [],
    error: ''
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
    'spottings/addNewSpotting',
    async spotting => {
        const response = await useSupabaseClient()
            .from('spottings')
            .insert(spotting)
        console.log('addNewSpotting', response);
        return response.data
    })

export const spottingsSlice = createSlice({
    name: 'spottings',
    initialState,
    reducers: {
       /* setSpottings: (state) => {
            state.spottings = []
        } */
    },
    extraReducers(builder) {
        builder
            .addCase(fetchSpottings.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchSpottings.fulfilled, (state, action) => {
                state.status = 'succeeded'
                console.log('FETCHED', action.payload);
                state.spottings = state.spottings.concat(action.payload)
            })
            .addCase(fetchSpottings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || ''
            })
            .addCase(addNewSpotting.fulfilled, (state, action) => {
                console.log('addNewSpotting fulfilled');
                state.spottings.push(action.payload)
            })
    }
})

// export const { setSpottings } = spottingsSlice.actions

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export const selectNextPlate = (state: RootState) => {
    let latest =  state.spottings.spottings[0] // state.spottings.spottings && state.spottings.spottings.reduce((x, y) => x.plateNumber > y.plateNumber ? x : y, { plateNumber: 0 })
    if (latest && latest.plateNumber != 0) {
        return latest.plateNumber + 1
    } else {
        return 1;
    }
};

export const selectAllSpottings = (state: RootState) => state.spottings.spottings

export default spottingsSlice.reducer