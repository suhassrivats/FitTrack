# App Store Listing — ShredX

Draft copy for App Store Connect. Fill in the `[ ]` placeholders before submitting.

## App Name
ShredX

## Subtitle (30 chars max)
Workouts, classes, progress

## Promotional Text (170 chars max, editable without review)
Log workouts, join fitness classes, and track your progress — all in one app. Sign in with Google and pick up right where you left off.

## Description (4000 chars max)

ShredX is a fitness tracking app for lifters, coaches, and fitness classes.

Track every workout in detail — exercises, sets, reps, and weight — and watch your history and personal records build up over time. Built-in workout timers keep your sessions on pace, and an exercise library with instructions and videos takes the guesswork out of form.

For coaches and instructors: create classes, invite students with a simple join code, and assign specific workouts and targets. Students log their actual performance, and everyone can see class leaderboards and completion tracking. It's built for gyms, bootcamps, and online coaching alike.

Your profile brings it all together with workout streaks, weekly analytics, and consistency tracking, so you always know where you stand.

KEY FEATURES
• Log workouts with exercises, sets, reps, and weight
• Build custom workout routines
• Exercise library with instructions and videos
• Workout timer and personal records
• Create and join fitness classes with a join code
• Assign and track workouts for students
• Class leaderboards and progress tracking
• Weekly analytics and streak tracking
• Sign in with email or Google
• kg/lbs unit support

Whether you're training solo or running a class full of students, ShredX keeps everyone's progress in one place.

## Keywords (100 chars max, comma-separated)
fitness,workout,gym,tracker,strength training,personal trainer,fitness class,leaderboard,coach

## Support URL
https://suhassrivats.github.io/shredX/support.html (GitHub Pages, contact: suhassrivats@gmail.com)

## Marketing URL (optional)
None — no marketing site, field left blank.

## Privacy Policy URL (required — app collects account data, camera/photo access, and tracking)
https://suhassrivats.github.io/shredX/privacy.html (GitHub Pages, live)

## Category
Primary: Health & Fitness
Secondary (optional): Sports

## Age Rating
No mature content, no user-generated content beyond profile photos, no gambling. Should qualify for 4+ once the ASC questionnaire is answered accurately (current pulled config has placeholder NONE/false values — verify each field, don't just accept the default).

## App Privacy (ASC "App Privacy" section — separate from age rating)
Data types collected, based on current app behavior:
- **Contact Info**: Email address (account creation, login)
- **User Content**: Photos (profile picture, optional)
- **Identifiers**: User ID
- **Usage Data**: Workout/exercise logs (linked to account)
- **Diagnostics**: none currently collected — update if analytics/crash reporting is added later

Declare "used for tracking" = No unless Google Sign-In or analytics SDKs are confirmed to track across apps/websites for ads. NSUserTrackingUsageDescription is present in app.json — confirm whether ATT prompt actually fires; if no cross-app tracking happens, consider removing that permission string to avoid an unnecessary ATT prompt.

## What's New (this version)
Added "Continue with Google" sign-in.

---

## Privacy Policy stub (host this at the Support/Privacy URL)

Placeholder — replace `[ ]` fields and publish before submission; App Review requires a live, reachable URL.

```
Privacy Policy for ShredX

Last updated: [ ]

ShredX ("we", "us") provides this fitness tracking app. This policy explains what
we collect and how we use it.

Information we collect:
- Account info: email address, username, password (hashed)
- Profile photo, if you choose to add one
- Workout data you log: exercises, sets, reps, weight, routines
- Class data: join codes, class membership, assigned workouts, leaderboard standing
- If you sign in with Google: your Google account email and profile info, via
  Google's own sign-in flow. We do not receive your Google password.

How we use it:
- To provide and operate the app (auth, workout tracking, class features)
- To show your progress, streaks, and leaderboards to you and, where applicable,
  your class instructor/classmates
- We do not sell your personal data
- We do not use your data for third-party advertising

Data storage:
- Stored on our servers ([ hosting provider / region ])
- You can request account deletion by contacting [ support email ]

Camera / Photo Library:
- Used only if you choose to set a profile photo. Not accessed otherwise.

Contact:
[ support email ]
```
