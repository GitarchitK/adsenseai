# Firestore Indexes Required

Run these in Firebase Console → Firestore → Indexes, or deploy via `firebase deploy --only firestore:indexes`.

## Composite Indexes

### scans collection
- Collection: `scans`
- Fields: `userId ASC`, `createdAt DESC`
- Query scope: Collection

## firestore.indexes.json (for firebase CLI)

```json
{
  "indexes": [
    {
      "collectionGroup": "scans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Security Rules (firestore.rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can only read/write their own scans
    match /scans/{scanId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
