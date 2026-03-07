# Live site – product images not showing

If product images work locally but **not on the live site** (e.g. on Google Cloud), check the following.

## 1. Cloudinary env vars on the live server

Uploads only work if Cloudinary is configured in the **deployment** environment.

Set one of these on your live host (e.g. Google Cloud Run / App Engine / Firebase env config):

- **Option A:** One variable  
  `CLOUDINARY_URL` = `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

- **Option B:** Three variables  
  `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

If these are missing on the live server, uploads from the admin will fail and no image URL is saved, so the site will show placeholders.

## 2. Cloudinary dashboard – allowed delivery domains

So that images can be loaded on your live domain:

1. Go to [Cloudinary Console](https://console.cloudinary.com) → **Settings** → **Security**.
2. Under **Allowed fetch domains** (or **Restrict image delivery**), add your **live site domain**, e.g.:
   - `yourdomain.com`
   - `www.yourdomain.com`
   - Or the exact host (e.g. `xxx.run.app` for Cloud Run).

Without this, the browser may block loading Cloudinary images when the page is served from your live URL.

## 3. Redeploy after changing env vars

After adding or changing `CLOUDINARY_*` (or `CLOUDINARY_URL`) on the live server, **redeploy** or **restart** the app so it picks up the new values.

## 4. Verify

- In admin on the **live** site: add or edit a product and upload an image. You should see a success message and the image in the form. If you see “Image upload failed”, env vars or Cloudinary config are wrong.
- On the live storefront: open a product that has an image. The image should load from `https://res.cloudinary.com/...`. If it doesn’t, check step 2 (allowed domains) and the browser console/network tab for blocked requests.
