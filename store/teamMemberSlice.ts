import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { TeamMemberType } from '../types/TeamMemberType'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface TeamMembersState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    teamMembers: TeamMemberType[],
    error: string | null,
}

const initialState: TeamMembersState = {
    status: 'idle',
    teamMembers: [],
    error: '',
}

export const fetchTeamMembers = createAsyncThunk('teamMembers/fetchTeamMembers', async () => {
    let { data: teamMembers, error } = await useSupabaseClient()
        .from('teamMembers')
        .select('*')
    if (error) { console.log(error); }
    return teamMembers;
})

type AddNewTeamMemberType = {
    teamMember: TeamMemberType,
    supabase: any
}

export const addNewTeamMember = createAsyncThunk('teamMembers/addNewTeamMember', async (prop: AddNewTeamMemberType) => {
    console.log('teamMemberSlice to add ', prop.teamMember);
    const { data, error } = await prop.supabase
        .from('teamMembers')
        .insert(
            prop.teamMember
        ).select()
    if (error) {
        console.log(error)
    }
    return data;
})


export const teamMembersSlice = createSlice({
    name: 'teamMembers',
    initialState,
    reducers: {
    },
    extraReducers(builder) {
        builder
            // Fetch team members
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
            // Add team member
            .addCase(addNewTeamMember.pending, (state, action) => {
                state.status = 'loading'
                console.log('loading');
            })
            .addCase(addNewTeamMember.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                console.log('succeeded', action.payload);
                state.teamMembers.unshift(action.payload[0])
                console.log('teamMembers now', state.teamMembers)
            })
            .addCase(addNewTeamMember.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
                console.log('failed', action.error.message)
            })
    }
})

// export const { } = teamMembersSlice.actions

export const selectAllTeamMembers = (state: RootState) => state.teamMembers.teamMembers

export default teamMembersSlice.reducer