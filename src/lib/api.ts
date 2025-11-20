import { supabase, TABLES } from './supabase'

// Rate limiting map (simple in-memory solution for MVP)
const rateLimitMap = new Map()

const checkRateLimit = (identifier: string, maxRequests = 5, windowMs = 60000) => {
  const now = Date.now()
  const userRequests = rateLimitMap.get(identifier) || []
  
  // Filter out old requests
  const recentRequests = userRequests.filter((time: number) => now - time < windowMs)
  
  if (recentRequests.length >= maxRequests) {
    return false
  }
  
  recentRequests.push(now)
  rateLimitMap.set(identifier, recentRequests)
  return true
}

// Validate Egyptian phone number
const validatePhone = (phone: string) => {
  const egyptianPhoneRegex = /^(\+201|01)[0-2,5]{1}[0-9]{8}$/
  return egyptianPhoneRegex.test(phone)
}

// Sanitize input
const sanitizeInput = (input: any) => {
  if (typeof input !== 'string') return input
  return input.trim().replace(/[<>]/g, '')
}

// Register a new student
export const registerStudent = async (data: any) => {
  // Rate limiting check (using phone as identifier)
  if (!checkRateLimit(data.phone)) {
    throw new Error('Too many requests. Please try again later.')
  }

  // Validate phone
  if (!validatePhone(data.phone)) {
    throw new Error('Invalid Egyptian phone number format')
  }

  // Sanitize inputs
  const sanitizedData = {
    name: sanitizeInput(data.name),
    college: sanitizeInput(data.college || ''),
    phone: sanitizeInput(data.phone),
    interest: data.interest,
    assigned: false,
    group_id: null,
    created_at: new Date().toISOString(),
  }

  // Check for duplicate phone
  const { data: existing, error: checkError } = await supabase
    .from(TABLES.REGISTRATIONS)
    .select('id')
    .eq('phone', sanitizedData.phone)
    .single()

  if (existing) {
    throw new Error('أنت مسجل بالفعل')
  }

  // Insert registration
  const { data: registration, error } = await supabase
    .from(TABLES.REGISTRATIONS)
    .insert([sanitizedData])
    .select()
    .single()

  if (error) {
    console.error('Registration error:', error)
    throw new Error('فشل التسجيل. حاول مرة أخرى.')
  }

  return registration
}

// Get all registrations (admin only)
export const getRegistrations = async () => {
  const { data, error } = await supabase
    .from(TABLES.REGISTRATIONS)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching registrations:', error)
    throw new Error('Failed to fetch registrations')
  }

  return data
}

// Get registration count (including all students - real + dummy)
export const getRegistrationCount = async () => {
  const { count, error } = await supabase
    .from(TABLES.REGISTRATIONS)
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching count:', error)
    return 0
  }

  return count || 0
}

// Subscribe to registration count updates
export const subscribeToRegistrations = (callback: () => void) => {
  const channel = supabase
    .channel('registrations-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.REGISTRATIONS,
      },
      (payload) => {
        console.log('📡 Realtime update received:', payload)
        callback()
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status)
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to registrations updates!')
      }
    })

  return () => {
    console.log('🔌 Unsubscribing from registrations updates')
    supabase.removeChannel(channel)
  }
}

// Generate groups with balancing algorithm
export const generateGroups = async (groupSize = 5) => {
  // Get all unassigned registrations
  const { data: registrations, error: fetchError } = await supabase
    .from(TABLES.REGISTRATIONS)
    .select('*')
    .eq('assigned', false)

  if (fetchError) {
    throw new Error('Failed to fetch registrations')
  }

  if (!registrations || registrations.length === 0) {
    throw new Error('No unassigned registrations found')
  }

  // Separate real students from dummy students
  const realStudents = registrations.filter(r => !r.is_dummy)
  const dummyStudents = registrations.filter(r => r.is_dummy)

  // Function to create balanced groups
  const createBalancedGroups = (students: any[], groupNamePrefix: string) => {
    if (students.length === 0) return []

    // Shuffle for randomness
    const shuffled = [...students].sort(() => Math.random() - 0.5)

    // Balance by interest (round-robin distribution)
    const interestGroups = {
      marketing: shuffled.filter(r => r.interest === 'marketing'),
      software: shuffled.filter(r => r.interest === 'software'),
      other: shuffled.filter(r => r.interest === 'other'),
    }

    const balanced = []
    const interests = Object.keys(interestGroups)
    let maxLength = Math.max(...interests.map(k => interestGroups[k].length))

    for (let i = 0; i < maxLength; i++) {
      for (const interest of interests) {
        if (interestGroups[interest][i]) {
          balanced.push(interestGroups[interest][i])
        }
      }
    }

    // Create groups
    const groups = []
    const groupNames = [
      'Tech Titans',
      'Innovation Squad',
      'Digital Dynamos',
      'Code Crusaders',
      'Marketing Mavericks',
      'Growth Hackers',
      'Creative Collective',
      'Data Drivers',
      'Future Founders',
      'Startup Stars',
      'Solution Seekers',
      'Impact Makers',
      'Vision Team',
      'Success Squad',
      'Dream Team',
    ]

    for (let i = 0; i < balanced.length; i += groupSize) {
      const members = balanced.slice(i, i + groupSize)
      const groupIndex = Math.floor(i / groupSize)
      const groupName = `${groupNamePrefix} ${groupNames[groupIndex % groupNames.length]} #${groupIndex + 1}`

      const group = {
        name: groupName,
        members: members.map(m => m.id),
        member_count: members.length,
        created_at: new Date().toISOString(),
      }

      groups.push({ group, members })
    }

    return groups
  }

  // Create groups for real students
  const realGroups = createBalancedGroups(realStudents, '🎯')

  // Create groups for dummy students (Testing groups)
  const dummyGroups = createBalancedGroups(dummyStudents, '🤖 Test')

  // Combine all groups
  const allGroups = [...realGroups, ...dummyGroups]

  // Insert groups and update registrations (transactional approach)
  const insertedGroups = []

  for (const { group, members } of allGroups) {
    // Insert group
    const { data: insertedGroup, error: groupError } = await supabase
      .from(TABLES.GROUPS)
      .insert([group])
      .select()
      .single()

    if (groupError) {
      console.error('Error inserting group:', groupError)
      continue
    }

    // Update members with group_id
    const memberIds = members.map(m => m.id)
    const { error: updateError } = await supabase
      .from(TABLES.REGISTRATIONS)
      .update({ assigned: true, group_id: insertedGroup.id })
      .in('id', memberIds)

    if (updateError) {
      console.error('Error updating members:', updateError)
    }

    insertedGroups.push(insertedGroup)
  }

  return insertedGroups
}

// Get all groups with members
export const getGroups = async () => {
  const { data: groups, error: groupsError } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .order('created_at', { ascending: false })

  if (groupsError) {
    throw new Error('Failed to fetch groups')
  }

  // Fetch members for each group
  const groupsWithMembers = await Promise.all(
    groups.map(async (group: any) => {
      const { data: members, error: membersError } = await supabase
        .from(TABLES.REGISTRATIONS)
        .select('*')
        .eq('group_id', group.id)

      if (membersError) {
        console.error('Error fetching members:', membersError)
        return { ...group, members: [] }
      }

      return { ...group, members: members || [] }
    })
  )

  return groupsWithMembers
}

// Export to CSV
export const exportToCSV = async () => {
  const groups = await getGroups()
  
  const rows = []
  rows.push(['group_id', 'group_name', 'member_name', 'member_phone', 'member_college', 'member_interest'])

  for (const group of groups) {
    for (const member of group.members) {
      rows.push([
        group.id,
        group.name,
        member.name,
        member.phone,
        member.college || '',
        member.interest,
      ])
    }
  }

  return rows
}

// Reset all groups (for testing)
export const resetGroups = async () => {
  // Reset all registrations first
  const { error: updateError } = await supabase
    .from(TABLES.REGISTRATIONS)
    .update({ assigned: false, group_id: null })
    .not('id', 'is', null)

  if (updateError) {
    console.error('Error resetting registrations:', updateError)
  }

  // Delete all groups
  const { error: deleteError } = await supabase
    .from(TABLES.GROUPS)
    .delete()
    .not('id', 'is', null)

  if (deleteError) {
    console.error('Error deleting groups:', deleteError)
    throw new Error('Failed to delete groups')
  }
}

// Delete a specific group
export const deleteGroup = async (groupId: string) => {
  // Get members of this group
  const { data: members } = await supabase
    .from(TABLES.REGISTRATIONS)
    .select('id')
    .eq('group_id', groupId)

  // Unassign members
  if (members && members.length > 0) {
    await supabase
      .from(TABLES.REGISTRATIONS)
      .update({ assigned: false, group_id: null })
      .eq('group_id', groupId)
  }

  // Delete the group
  const { error } = await supabase
    .from(TABLES.GROUPS)
    .delete()
    .eq('id', groupId)

  if (error) {
    throw new Error('Failed to delete group')
  }
}

// Re-shuffle: Reset and regenerate groups
export const reshuffleGroups = async (groupSize = 5) => {
  // First, reset all groups
  await resetGroups()
  
  // Then generate new groups
  return await generateGroups(groupSize)
}

// Delete a single student registration
export const deleteStudent = async (studentId: string) => {
  const { error } = await supabase
    .from(TABLES.REGISTRATIONS)
    .delete()
    .eq('id', studentId)

  if (error) {
    console.error('Error deleting student:', error)
    throw new Error('Failed to delete student')
  }
}

// Delete all students
export const deleteAllStudents = async () => {
  // First, reset all groups (unassign students)
  const { error: updateError } = await supabase
    .from(TABLES.REGISTRATIONS)
    .update({ assigned: false, group_id: null })
    .not('id', 'is', null)

  if (updateError) {
    console.error('Error resetting registrations:', updateError)
  }

  // Delete all groups
  const { error: deleteGroupsError } = await supabase
    .from(TABLES.GROUPS)
    .delete()
    .not('id', 'is', null)

  if (deleteGroupsError) {
    console.error('Error deleting groups:', deleteGroupsError)
  }

  // Delete all registrations
  const { error: deleteError } = await supabase
    .from(TABLES.REGISTRATIONS)
    .delete()
    .not('id', 'is', null)

  if (deleteError) {
    console.error('Error deleting all students:', deleteError)
    throw new Error('Failed to delete all students')
  }
}

// Register a group (creates group and adds all members)
export const registerGroup = async (groupData: any) => {
  const { leaderName, leaderPhone, college, interest, members } = groupData

  // Generate unique group name
  const groupNames = [
    'Tech Titans', 'Innovation Squad', 'Digital Dynamos', 'Code Crusaders', 
    'Marketing Mavericks', 'Growth Hackers', 'Creative Collective', 'Data Drivers',
    'Future Founders', 'Startup Stars', 'Solution Seekers', 'Impact Makers'
  ]
  const randomName = groupNames[Math.floor(Math.random() * groupNames.length)]
  const groupName = `${randomName} #${Date.now().toString().slice(-4)}`

  // First, create all registrations (leader + members)
  const allMembers = [
    { name: leaderName, phone: leaderPhone, college, interest },
    ...members.map((m: any) => ({ name: m.name, phone: m.phone, college: m.college || college, interest }))
  ]

  const registeredMembers = []
  
  // Register each member
  for (const member of allMembers) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REGISTRATIONS)
        .insert([{
          name: member.name,
          phone: member.phone,
          college: member.college,
          interest: member.interest,
          assigned: true, // Already assigned to group
          group_id: null, // Will be updated after group creation
          created_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error(`رقم الموبايل ${member.phone} مسجل بالفعل`)
        }
        throw error
      }

      registeredMembers.push(data)
    } catch (err) {
      // Rollback: delete any created registrations
      for (const reg of registeredMembers) {
        await supabase.from(TABLES.REGISTRATIONS).delete().eq('id', reg.id)
      }
      throw err
    }
  }

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from(TABLES.GROUPS)
    .insert([{
      name: groupName,
      members: registeredMembers.map(m => m.id),
      member_count: registeredMembers.length,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (groupError) {
    // Rollback: delete all registrations
    for (const reg of registeredMembers) {
      await supabase.from(TABLES.REGISTRATIONS).delete().eq('id', reg.id)
    }
    throw new Error('فشل في إنشاء المجموعة')
  }

  // Update all registrations with group_id
  const memberIds = registeredMembers.map(m => m.id)
  const { error: updateError } = await supabase
    .from(TABLES.REGISTRATIONS)
    .update({ group_id: group.id })
    .in('id', memberIds)

  if (updateError) {
    console.error('Error updating group_id:', updateError)
  }

  return { group, members: registeredMembers }
}

// Add random student
export const addRandomStudent = async () => {
  const arabicFirstNames = [
    'أحمد', 'محمد', 'علي', 'حسن', 'خالد', 'عمر', 'يوسف', 'كريم', 'طارق', 'مصطفى',
    'فاطمة', 'سارة', 'نور', 'ياسمين', 'مريم', 'دينا', 'رنا', 'لينا', 'هدى', 'سلمى'
  ]
  const arabicLastNames = [
    'محمود', 'إبراهيم', 'عبدالله', 'حسين', 'صلاح', 'ناصر', 'فاروق', 'سعيد', 'رشاد', 'جمال',
    'أحمد', 'علي', 'حسن', 'خليل', 'منصور', 'عادل', 'وليد', 'حمدي', 'ماهر', 'نبيل'
  ]
  const englishFirstNames = [
    'Ahmed', 'Mohamed', 'Ali', 'Hassan', 'Khaled', 'Omar', 'Youssef', 'Karim', 'Tarek', 'Mostafa',
    'Fatma', 'Sarah', 'Nour', 'Yasmin', 'Mariam', 'Dina', 'Rana', 'Lina', 'Hoda', 'Salma',
    'Mahmoud', 'Amr', 'Hossam', 'Tamer', 'Sherif', 'Adel', 'Fady', 'Hany', 'Ramy', 'Wael',
    'Aya', 'Eman', 'Heba', 'Laila', 'Mona', 'Noha', 'Reem', 'Samar', 'Yara', 'Zainab'
  ]
  const englishLastNames = [
    'Mahmoud', 'Ibrahim', 'Abdullah', 'Hussein', 'Salah', 'Nasser', 'Farouk', 'Said', 'Rashad', 'Gamal',
    'Ahmed', 'Ali', 'Hassan', 'Khalil', 'Mansour', 'Adel', 'Walid', 'Hamdy', 'Maher', 'Nabil',
    'Mahmoud', 'Mohamed', 'Youssef', 'Mostafa', 'Sayed', 'Fathy', 'Shawky', 'Sabry', 'Gomaa', 'Ashraf',
    'Ezzat', 'Kamel', 'Hamed', 'Bakr', 'Othman', 'Zaki', 'Helmy', 'Ramadan', 'Shahin', 'Hegazy'
  ]
  
  // Randomly choose Arabic or English
  const useArabic = Math.random() < 0.5
  const firstNames = useArabic ? arabicFirstNames : englishFirstNames
  const lastNames = useArabic ? arabicLastNames : englishLastNames
  const colleges = [
    'كلية الهندسة',
    'كلية الحاسبات والمعلومات',
    'كلية التجارة',
    'كلية الاقتصاد',
    'كلية الإعلام',
    'كلية الفنون',
    'كلية العلوم',
    'كلية الطب',
    'كلية الصيدلة',
    'كلية الآداب'
  ]
  const interests = ['software', 'marketing', 'other']

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const name = `${firstName} ${lastName}`
  const college = colleges[Math.floor(Math.random() * colleges.length)]
  const interest = interests[Math.floor(Math.random() * interests.length)]
  
  // Generate unique phone
  const prefix = ['0100', '0101', '0102', '0105', '0106', '0109', '0111', '0112', '0115', '0120'][Math.floor(Math.random() * 10)]
  const rest = Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
  const phone = `+2${prefix}${rest}`

  const studentData = {
    name,
    college,
    phone,
    interest,
    assigned: false,
    group_id: null,
    is_dummy: true,
    created_at: new Date().toISOString(),
  }

  // Try to insert, if phone exists, retry with different phone
  let attempts = 0
  while (attempts < 5) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REGISTRATIONS)
        .insert([studentData])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Duplicate key error
          // Generate new phone and retry
          const newPrefix = ['0100', '0101', '0102', '0105', '0106', '0109', '0111', '0112', '0115', '0120'][Math.floor(Math.random() * 10)]
          const newRest = Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
          studentData.phone = `+2${newPrefix}${newRest}`
          attempts++
          continue
        }
        throw error
      }

      return data
    } catch (err) {
      attempts++
      if (attempts >= 5) {
        throw new Error('Failed to add random student after multiple attempts')
      }
    }
  }
}