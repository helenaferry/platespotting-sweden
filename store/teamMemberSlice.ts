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
    database: any
}

export const addNewTeamMember = createAsyncThunk('teamMembers/addNewTeamMember', async (prop: AddNewTeamMemberType) => {
    const { data, error } = await prop.database
        .from('teamMembers')
        .insert(
            { name: prop.teamMember.name, color: prop.teamMember.color, profile: prop.teamMember.profile }
        ).select()
    if (error) {
        console.log(error)
    }
    return data;
})

type EditTeamMemberType = {
    id: number,
    name: string,
    color: string,
    database: any
}

export const updateTeamMember = createAsyncThunk('teamMembers/updateTeamMember', async (prop: EditTeamMemberType) => {
    const { data, error } = await prop.database
        .from('teamMembers')
        .update({ name: prop.name, color: prop.color })
        .eq('id', prop.id)
        .select()
    if (error) {
        console.log(error)
    }
    return data;
})

type DeleteOrUndeleteTeamMemberType = {
    id: number,
    deleted: boolean,
    database: any
}
export const deleteOrUndeleteTeamMember = createAsyncThunk('teamMembers/deleteTeamMember', async (prop: DeleteOrUndeleteTeamMemberType) => {
    const { data, error } = await prop.database
        .from('teamMembers')
        .update({ deleted: prop.deleted })
        .eq('id', prop.id)
        .select()
    if (error) {
        console.log(error);
    }
    return data;
})



export const teamMembersSlice = createSlice({
    name: 'teamMembers',
    initialState,
    reducers: {
        /*  findTeamMember: (state, action) => {
              return state.teamMembers.find(teamMember => teamMember.id == action.payload.id);
          }*/
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
                if (!action.payload) return;
                state.teamMembers.unshift(action.payload[0])
                console.log('teamMembers now', state.teamMembers)
            })
            .addCase(addNewTeamMember.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
                console.log('failed', action.error.message)
            })
            // Update team member
            .addCase(updateTeamMember.pending, (state, action) => {
                state.status = 'loading'
                console.log('loading');
            })
            .addCase(updateTeamMember.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                console.log('succeeded', action.payload);
                if (!action.payload) return
                const editedTm = action.payload[0];
                console.log(editedTm);
                const index = state.teamMembers.findIndex(tm => tm.id === editedTm.id);
                if (index < 0) return;
                state.teamMembers[index] = editedTm;
            })
            .addCase(updateTeamMember.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
                console.log('failed', action.error.message)
            })
            // Delete or undelete team member
            .addCase(deleteOrUndeleteTeamMember.pending, (state, action) => {
                state.status = 'loading'
                console.log('loading');
            })
            .addCase(deleteOrUndeleteTeamMember.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded'
                console.log('succeeded', action.payload);
                if (!action.payload) return
                const editedTm = action.payload[0];
                const index = state.teamMembers.findIndex(tm => tm.id === editedTm.id);
                if (index < 0) return;
                state.teamMembers[index] = editedTm;
            })
            .addCase(deleteOrUndeleteTeamMember.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || '';
                console.log('failed', action.error.message)
            })
    }
})

export const selectAllTeamMembers = (state: RootState) => [...state.teamMembers.teamMembers].sort((a, b) => a.id - b.id).filter(teamMember => !teamMember.deleted)

export const selectAllTeamMembersInclDeleted = (state: RootState) => [...state.teamMembers.teamMembers].sort((a, b) => a.id - b.id)

export default teamMembersSlice.reducer