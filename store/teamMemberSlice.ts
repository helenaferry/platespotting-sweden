import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { TeamMemberType } from '../types/TeamMemberType'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface SpottingsState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    loading: boolean,
    teamMembers: TeamMemberType[],
    error: string | null,
}

const initialState: SpottingsState = {
    status: 'idle',
    loading: false,
    teamMembers: [],
    error: '',
}

export const fetchTeamMembers = createAsyncThunk('spottings/fetchTeamMembers', async () => {
    let { data: teamMembers, error } = await useSupabaseClient()
        .from('teamMembers')
        .select('*')
    if (error) { console.log(error); }
    return teamMembers;
})

export const addNewTeamMember = createAsyncThunk('teamMembers/addNewTeamMember', async () => {
    return [];
})

export const teamMembersSlice = createSlice({
    name: 'teamMembers',
    initialState,
    reducers: {
        addTeamMember(state, action) {
            console.log('add teamMember', action.payload);
            state.teamMembers.unshift(action.payload)
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchTeamMembers.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchTeamMembers.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.teamMembers = state.teamMembers.concat(action.payload)
            })
            .addCase(fetchTeamMembers.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || ''
            })
            .addCase(addNewTeamMember.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(addNewTeamMember.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.teamMembers.unshift(action.payload)
            })
            .addCase(addNewTeamMember.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
            })
    }
})

export const { addTeamMember } = teamMembersSlice.actions

export const selectAllTeamMembers = (state: RootState) => state.spottings.teamMembers

export default teamMembersSlice.reducer