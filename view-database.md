# 📊 View Database and Test API

## 🔍 View Database with Prisma Studio

```powershell
# Set your database URL
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE"

# Run Prisma Studio
npx prisma studio --schema=./prisma/schema.prisma
```

It will automatically open in `http://localhost:5555` where you can view and edit data.

---

## 🧪 Test API with curl.exe

### GET - Get Posts

```powershell
curl.exe -X GET "https://litebox-challenge-webservice.onrender.com/api/posts/related"
```

### POST - Create a Post

```powershell
# Make sure you have an image named test_img.jpg in the current directory
curl.exe -X POST "https://litebox-challenge-webservice.onrender.com/api/posts/related" `
  -F "title=My Test Post" `
  -F "topic=Technology" `
  -F "image=@test_img.jpg"
```

**Note:** Replace `test_img.jpg` with the path to your image if it has a different name or is in another location.

---

## 📝 Environment Variables

If you need to change the database URL, update the `DATABASE_URL`:

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE"
```
