import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { TeamMemberType } from '../types/TeamMemberType'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface SettingsState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    loading: boolean,
    teamMembers: TeamMemberType[],
    error: string | null,
    hasTeamMembers: boolean,
    name: string,
    email: string
}

const initialState: SettingsState = {
    status: 'idle',
    loading: false,
    teamMembers: [],
    error: '',
    hasTeamMembers: false,
    name: '',
    email: ''
}

export const fetchTeamMembers = createAsyncThunk('teamMembers/fetchTeamMembers', async () => {
    let { data: teamMembers, error } = await useSupabaseClient()
        .from('teamMembers')
        .select('*')
    if (error) { console.log(error); }
    return teamMembers;
})

type FetchSettingsType = {
    id: string | undefined,
    supabase: any
}

export const fetchSettings = createAsyncThunk('settings/fetchSettings', async (prop: FetchSettingsType) => {
    if (!prop.id) return
    let { data: settings, error } = await prop.supabase
        .from('profiles')
        .select('name, email, hasTeamMembers')
        .eq('id', prop.id)
    if (error) { console.log(error); }
    return settings;
})

export const addNewTeamMember = createAsyncThunk('teamMembers/addNewTeamMember', async () => {
    return [];
})

type HasTeamMembersType = {
    hasTeamMembers: boolean,
    id: string,
    supabase: any
}

export const setHasTeamMembers = createAsyncThunk('teamMembers/setHasTeamMembers', async (prop: HasTeamMembersType) => {
    const { data, error } = await prop.supabase
        .from('profiles')
        .update({ hasTeamMembers: prop.hasTeamMembers })
        .eq('id', prop.id)
        .select()
    if (error) { console.log(error); }
    return data
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
            // Fetch user settings
            .addCase(fetchSettings.pending, (state, action) => {
                console.log('pending')
            })
            .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<any>) => {
                if (!action || !action.payload || !action.payload[0]) return;
                state.hasTeamMembers = action.payload[0].hasTeamMembers;
                state.name = action.payload[0].name;
                state.email = action.payload[0].email;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                console.log(action.error.message || '')
            })            
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
            })
            .addCase(addNewTeamMember.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                state.teamMembers.unshift(action.payload)
            })
            .addCase(addNewTeamMember.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
            })
            // Set has team members
            .addCase(setHasTeamMembers.pending, (state, action) => {
                //state.status = 'loading'
                console.log('loading');
            })
            .addCase(setHasTeamMembers.fulfilled, (state, action: PayloadAction<any>) => {
                //state.status = 'succeeded'
                state.hasTeamMembers = action.payload.hasTeamMembers;
                console.log('setHasTeamMEmbers got', action.payload)
            })
            .addCase(setHasTeamMembers.rejected, (state, action) => {
                //state.status = 'failed'
                //state.error = action.error.message || '';
                console.log(action.error.message);
            })
    }
})

export const { addTeamMember } = teamMembersSlice.actions

export const selectAllTeamMembers = (state: RootState) => state.teamMembers.teamMembers

export default teamMembersSlice.reducer