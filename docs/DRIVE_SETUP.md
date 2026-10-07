# Google Drive backup: setup guide

Every avatar, scene image and company logo the app saves is also copied to a Google Drive folder you own. The copy is a backup only: the app keeps working from its own storage whether or not Drive is set up.

You do this once. It takes about 15 minutes and needs no coding.

## 1. Create a Google Cloud project
1. Go to https://console.cloud.google.com and sign in with the Google account that owns the Drive.
2. Click the project picker at the top, then **New project**. Name it, for example, `story-site-backup`, and click **Create**.
3. Make sure the new project is selected in the picker.

## 2. Turn on the Google Drive API
1. Open **APIs & Services > Library**.
2. Search for **Google Drive API**, open it and click **Enable**.

## 3. Create a service account and download its key
A service account is a robot user that the app signs in as.
1. Open **IAM & Admin > Service Accounts** and click **Create service account**.
2. Give it a name (for example `drive-backup`) and click **Create and continue**. You can skip the optional role and access steps and click **Done**.
3. Click the new account in the list, copy its **email address** (it ends in `.iam.gserviceaccount.com`) and keep it for step 5.
4. Open the **Keys** tab, click **Add key > Create new key**, choose **JSON** and click **Create**. A `.json` file downloads to your computer.
5. Treat this file like a password. Do not email it, post it in chat or commit it to git.

## 4. Choose the Drive folder
1. In Google Drive, create a folder (for example `Story Site Backup`) in My Drive, or pick an existing one. A normal My Drive folder works fine.
2. Shared drives also work: you can use a folder that lives inside a shared drive. In that case add the service account as a member of the shared drive (or of that folder) with the **Content manager** or **Editor** role.

## 5. Share the folder with the service account
1. Right-click the folder, choose **Share**.
2. Paste the service account email address from step 3.
3. Set the role to **Editor** and click **Send** (untick "Notify people" if shown; the robot has no inbox).

## 6. Copy the folder id
Open the folder in Drive. The address looks like
`https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz`.
The folder id is the part after `/folders/` (here `1AbCdEfGhIjKlMnOpQrStUvWxYz`). Do not include anything after a `?`.

## 7. Add the two values

| Name | Value |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | The whole content of the downloaded `.json` key file |
| `DRIVE_FOLDER_ID` | The folder id from step 6 |

**On Vercel:** open the project, then **Settings > Environment Variables**, add both names for the Production environment (and Preview if you use it), then redeploy so they take effect.

**On your own computer:** add the same two lines to `.env.local` in the project folder (never commit that file) and restart the dev server. `.env.local.example` shows the names.

### Pasting the JSON safely
- Open the downloaded file in a plain text editor, select everything and copy it. Paste it as the value. Vercel accepts the multi-line text as is.
- In `.env.local` the value must be on one line. Easiest: paste the whole JSON inside single quotes, for example `GOOGLE_SERVICE_ACCOUNT_JSON='{ ... }'`. The app also understands the key if the line breaks inside the private key appear as the two characters `\n`, which is how the file stores them.
- Alternative if quoting is awkward: convert the file to base64 and paste that instead (the app detects it automatically). On Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("key.json"))`.
- Never paste the key into chat, tickets or documents. If it leaks, delete the key in the Google Cloud console (Service Accounts > Keys) and create a new one.

## How the backup folder is organised
Inside your Drive folder the app creates subfolders on demand:

```
<your folder>/
  <domain or project>/
    <file>
```

Avatars go into a folder named after the domain, scene images into a folder named after the project. Saving the same file again replaces the existing file of that name instead of adding a duplicate.

## How to check it works
1. Generate a domain avatar or a scene image in the app (this needs the database migration for images to be applied).
2. Wait up to a minute, then open the Drive folder: a subfolder with the new file should appear.
3. In the database, the `drive_status` column of the row is `done` when the copy succeeded, `skipped` when Drive is not configured and `failed` when something went wrong.

## If it is not configured
Nothing breaks. When either value is missing or the JSON cannot be read, the backup is skipped silently, `drive_status` is `skipped`, and the app works exactly as before.

## Troubleshooting
- **Nothing appears and status is `skipped`:** one of the two values is missing, empty, or the JSON is damaged (for example cut off while copying). Re-paste the full file content. After changing Vercel variables, redeploy.
- **Status is `failed` and the log shows HTTP 404:** the folder id is wrong, or the folder is not shared with the service account email. Re-check steps 5 and 6.
- **HTTP 403:** the Drive API is not enabled for the project (step 2), the role is Viewer instead of Editor, or the service account is not a member of the shared drive.
- **HTTP 401 or an error about the token:** the key was deleted or disabled. Create a new key and update `GOOGLE_SERVICE_ACCOUNT_JSON`.
- **Files appear late or sometimes not at all on Vercel:** the copy runs after the response is sent and can be cut short by the platform. Generating the image again re-copies it.
- **Storage quota errors:** service accounts have no storage of their own; files must be created inside a folder owned by you (or in a shared drive), which is why the folder has to be shared in step 5.
- **Where to look for errors:** the Vercel function logs (or the dev server console) show lines starting with `[driveBackup]`. They never contain the key or tokens.
