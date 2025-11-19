import { supabase, TABLES } from './supabase'

// Register a new project support application
export const registerProjectApplication = async (applicationData: any) => {
  const { teamMembers, ...application } = applicationData

  try {
    // Insert the application
    const { data: applicationRecord, error: applicationError } = await supabase
      .from(TABLES.PROJECT_APPLICATIONS)
      .insert([application])
      .select()
      .single()

    if (applicationError) {
      console.error('Application error:', applicationError)
      // Check if it's a table not found error
      if (applicationError.message.includes('Could not find the table')) {
        throw new Error('جدول قاعدة البيانات غير موجود. يرجى إنشاء الجداول المطلوبة أولاً.')
      }
      throw new Error('فشل في تقديم الطلب. حاول مرة أخرى.')
    }

    // Insert team members
    if (teamMembers && teamMembers.length > 0) {
      const teamMembersData = teamMembers.map((member: any) => ({
        application_id: applicationRecord.id,
        name: member.name,
        phone: member.phone,
        email: member.email || '',
        role: member.role || ''
      }))

      const { error: membersError } = await supabase
        .from(TABLES.TEAM_MEMBERS)
        .insert(teamMembersData)

      if (membersError) {
        console.error('Team members error:', membersError)
        // Rollback application if members insertion fails
        await supabase
          .from(TABLES.PROJECT_APPLICATIONS)
          .delete()
          .eq('id', applicationRecord.id)
        
        throw new Error('فشل في تسجيل أعضاء الفريق. حاول مرة أخرى.')
      }
    }

    return applicationRecord
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// Get all project applications
export const getProjectApplications = async () => {
  const { data, error } = await supabase
    .from(TABLES.PROJECT_APPLICATIONS)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    // Check if it's a table not found error
    if (error.message.includes('Could not find the table')) {
      throw new Error('جدول قاعدة البيانات غير موجود. يرجى إنشاء الجداول المطلوبة أولاً.')
    }
    throw new Error('Failed to fetch applications')
  }

  return data
}

// Get project application with team members
export const getProjectApplicationWithMembers = async (applicationId: string) => {
  const { data: application, error: applicationError } = await supabase
    .from(TABLES.PROJECT_APPLICATIONS)
    .select('*')
    .eq('id', applicationId)
    .single()

  if (applicationError) {
    console.error('Error fetching application:', applicationError)
    // Check if it's a table not found error
    if (applicationError.message.includes('Could not find the table')) {
      throw new Error('جدول قاعدة البيانات غير موجود. يرجى إنشاء الجداول المطلوبة أولاً.')
    }
    throw new Error('Failed to fetch application')
  }

  const { data: members, error: membersError } = await supabase
    .from(TABLES.TEAM_MEMBERS)
    .select('*')
    .eq('application_id', applicationId)

  if (membersError) {
    console.error('Error fetching team members:', membersError)
    // Check if it's a table not found error
    if (membersError.message.includes('Could not find the table')) {
      throw new Error('جدول قاعدة البيانات غير موجود. يرجى إنشاء الجداول المطلوبة أولاً.')
    }
    throw new Error('Failed to fetch team members')
  }

  return { ...application, team_members: members }
}

// Update project application status
export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const { data, error } = await supabase
    .from(TABLES.PROJECT_APPLICATIONS)
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating application status:', error)
    // Check if it's a table not found error
    if (error.message.includes('Could not find the table')) {
      throw new Error('جدول قاعدة البيانات غير موجود. يرجى إنشاء الجداول المطلوبة أولاً.')
    }
    throw new Error('Failed to update application status')
  }

  return data
}