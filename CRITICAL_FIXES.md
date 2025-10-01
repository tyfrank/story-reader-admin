# CRITICAL FIXES FOR BOOK UPLOAD - DO NOT LOSE THIS

## Backend URL
- Production: `https://story-reader-backend-production.up.railway.app`
- The backend is deployed on Railway and connected to GitHub

## Authentication
- **Admin Credentials**:
  - Email: `admin@romanceme.com`
  - Password: `admin123`
- **Token**: Must be included in all API calls as `Authorization: Bearer ${token}`
- **Admin Check**: Backend verifies `request.user.role === 'ADMIN'`

## Working Book Upload Format
The backend expects this exact format at `/api/admin/books`:

```javascript
{
  title: "Book Title",
  authorName: "Author Name",
  description: "Book description",
  genre: "romance",  // or other genre
  tags: ["tag1", "tag2"],  // Array of strings
  coverUrl: "https://...",  // Optional
  status: "draft",  // or "published"
  chapters: [
    {
      chapterNumber: 1,
      title: "Chapter Title",
      content: "Chapter content...",
      isFree: true,  // First chapter usually free
      coinCost: 0     // 0 for free, 2+ for paid
    }
  ]
}
```

## Backend Fixes Already Applied

### 1. CORS Configuration (src/index.ts)
```javascript
const allowedOrigins = [
  'https://admin-zeta-brown.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];
```

### 2. Unique Slug Generation (src/routes/admin.routes.ts)
```javascript
let baseSlug = bookData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
let slug = baseSlug;
let counter = 1;
while (await prisma.book.findUnique({ where: { slug } })) {
  slug = `${baseSlug}-${counter}`;
  counter++;
}
```

### 3. Chapter Fields
**CORRECT fields for chapters:**
- ✅ `chapterNumber` (not orderIndex)
- ✅ `isFree` (boolean)
- ✅ `coinCost` (number)
- ✅ `title`
- ✅ `content`

**INVALID fields (don't use these):**
- ❌ `orderIndex`
- ❌ `estimatedReadTime` 
- ❌ `isPublished` (this is only for books, not chapters)

### 4. Database Schema
The Prisma schema uses these models:
- `User` (with role: 'USER' | 'AUTHOR' | 'ADMIN')
- `Book` (with status: 'DRAFT' | 'ONGOING' | 'COMPLETED')
- `Chapter` 
- `Purchase` (not Payment)

### 5. Admin User Creation
To create/reset admin user, use this endpoint:
```bash
curl -X POST https://story-reader-backend-production.up.railway.app/api/init/create-admin -H "Content-Type: application/json" -d '{}'
```

## Common Issues & Solutions

### Issue: "Invalid credentials"
**Solution**: Admin user might not exist. Create it using the endpoint above.

### Issue: "Failed to create book" 
**Solution**: Check that:
1. Tags is an array (not a string)
2. All chapter fields are correct
3. Slug isn't duplicate (should auto-handle now)

### Issue: "Chapters not showing"
**Solution**: Chapters must be sent WITH the book creation request, not separately.

### Issue: 404 on API calls
**Solution**: Check that:
1. Backend is deployed (check Railway)
2. CORS includes your domain
3. API URL is correct

## Git Repositories
- **Backend**: https://github.com/tyfrank/story-reader-backend
- **Admin**: https://github.com/tyfrank/story-reader-admin

## Deployment
- **Backend**: Deploys automatically to Railway on git push
- **Admin**: Deploys automatically to Vercel on git push

## Testing Book Upload Locally
1. Start admin locally: `npm run dev` (runs on port 3001)
2. Login with admin@romanceme.com / admin123
3. Try uploading a book with at least one chapter
4. Check browser console for errors
5. Check Railway logs for backend errors

## DO NOT CHANGE
These are working and should not be modified:
1. The book creation endpoint structure in `admin.routes.ts`
2. The authentication middleware
3. The CORS configuration
4. The slug generation logic

---
Last Working: September 30, 2025
If something breaks, check this file first!