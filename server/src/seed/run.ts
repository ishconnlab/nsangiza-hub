import bcrypt from 'bcryptjs'
import { connectDb, disconnectDb } from '../lib/db'
import type { HydratedDocument } from 'mongoose'
import User from '../models/User'
import type { UserSchema } from '../models/User'
import Professional from '../models/Professional'
import Appointment from '../models/Appointment'
import Conversation from '../models/Conversation'
import Message from '../models/Message'
import Resource from '../models/Resource'
import CommunityGroup from '../models/CommunityGroup'
import CommunityPost from '../models/CommunityPost'
import Notification from '../models/Notification'
import FollowUp from '../models/FollowUp'
import CheckIn from '../models/CheckIn'
import SafeguardingCase from '../models/SafeguardingCase'
import { ROLES } from '../constants'
import {
  DEMO_PASSWORD,
  seedCommunityGroups,
  seedCommunityPosts,
  seedProfessionals,
  seedResources,
  seedSafeguarding,
  seedUsers,
} from './data'

const collections = [
  'users',
  'professionals',
  'appointments',
  'conversations',
  'messages',
  'resources',
  'communitygroups',
  'communityposts',
  'notifications',
  'followups',
  'checkins',
  'safeguardingcases',
  'auditlogs',
  'assessments',
]

const daysFromNow = (days: number, hour = 10, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

async function reset(): Promise<void> {
  const db = (await import('mongoose')).default.connection.db
  if (!db) throw new Error('No database connection')
  for (const name of collections) {
    try {
      await db.collection(name).drop()
    } catch {
      // collection does not exist yet
    }
  }
  console.log('[seed] reset: dropped seed collections')
}

export async function seed(options: { reset?: boolean } = {}): Promise<void> {
  if (options.reset) await reset()
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  // ------------------------------------------------ users
  const mainUser = await User.create({
    email: seedUsers[0].email,
    passwordHash,
    displayName: seedUsers[0].displayName,
    role: ROLES.USER,
    city: seedUsers[0].city,
    ageRange: seedUsers[0].ageRange,
    language: seedUsers[0].language,
    preferredSupportLanguage: seedUsers[0].preferredSupportLanguage,
    communicationPreference: seedUsers[0].communicationPreference,
    consent: { accepted: true, acceptedAt: new Date(), version: '2026.1' },
    onboarding: { welcomeSeen: true, consentSeen: true, preferencesComplete: true, assessmentComplete: true, resultsSeen: true },
    lastLoginAt: new Date(Date.now() - 3600_000),
  })

  const extraUsers = await User.insertMany(
    seedUsers.slice(1).map((u) => ({
      email: u.email,
      passwordHash,
      displayName: u.displayName,
      role: ROLES.USER,
      city: u.city,
      language: u.language,
      preferredSupportLanguage: u.preferredSupportLanguage,
      onboarding: { welcomeSeen: true, consentSeen: true, preferencesComplete: true, assessmentComplete: true, resultsSeen: true },
    })),
  )

  // Professionals: one user account per professional profile
  const profUsers: Record<number, HydratedDocument<UserSchema>> = {}
  const professionalDocs = await Promise.all(
    seedProfessionals.map(async (p, index) => {
      const user = await User.create({
        email: p.email,
        passwordHash,
        displayName: p.name,
        role: ROLES.PROFESSIONAL,
        city: p.city as string,
        language: p.languages[0] ?? 'English',
        approved: true,
        onboarding: { welcomeSeen: true, consentSeen: true, preferencesComplete: true, assessmentComplete: true, resultsSeen: true },
      })
      profUsers[index] = user
      const doc = await Professional.create({
        user: user._id,
        name: p.name,
        providerType: p.providerType,
        title: p.title,
        about: p.about,
        city: p.city,
        languages: p.languages,
        specializations: p.specializations,
        experienceYears: p.experienceYears,
        experience: p.experience,
        qualifications: p.qualifications,
        sessionTypes: p.sessionTypes.filter((s) => s !== 'In-person'),
        consultationModes: { video: true, audio: true, chat: true, inPerson: p.sessionTypes.includes('In-person') },
        pricePerSession: p.pricePerSession,
        availabilityLabel: p.availabilityLabel,
        rating: p.rating,
        reviewCount: p.reviewCount,
        featured: p.featured ?? false,
        isDemo: true,
        active: true,
        verification: { status: 'Approved', documents: ['id-document-demo.png', 'credential-demo.png'] },
        availability: [
          { day: 'Monday', start: '09:00', end: '17:00', enabled: index % 3 !== 0 },
          { day: 'Tuesday', start: '09:00', end: '17:00', enabled: true },
          { day: 'Wednesday', start: '09:00', end: '17:00', enabled: index % 2 === 0 },
          { day: 'Thursday', start: '09:00', end: '17:00', enabled: true },
          { day: 'Friday', start: '09:00', end: '15:00', enabled: index % 4 !== 1 },
        ],
        onboarding: { step: 8, profileComplete: true, availabilityComplete: true, submitted: true },
        reviews: [
          { author: 'Anonymous', rating: 5, body: 'Kind, patient, and easy to talk to. The video session felt private and calm.', anonymous: true, createdAt: daysFromNow(-21, 9) },
          { author: 'Anonymous', rating: 5, body: 'I appreciated being listened to without being rushed.', anonymous: true, createdAt: daysFromNow(-40, 16) },
        ],
      })
      return doc
    }),
  )

  // Admin + moderator + supervisor accounts
  const adminUser = await User.create({
    email: 'admin@nsangiza.rw',
    passwordHash,
    displayName: 'Support Team Admin',
    role: ROLES.ADMIN,
    city: 'Kigali',
    onboarding: { welcomeSeen: true, consentSeen: true, preferencesComplete: true, assessmentComplete: true, resultsSeen: true },
  })
  await User.create({
    email: 'moderator@nsangiza.rw',
    passwordHash,
    displayName: 'Community Moderator',
    role: ROLES.MODERATOR,
    city: 'Kigali',
  })
  await User.create({
    email: 'supervisor@nsangiza.rw',
    passwordHash,
    displayName: 'Safeguarding Supervisor',
    role: ROLES.SUPERVISOR,
    city: 'Kigali',
  })

  // ------------------------------------------------ resources
  await Resource.create(
    seedResources.map((r, index) => ({
      ...r,
      language: index % 3 === 2 ? 'French' : index % 3 === 1 ? 'Kinyarwanda' : 'English',
      author: index % 4 === 0 ? 'Nsangiza Hub Clinical Review' : 'Nsangiza Hub Content Team',
      reviewer: 'Dr. Jessica Uwimana (Clinical Reviewer)',
      reviewStatus: 'Reviewed',
      published: true,
      publishedAt: daysFromNow(-(index * 3 + 2), 8),
      featuredImage: '/og-default.png',
    })),
  )

  // ------------------------------------------------ community
  const groups = await CommunityGroup.create(
    seedCommunityGroups.map((g) => ({ ...g, members: [mainUser._id] })),
  )
  for (const [index, post] of seedCommunityPosts.entries()) {
    const author = extraUsers[index % extraUsers.length]
    const group = groups[index % groups.length]
    await CommunityPost.create({
      group: group._id,
      author: author._id,
      authorName: author.displayName,
      body: post.text,
      reactions: { supportive: post.reactions[0], thoughtful: post.reactions[1], grateful: post.reactions[2] },
      commentCount: index % 3,
      comments:
        index % 3 === 0
          ? [
              { authorName: 'Community Member', body: 'Thank you for sharing this. You are not alone.', createdAt: daysFromNow(-1, 12) },
            ]
          : [],
    })
    await CommunityGroup.updateOne({ _id: group._id }, { $inc: { memberCount: 1 } })
  }

  // ------------------------------------------------ appointments for the demo user
  const appointmentSpecs = [
    { prof: 1, days: 1, hour: 10, type: 'Video call', status: 'confirmed', duration: 45 },
    { prof: 0, days: 3, hour: 16, type: 'Secure chat', status: 'requested', duration: 30 },
    { prof: 6, days: -2, hour: 14, type: 'Audio call', status: 'completed', duration: 45 },
    { prof: 8, days: -8, hour: 11, type: 'Video call', status: 'completed', duration: 60 },
    { prof: 3, days: -15, hour: 9, type: 'Secure chat', status: 'completed', duration: 30 },
    { prof: 11, days: 6, hour: 15, type: 'Video call', status: 'confirmed', duration: 45 },
  ]
  const appointments = await Appointment.create(
    appointmentSpecs.map((spec) => {
      const prof = professionalDocs[spec.prof]!
      const date = daysFromNow(spec.days, spec.hour)
      return {
        user: mainUser._id,
        professional: prof._id,
        professionalName: prof.name,
        providerType: prof.providerType,
        date,
        endDate: new Date(date.getTime() + spec.duration * 60_000),
        durationMin: spec.duration,
        type: spec.type,
        status: spec.status,
        joinToken: `demo-join-${Math.random().toString(36).slice(2, 10)}`,
      }
    }),
  )

  // extra appointments for the "prof@nsangiza.rw" professional workspace
  const mainProfessional = professionalDocs[0]!
  await Appointment.create([
    {
      user: extraUsers[1]._id,
      professional: mainProfessional._id,
      professionalName: mainProfessional.name,
      providerType: mainProfessional.providerType,
      date: daysFromNow(0, 9, 30),
      endDate: daysFromNow(0, 10, 30),
      durationMin: 60,
      type: 'Video call',
      status: 'confirmed',
      joinToken: 'demo-join-main-1',
    },
    {
      user: extraUsers[2]._id,
      professional: mainProfessional._id,
      professionalName: mainProfessional.name,
      providerType: mainProfessional.providerType,
      date: daysFromNow(0, 11),
      endDate: daysFromNow(0, 11, 45),
      durationMin: 45,
      type: 'Audio call',
      status: 'confirmed',
    },
    {
      user: extraUsers[4]._id,
      professional: mainProfessional._id,
      professionalName: mainProfessional.name,
      providerType: mainProfessional.providerType,
      date: daysFromNow(1, 14),
      endDate: daysFromNow(1, 14, 45),
      durationMin: 45,
      type: 'Secure chat',
      status: 'requested',
    },
  ])

  // ------------------------------------------------ conversations + messages
  const messageBatches = [
    { prof: 0, lines: [
      { from: 'user', body: 'Muraho, thank you for fitting me in this week. I have been feeling very heavy lately.' },
      { from: 'prof', body: 'Muraho Aline. I am glad you reached out. What has been weighing on you most?' },
      { from: 'user', body: 'Work pressure is building and I keep losing sleep thinking about deadlines.' },
      { from: 'prof', body: 'That sounds tiring. We can talk about a gentle evening routine and a calmer way to approach the week.' },
    ] },
    { prof: 1, lines: [
      { from: 'user', body: 'Hello, I wanted to check if you have a slot before my exam next week.' },
      { from: 'prof', body: 'I do. Would Wednesday at 4pm video work for you?' },
      { from: 'user', body: 'Yes, that works. Thank you.' },
    ] },
    { prof: 6, lines: [
      { from: 'prof', body: 'Hello Aline, I hope your week is going gently. I shared a resource on sleep routines that you may find useful.' },
      { from: 'user', body: 'Thank you, I read it last night and tried the wind-down steps. It helped a little.' },
    ] },
  ]
  for (const batch of messageBatches) {
    const prof = professionalDocs[batch.prof]!
    const profUser = profUsers[batch.prof]!
    const conversation = await Conversation.create({
      participants: [mainUser._id, profUser._id],
      professional: prof._id,
      user: mainUser._id,
      participantNames: { [String(mainUser._id)]: prof.name, [String(profUser._id)]: 'Aline Ineza' },
      lastMessageAt: daysFromNow(-1, 18),
      lastMessagePreview: batch.lines[batch.lines.length - 1].body.slice(0, 100),
      unread: { [String(mainUser._id)]: 0, [String(profUser._id)]: 0 },
    })
    for (const [index, line] of batch.lines.entries()) {
      const senderId = line.from === 'user' ? mainUser._id : profUser._id
      await Message.create({
        conversation: conversation._id,
        sender: senderId,
        senderRole: line.from === 'user' ? ROLES.USER : ROLES.PROFESSIONAL,
        body: line.body,
        kind: 'text',
        status: index === batch.lines.length - 1 ? 'read' : index === batch.lines.length - 2 ? 'sent' : 'read',
        createdAt: daysFromNow(-(batch.lines.length - index), 17, 20 + index * 7),
      })
    }
  }

  // ------------------------------------------------ notifications
  await Notification.create([
    { user: mainUser._id, type: 'appointment', title: 'Appointment confirmed', body: 'Your session with Aline Mukamana is confirmed for ' + `${appointments[0].date.toLocaleDateString('en-GB')}`.concat('.'), link: '/app/appointments', read: true },
    { user: mainUser._id, type: 'message', title: 'New message from Eric Niyonzima', body: 'Yes, that works. Thank you.', link: '/app/messages', read: false },
    { user: mainUser._id, type: 'follow-up', title: 'Follow-up reminder', body: 'Your next check-in with Mireille Uwase is due in 3 days.', link: '/app/follow-ups', read: false },
    { user: mainUser._id, type: 'community', title: 'A post you may find encouraging', body: 'Ã¢â‚¬Å“Started seeing a counsellor last monthÃ¢â‚¬Â¦Ã¢â‚¬Â received 15 supportive reactions.', link: '/app/community', read: false },
    { user: mainUser._id, type: 'system', title: 'Your privacy centre is ready', body: 'You can review your data, consent and download options anytime.', link: '/app/privacy', read: false },
    { user: adminUser._id, type: 'professional', title: 'New professional applications', body: '2 professional applications are awaiting verification.', link: '/admin/professionals/pending', read: false },
  ])

  // ------------------------------------------------ follow-ups
  await FollowUp.create([
    { user: mainUser._id, professional: professionalDocs[0]!._id, professionalName: professionalDocs[0]!.name, dueAt: daysFromNow(3, 16), status: 'upcoming', kind: 'check-in', notes: 'Gentle review of stress levels and sleep.' },
    { user: mainUser._id, professional: professionalDocs[1]!._id, professionalName: professionalDocs[1]!.name, dueAt: daysFromNow(7, 10), status: 'pending', kind: 'session', notes: 'Follow-up session after initial consultation.' },
    { user: mainUser._id, professional: professionalDocs[6]!._id, professionalName: professionalDocs[6]!.name, dueAt: daysFromNow(-1, 12), status: 'completed', kind: 'resource', notes: 'Shared sleep routine resource.' },
    { user: mainUser._id, professional: professionalDocs[8]!._id, professionalName: professionalDocs[8]!.name, dueAt: daysFromNow(12, 9), status: 'pending', kind: 'check-in' },
    { user: mainUser._id, professional: professionalDocs[0]!._id, professionalName: professionalDocs[0]!.name, dueAt: daysFromNow(20, 16), status: 'pending', kind: 'session' },
  ])

  // ------------------------------------------------ check-ins
  const moodPattern = ['okay', 'good', 'okay', 'difficult', 'okay', 'good', 'very-good', 'okay', 'difficult', 'okay'] as const
  const factorPattern = [
    ['Work'],
    ['Sleep'],
    ['Work'],
    ['Stress', 'Sleep'],
    ['Family'],
    [],
    [],
    ['Work', 'Sleep'],
    ['Stress'],
    ['Relationships'],
  ]
  for (let i = 0; i < moodPattern.length; i++) {
    await CheckIn.create({
      user: mainUser._id,
      mood: moodPattern[i],
      factors: factorPattern[i],
      createdAt: daysFromNow(-(moodPattern.length - i), 8 + (i % 6)),
    })
  }

  // ------------------------------------------------ safeguarding cases
  await SafeguardingCase.create(
    seedSafeguarding.map((c) => ({
      ...c,
      createdBy: adminUser._id,
      assignedReviewer: adminUser._id,
      summary: 'Referral pathway discussion Ã¢â‚¬â€ details require elevated permissions.',
    })),
  )

  // ------------------------------------------------ summary
  const counts = {
    users: await User.countDocuments(),
    professionalProfiles: await Professional.countDocuments(),
    resources: await Resource.countDocuments(),
    communityGroups: await CommunityGroup.countDocuments(),
    communityPosts: await CommunityPost.countDocuments(),
    appointments: await Appointment.countDocuments(),
    conversations: await Conversation.countDocuments(),
    messages: await Message.countDocuments(),
    notifications: await Notification.countDocuments(),
    followUps: await FollowUp.countDocuments(),
    checkIns: await CheckIn.countDocuments(),
    safeguardingCases: await SafeguardingCase.countDocuments(),
  }
  console.log('[seed] complete:', counts)
  console.log('[seed] demo accounts (password: %s):', DEMO_PASSWORD)
  console.log('[seed]   user        -> demo@nsangiza.rw')
  console.log('[seed]   professional-> prof@nsangiza.rw')
  console.log('[seed]   admin       -> admin@nsangiza.rw')
  console.log('[seed]   moderator   -> moderator@nsangiza.rw')
  console.log('[seed]   supervisor  -> supervisor@nsangiza.rw')
}

async function main(): Promise<void> {
  const resetMode = process.argv.includes('--reset')
  await connectDb()
  await seed({ reset: resetMode })
  await disconnectDb()
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})