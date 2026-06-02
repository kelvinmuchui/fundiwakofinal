# Phase 1 - Quick Reference Guide

**For Developers: How to use the new LinkedIn-like features**

---

## 🚀 What's New

You now have a professional networking layer on top of FundiWako with:
- ✅ Enhanced user profiles with verification badges
- ✅ Professional connections/network system
- ✅ Skill endorsements (2-way)
- ✅ Activity feeds from your network
- ✅ Professional recommendations system
- ✅ Profile view tracking

---

## 📂 New Files Created

### Database Models
```
lib/models/
  ├── User.ts (ENHANCED)
  ├── Connection.ts (NEW)
  ├── Recommendation.ts (NEW)
  ├── Activity.ts (NEW)
  ├── Skill.ts (NEW)
```

### API Routes
```
app/api/
  ├── connections/
  │   ├── route.ts (GET all, POST new request)
  │   └── [connectionId]/route.ts (POST accept/reject)
  ├── skills/
  │   └── endorse/route.ts (POST endorse, GET skills)
  ├── feed/
  │   └── route.ts (GET feed, POST activity)
  ├── recommendations/
  │   ├── route.ts (POST request, GET recommendations)
  │   └── write/route.ts (POST write, PATCH publish)
  └── profile/
      ├── [id]/
      │   ├── route.ts (GET profile)
      │   └── view/route.ts (POST view)
```

### Components
```
app/components/
  ├── EnhancedProfilePage.tsx (Main profile page)
  ├── VerificationBadge.tsx (Badge display)
  ├── ConnectionButton.tsx (Connect/manage)
  ├── SkillEndorsement.tsx (Endorse skills)
  ├── ActivityFeed.tsx (Show activities)
  ├── RecommendationCard.tsx (Display recommendations)
```

### Utilities
```
lib/
  └── activityLogger.ts (Easy activity logging)
```

---

## 💡 How to Use - Common Tasks

### 1. Log an Activity
```typescript
import { logActivity } from '@/lib/activityLogger';

await logActivity(
  userId,
  'job_completed', // activity type
  'Completed plumbing job', // title
  'Successfully completed a plumbing repair', // description
  {
    relatedUserId: clientId,
    relatedJobId: bookingId,
    metadata: { jobTitle: 'Plumbing Repair' },
    visibility: 'connections'
  }
);
```

### 2. Get Activity Feed
```typescript
import { getActivityFeed } from '@/lib/activityLogger';

const { activities, total } = await getActivityFeed(userId, 20, 0);
// Returns activities from user's connections
```

### 3. Display Enhanced Profile
```typescript
import EnhancedProfilePage from '@/app/components/EnhancedProfilePage';

export default function UserProfile({ params }) {
  return <EnhancedProfilePage userId={params.id} />;
}
```

### 4. Send Connection Request
```typescript
const response = await fetch('/api/connections', {
  method: 'POST',
  body: JSON.stringify({
    targetUserId: userId,
    relationship: 'colleague'
  })
});
```

### 5. Endorse a Skill
```typescript
const response = await fetch('/api/skills/endorse', {
  method: 'POST',
  body: JSON.stringify({
    targetUserId: userId,
    skillName: 'Plumbing'
  })
});
```

### 6. Request a Recommendation
```typescript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  body: JSON.stringify({
    toUserId: userId,
    relationship: 'client',
    message: 'Would love a recommendation for our work together'
  })
});
```

### 7. Write a Recommendation
```typescript
const response = await fetch('/api/recommendations/write', {
  method: 'POST',
  body: JSON.stringify({
    toUserId: userId,
    requestId: recommendationRequestId,
    content: 'Amazing electrician, very professional!',
    rating: 5,
    relationship: 'client'
  })
});
```

---

## 🔌 Integration Points

### Update Booking Completion
In `app/api/bookings/complete/route.ts` or similar:
```typescript
import { logActivity } from '@/lib/activityLogger';

// After marking booking as complete:
await logActivity(
  funderId,
  'job_completed',
  `Completed ${serviceType} booking`,
  `Successfully completed booking for ${clientName}`,
  {
    relatedUserId: clientId,
    relatedJobId: bookingId,
    metadata: { serviceType, location },
    visibility: 'connections'
  }
);
```

### Update Rating Endpoint
In `app/api/ratings/route.ts`:
```typescript
import { logActivity } from '@/lib/activityLogger';

// After creating a rating:
await logActivity(
  clientId,
  'rating_received',
  'Received a new rating',
  `${clientName} rated you ${rating} stars`,
  {
    relatedUserId: funderId,
    metadata: { rating, review },
    visibility: 'public'
  }
);
```

### Update Worker Card
In `app/components/WorkerCard.tsx`:
```typescript
import ConnectionButton from './ConnectionButton';

// Add to worker card:
<ConnectionButton
  targetUserId={worker._id}
  status="not_connected"
  size="md"
/>
```

---

## 📊 Database Collections

### MongoDB Collections Created
```javascript
// Check these collections exist:
db.connections.find({})
db.skills.find({})
db.skillEndorsements.find({})
db.activities.find({})
db.recommendations.find({})
db.recommendationRequests.find({})
```

### Important Indexes to Add
```javascript
// Run in MongoDB:
db.connections.createIndex({ userId: 1, status: 1 })
db.skills.createIndex({ userId: 1, endorsementCount: -1 })
db.activities.createIndex({ userId: 1, createdAt: -1 })
db.recommendations.createIndex({ toUserId: 1, status: 1 })
```

---

## 🎨 UI Component Props

### VerificationBadge
```typescript
<VerificationBadge
  type="email_verified" // or id_verified, background_checked, certified, phone_verified
  label="Optional Label"
  size="md" // sm, md, lg
/>
```

### ConnectionButton
```typescript
<ConnectionButton
  targetUserId="userId123"
  status="not_connected" // or pending, connected, blocked
  onStatusChange={(newStatus) => console.log(newStatus)}
  size="md" // sm, md, lg
  fullWidth={false}
/>
```

### SkillEndorsement
```typescript
<SkillEndorsement
  skill={{
    name: 'Plumbing',
    yearsOfExperience: 10,
    endorsementCount: 5,
    isPrimary: true
  }}
  targetUserId="userId123"
  isConnected={true}
  onEndorsed={() => console.log('Endorsed!')}
  hasEndorsed={false}
/>
```

### ActivityFeed
```typescript
<ActivityFeed
  limit={20}
  showHeader={true}
/>
```

### RecommendationCard
```typescript
<RecommendationCard
  recommendation={recommendationObject}
  isOwner={false}
  onStatusChange={(id, status) => console.log(id, status)}
/>
```

### EnhancedProfilePage
```typescript
<EnhancedProfilePage userId="userId123" />
```

---

## 🔒 Permissions & Security

### Connection Requirements
- ✅ Users must be connected to endorse skills
- ✅ 30-day cooldown on endorsing same skill
- ✅ Only connections can see connection-level activities
- ✅ Can't endorse own skills

### Recommendation Requirements
- ✅ Must be connected to request/give recommendation
- ✅ Recipient must accept before publishing
- ✅ Public recommendations visible on profile

### Profile Views
- ✅ Can't record own profile view
- ✅ All views tracked with timestamp
- ✅ Profile completeness auto-calculated

---

## 🧪 API Testing

### Test Connection Request
```bash
curl -X POST http://localhost:3000/api/connections \
  -H "Content-Type: application/json" \
  -d '{"targetUserId":"USER_ID","relationship":"colleague"}'
```

### Test Skill Endorsement
```bash
curl -X POST http://localhost:3000/api/skills/endorse \
  -H "Content-Type: application/json" \
  -d '{"targetUserId":"USER_ID","skillName":"Plumbing"}'
```

### Test Get Profile
```bash
curl http://localhost:3000/api/profile/USER_ID
```

### Test Activity Feed
```bash
curl http://localhost:3000/api/feed
```

---

## 📝 Activity Types

These are the built-in activity types:
- `job_completed` - User completed a job
- `skill_endorsed` - User endorsed a skill
- `recommendation_given` - User gave a recommendation
- `joined_platform` - User joined the platform
- `certification_completed` - User completed certification
- `profile_updated` - User updated profile
- `connection_made` - User made a connection
- `milestone_reached` - User reached a milestone
- `rating_received` - User received a rating

---

## 🚨 Common Issues & Solutions

### Issue: "You must be connected to endorse"
**Solution:** Users must have accepted connection request first

### Issue: Profile shows 0% complete
**Solution:** Fill in: headline, about, photo, skills, location, hourly rate, cover

### Issue: No activities showing
**Solution:** Create activities by completing jobs, endorsing skills, or making connections

### Issue: Recommendation request not sending
**Solution:** Check users are connected and no pending request exists

---

## 📞 Need Help?

Refer to [PHASE1_STATUS.md](PHASE1_STATUS.md) for detailed status and next steps.

File structure and examples in this guide follow the new MongoDB collections and Next.js API route patterns.
