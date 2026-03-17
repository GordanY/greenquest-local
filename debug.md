# GreenQuest Frontend - Actual Bugs to Fix

## 🔴 Critical Bugs

### 1. **UserPet.tsx - levelToPetStage() Logic Error** (Line 15-19)
**File:** `frontend/src/pages/user/UserPet.tsx`
**Severity:** HIGH - Pet progression completely broken

```typescript
export function levelToPetStage(level: number) {
    return (level >= 1) ?
        1 :
        ((level >= 2) ? 2 : 3);
}
```

**Problem:** Logic is inverted. The condition `(level >= 1) ? 1 : ...` will ALWAYS return 1 for any level >= 1, meaning pet never progresses past stage 1.

**Expected Behavior (by design):**
- Level 1 → Stage 1
- Level 2 → Stage 2
- Level 3+ → Stage 3

**Fix:** Need to correct the ternary logic to match the expected behavior.

---

### 2. **ModeContext.tsx - Auth0 Login Not Auto-Redirecting to UserHome**
**Files:**
- `frontend/src/context/ModeContext.tsx`
- `frontend/src/pages/HomePage.tsx`

**Severity:** HIGH - Auth0 Google login flow broken

**Problem:** After user logs in via Auth0/Google and gets redirected back to the app, they see the login page with 登入 and 訪客 buttons instead of going directly to UserHome.

**Root Cause:**
- ModeContext shows login buttons when `mode === ''`
- Auth0 login doesn't automatically set `mode` to 'user'
- The root component doesn't check `useAuth0().isAuthenticated` to bypass login screen

**Expected Behavior:**
- Check `useAuth0().isAuthenticated` in real-time
- If user is already authenticated via Auth0, automatically show UserHome without asking for mode selection
- Login button page should only show if `!isAuthenticated`

**Fix:** Integrate Auth0 authentication check in ModeContext or HomePage to auto-set mode to 'user' when user is already logged in.

---

### 3. **frontend/index.html - Root Div Not Centered**
**File:** `frontend/index.html`
**Severity:** MEDIUM - Poor UX, mobile phone frame not centered on desktop

**Problem:** The root `<div id="root"></div>` is not centered in the body. Desktop users see the app aligned to the top instead of centered.

**Current HTML:**
```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

**Reference (original/index.html):**
```html
<body class="bg-gray-200 flex items-center justify-center min-h-screen">
  <div id="app-container" class="...">
```

**Expected Behavior:**
- Center the phone mockup (max-width: 448px, height: 800px) both horizontally and vertically on the screen
- Add gray background to show desktop space
- Mimic the original design

**Fix:** Add Tailwind classes to body element to center the content.

---

### 4. **UserHome.tsx - Endless Loading Loop After Pet Initialization**
**File:** `frontend/src/pages/user/UserHome.tsx`
**Severity:** HIGH - User gets stuck after first login pet setup

**Problem:** After user initializes their pet (selects pet type and enters name), the app shows an endless loading screen instead of transitioning to the home screen.

**Root Cause:**
- In UserHome.tsx, `profile_ready` is a dependency of `useEffect` (line 40)
- When user submits pet form, `createNewUser()` reducer is called
- This creates a new user profile in the database
- However, `profile_ready` state update doesn't trigger UI re-render
- The conditional rendering checks:
  ```typescript
  {!profile_ready && <div className="loading-overlay">...</div>}
  {profile_ready && !userInited && <UserPet ... />}
  {profile_ready && userInited && <>...</>}
  ```
- Since `profile_ready` doesn't update properly, the UI is stuck showing loading screen

**Current Code (UserHome.tsx, line 35-40):**
```typescript
useEffect(()=>{
  if (profile_ready && my_profile.length > 0) {
    setUserInited(true);
  }
}, [profile_ready, my_profile]);
```

**Issue:**
- After `createNewUser()` succeeds, `my_profile` array should populate from SpacetimeDB
- But if `profile_ready` doesn't become `true`, the condition never triggers
- Need to ensure `profile_ready` updates when new profile is created

**Fix:** Investigate why `profile_ready` doesn't update after `createNewUser()` is called. May need to refetch or reset the table data.

---

## 📋 Deferred Features (Not Bugs)

### 5. **UserShop.tsx - Purchase Not Implemented** (Line 36-40)
**File:** `frontend/src/pages/user/UserShop.tsx`
**Status:** DEFERRED - Hide nav bar for now and implement later

Currently the `confirmPurchase()` function has a TODO comment. The shop UI is complete but backend integration is deferred.

**Action:** Hide the 商店 (shop) button from the nav bar until this is implemented.

---

## ✅ Not Actually Bugs (Verified as By Design)

All other items reviewed are working as intended:
- ✅ UserChallenge.tsx - Score persistence handled by `userCallAiModel()` RPC
- ✅ GuestChallenge.tsx - Progress saved by same RPC
- ✅ UserPokedex.tsx - Plant collection logic is correct
- ✅ UserRanking.tsx - Score calculation correct (only correct answers count)
- ✅ Skip behavior - Correct by design (random for user, sequential for guest)
- ✅ Guest answered badge - One-answer-per-question is intentional
- ✅ Identity comparison - Safe (user must be logged in)
