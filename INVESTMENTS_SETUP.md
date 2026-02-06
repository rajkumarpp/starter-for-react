# Investments Feature Setup Guide

## Overview
This guide will help you set up the Investments feature in your Appwrite database.

## Step 1: Create the Investments Collection

1. **Log in to your Appwrite Console**: https://sgp.cloud.appwrite.io/console
2. **Navigate to your project**: "The Royal Ledger"
3. **Go to Databases** → Select your database (ID: `698169f0003a699bc147`)
4. **Click "Create Collection"**
5. **Collection Name**: `investments`
6. **Collection ID**: Click "Generate ID" or use a custom ID
7. **Copy the Collection ID** and add it to your `.env` file:
   ```
   VITE_APPWRITE_INVESTMENTS_COLLECTION_ID=your_collection_id_here
   ```

## Step 2: Configure Collection Attributes

Add the following attributes to your `investments` collection:

### String Attributes
1. **name**
   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

2. **type**
   - Type: Enum
   - Elements: `Stocks`, `Mutual Funds`, `Bonds`, `Real Estate`, `Cryptocurrency`, `Gold`, `Other`
   - Required: Yes
   - Array: No

3. **user_id**
   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

### Numeric Attributes
4. **quantity**
   - Type: Double
   - Required: Yes
   - Min: 0
   - Array: No

5. **purchasePrice**
   - Type: Double
   - Required: Yes
   - Min: 0
   - Array: No

6. **currentValue**
   - Type: Double
   - Required: Yes
   - Min: 0
   - Array: No

### DateTime Attributes
7. **purchaseDate**
   - Type: DateTime
   - Required: Yes
   - Array: No

8. **closure_date**
   - Type: DateTime
   - Required: No (Optional)
   - Array: No

## Step 3: Configure Indexes

Create the following indexes for better query performance:

1. **Index by user_id**
   - Key: `user_id_index`
   - Type: Key
   - Attributes: `user_id` (ASC)

2. **Index by purchaseDate**
   - Key: `purchase_date_index`
   - Type: Key
   - Attributes: `purchaseDate` (DESC)

3. **Index by type**
   - Key: `type_index`
   - Type: Key
   - Attributes: `type` (ASC)

## Step 4: Set Permissions

Configure the following permissions for the collection:

### Read Access
- Role: `user:[USER_ID]` (Any authenticated user can read their own investments)
- Permission: Read

### Create Access
- Role: `user:[USER_ID]` (Any authenticated user can create investments)
- Permission: Create

### Update Access
- Role: `user:[USER_ID]` (Any authenticated user can update their own investments)
- Permission: Update

### Delete Access
- Role: `user:[USER_ID]` (Any authenticated user can delete their own investments)
- Permission: Delete

**Note**: Replace `[USER_ID]` with the actual user ID, or use the wildcard `users` for all authenticated users.

## Step 5: Update Environment Variables

Add the collection ID to your `.env` file:

```env
VITE_APPWRITE_INVESTMENTS_COLLECTION_ID=your_investments_collection_id
```

## Step 6: Restart Development Server

After updating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Features Included

### Investment Tracking
- Add, edit, and delete investments
- Track multiple investment types (Stocks, Mutual Funds, Bonds, etc.)
- Record purchase details (quantity, price, date)
- Update current values
- Optional closure date for sold investments

### Portfolio Analytics
- **Total Invested**: Sum of all purchase amounts (quantity × purchase price)
- **Current Value**: Total current market value
- **Profit/Loss**: Calculated difference with percentage
- **Individual Investment P&L**: Per-investment profit/loss tracking

### User Interface
- Clean, modern design matching your existing pages
- Responsive table layout
- Summary cards with visual indicators
- Color-coded profit (green) and loss (red)
- Form validation
- Date pickers for easy date entry

## Database Schema Reference

```
investments Collection
├── id (auto-generated)
├── name (string, required)
├── quantity (double, required)
├── purchasePrice (double, required)
├── purchaseDate (datetime, required)
├── currentValue (double, required)
├── type (enum, required)
├── closure_date (datetime, optional)
├── user_id (string, required - relationship to users)
├── $createdAt (auto-generated)
└── $updatedAt (auto-generated)
```

## Troubleshooting

### "Collection not found" error
- Verify the collection ID in your `.env` file matches the Appwrite console
- Ensure you've restarted the dev server after updating `.env`

### "Permission denied" error
- Check that collection permissions are set correctly
- Verify the user is authenticated
- Ensure `user_id` matches the authenticated user's ID

### Data not displaying
- Check browser console for errors
- Verify the collection has data
- Ensure the user_id filter matches your authenticated user

## Next Steps

1. Create the collection in Appwrite Console
2. Add all attributes as specified
3. Configure indexes
4. Set permissions
5. Add the collection ID to `.env`
6. Restart the dev server
7. Navigate to `/investments` in your app
8. Start tracking your investments!

## Support

If you encounter any issues, check:
- Appwrite Console for collection configuration
- Browser DevTools Console for JavaScript errors
- Network tab for API request/response details
